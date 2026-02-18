// wordTableExtractor.ts
// Extrator de estrutura de tabelas de arquivos Word (.docx)

import JSZip from "jszip";

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
  /**
   * Extrai estrutura completa de tabelas de um arquivo Word
   */
  async extractFromDocx(file: File | Buffer): Promise<ExtractionResult> {
    let buffer: ArrayBuffer;

    if (file instanceof File) {
      buffer = await file.arrayBuffer();
    } else {
      buffer = file.buffer;
    }

    // Descompactar o arquivo .docx (é um ZIP)
    const zip = await JSZip.loadAsync(buffer);

    // Extrair document.xml
    const documentXml = await zip.file("word/document.xml")?.async("text");

    if (!documentXml) {
      throw new Error("Arquivo Word inválido: document.xml não encontrado");
    }

    // Parse do XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXml, "text/xml");

    // Extrair tabelas
    const tables = this.extractTables(xmlDoc);

    // Identificar campos e estrutura
    const { fields, structure } = this.analyzeTablesStructure(tables);

    return {
      fields,
      structure,
      tables,
      rawContent: documentXml,
    };
  }

  /**
   * Extrai todas as tabelas do documento XML
   */
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
        // Primeira linha é header, restantes são dados
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

  /**
   * Analisa estrutura das tabelas e identifica campos
   */
  private analyzeTablesStructure(tables: ExtractedTable[]): {
    fields: TemplateField[];
    structure: TableStructure[];
  } {
    const fieldsMap = new Map<string, Set<number>>();
    const structures: TableStructure[] = [];

    tables.forEach((table, tableIndex) => {
      // Pular tabelas sem placeholders (ex: cabeçalho do documento)
      if (table.placeholderRows.length === 0) {
        return;
      }

      const columns = table.headerRow.length;
      const columnMapping: ColumnMapping[] = [];

      // Mapear cada coluna
      for (let colIdx = 0; colIdx < columns; colIdx++) {
        const headerText = table.headerRow[colIdx];

        // Coletar todos os placeholders desta coluna
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

            // Registrar campo sequencial
            if (!fieldsMap.has(fieldName)) {
              fieldsMap.set(fieldName, new Set());
            }
            fieldsMap.get(fieldName)!.add(index);
          }
        });

        // Se encontrou placeholders, mapear coluna
        if (placeholders.size > 0) {
          const fieldName = Array.from(placeholders)[0]; // Primeiro placeholder

          columnMapping.push({
            fieldName,
            fieldType: this.inferFieldType(fieldName),
            isSequential: indices.size > 0,
            placeholder: headerText,
          });
        } else {
          // Coluna sem placeholder
          columnMapping.push({
            fieldName: this.sanitizeFieldName(headerText),
            fieldType: "text",
            isSequential: false,
            placeholder: headerText,
          });
        }
      }

      // Criar estrutura da tabela
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

    // Construir lista de campos
    const fields: TemplateField[] = [];

    fieldsMap.forEach((indices, fieldName) => {
      const sortedIndices = Array.from(indices).sort((a, b) => a - b);

      fields.push({
        name: fieldName,
        type: this.inferFieldType(fieldName),
        defaultValue: "",
        sequentialIndices: sortedIndices,
        description: this.generateDescription(fieldName),
      });
    });

    return { fields, structure: structures };
  }

  /**
   * Inferir tipo do campo baseado no nome
   */
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

  /**
   * Sanitizar nome de campo
   */
  private sanitizeFieldName(text: string): string {
    return text
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .substring(0, 50);
  }

  /**
   * Gerar descrição do campo
   */
  private generateDescription(fieldName: string): string {
    const descriptions: Record<string, string> = {
      ANO: "Ano letivo",
      TRIMESTRE: "Trimestre do ano letivo (1º, 2º, 3º, 4º)",
      COMPONENTECURRICULAR: "Componente curricular/Disciplina",
      UNIDADETEMATICA: "Unidade temática do conteúdo",
      HABILIDADEPRIORIZADA: "Habilidade BNCC priorizada",
      HABILIDADERECOMP: "Habilidade de recomposição de aprendizagem",
      HABILIDADESUPORTE: "Habilidade de suporte",
      COMPETENCIAESPECIFICA: "Objeto do conhecimento e competência específica",
      EXEMPLOPRATIC: "Exemplos de práticas pedagógicas",
      EVIDENCIAHABILIDADE: "Evidências de consolidação de habilidade",
    };

    return descriptions[fieldName] || `Campo ${fieldName}`;
  }
}

/**
 * Função auxiliar para processar upload de template
 */
export async function processDocxUpload(file: File): Promise<DocumentTemplate> {
  const extractor = new WordTableExtractor();
  const result = await extractor.extractFromDocx(file);

  console.log("📊 Extração concluída:");
  console.log(`- Campos encontrados: ${result.fields.length}`);
  console.log(`- Tabelas dinâmicas: ${result.structure.length}`);
  console.log(
    `- Campos sequenciais:`,
    result.fields.filter(
      (f) => f.sequentialIndices && f.sequentialIndices.length > 0,
    ).length,
  );

  // Criar template
  const template: DocumentTemplate = {
    id: 0, // Será gerado pelo backend
    name: file.name.replace(".docx", ""),
    filePath: "", // Será preenchido pelo backend
    fileName: file.name,
    fileSize: file.size,
    fields: result.fields,
    structure: result.structure,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return template;
}

/**
 * Hook React para usar o extrator
 */
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