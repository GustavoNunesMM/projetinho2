import JSZip from "jszip";
import mammoth from "mammoth";

import {TemplateField} from "@/types/documentGeneration";

// Regex para campos: {{CAMPO}} ou {{CAMPO_1}}
// Captura: nome do campo (só letras/números) + índice opcional (após underscore)
// Exemplo: {{ANO_1}} -> grupos: ["{{ANO_1}}", "ANO", "1"]
const FIELD_REGEX = /\{\{([A-Za-z][A-Za-z0-9]*)(?:_(\d+))?\}\}/g;

export function extractFields(text: string): TemplateField[] {
    const fields: TemplateField[] = [];
    const seenFields = new Set<string>();
    const sequentialFields = new Map<string, number[]>();

    console.log("=== EXTRAINDO CAMPOS ===");
    console.log(
        "Texto a processar (primeiros 500 chars):",
        text.substring(0, 500),
    );

    // Criar novo regex a cada execução para evitar problemas com lastIndex
    const fieldRegex = new RegExp(FIELD_REGEX.source, FIELD_REGEX.flags);

    let match;
    while ((match = fieldRegex.exec(text)) !== null) {
        const fieldName = match[1];
        const index = match[2] ? parseInt(match[2], 10) : null;

        console.log(
            `Encontrado: ${match[0]} -> nome: ${fieldName}, índice: ${index}`,
        );

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

    console.log("Campos únicos encontrados:", Array.from(seenFields));
    console.log(
        "Campos sequenciais encontrados:",
        Array.from(sequentialFields.entries()),
    );

    sequentialFields.forEach((indices, fieldName) => {
        fields.push({
            name: fieldName,
            type: "sequential",
            defaultValue: "",
            sequentialIndices: indices,
        });
    });

    console.log("Campos finais:", fields);

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

        console.log("=== PROCESSANDO DOCX - DOCUMENT.XML ===");
        console.log("Field values recebidos:", fieldValues);
        console.log("Campos no XML:", documentXml.match(FIELD_REGEX));

        processedXml = processedXml.replace(
            FIELD_REGEX,
            (match, fieldName, indexStr) => {
                let value = "";

                console.log(`\n📝 Processando: ${match}`);
                console.log(`  - fieldName: ${fieldName}, indexStr: ${indexStr}`);

                if (indexStr) {
                    const index = parseInt(indexStr, 10);
                    // Primeiro, tentar buscar por chave específica (fieldName_index)
                    const fieldKey = `${fieldName}_${index}`;
                    const specificValue = fieldValues[fieldKey];
                    console.log(
                        `  - Buscando chave específica: ${fieldKey} = ${specificValue}`,
                    );

                    if (typeof specificValue === "string" && specificValue) {
                        value = specificValue;
                        console.log(`  ✅ Encontrado na chave específica: "${value}"`);
                    } else {
                        // Fallback: tentar buscar no array
                        const arrayValue = fieldValues[fieldName];
                        console.log(`  - Tentando array: ${fieldName} =`, arrayValue);

                        if (Array.isArray(arrayValue)) {
                            // Assumir que os índices começam em 1 e são sequenciais
                            const arrayIndex = index - 1;
                            if (arrayIndex >= 0 && arrayIndex < arrayValue.length) {
                                value = arrayValue[arrayIndex];
                                console.log(
                                    `  ✅ Encontrado no array[${arrayIndex}]: "${value}"`,
                                );
                            } else {
                                console.log(
                                    `  ❌ Índice ${arrayIndex} fora do range do array (length: ${arrayValue.length})`,
                                );
                            }
                        } else {
                            console.log(`  ❌ Não é array:`, typeof arrayValue);
                        }
                    }
                } else {
                    const fieldValue = fieldValues[fieldName];
                    console.log(`  - Campo único, valor:`, fieldValue);
                    value = typeof fieldValue === "string" ? fieldValue : "";
                    if (value) {
                        console.log(`  ✅ Valor: "${value}"`);
                    }
                }

                if (!value) {
                    console.log(`  ⚠️ NENHUM VALOR ENCONTRADO - deixando ${match}`);
                }
                const escapedValue = value
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
                processedHeader = processedHeader.replace(
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
                        const escapedValue = value
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
                processedFooter = processedFooter.replace(
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
                        const escapedValue = value
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

        const newBlob = await zip.generateAsync({type: "blob"});
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