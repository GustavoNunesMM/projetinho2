import JSZip from "jszip";
import { useState } from "React";

import {
  DocumentTemplate,
  TemplateField,
  TableStructure,
  ColumnMapping,
  FieldType,
} from "@/types/generate.ts";

interface ExtractedTable {
  rows: string[][];
  headerRow: string[];
  placeholderRows: string[][];
}

interface ExtractionResult {
  fields: TemplateField[];
  structure: TableStructure[];
  tables: ExtractedTable[];
  rawContent: string;
}

export class WordTableExtractor {
  async extractFromDocx(file: File | Buffer): Promise<ExtractionResult> {
    let buffer: ArrayBuffer;

    if (file instanceof File) {
      buffer = await file.arrayBuffer();
    } else {
      buffer = file.buffer;
    }

    const zip = await JSZip.loadAsync(buffer);

    const documentXml = await zip.file("word/document.xml")?.async("text");

    if (!documentXml) {
      throw new Error("Arquivo Word inválido: document.xml não encontrado");
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXml, "text/xml");

    const tables = this.extractTables(xmlDoc);

    const { fields, structure } = this.analyzeTablesStructure(tables);

    return {
      fields,
      structure,
      tables,
      rawContent: documentXml,
    };
  }

  private extractTables(xmlDoc: Document): ExtractedTable[] {
    const tables: ExtractedTable[] = [];
    const tblElements = xmlDoc.getElementsByTagNameNS(
      "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
      "tbl",
    );

    for (let i = 0; i < tblElements.length; i++) {
      const table = tblElements[i];
      const rows: string[][] = [];

      const trElements = table.getElementsByTagNameNS(
        "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
        "tr",
      );

      for (let j = 0; j < trElements.length; j++) {
        const row = trElements[j];
        const cells: string[] = [];

        const tcElements = row.getElementsByTagNameNS(
          "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
          "tc",
        );

        for (let k = 0; k < tcElements.length; k++) {
          const cell = tcElements[k];
          const tElements = cell.getElementsByTagNameNS(
            "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
            "t",
          );

          let cellText = "";

          for (let l = 0; l < tElements.length; l++) {
            cellText += tElements[l].textContent || "";
          }

          cells.push(cellText.trim());
        }

        rows.push(cells);
      }

      if (rows.length > 0) {
        const headerRow = rows[0];
        const placeholderRows = rows
          .slice(1)
          .filter((row) =>
            row.some((cell) => cell.includes("{{") && cell.includes("}}")),
          );

        tables.push({
          rows,
          headerRow,
          placeholderRows,
        });
      }
    }

    return tables;
  }

  private analyzeTablesStructure(tables: ExtractedTable[]): {
    fields: TemplateField[];
    structure: TableStructure[];
  } {
    const fieldsMap = new Map<string, Set<number>>();
    const structures: TableStructure[] = [];

    tables.forEach((table) => {
      if (table.placeholderRows.length === 0) {
        return;
      }

      const columns = table.headerRow.length;
      const columnMapping: ColumnMapping[] = [];

      for (let colIdx = 0; colIdx < columns; colIdx++) {
        const headerText = table.headerRow[colIdx];

        const placeholders = new Set<string>();
        const indices = new Set<number>();

        table.placeholderRows.forEach((row) => {
          const cellText = row[colIdx] || "";
          const matches = cellText.matchAll(/\{\{([A-Z_]+)_(\d+)\}\}/g);

          for (const match of matches) {
            const fieldName = match[1];
            const index = parseInt(match[2]);

            placeholders.add(fieldName);
            indices.add(index);

            if (!fieldsMap.has(fieldName)) {
              fieldsMap.set(fieldName, new Set());
            }
            fieldsMap.get(fieldName)!.add(index);
          }
        });

        if (placeholders.size > 0) {
          const fieldName = Array.from(placeholders)[0];

          columnMapping.push({
            fieldName,
            fieldType: this.inferFieldType(fieldName),
            isSequential: indices.size > 0,
            placeholder: headerText,
          });
        } else {
          columnMapping.push({
            fieldName: this.sanitizeFieldName(headerText),
            fieldType: "text",
            isSequential: false,
            placeholder: headerText,
          });
        }
      }

      if (columnMapping.length > 0) {
        structures.push({
          tableIndex: structures.length,
          rows: table.rows.length,
          columns,
          headerRows: 1,
          isDynamic: table.placeholderRows.length > 0,
          columnMapping,
        });
      }
    });

    const fields: TemplateField[] = [];

    fieldsMap.forEach((indices, fieldName) => {
      const sortedIndices = Array.from(indices).sort((a, b) => a - b);

      fields.push({
        name: fieldName,
        type: this.inferFieldType(fieldName),
        defaultValue: "",
        sequentialIndices: sortedIndices,
        description: fieldName,
      });
    });

    return { fields, structure: structures };
  }

  private inferFieldType(fieldName: string): FieldType {
    const name = fieldName.toUpperCase();

    if (
      name.includes("DATA") ||
      name.includes("DATE") ||
      name.includes("INICIO") ||
      name.includes("TERMINO")
    ) {
      return "date";
    }
    if (
      name.includes("NUM") ||
      name.includes("QUANTIDADE") ||
      name.includes("IDADE") ||
      name.includes("AULAS")
    ) {
      return "number";
    }
    if (
      name.includes("TRIMESTRE") ||
      name.includes("ANO") ||
      name.includes("NIVEL")
    ) {
      return "select";
    }

    return "text";
  }

  private sanitizeFieldName(text: string): string {
    return text
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .substring(0, 50);
  }
}

export async function processDocxUpload(file: File): Promise<DocumentTemplate> {
  const extractor = new WordTableExtractor();
  const result = await extractor.extractFromDocx(file);

  const template: DocumentTemplate = {
    id: 0,
    name: file.name.replace(".docx", ""),
    filePath: "",
    fileName: file.name,
    fileSize: file.size,
    fields: result.fields,
    structure: result.structure,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return template;
}

export function useDocxExtractor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractTemplate = async (
    file: File,
  ): Promise<DocumentTemplate | null> => {
    setLoading(true);
    setError(null);

    try {
      const template = await processDocxUpload(file);

      return template;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao processar arquivo";

      setError(message);
      console.error("Erro na extração:", err);

      return null;
    } finally {
      setLoading(false);
    }
  };

  return { extractTemplate, loading, error };
}
