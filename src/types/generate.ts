import { Table } from "docx";

export interface Alternative {
  letter?: string;
  text?: string;
  texto?: string;
}

export interface ParsedQuestion {
  id: number;
  statement: string;
  subject: string;
  difficulty: string;
  tags: string[];
  alternatives: Alternative[];
}

export type borderStyle =
  | "none"
  | "nil"
  | "single"
  | "dashDotStroked"
  | "dashed"
  | "dashSmallGap"
  | "dotDash"
  | "dotDotDash"
  | "dotted"
  | "double"
  | "doubleWave"
  | "inset"
  | "outset"
  | "thick"
  | "thickThinLargeGap"
  | "thickThinMediumGap"
  | "thickThinSmallGap"
  | "thinThickLargeGap"
  | "thinThickMediumGap"
  | "thinThickSmallGap"
  | "triple"
  | "wave";

export interface CellBorder {
  style: borderStyle;
  size: number;
  color: string;
}

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  backgroundColor?: string;
  color?: string;
  alignment?: "left" | "center" | "right";
  verticalAlignment?: "top" | "center" | "bottom";
  borders?: {
    top?: CellBorder;
    bottom?: CellBorder;
    left?: CellBorder;
    right?: CellBorder;
  };
}

export interface HeaderData {
  docxTable: Table;
  rawData: any[][];
  colWidths: number[];
  rowHeights: number[];
  styles: CellStyle[][];
  mergedCells: { row: number; col: number; rowspan: number; colspan: number }[];
  images: {
    row: number;
    col: number;
    data: string;
    width: number;
    height: number;
  }[];
}

export type FieldType = "text" | "number" | "date" | "select" | "sequential";

export interface TemplateField {
  name: string;
  type?: FieldType;
  defaultValue?: string;
  sequentialIndices?: number[];
  description?: string;
  aiHints?: string[];
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  type: "required" | "minLength" | "maxLength" | "pattern" | "custom";
  value?: number | string;
  message?: string;
}

export interface ColumnMapping {
  fieldName: string;
  fieldType: FieldType;
  isSequential: boolean;
  placeholder?: string;
}

export interface TableStructure {
  tableIndex: number;
  rows: number;
  columns: number;
  headerRows: number;
  isDynamic: boolean;
  columnMapping: ColumnMapping[];
}

export interface DocumentTemplate {
  id: number;
  name: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  fileContent?: string | null;
  fields: TemplateField[];
  structure?: TableStructure[];
  createdAt: string;
  updatedAt: string;
}