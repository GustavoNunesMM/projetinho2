import JSZip from "jszip";
import mammoth from "mammoth";

import { TemplateField } from "@/types/generate.ts";

const FIELD_REGEX = /\{\{([A-Za-z][A-Za-z0-9]*)(?:_(\d+))?\}\}/g;

export function extractFields(text: string): TemplateField[] {
  const fields: TemplateField[] = [];
  const seenFields = new Set<string>();
  const sequentialFields = new Map<string, number[]>();



  const fieldRegex = new RegExp(FIELD_REGEX.source, FIELD_REGEX.flags);

  let match;

  while ((match = fieldRegex.exec(text)) !== null) {
    const fieldName = match[1];
    const index = match[2] ? parseInt(match[2], 10) : null;



    if (index !== null) {
      if (!sequentialFields.has(fieldName)) {
        sequentialFields.set(fieldName, []);
      }
      const indices = sequentialFields.get(fieldName)!;

      if (!indices.includes(index)) {
        indices.push(index);
        indices.sort((a, b) => a - b);
      }
    } else {
      if (!seenFields.has(fieldName)) {
        seenFields.add(fieldName);
        fields.push({
          name: fieldName,
          type: "text",
          defaultValue: "",
        });
      }
    }
  }



  sequentialFields.forEach((indices, fieldName) => {
    fields.push({
      name: fieldName,
      type: "sequential",
      defaultValue: "",
      sequentialIndices: indices,
    });
  });


  return fields;
}

export function replaceFields(
  text: string,
  fieldValues: Record<string, string | string[]>,
): string {
  let result = text;
  const fieldRegex = new RegExp(FIELD_REGEX.source, FIELD_REGEX.flags);

  result = result.replace(fieldRegex, (match, fieldName, indexStr) => {
    if (indexStr) {
      const index = parseInt(indexStr, 10);
      const fieldKey = `${fieldName}_${index}`;
      const value = fieldValues[fieldKey];

      if (typeof value === "string") {
        return value;
      }
      const arrayValue = fieldValues[fieldName];

      if (Array.isArray(arrayValue) && arrayValue[index - 1] !== undefined) {
        return arrayValue[index - 1];
      }

      return match;
    } else {
      const value = fieldValues[fieldName];

      if (typeof value === "string") {
        return value;
      }

      return match;
    }
  });

  return result;
}


function mergeFragmentedFields(xml: string): string {
  return xml.replace(
    /(<w:p\b[^>]*>)([\s\S]*?)(<\/w:p>)/g,
    (_, openTag, content, closeTag) => {
      const runMatches: Array<{
        full: string;
        text: string;
        rPr: string;
      }> = [];

      const runRegex = /<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g;
      let runMatch;

      while ((runMatch = runRegex.exec(content)) !== null) {
        const runContent = runMatch[1];
        const rPrMatch = runContent.match(/<w:rPr\b[^>]*>([\s\S]*?)<\/w:rPr>/);
        const tMatch = runContent.match(
          /<w:t[^>]*xml:space="preserve"[^>]*>([\s\S]*?)<\/w:t>/,
        );
        const tMatchSimple = runContent.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/);

        const text = (tMatch || tMatchSimple)?.[1] || "";
        const rPr = rPrMatch ? `<w:rPr>${rPrMatch[1]}</w:rPr>` : "";

        runMatches.push({
          full: runMatch[0],
          text: text,
          rPr: rPr,
        });
      }

      if (runMatches.length === 0) {
        return `${openTag}${content}${closeTag}`;
      }

      const combinedText = runMatches.map((r) => r.text).join("");

      if (!combinedText.includes("{{") || !combinedText.includes("}}")) {
        return `${openTag}${content}${closeTag}`;
      }

      const allRunsHaveCompletePlaceholders = runMatches.every(
        (run) => !run.text.includes("{{") || /\{\{[^}]+\}\}/.test(run.text),
      );

      if (
        allRunsHaveCompletePlaceholders &&
        /\{\{[^}]+\}\}/.test(combinedText)
      ) {
        return `${openTag}${content}${closeTag}`;
      }

      const newRuns: typeof runMatches = [];
      let buffer = "";
      let bufferRuns: typeof runMatches = [];
      let bufferRPr = "";

      for (const run of runMatches) {
        buffer += run.text;
        bufferRuns.push(run);

        if (!bufferRPr && run.rPr) {
          bufferRPr = run.rPr;
        }

        const openCount = (buffer.match(/\{\{/g) || []).length;
        const closeCount = (buffer.match(/\}\}/g) || []).length;

        if (openCount > 0 && openCount === closeCount) {
          const mergedText = buffer;
          const mergedRun = `<w:r>${bufferRPr}<w:t xml:space="preserve">${mergedText}</w:t></w:r>`;

          newRuns.push({
            full: mergedRun,
            text: mergedText,
            rPr: bufferRPr,
          });

          buffer = "";
          bufferRuns = [];
          bufferRPr = "";
        } else if (openCount === 0 && closeCount === 0 && buffer.trim()) {
          if (bufferRuns.length === 1) {
            newRuns.push(bufferRuns[0]);
          } else {
            const mergedText = buffer;
            const mergedRun = `<w:r>${bufferRPr}<w:t xml:space="preserve">${mergedText}</w:t></w:r>`;

            newRuns.push({
              full: mergedRun,
              text: mergedText,
              rPr: bufferRPr,
            });
          }
          buffer = "";
          bufferRuns = [];
          bufferRPr = "";
        }
      }

      if (bufferRuns.length > 0) {
        if (bufferRuns.length === 1) {
          newRuns.push(bufferRuns[0]);
        } else {
          const mergedText = buffer;
          const mergedRun = `<w:r>${bufferRPr}<w:t xml:space="preserve">${mergedText}</w:t></w:r>`;

          newRuns.push({
            full: mergedRun,
            text: mergedText,
            rPr: bufferRPr,
          });
        }
      }

      const newContent = newRuns.map((r) => r.full).join("");

      return `${openTag}${newContent}${closeTag}`;
    },
  );
}

export async function processDocxTemplate(
  blob: Blob,
  fieldValues: Record<string, string | string[]>,
): Promise<Blob> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const documentXml = await zip.file("word/document.xml")?.async("string");

    if (!documentXml) {
      throw new Error("Não foi possível ler o documento principal");
    }

    let processedXml = documentXml;


    processedXml = mergeFragmentedFields(processedXml);


    processedXml = processedXml.replace(
      FIELD_REGEX,
      (match, fieldName, indexStr) => {
        let value = "";


        if (indexStr) {
          const index = parseInt(indexStr, 10);
          const fieldKey = `${fieldName}_${index}`;
          const specificValue = fieldValues[fieldKey];

       

          if (typeof specificValue === "string") {
            value = specificValue;
          } else {
            const arrayValue = fieldValues[fieldName];


            if (Array.isArray(arrayValue)) {
              const arrayIndex = index - 1;

              if (arrayIndex >= 0 && arrayIndex < arrayValue.length) {
                value = arrayValue[arrayIndex];
              }
            }
          }
        } else {
          const fieldValue = fieldValues[fieldName];

          value = typeof fieldValue === "string" ? fieldValue : "";

        }

        const escapedValue = (value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");



        return escapedValue;
      },
    );

    zip.file("word/document.xml", processedXml);

    const headerFiles = zip.file(/^word\/header\d+\.xml$/);

    for (const headerFile of headerFiles) {
      const headerXml = await headerFile.async("string");

      if (headerXml) {
        let processedHeader = headerXml;

        processedHeader = mergeFragmentedFields(processedHeader);

        processedHeader = processedHeader.replace(
          FIELD_REGEX,
          (_: string, fieldName, indexStr) => {
            let value = "";

            if (indexStr) {
              const index = parseInt(indexStr, 10);
              const fieldKey = `${fieldName}_${index}`;
              const specificValue = fieldValues[fieldKey];

              if (typeof specificValue === "string") {
                value = specificValue;
              } else {
                const arrayValue = fieldValues[fieldName];

                if (Array.isArray(arrayValue)) {
                  const arrayIndex = index - 1;

                  if (arrayIndex >= 0 && arrayIndex < arrayValue.length) {
                    value = arrayValue[arrayIndex];
                  }
                }
              }
            } else {
              const fieldValue = fieldValues[fieldName];

              value = typeof fieldValue === "string" ? fieldValue : "";
            }
            const escapedValue = (value || "")
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&apos;");

            return escapedValue;
          },
        );
        zip.file(headerFile.name, processedHeader);
      }
    }

    const footerFiles = zip.file(/^word\/footer\d+\.xml$/);

    for (const footerFile of footerFiles) {
      const footerXml = await footerFile.async("string");

      if (footerXml) {
        let processedFooter = footerXml;

        processedFooter = mergeFragmentedFields(processedFooter);

        processedFooter = processedFooter.replace(
          FIELD_REGEX,
          (_: string, fieldName, indexStr) => {
            let value = "";

            if (indexStr) {
              const index = parseInt(indexStr, 10);
              const fieldKey = `${fieldName}_${index}`;
              const specificValue = fieldValues[fieldKey];

              if (typeof specificValue === "string") {
                value = specificValue;
              } else {
                const arrayValue = fieldValues[fieldName];

                if (Array.isArray(arrayValue)) {
                  const arrayIndex = index - 1;

                  if (arrayIndex >= 0 && arrayIndex < arrayValue.length) {
                    value = arrayValue[arrayIndex];
                  }
                }
              }
            } else {
              const fieldValue = fieldValues[fieldName];

              value = typeof fieldValue === "string" ? fieldValue : "";
            }
            const escapedValue = (value || "")
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&apos;");

            return escapedValue;
          },
        );
        zip.file(footerFile.name, processedFooter);
      }
    }

    const newBlob = await zip.generateAsync({ type: "blob" });

    return newBlob;
  } catch (error) {
    console.error("Erro ao processar template DOCX:", error);
    throw new Error("Falha ao processar template: " + (error as Error).message);
  }
}

export async function extractFieldsFromDocx(
  blob: Blob,
): Promise<TemplateField[]> {
  try {
    const text = await mammoth.extractRawText({
      arrayBuffer: await blob.arrayBuffer(),
    });

    return extractFields(text.value);
  } catch (error) {
    console.error("Erro ao extrair campos do DOCX:", error);
    throw new Error("Falha ao extrair campos: " + (error as Error).message);
  }
}
