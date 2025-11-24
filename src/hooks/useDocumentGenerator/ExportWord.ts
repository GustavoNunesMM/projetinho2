import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  ImageRun,
  AlignmentType,
  HeadingLevel,
  ISectionOptions,
  convertInchesToTwip,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
} from "docx";
import { getImageDimensions } from "@/utils/imageImport";
import { Message } from "@/types/messages";
import JSZip from "jszip";
import { WordLayoutInfo } from "@/types/layout";
import mammoth from "mammoth";
import { Layout } from "@/types/layout";
import { Question } from "@/types/question";
import { HeaderData, ParsedQuestion } from "@/types/documentGeneration";
import { GabaritoData } from "@/types";

const base64ToUint8Array = (base64: string): Uint8Array => {
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};
export function detectImageType(
  input: string | ArrayBuffer | Uint8Array
): "png" | "jpg" | "jpeg" | "gif" | "svg" {
  if (typeof input === "string") {
    if (input.startsWith("data:image/png")) return "png";
    if (input.startsWith("data:image/jpeg")) return "jpeg";
    if (input.startsWith("data:image/jpg")) return "jpg";
    if (input.startsWith("data:image/gif")) return "gif";
    if (input.startsWith("data:image/webp")) return "png";
    if (input.startsWith("data:image/svg+xml")) return "svg";

    try {
      const bytes = base64ToUint8Array(input);
      return detectFromBytes(bytes) as "png";
    } catch {
      return "png";
    }
  }

  if (input instanceof ArrayBuffer) {
    return detectFromBytes(new Uint8Array(input)) as "png";
  }

  if (input instanceof Uint8Array) {
    return detectFromBytes(input) as "png";
  }

  return "png";
}

function detectFromBytes(bytes: Uint8Array): string {
  if (!bytes || bytes.length < 4) return "unknown";

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return "jpeg";
  }

  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return "gif";
  }

  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "png";
  }

  // SVG (text)
  const asText = new TextDecoder().decode(bytes.slice(0, 100)).trim();
  if (asText.startsWith("<svg")) return "svg";

  return "unknown";
}

const marginToTwips = (margin: string): number => {
  const value = parseFloat(margin);
  if (margin.includes("cm")) {
    return convertInchesToTwip(value / 2.54);
  } else if (margin.includes("in")) {
    return convertInchesToTwip(value);
  }
  return convertInchesToTwip(value / 2.54);
};

const fontSizeToHalfPoints = (fontSize: string): number => {
  const value = parseFloat(fontSize);
  return value * 2;
};

export const lineSpacingToValue = (spacing: string): number => {
  const value = parseFloat(spacing);
  return Math.round(value * 240);
};

export const generateDocx = async (
  questions: Question[],
  layout: Layout,
  importedHeader?: HeaderData[],
  message?: Message,
  gabaritoData?: GabaritoData
): Promise<Blob> => {
  const sections: (Paragraph | Table)[] = [];

  const pageMargins = {
    top: marginToTwips(layout.marginTop || "2.54cm"),
    bottom: marginToTwips(layout.marginBottom || "2.54cm"),
    left: marginToTwips(layout.marginLeft || "2.54cm"),
    right: marginToTwips(layout.marginRight || "2.54cm"),
  };
  const fontSize = fontSizeToHalfPoints(layout.fontSize || "12");
  const lineSpacing = lineSpacingToValue(layout.lineSpacing || "1.15");

  if (importedHeader?.length) {
    importedHeader.forEach((headerData) => {
      sections.push(headerData.docxTable);
    });
  } else if (layout.header || layout.headerText) {
    sections.push(
      new Paragraph({
        text: layout.header || layout.headerText || "",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  if (message) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: message.title,
            bold: true,
            size: fontSize + 2,
            font: layout.fontFamily || "Arial",
          }),
        ],
        spacing: { before: 200, after: 200, line: lineSpacing },
      })
    );

    if (message.isList) {
      message.items.forEach((item, index) => {
        const prefix = message.isOrdered ? `${index + 1}. ` : "• ";
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${prefix}${item}`,
                size: fontSize,
                font: layout.fontFamily || "Arial",
              }),
            ],
            spacing: { after: 100, line: lineSpacing },
            indent: { left: 360 },
          })
        );
      });
    } else {
      message.items.forEach((item) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item,
                size: fontSize,
                font: layout.fontFamily || "Arial",
              }),
            ],
            spacing: { after: 100, line: lineSpacing },
          })
        );
      });
    }
  }
  if (gabaritoData && gabaritoData.questoes.length > 0) {
    const cols = gabaritoData.questoes[0].alternativas.length;
    const cellWidth = convertInchesToTwip(1.0 / 2.54);
    const cellHeight = convertInchesToTwip(0.5 / 2.54);
    const tableWidth = cellWidth * (cols + 1);

    const headerRow = new TableRow({
      height: { value: cellHeight, rule: "exact" },
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Nº", bold: true, size: 18 })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          verticalAlign: VerticalAlign.CENTER,
          width: { size: cellWidth, type: WidthType.DXA },
          margins: { top: 40, bottom: 40, left: 40, right: 40 },
        }),
        ...Array.from({ length: cols }).map(
          (_, i) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: String.fromCharCode(65 + i),
                      bold: true,
                      size: 18,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: cellWidth, type: WidthType.DXA },
              margins: { top: 40, bottom: 40, left: 40, right: 40 },
            })
        ),
      ],
    });

    const bodyRows = gabaritoData.questoes.map(
      (q) =>
        new TableRow({
          height: { value: cellHeight, rule: "exact" },
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: String(q.numero),
                      bold: true,
                      size: 18,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              width: { size: cellWidth, type: WidthType.DXA },
              margins: { top: 40, bottom: 40, left: 40, right: 40 },
            }),
            ...q.alternativas.map(
              (letra) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: letra, size: 18 })],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  verticalAlign: VerticalAlign.CENTER,
                  width: { size: cellWidth, type: WidthType.DXA },
                  margins: { top: 40, bottom: 40, left: 40, right: 40 },
                })
            ),
          ],
        })
    );

    sections.push(
      new Table({
        rows: [headerRow, ...bodyRows],
        width: { size: tableWidth, type: WidthType.DXA },
        borders: {
          top: { style: "single", size: 1, color: "000000" },
          bottom: { style: "single", size: 1, color: "000000" },
          left: { style: "single", size: 1, color: "000000" },
          right: { style: "single", size: 1, color: "000000" },
          insideHorizontal: { style: "single", size: 1, color: "000000" },
          insideVertical: { style: "single", size: 1, color: "000000" },
        },
      })
    );
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const contentLines = (q.content || "").split("\n");

    contentLines.forEach((line, lineIndex) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: lineIndex === 0 ? `${i + 1}. ${line}` : line,
              bold: lineIndex === 0,
              size: fontSize,
              font: layout.fontFamily || "Arial",
            }),
          ],
          spacing: {
            after: lineIndex === contentLines.length - 1 ? 200 : 100,
            line: lineSpacing,
          },
        })
      );
    });

    if (q.contentImage) {
      try {
        const { width, height } = await getImageDimensions(q.contentImage);
        const bytes = base64ToUint8Array(q.contentImage);
        const type = detectImageType(bytes);
        const scale = width > 400 ? 400 / width : 1;

        const imageRunOptions: any = {
          data: bytes,
          type: type === "jpeg" ? "jpg" : type,
          transformation: {
            width: width * scale,
            height: height * scale,
          },
        };

        if (type === "svg") {
          imageRunOptions.fallback = "Imagem não encontrada";
        }

        sections.push(
          new Paragraph({
            children: [new ImageRun(imageRunOptions)],
            spacing: { before: 100, after: 200 },
          })
        );
      } catch (error) {
        console.error("Error processing image:", error);
      }
    }
    if (q.type === "multipla" && q.options?.length) {
      for (let j = 0; j < q.options.length; j++) {
        const letter = String.fromCharCode(97 + j);
        const optionLines = q.options[j].split("\n");

        optionLines.forEach((line, lineIndex) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: lineIndex === 0 ? `${letter}) ${line}` : line,
                  size: fontSize,
                  font: layout.fontFamily || "Arial",
                }),
              ],
              spacing: {
                after: lineIndex === optionLines.length - 1 ? 100 : 50,
                line: lineSpacing,
              },
              indent: { left: 720 },
            })
          );
        });

        if (q.optionImages?.[j]) {
          try {
            const { width, height } = await getImageDimensions(
              q.optionImages[j]!
            );
            const bytes = base64ToUint8Array(q.optionImages[j]!);
            const type = detectImageType(bytes);
            const scale = width > 300 ? 300 / width : 1;

            const imageRunOptions: any = {
              data: bytes,
              type: type === "jpeg" ? "jpg" : type, 
              transformation: {
                width: width * scale,
                height: height * scale,
              },
            };

            if (type === "svg") {
              imageRunOptions.fallback = 'Imagem não encontrada';
            }

            sections.push(
              new Paragraph({
                children: [new ImageRun(imageRunOptions)],
                spacing: { before: 50, after: 100 },
                indent: { left: 720 },
              })
            );
          } catch (error) {
            console.error("Error processing option image:", error);
          }
        }
      }
    }
    sections.push(new Paragraph({ text: "", spacing: { after: 400 } }));
  }

  if (layout.footer || layout.footerText) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: layout.footer || layout.footerText || "",
            size: fontSize - 4,
            font: layout.fontFamily || "Arial",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: pageMargins } },
        children: sections,
      } as ISectionOptions,
    ],
  });
  return Packer.toBlob(doc);
};

export const generateQuestionDocx = async (
  question: Question
): Promise<Blob> => {
  return generateDocx([question], {
    id: 0,
    name: "Default",
    headerText: "",
    footerText: "",
    headerLocked: false,
    importedFrom: null,
    marginTop: "2.54cm",
    marginBottom: "2.54cm",
    marginLeft: "2.54cm",
    marginRight: "2.54cm",
    fontSize: "12",
    lineSpacing: "1.15",
    fontFamily: "Arial",
  });
};

export const readDocx = async (blob: Blob): Promise<string> => {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("Erro ao ler DOCX:", error);
    throw new Error("Falha ao ler documento Word: " + (error as Error).message);
  }
};

export const parseQuestionsFromText = (text: string) => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const questions: ParsedQuestion[] = [];
  let current: Partial<ParsedQuestion> = {};
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length === 0) return;
    const statement = buffer.join("\n").trim();
    if (statement) {
      if (!current.statement) current.statement = statement;
      else current.statement += "\n" + statement;
    }
    buffer = [];
  };

  for (const line of lines) {
    const numMatch = line.match(/^\s*(?:\d+[\.\)]|\d+\s*[-–—])\s*(.+)/i);
    if (numMatch) {
      flush();
      if (current.statement) {
        questions.push(current as ParsedQuestion);
      }
      current = { statement: numMatch[1].trim(), alternatives: [] };
      continue;
    }

    const altMatch = line.match(/^([a-zA-Z])\s*[)\.\s]\s*(.+)/);
    if (altMatch && current.alternatives) {
      flush();
      current.alternatives.push({
        letter: altMatch[1].toUpperCase(),
        text: altMatch[2].trim(),
      });
      continue;
    }

    buffer.push(line);
  }

  flush();
  if (current.statement) questions.push(current as ParsedQuestion);

  return questions.map((q, idx) => ({
    ...q,
    id: idx + 1,
    subject: "Geral",
    difficulty: "media",
    tags: [],
  }));
};

export const extractWordLayoutInfo = async (
  file: File
): Promise<WordLayoutInfo> => {
  const zip = await JSZip.loadAsync(file);
  const docXml = await zip.file("word/document.xml")?.async("text");
  const stylesXml = await zip.file("word/styles.xml")?.async("text");
  if (!docXml || !stylesXml)
    throw new Error("Arquivo Word inválido ou sem informações de layout");

  const doc = new DOMParser().parseFromString(docXml, "text/xml");
  const styles = new DOMParser().parseFromString(stylesXml, "text/xml");

  const sectPr = doc.querySelector("w\\:sectPr, sectPr");
  const pgMar = sectPr?.querySelector("w\\:pgMar, pgMar");
  const marginTop = pgMar ? pxToCm(pgMar.getAttribute("w:top") || "720") : 2.5;
  const marginBottom = pgMar
    ? pxToCm(pgMar.getAttribute("w:bottom") || "720")
    : 2.5;
  const marginLeft = pgMar
    ? pxToCm(pgMar.getAttribute("w:left") || "720")
    : 2.5;
  const marginRight = pgMar
    ? pxToCm(pgMar.getAttribute("w:right") || "720")
    : 2.5;

  const docDefaults = styles.querySelector(
    "w\\:docDefaults w\\:rPrDefault rPr, docDefaults rPrDefault rPr"
  );
  const fontEl = docDefaults?.querySelector("w\\:rFonts, rFonts");
  const szEl = docDefaults?.querySelector("w\\:sz, sz");
  const fontFamily =
    fontEl?.getAttribute("w:ascii") ||
    fontEl?.getAttribute("w:hAnsi") ||
    "Arial";
  const fontSize = szEl
    ? (parseInt(szEl.getAttribute("w:val") || "24") / 2).toString()
    : "12";

  const spacingEl = docDefaults?.querySelector("w\\:spacing, spacing");
  const lineSpacing = spacingEl
    ? (parseInt(spacingEl.getAttribute("w:line") || "360") / 240).toFixed(1)
    : "1.5";

  return {
    fontSize,
    fontFamily,
    lineSpacing,
    marginTop: marginTop.toFixed(1),
    marginBottom: marginBottom.toFixed(1),
    marginLeft: marginLeft.toFixed(1),
    marginRight: marginRight.toFixed(1),
  };
};

function pxToCm(twips: string): number {
  const dxa = parseInt(twips) || 0;
  return dxa / 567;
}
