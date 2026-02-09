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

export interface TemplateField {
  name: string;
  type?: string;
  defaultValue?: string;
  sequentialIndices?: number[];
}

export interface DocumentTemplate {
  id: number;
  name: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  fileContent?: string | null;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedDocument {
  id: number;
  templateId: number;
  name: string;
  filePath: string;
  fileName: string;
  fileContent?: string | null;
  filledFields: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
