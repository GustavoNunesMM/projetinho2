// exportPdf.ts
import { jsPDF } from "jspdf";
import { Layout } from "@/types/layout";
import { Question } from "@/types/question";
import { HeaderData } from "@/types/documentGeneration";
import { getImageDimensions } from "@/utils/imageImport";

/* ----------  PDF  ---------- */
export const generatePdf = async (
  questions: Question[],
  layout: Layout,
  importedHeader?: HeaderData[]
): Promise<Blob> => {
  try {
    const doc = new jsPDF();
    const marginTop = parseFloat(layout.marginTop || "20");
    const marginBottom = parseFloat(layout.marginBottom || "20");
    const marginLeft = parseFloat(layout.marginLeft || "20");
    const marginRight = parseFloat(layout.marginRight || "20");
    const fontSize = parseFloat(layout.fontSize || "12");
    const lineHeight =
      (fontSize * parseFloat(layout.lineSpacing || "1.15")) / 2;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    let yPosition = marginTop;

    const checkPageBreak = (h: number) => {
      if (yPosition + h > pageHeight - marginBottom) {
        doc.addPage();
        yPosition = marginTop;
      }
    };

    /* ------- HEADER (DOCX) ------- */
    if (importedHeader?.length) {
      const hd = importedHeader[0];
      const tableData = hd.rawData;
      const availW = pageWidth - marginLeft - marginRight;
      const totalW = hd.colWidths.reduce((s, w) => s + w, 0);
      const colWidthsPdf =
        totalW > 0
          ? hd.colWidths.map((w) => (w / totalW) * availW)
          : Array.from(
              { length: Math.max(...tableData.map((r) => r.length)) },
              () => availW / Math.max(tableData[0]?.length || 1, 1)
            );
      const proc = new Set<string>();

      tableData.forEach((row: any[], rIdx) => {
        const rowH = (hd.rowHeights[rIdx] || 20) * 0.35;
        checkPageBreak(rowH);
        let x = marginLeft;

        row.forEach((cell: any, cIdx) => {
          const key = `${rIdx}-${cIdx}`;
          if (proc.has(key)) {
            x += colWidthsPdf[cIdx];
            return;
          }
          const style = hd.styles[rIdx]?.[cIdx] || {};
          const merge = hd.mergedCells.find(
            (m) => m.row === rIdx && m.col === cIdx
          );

          let cellW = colWidthsPdf[cIdx] ?? availW / (row.length || 1);
          let rowSpan = 1;
          let colSpan = 1;

          if (merge) {
            colSpan = merge.colspan;
            rowSpan = merge.rowspan;
            cellW = 0;
            for (let i = 0; i < colSpan; i++)
              cellW += colWidthsPdf[cIdx + i] || 0;
            for (let mr = 0; mr < rowSpan; mr++)
              for (let mc = 0; mc < colSpan; mc++)
                proc.add(`${rIdx + mr}-${cIdx + mc}`);
          }

          /* fundo */
          if (style.backgroundColor) {
            doc.setFillColor(`#${style.backgroundColor}`);
            doc.rect(x, yPosition, cellW, rowH * rowSpan, "F");
          }

          /* bordas */
          const drawBorder = (
            b: { style?: string; color?: string } | undefined,
            line: () => void
          ) => {
            if (b) {
              doc.setDrawColor(`#${b.color || "000000"}`);
              doc.setLineWidth(b.style === "thick" ? 0.5 : 0.2);
              line();
            }
          };
          drawBorder(style.borders?.top, () =>
            doc.line(x, yPosition, x + cellW, yPosition)
          );
          drawBorder(style.borders?.bottom, () =>
            doc.line(
              x,
              yPosition + rowH * rowSpan,
              x + cellW,
              yPosition + rowH * rowSpan
            )
          );
          drawBorder(style.borders?.left, () =>
            doc.line(x, yPosition, x, yPosition + rowH * rowSpan)
          );
          drawBorder(style.borders?.right, () =>
            doc.line(
              x + cellW,
              yPosition,
              x + cellW,
              yPosition + rowH * rowSpan
            )
          );

          /* imagens */
          const cellImgs = hd.images.filter(
            (i) => i.row === rIdx && i.col === cIdx
          );
          let imgY = yPosition + 2;
          cellImgs.forEach((img) => {
            try {
              const maxW = cellW - 4;
              const scale = img.width > maxW ? maxW / img.width : 1;
              const w = img.width * scale * 0.264583;
              const h = img.height * scale * 0.264583;
              doc.addImage(img.data, "PNG", x + 2, imgY, w, h);
              imgY += h + 2;
            } catch (e) {
              console.warn("Erro ao desenhar imagem no PDF", e);
            }
          });

          const rawCell = cell == null ? "" : cell;
          const safeText =
            typeof rawCell === "string"
              ? rawCell
              : Array.isArray(rawCell)
                ? rawCell.map((v) => String(v ?? "")).join(" ")
                : typeof rawCell === "object"
                  ? String(rawCell.text ?? rawCell.value ?? "")
                  : String(rawCell);

          const finalText = String(safeText ?? "").trim();

          if (finalText) {
            doc.setFontSize(style.fontSize || 10);
            if (style.bold && style.italic)
              doc.setFont("helvetica", "bolditalic");
            else if (style.bold) doc.setFont("helvetica", "bold");
            else if (style.italic) doc.setFont("helvetica", "italic");
            else doc.setFont("helvetica", "normal");

            doc.setTextColor(style.color ? `#${style.color}` : "#000000");

            const align = style.alignment || "left";
            const textX =
              align === "center"
                ? x + cellW / 2
                : align === "right"
                  ? x + cellW - 2
                  : x + 2;
            const textY = yPosition + (rowH * rowSpan) / 2;

            console.log("Final text", finalText, "resto", textX, textY, {
              align: align as any,
              baseline: "middle",
              maxWidth: cellW - 4,
            });

            doc.text(finalText, textX, textY, {
              align: align as any,
              baseline: "middle",
              maxWidth: cellW - 4,
            });
          }

          x += merge ? cellW : colWidthsPdf[cIdx];
        });
        yPosition += rowH;
      });

      // espaço após cabeçalho
      yPosition += lineHeight * 2;
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#000000");
    } else if (layout.header || layout.headerText) {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const lines = doc.splitTextToSize(
        layout.header || layout.headerText || "",
        pageWidth - marginLeft - marginRight
      );
      doc.text(lines, marginLeft, yPosition);
      yPosition += lineHeight * (lines.length + 1);
      doc.setFontSize(fontSize);
    }

    /* ------- QUESTÕES ------- */
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qHeight =
        lineHeight * (q.title ? 3 : 2) + (q.contentImage ? 50 : 0);
      checkPageBreak(qHeight);

      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}.`, marginLeft, yPosition);
      yPosition += lineHeight;

      if (q.title) {
        doc.setFont("helvetica", "bold");
        const tLines = doc.splitTextToSize(
          q.title,
          pageWidth - marginLeft - marginRight
        );
        doc.text(tLines, marginLeft + 5, yPosition);
        yPosition += lineHeight * tLines.length;
      }

      doc.setFont("helvetica", "normal");
      const cLines = doc.splitTextToSize(
        q.content || "",
        pageWidth - marginLeft - marginRight
      );
      doc.text(cLines, marginLeft + 5, yPosition);
      yPosition += lineHeight * cLines.length + lineHeight;

      if (q.contentImage) {
        try {
          const { width, height } = await getImageDimensions(q.contentImage);
          const maxW = pageWidth - marginLeft - marginRight - 10;
          const scale = width > maxW ? maxW / width : 1;
          const w = width * scale * 0.264583;
          const h = height * scale * 0.264583;
          checkPageBreak(h + lineHeight);
          doc.addImage(q.contentImage, "PNG", marginLeft + 5, yPosition, w, h);
          yPosition += h + lineHeight;
        } catch {}
      }

      if (q.type === "multipla" && q.options?.length) {
        for (let j = 0; j < q.options.length; j++) {
          const letter = String.fromCharCode(97 + j);
          const optText = `${letter}) ${q.options[j]}`;
          const optLines = doc.splitTextToSize(
            optText,
            pageWidth - marginLeft - marginRight - 10
          );
          checkPageBreak(lineHeight * optLines.length);
          doc.text(optLines, marginLeft + 10, yPosition);
          yPosition += lineHeight * optLines.length;

          if (q.optionImages?.[j]) {
            try {
              const { width, height } = await getImageDimensions(
                q.optionImages[j]!
              );
              const maxW = pageWidth - marginLeft - marginRight - 20;
              const scale = width > maxW ? maxW / width : 1;
              const w = width * scale * 0.264583;
              const h = height * scale * 0.264583;
              checkPageBreak(h + lineHeight);
              doc.addImage(
                q.optionImages[j]!,
                "PNG",
                marginLeft + 10,
                yPosition,
                w,
                h
              );
              yPosition += h + lineHeight;
            } catch {}
          }
        }
      }
      yPosition += lineHeight;
    }

    /* ------- FOOTER ------- */
    if (layout.footer || layout.footerText) {
      const totalPages = (doc as any).internal.pages.length;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          layout.footer || layout.footerText || "",
          marginLeft,
          pageHeight - 10
        );
      }
    }

    return doc.output("blob");
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw new Error("Falha ao gerar PDF: " + (error as Error).message);
  }
};
