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
  BorderStyle,
} from "docx";
import { HeaderData, CellStyle, CellBorder } from "@/types/documentGeneration";

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

    // Ler documento XML principal
    const docXml = await zip.file("word/document.xml")?.async("text");
    if (!docXml) throw new Error("Documento Word inválido");

    // Ler relacionamentos para mapear imagens
    const relsXml = await zip
      .file("word/_rels/document.xml.rels")
      ?.async("text");
    const relationshipMap = relsXml ? parseRelationships(relsXml) : new Map();

    console.log("Relationships:", relationshipMap);

    const parser = new DOMParser();
    const doc = parser.parseFromString(docXml, "text/xml");

    // Encontrar primeira tabela
    const tableEl = doc.querySelector("w\\:tbl, tbl");
    if (!tableEl) throw new Error("Nenhuma tabela encontrada no Word");

    // Processar imagens
    const imageMap = await extractImages(zip);
    console.log("Images found:", imageMap.size);

    // Processar linhas da tabela
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

    // Primeira passada: coletar todas as células
    const tableRows = tableEl.querySelectorAll("w\\:tr, tr");
    const parsedTable: ParsedCell[][] = [];
    const tcElements: Element[][] = []; // Guardar referência aos elementos originais

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

    console.log("Parsed table structure:", parsedTable);

    // Processar mesclagens e criar grid real
    const grid: (ParsedCell | null)[][] = [];

    for (let r = 0; r < parsedTable.length; r++) {
      if (!grid[r]) grid[r] = [];

      let cellIndex = 0;
      let gridCol = 0;

      while (cellIndex < parsedTable[r].length) {
        // Encontrar próxima coluna vazia no grid
        while (grid[r][gridCol] !== undefined) {
          gridCol++;
        }

        const cell = parsedTable[r][cellIndex];

        // Se a célula é continuação de vMerge, não incluir no grid como célula visível
        if (cell.vMerge === "continue") {
          cellIndex++;
          continue;
        }

        // Colocar célula no grid
        grid[r][gridCol] = cell;

        // Preencher colspan
        for (let c = 1; c < cell.gridSpan; c++) {
          grid[r][gridCol + c] = null; // Célula mesclada horizontalmente
        }

        // Preencher rowspan
        if (cell.vMerge === "restart") {
          // Contar quantas linhas seguem com vMerge="continue" na mesma posição
          let rowspanCount = 1;

          for (let nextR = r + 1; nextR < parsedTable.length; nextR++) {
            // Verificar se há continuação de merge nesta posição
            let foundContinue = false;
            let tempCellIndex = 0;
            let tempGridCol = 0;

            for (const nextCell of parsedTable[nextR]) {
              // Pular posições já ocupadas no grid
              while (grid[nextR] && grid[nextR][tempGridCol] !== undefined) {
                tempGridCol++;
              }

              if (tempGridCol === gridCol && nextCell.vMerge === "continue") {
                foundContinue = true;
                rowspanCount++;

                // Marcar células como null no grid (espaço ocupado por rowspan)
                for (let c = 0; c < cell.gridSpan; c++) {
                  if (!grid[nextR]) grid[nextR] = [];
                  grid[nextR][gridCol + c] = null;
                }
                break;
              }

              tempGridCol += nextCell.gridSpan;
              tempCellIndex++;
            }

            if (!foundContinue) break;
          }

          cell.rowspan = rowspanCount;
        }

        gridCol += cell.gridSpan;
        cellIndex++;
      }
    }

    console.log("Grid structure:", grid);

    // Criar células do docx
    for (let r = 0; r < grid.length; r++) {
      const rowData: string[] = [];
      const rowStyles: CellStyle[] = [];
      const tableCells: TableCell[] = [];

      let originalCellIndex = 0;

      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];

        // Pular células null (mescladas)
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

        if (cell.gridSpan > 1 || cell.rowspan > 1) {
          mergedCells.push({
            row: r,
            col: c,
            rowspan: cell.rowspan,
            colspan: cell.gridSpan,
          });
        }

        // Buscar imagem
        let imgData = null;
        if (cell.hasImage && cell.imageId) {
          const target = relationshipMap.get(cell.imageId);
          if (target) {
            const filename = target.replace("media/", "");
            imgData = imageMap.get(filename);
            console.log(
              `Image for cell [${r},${c}]:`,
              filename,
              imgData ? "found" : "not found"
            );

            // Tentar obter dimensões do elemento original
            const tcEl = tcElements[r]?.[originalCellIndex];
            if (tcEl) {
              const drawing = tcEl.querySelector("w\\:drawing, drawing");
              if (drawing) {
                const extent = drawing.querySelector("wp\\:extent, extent");
                if (extent && imgData) {
                  const cx = extent.getAttribute("cx");
                  const cy = extent.getAttribute("cy");
                  if (cx && cy) {
                    imgData = {
                      ...imgData,
                      width: Math.round(parseInt(cx) / 9525),
                      height: Math.round(parseInt(cy) / 9525),
                    };
                  }
                }
              }
            }
          }
        }

        originalCellIndex++;

        const cellChildren: any[] = [];

        if (imgData) {
          // Usar dimensões originais ou aplicar escala se muito grande
          let finalWidth = imgData.width;
          let finalHeight = imgData.height;

          // Se a imagem for muito grande, redimensionar mantendo proporção
          const maxWidth = 250;
          const maxHeight = 250;

          if (finalWidth > maxWidth || finalHeight > maxHeight) {
            const widthRatio = maxWidth / finalWidth;
            const heightRatio = maxHeight / finalHeight;
            const scale = Math.min(widthRatio, heightRatio);

            finalWidth = Math.round(finalWidth * scale);
            finalHeight = Math.round(finalHeight * scale);
          }

          images.push({
            row: r,
            col: c,
            data: imgData.base64,
            width: finalWidth,
            height: finalHeight,
          });

          cellChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: base64ToUint8Array(imgData.base64),
                  transformation: {
                    width: finalWidth,
                    height: finalHeight,
                  },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: cell.spacing,
            })
          );
        }

        if (cell.text) {
          cellChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: cell.text,
                  bold: cell.bold,
                  italics: cell.italic,
                  underline: cell.underline ? {} : undefined,
                  size: cell.fontSize * 2,
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
        }

        // Se não tem conteúdo (nem imagem nem texto), adicionar parágrafo vazio
        if (cellChildren.length === 0) {
          cellChildren.push(new Paragraph({ text: "", spacing: cell.spacing }));
        }

        tableCells.push(
          new TableCell({
            children: cellChildren,
            width: { size: 2500, type: WidthType.DXA },
            columnSpan: cell.gridSpan > 1 ? cell.gridSpan : undefined,
            rowSpan: cell.rowspan > 1 ? cell.rowspan : undefined,
            verticalAlign:
              cell.verticalAlignment === "top"
                ? VerticalAlign.TOP
                : cell.verticalAlignment === "bottom"
                  ? VerticalAlign.BOTTOM
                  : VerticalAlign.CENTER,
            shading: cell.backgroundColor
              ? {
                  fill: cell.backgroundColor,
                  color: cell.backgroundColor,
                }
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

      if (tableCells.length > 0) {
        rawData.push(rowData);
        styles.push(rowStyles);
        rows.push(new TableRow({ children: tableCells }));
      }
    }

    const table = new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
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

// ============ FUNÇÕES AUXILIARES ============

function parseCellFromXml(tcEl: Element): ParsedCell {
  const tcPr = tcEl.querySelector("w\\:tcPr, tcPr");

  // GridSpan (colspan)
  const gridSpan = tcPr?.querySelector("w\\:gridSpan, gridSpan");
  const gridSpanValue = gridSpan
    ? parseInt(gridSpan.getAttribute("w:val") || "1")
    : 1;

  // vMerge (rowspan)
  const vMerge = tcPr?.querySelector("w\\:vMerge, vMerge");
  let vMergeStatus: "restart" | "continue" | null = null;

  if (vMerge) {
    const val = vMerge.getAttribute("w:val");
    // Se não tem atributo val, significa "continue"
    vMergeStatus = !val || val === "continue" ? "continue" : "restart";
  }

  // Cor de fundo
  const shd = tcPr?.querySelector("w\\:shd, shd");
  let backgroundColor = shd?.getAttribute("w:fill") ?? undefined;
  if (backgroundColor === "auto" || backgroundColor === "000000") {
    backgroundColor = undefined;
  }

  // Alinhamento vertical
  const vAlign = tcPr?.querySelector("w\\:vAlign, vAlign");
  const vAlignVal = vAlign?.getAttribute("w:val");
  const verticalAlignment: "top" | "center" | "bottom" =
    vAlignVal === "top" ? "top" : vAlignVal === "bottom" ? "bottom" : "center";

  // Bordas
  const tcBorders = tcPr?.querySelector("w\\:tcBorders, tcBorders");
  const borders = {
    top: parseBorderFromXml(tcBorders?.querySelector("w\\:top, top")),
    bottom: parseBorderFromXml(tcBorders?.querySelector("w\\:bottom, bottom")),
    left: parseBorderFromXml(tcBorders?.querySelector("w\\:left, left")),
    right: parseBorderFromXml(tcBorders?.querySelector("w\\:right, right")),
  };

  // Processar parágrafos
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

    // Alinhamento
    const jc = pPr?.querySelector("w\\:jc, jc");
    if (jc) {
      const alignVal = jc.getAttribute("w:val");
      if (alignVal === "center") alignment = "center";
      else if (alignVal === "right") alignment = "right";
      else if (alignVal === "left") alignment = "left";
    }

    // Espaçamento
    const spacingEl = pPr?.querySelector("w\\:spacing, spacing");
    if (spacingEl) {
      const before = spacingEl.getAttribute("w:before");
      const after = spacingEl.getAttribute("w:after");
      const line = spacingEl.getAttribute("w:line");

      spacing = {
        before: before ? parseInt(before) : undefined,
        after: after ? parseInt(after) : undefined,
        line: line ? parseInt(line) : undefined,
      };
    }

    // Verificar imagem
    const drawing = p.querySelector("w\\:drawing, drawing");
    if (drawing) {
      hasImage = true;
      const blip = drawing.querySelector("a\\:blip, blip");
      if (blip) {
        imageId =
          blip.getAttribute("r:embed") ||
          blip.getAttribute("embed") ||
          undefined;
      }
    }

    // Runs de texto
    const runs = p.querySelectorAll("w\\:r, r");
    runs.forEach((r) => {
      const rPr = r.querySelector("w\\:rPr, rPr");

      if (rPr?.querySelector("w\\:b, b")) bold = true;
      if (rPr?.querySelector("w\\:i, i")) italic = true;
      if (rPr?.querySelector("w\\:u, u")) underline = true;

      const sz = rPr?.querySelector("w\\:sz, sz");
      if (sz) {
        const sizeVal = sz.getAttribute("w:val");
        if (sizeVal) fontSize = parseInt(sizeVal) / 2;
      }

      const rFonts = rPr?.querySelector("w\\:rFonts, rFonts");
      if (rFonts) {
        const asciiFont =
          rFonts.getAttribute("w:ascii") || rFonts.getAttribute("w:hAnsi");
        if (asciiFont) fontFamily = asciiFont;
      }

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

function parseBorderFromXml(
  borderEl: Element | null | undefined
): CellBorder | undefined {
  if (!borderEl) return undefined;

  const val = borderEl.getAttribute("w:val");
  if (!val || val === "none" || val === "nil") return undefined;

  const sizeAttr = borderEl.getAttribute("w:sz");
  const size = sizeAttr ? parseInt(sizeAttr) : 4;
  const colorAttr = borderEl.getAttribute("w:color");
  const color = colorAttr && colorAttr !== "auto" ? colorAttr : "000000";

  return {
    style: "single",
    size,
    color,
  };
}

function convertBorderToDocx(border: CellBorder | undefined) {
  if (!border) {
    return { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  }

  return {
    style: BorderStyle.SINGLE,
    size: border.size,
    color: border.color,
  };
}

function parseRelationships(relsXml: string): Map<string, string> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(relsXml, "text/xml");
  const relationships = new Map<string, string>();

  const rels = doc.querySelectorAll("Relationship");
  rels.forEach((rel) => {
    const id = rel.getAttribute("Id");
    const target = rel.getAttribute("Target");
    if (id && target) {
      relationships.set(id, target);
    }
  });

  return relationships;
}

async function extractImages(
  zip: JSZip
): Promise<Map<string, { base64: string; width: number; height: number }>> {
  const imageMap = new Map();
  const mediaFolder = zip.folder("word/media");

  if (mediaFolder) {
    const files = Object.keys(mediaFolder.files);
    for (const filename of files) {
      const file = mediaFolder.files[filename];
      if (!file.dir && filename.includes("word/media/")) {
        const data = await file.async("base64");
        const shortName = filename.replace("word/media/", "");
        const ext = shortName.split(".").pop()?.toLowerCase();
        const mimeType =
          ext === "png"
            ? "image/png"
            : ext === "jpg" || ext === "jpeg"
              ? "image/jpeg"
              : ext === "gif"
                ? "image/gif"
                : "image/png";

        const base64String = `data:${mimeType};base64,${data}`;
        const dimensions = await getImageDimensions(base64String);

        imageMap.set(shortName, {
          base64: base64String,
          width: dimensions.width,
          height: dimensions.height,
        });

        console.log(`Loaded image: ${shortName}`, dimensions);
      }
    }
  }

  return imageMap;
}

function getImageDimensions(
  base64: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      resolve({ width: 150, height: 60 });
    };
    img.src = base64;
  });
}

function base64ToUint8Array(base64: string): Uint8Array {
  const data = base64.includes(",") ? base64.split(",")[1] : base64;
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
