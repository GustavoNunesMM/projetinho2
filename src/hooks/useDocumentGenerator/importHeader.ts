import JSZip from "jszip";
import {
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  ImageRun,
  WidthType,
  AlignmentType,
  VerticalAlign,
} from "docx";
import {
  HeaderData,
  CellStyle,
  CellBorder,
  borderStyle,
} from "@/types/documentGeneration";

interface ParsedCell {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  alignment: "left" | "center" | "right";
  verticalAlignment: "top" | "center" | "bottom";
  spacing?: { before?: number; after?: number; line?: number };
  borders: {
    top?: CellBorder;
    bottom?: CellBorder;
    left?: CellBorder;
    right?: CellBorder;
  };
  colspan: number;
  rowspan: number;
  gridSpan: number;
  vMerge: "restart" | "continue" | null;
  hasImage: boolean;
  imageId?: string;
}

export function useHeaderFromWord() {
  const importHeaderFromDocx = async (file: File): Promise<HeaderData[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const docXml = await zip.file("word/document.xml")?.async("text");
    if (!docXml) throw new Error("Documento Word inválido");

    const relsXml = await zip
      .file("word/_rels/document.xml.rels")
      ?.async("text");
    const relationshipMap = relsXml ? parseRelationships(relsXml) : new Map();

    const parser = new DOMParser();
    const doc = parser.parseFromString(docXml, "text/xml");

    const tableEl = doc.querySelector("w\\:tbl, tbl");
    if (!tableEl) throw new Error("Nenhuma tabela encontrada no Word");

    /* ---------- bordas DEFAULT da tabela (quando célula não tem própria) ---------- */
    const tblBorders = tableEl.querySelector(
      "w\\:tblPr w\\:tblBorders, tblPr tblBorders"
    );
    const defaultBorder: Record<
      keyof ParsedCell["borders"],
      CellBorder | undefined
    > = {
      top: parseBorderFromXml(tblBorders?.querySelector("w\\:top, top")),
      bottom: parseBorderFromXml(
        tblBorders?.querySelector("w\\:bottom, bottom")
      ),
      left: parseBorderFromXml(tblBorders?.querySelector("w\\:left, left")),
      right: parseBorderFromXml(tblBorders?.querySelector("w\\:right, right")),
    };

    const imageMap = await extractImages(zip);

    /* ---------- parse das linhas / células ---------- */
    const tableRows = tableEl.querySelectorAll("w\\:tr, tr");
    const parsedTable: ParsedCell[][] = [];
    const tcElements: Element[][] = [];

    tableRows.forEach((trEl) => {
      const cells = trEl.querySelectorAll("w\\:tc, tc");
      const parsedRow: ParsedCell[] = [];
      const tcRow: Element[] = [];

      cells.forEach((tcEl) => {
        parsedRow.push(parseCellFromXml(tcEl));
        tcRow.push(tcEl);
      });

      parsedTable.push(parsedRow);
      tcElements.push(tcRow);
    });

    /* ---------- cria grid respeitando span/merge ---------- */
    const grid: (ParsedCell | null)[][] = [];

    for (let r = 0; r < parsedTable.length; r++) {
      if (!grid[r]) grid[r] = [];

      let cellIndex = 0;
      let gridCol = 0;

      while (cellIndex < parsedTable[r].length) {
        while (grid[r][gridCol] !== undefined) gridCol++;

        const cell = parsedTable[r][cellIndex];
        if (cell.vMerge === "continue") {
          cellIndex++;
          continue;
        }

        grid[r][gridCol] = cell;

        for (let c = 1; c < cell.gridSpan; c++) grid[r][gridCol + c] = null;

        if (cell.vMerge === "restart") {
          let rowspanCount = 1;
          for (let nextR = r + 1; nextR < parsedTable.length; nextR++) {
            let foundContinue = false;
            let tempGridCol = 0;
            for (const nextCell of parsedTable[nextR]) {
              while (grid[nextR] && grid[nextR][tempGridCol] !== undefined)
                tempGridCol++;
              if (tempGridCol === gridCol && nextCell.vMerge === "continue") {
                foundContinue = true;
                rowspanCount++;
                for (let c = 0; c < cell.gridSpan; c++) {
                  if (!grid[nextR]) grid[nextR] = [];
                  grid[nextR][gridCol + c] = null;
                }
                break;
              }
              tempGridCol += nextCell.gridSpan;
            }
            if (!foundContinue) break;
          }
          cell.rowspan = rowspanCount;
        }
        gridCol += cell.gridSpan;
        cellIndex++;
      }
    }

    /* ---------- aplica bordas DEFAULT da tabela apenas onde célula NÃO tem própria ---------- */
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        if (!cell) continue;
        if (!cell.borders.top) cell.borders.top = defaultBorder.top;
        if (!cell.borders.bottom) cell.borders.bottom = defaultBorder.bottom;
        if (!cell.borders.left) cell.borders.left = defaultBorder.left;
        if (!cell.borders.right) cell.borders.right = defaultBorder.right;
      }
    }

    /* ---------- propaga bordas entre células adjacentes (opcional) ---------- */
    applyAdjacentBorders(grid);

    /* ---------- monta TableRows / TableCells ---------- */
    const rawData: string[][] = [];
    const styles: CellStyle[][] = [];
    const mergedCells: {
      row: number;
      col: number;
      rowspan: number;
      colspan: number;
    }[] = [];
    const images: {
      row: number;
      col: number;
      data: string;
      width: number;
      height: number;
    }[] = [];
    const rows: TableRow[] = [];
    const gridColEls = Array.from(
      tableEl.querySelectorAll("w\\:tblGrid w\\:gridCol, tblGrid gridCol")
    );
    const colWidthsDXA: number[] = gridColEls.map((col) =>
      parseInt(col.getAttribute("w:w") || "2500")
    );

    for (let r = 0; r < grid.length; r++) {
      const rowData: string[] = [];
      const rowStyles: CellStyle[] = [];
      const tableCells: TableCell[] = [];
      let originalCellIndex = 0;

      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        if (cell === null) continue;

        rowData.push(cell.text);
        rowStyles.push({
          bold: cell.bold,
          italic: cell.italic,
          fontSize: cell.fontSize,
          color: cell.color,
          backgroundColor: cell.backgroundColor,
          alignment: cell.alignment,
          verticalAlignment: cell.verticalAlignment,
          borders: cell.borders,
        });

        if (cell.gridSpan > 1 || cell.rowspan > 1)
          mergedCells.push({
            row: r,
            col: c,
            rowspan: cell.rowspan,
            colspan: cell.gridSpan,
          });

        let imgData: { base64: string; width: number; height: number } | null =
          null;
        if (cell.hasImage && cell.imageId) {
          const target = relationshipMap.get(cell.imageId);
          if (target) {
            const filename = target.replace("media/", "");
            imgData = imageMap.get(filename) ?? null; 
            const tcEl = tcElements[r]?.[originalCellIndex];

            if (tcEl) {
              const drawing = tcEl.querySelector("w\\:drawing, drawing");
              const extent = drawing?.querySelector("wp\\:extent, extent");
              if (extent) {
                const cx = extent.getAttribute("cx"); 
                const cy = extent.getAttribute("cy");
                if (cx && cy) {
                  const width = Math.round(parseInt(cx) / 9525);
                  const height = Math.round(parseInt(cy) / 9525);
                  if (imgData) imgData = { ...imgData, width, height };
                }
              }
            }
          }
        }
        const cellChildren: any[] = [];
        if (imgData) {
          images.push({
            row: r,
            col: c,
            data: imgData.base64,
            width: imgData.width,
            height: imgData.height,
          });

          cellChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imgData.base64,
                  transformation: {
                    width: imgData.width,
                    height: imgData.height,
                  },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { line: 360 },
            })
          );
        }

        if (cell.text)
          cellChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: cell.text,
                  bold: cell.bold,
                  italics: cell.italic,
                  underline: cell.underline ? {} : undefined,
                  size: Math.max(1, Math.round(cell.fontSize * 2)),
                  color: cell.color,
                  font: cell.fontFamily,
                }),
              ],
              alignment:
                cell.alignment === "center"
                  ? AlignmentType.CENTER
                  : cell.alignment === "right"
                    ? AlignmentType.RIGHT
                    : AlignmentType.LEFT,
              spacing: cell.spacing,
            })
          );

        if (cellChildren.length === 0)
          cellChildren.push(new Paragraph({ text: "", spacing: cell.spacing }));

        tableCells.push(
          new TableCell({
            children: cellChildren,
            width: { size: colWidthsDXA[c] || 2500, type: WidthType.DXA },
            columnSpan: cell.gridSpan > 1 ? cell.gridSpan : undefined,
            rowSpan: cell.rowspan > 1 ? cell.rowspan : undefined,
            verticalAlign:
              cell.verticalAlignment === "top"
                ? VerticalAlign.TOP
                : cell.verticalAlignment === "bottom"
                  ? VerticalAlign.BOTTOM
                  : VerticalAlign.CENTER,
            margins: { top: 120, bottom: 120, left: 120, right: 120 }, 
            shading: cell.backgroundColor
              ? { fill: cell.backgroundColor, color: cell.backgroundColor }
              : undefined,
            borders: {
              top: convertBorderToDocx(cell.borders.top),
              bottom: convertBorderToDocx(cell.borders.bottom),
              left: convertBorderToDocx(cell.borders.left),
              right: convertBorderToDocx(cell.borders.right),
            },
          })
        );
      }

      if (tableCells.length) {
        rawData.push(rowData);
        styles.push(rowStyles);
        rows.push(new TableRow({ children: tableCells }));
      }
    }

    const table = new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: colWidthsDXA,
    });

    return [
      {
        docxTable: table,
        rawData,
        colWidths: [],
        rowHeights: [],
        styles,
        mergedCells,
        images,
      },
    ];
  };

  return { importHeaderFromDocx };
}

/* ------------------------------------------------------------------ */
/* ---------------------- FUNÇÕES AUXILIARES ------------------------ */
/* ------------------------------------------------------------------ */

function parseCellFromXml(tcEl: Element): ParsedCell {
  const tcPr = tcEl.querySelector("w\\:tcPr, tcPr");

  const gridSpan = tcPr?.querySelector("w\\:gridSpan, gridSpan");
  const gridSpanValue = gridSpan
    ? parseInt(gridSpan.getAttribute("w:val") || "1")
    : 1;

  const vMerge = tcPr?.querySelector("w\\:vMerge, vMerge");
  let vMergeStatus: "restart" | "continue" | null = null;
  if (vMerge) {
    const val = vMerge.getAttribute("w:val");
    vMergeStatus = !val || val === "continue" ? "continue" : "restart";
  }

  const shd = tcPr?.querySelector("w\\:shd, shd");
  let backgroundColor = shd?.getAttribute("w:fill") ?? undefined;
  if (backgroundColor === "auto" || backgroundColor === "000000")
    backgroundColor = undefined;

  const vAlign = tcPr?.querySelector("w\\:vAlign, vAlign");
  const vAlignVal = vAlign?.getAttribute("w:val");
  const verticalAlignment: "top" | "center" | "bottom" =
    vAlignVal === "top" ? "top" : vAlignVal === "bottom" ? "bottom" : "center";

  const borders = getCellBordersFromXml(tcPr);


  const paragraphs = tcEl.querySelectorAll("w\\:p, p");
  let text = "";
  let bold = false;
  let italic = false;
  let underline = false;
  let fontSize = 11;
  let fontFamily = "Calibri";
  let color = "000000";
  let alignment: "left" | "center" | "right" = "left";
  let spacing: { before?: number; after?: number; line?: number } | undefined;
  let hasImage = false;
  let imageId: string | undefined;

  paragraphs.forEach((p) => {
    const pPr = p.querySelector("w\\:pPr, pPr");
    const jc = pPr?.querySelector("w\\:jc, jc");
    if (jc) {
      const alignVal = jc.getAttribute("w:val");
      if (alignVal === "center") alignment = "center";
      else if (alignVal === "right") alignment = "right";
      else if (alignVal === "left") alignment = "left";
    }

    const spacingEl = pPr?.querySelector("w\\:spacing, spacing");
    if (spacingEl) {
      spacing = {
        before:
          parseInt(spacingEl.getAttribute("w:before") || "0") || undefined,
        after: parseInt(spacingEl.getAttribute("w:after") || "0") || undefined,
        line: parseInt(spacingEl.getAttribute("w:line") || "0") || undefined,
      };
    }

    const drawing = p.querySelector("w\\:drawing, drawing");
    if (drawing) {
      hasImage = true;
      const blip = drawing.querySelector("a\\:blip, blip");
      imageId =
        blip?.getAttribute("r:embed") ||
        blip?.getAttribute("embed") ||
        undefined;
    }

    const runs = p.querySelectorAll("w\\:r, r");
    runs.forEach((r) => {
      const rPr = r.querySelector("w\\:rPr, rPr");
      if (rPr?.querySelector("w\\:b, b")) bold = true;
      if (rPr?.querySelector("w\\:i, i")) italic = true;
      if (rPr?.querySelector("w\\:u, u")) underline = true;

      const sz = rPr?.querySelector("w\\:sz, sz");
      if (sz) fontSize = parseInt(sz.getAttribute("w:val") || "22") / 2;

      const rFonts = rPr?.querySelector("w\\:rFonts, rFonts");
      if (rFonts)
        fontFamily =
          rFonts.getAttribute("w:ascii") ||
          rFonts.getAttribute("w:hAnsi") ||
          "Calibri";

      const colorEl = rPr?.querySelector("w\\:color, color");
      if (colorEl) {
        const colorVal = colorEl.getAttribute("w:val");
        if (colorVal && colorVal !== "auto") color = colorVal;
      }

      const textEl = r.querySelector("w\\:t, t");
      if (textEl) text += textEl.textContent || "";
    });
  });

  return {
    text: text.trim(),
    bold,
    italic,
    underline,
    fontSize,
    fontFamily,
    color,
    backgroundColor,
    alignment,
    verticalAlignment,
    spacing,
    borders,
    colspan: gridSpanValue,
    rowspan: 1,
    gridSpan: gridSpanValue,
    vMerge: vMergeStatus,
    hasImage,
    imageId,
  };
}

function parseBorderFromXml(borderEl?: Element | null): CellBorder | undefined {
  if (!borderEl) return;
  const val = borderEl.getAttribute("w:val") || borderEl.getAttribute("val");
  if (!val || val === "none" || val === "nil") return;

  const size = parseInt(
    borderEl.getAttribute("w:sz") || borderEl.getAttribute("sz") || "4"
  );
  const colorAttr =
    borderEl.getAttribute("w:color") ||
    borderEl.getAttribute("color") ||
    "000000";
  const color = colorAttr === "auto" ? "000000" : colorAttr;

  return { style: val as borderStyle, size, color };
}

function getCellBordersFromXml(tcPr?: Element | null): {
  top?: CellBorder;
  bottom?: CellBorder;
  left?: CellBorder;
  right?: CellBorder;
} {
  const tcBorders = tcPr?.querySelector("w\\:tcBorders, tcBorders");
  if (!tcBorders) return {};

  return {
    top: parseBorderFromXml(tcBorders.querySelector("w\\:top, top")),
    bottom: parseBorderFromXml(tcBorders.querySelector("w\\:bottom, bottom")),
    left: parseBorderFromXml(tcBorders.querySelector("w\\:left, left")),
    right: parseBorderFromXml(tcBorders.querySelector("w\\:right, right")),
  };
}

function applyAdjacentBorders(grid: (ParsedCell | null)[][]) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c];
      if (cell === null) continue;

      if (!cell.borders.top && r > 0) {
        const above = grid[r - 1][c];
        if (above && above.borders.bottom)
          cell.borders.top = above.borders.bottom;
      }
      if (!cell.borders.bottom && r < grid.length - 1) {
        const below = grid[r + 1][c];
        if (below && below.borders.top) cell.borders.bottom = below.borders.top;
      }
      if (!cell.borders.left && c > 0) {
        const left = grid[r][c - 1];
        if (left && left.borders.right) cell.borders.left = left.borders.right;
      }
      if (!cell.borders.right && c < grid[r].length - 1) {
        const right = grid[r][c + 1];
        if (right && right.borders.left)
          cell.borders.right = right.borders.left;
      }
    }
  }
}

const DOCX_BORDER_MAP: Record<string, any> = {
  single: "single",
  thick: "thick",
  double: "double",
  dashed: "dashed",
  dotted: "dotted",
  inset: "inset",
  outset: "outset",
};

function convertBorderToDocx(border?: CellBorder) {
  if (!border) return { style: "single" as const, size: 0, color: "FFFFFF" };
  const safeStyle = DOCX_BORDER_MAP[border.style] ?? "single";
  return { style: safeStyle, size: border.size, color: border.color };
}

function parseRelationships(relsXml: string): Map<string, string> {
  const doc = new DOMParser().parseFromString(relsXml, "text/xml");
  const map = new Map<string, string>();
  const rels = Array.from(
    doc.getElementsByTagName("Relationship") || doc.getElementsByTagName("Rel")
  ) as Element[];
  rels.forEach((rel) => {
    const id =
      rel.getAttribute("Id") ||
      rel.getAttribute("id") ||
      rel.getAttribute("r:id");
    const target = rel.getAttribute("Target") || rel.getAttribute("target");
    if (id && target) map.set(id, target);
  });
  if (map.size === 0)
    doc.querySelectorAll("[Id],[id]").forEach((n) => {
      const id = n.getAttribute("Id") || n.getAttribute("id");
      const target = n.getAttribute("Target") || n.getAttribute("target");
      if (id && target) map.set(id, target);
    });
  return map;
}

async function extractImages(zip: JSZip) {
  const imageMap = new Map<
    string,
    { base64: string; width: number; height: number }
  >();
  const mediaFiles = zip.file(/^word\/media\/.+$/) || [];
  for (const file of mediaFiles) {
    const shortName = file.name.replace("word/media/", "");
    const ext = shortName.split(".").pop()?.toLowerCase() || "png";
    const mime =
      {
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
      }[ext] || "image/png";
    const base64 = `data:${mime};base64,${await file.async("base64")}`;
    const dims = await getImageDimensions(base64);
    imageMap.set(shortName, { base64, width: dims.width, height: dims.height });
  }
  return imageMap;
}

function getImageDimensions(
  base64: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 150, height: 60 });
    img.src = base64;
  });
}

function base64ToUint8Array(base64: string): Uint8Array {
  const data = base64.includes(",") ? base64.split(",")[1] : base64;
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
