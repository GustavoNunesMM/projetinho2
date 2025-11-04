import { useCallback } from "react";
import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  Packer,
  ISectionOptions,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  convertInchesToTwip,
} from "docx";
import { saveAs } from "file-saver";
import * as mammoth from "mammoth";
import { Layout } from "../types/layout";
import { Question } from "../types/question";

interface Alternative {
  letter?: string;
  text?: string;
  texto?: string;
}

interface ParsedQuestion {
  id: number;
  statement: string;
  subject: string;
  difficulty: string;
  tags: string[];
  alternatives: Alternative[];
}

// Função auxiliar para converter string de margem para twips
const marginToTwips = (margin: string): number => {
  const value = parseFloat(margin);
  if (margin.includes("cm")) {
    return convertInchesToTwip(value / 2.54);
  } else if (margin.includes("in")) {
    return convertInchesToTwip(value);
  }
  // Assume cm por padrão
  return convertInchesToTwip(value / 2.54);
};

// Função auxiliar para converter tamanho de fonte
const fontSizeToHalfPoints = (fontSize: string): number => {
  const value = parseFloat(fontSize);
  return value * 2; // docx usa half-points
};

// Função auxiliar para converter espaçamento de linha
const lineSpacingToValue = (spacing: string): number => {
  const value = parseFloat(spacing);
  return Math.round(value * 240); // docx line spacing
};

export function useDocumentGenerator() {
  const generateDocx = useCallback(
    async (
      questions: Question[],
      layout: Layout,
      importedHeaderContent?: any[]
    ): Promise<Blob> => {
      try {
        const sections: (Paragraph | Table)[] = [];

        // Configurações de página baseadas no layout
        const pageMargins = {
          top: marginToTwips(layout.marginTop || "2.54cm"),
          bottom: marginToTwips(layout.marginBottom || "2.54cm"),
          left: marginToTwips(layout.marginLeft || "2.54cm"),
          right: marginToTwips(layout.marginRight || "2.54cm"),
        };

        const defaultFontSize = fontSizeToHalfPoints(layout.fontSize || "12");
        const defaultLineSpacing = lineSpacingToValue(
          layout.lineSpacing || "1.15"
        );

        // Adiciona cabeçalho importado (se houver)
        if (importedHeaderContent && importedHeaderContent.length > 0) {
          importedHeaderContent.forEach((element) => {
            sections.push(element);
          });

          // Linha separadora após cabeçalho importado
          sections.push(
            new Paragraph({
              text: "_".repeat(80),
              spacing: { before: 200, after: 400 },
            })
          );
        } else if (layout.header || layout.headerText) {
          // Cabeçalho simples (se não houver importado)
          sections.push(
            new Paragraph({
              text: layout.header || layout.headerText || "",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            })
          );
        }

        // Questões
        questions.forEach((question, index) => {
          // Número da questão
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${index + 1}. `,
                  bold: true,
                  size: defaultFontSize,
                  font: layout.fontFamily || "Arial",
                }),
              ],
              spacing: {
                before: 300,
                after: 150,
                line: defaultLineSpacing,
              },
            })
          );

          // Título da questão (se existir)
          if (question.title) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: question.title,
                    bold: true,
                    size: defaultFontSize,
                    font: layout.fontFamily || "Arial",
                  }),
                ],
                spacing: { after: 150, line: defaultLineSpacing },
              })
            );
          }

          // Conteúdo/Enunciado da questão
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: question.content || "",
                  size: defaultFontSize,
                  font: layout.fontFamily || "Arial",
                }),
              ],
              spacing: { after: 200, line: defaultLineSpacing },
            })
          );

          // Alternativas (apenas para questões de múltipla escolha)
          if (
            question.type === "multipla" &&
            question.options &&
            question.options.length > 0
          ) {
            question.options.forEach((option, optIndex) => {
              const letter = String.fromCharCode(97 + optIndex); // a, b, c, d...
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${letter}) ${option}`,
                      size: defaultFontSize,
                      font: layout.fontFamily || "Arial",
                    }),
                  ],
                  spacing: { after: 100, line: defaultLineSpacing },
                  indent: { left: 720 }, // 0.5 inch
                })
              );
            });
          }

          sections.push(
            new Paragraph({
              text: "",
              spacing: { after: 400 },
            })
          );
        });

        // Rodapé
        if (layout.footer || layout.footerText) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: layout.footer || layout.footerText || "",
                  size: defaultFontSize - 4, // Slightly smaller
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
              properties: {
                page: {
                  margin: pageMargins,
                },
              },
              children: sections,
            } as ISectionOptions,
          ],
        });

        const blob = await Packer.toBlob(doc);
        return blob;
      } catch (error) {
        console.error("Erro ao gerar DOCX:", error);
        throw new Error(
          "Falha ao gerar documento Word: " + (error as Error).message
        );
      }
    },
    []
  );

  const importHeaderFromDocx = useCallback(
    async (file: File): Promise<any[]> => {
      try {
        const arrayBuffer = await file.arrayBuffer();

        const result = await mammoth.convertToHtml({ arrayBuffer });
        const htmlContent = result.value;

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");

        const elements: any[] = [];

        const tables = doc.querySelectorAll("table");
        tables.forEach((table) => {
          const rows: TableRow[] = [];

          table.querySelectorAll("tr").forEach((tr) => {
            const cells: TableCell[] = [];

            tr.querySelectorAll("td, th").forEach((cell) => {
              const text = cell.textContent || "";
              const isBold = cell.querySelector("strong") !== null;
              const isUnderline = cell.querySelector("u") !== null;

              cells.push(
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: text.trim(),
                          bold: isBold,
                          underline: isUnderline ? {} : undefined,
                          size: 20, // 10pt
                        }),
                      ],
                    }),
                  ],
                  margins: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100,
                  },
                })
              );
            });

            if (cells.length > 0) {
              rows.push(new TableRow({ children: cells }));
            }
          });

          if (rows.length > 0) {
            elements.push(
              new Table({
                rows,
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1 },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                },
              })
            );
          }
        });

        // Procura por parágrafos formatados
        const paragraphs = doc.querySelectorAll("p");
        paragraphs.forEach((p) => {
          const text = p.textContent || "";
          if (text.trim()) {
            const isBold = p.querySelector("strong") !== null;
            const isUnderline = p.querySelector("u") !== null;
            const isCheckmark = text.includes("✔");

            elements.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: text.trim(),
                    bold: isBold,
                    underline: isUnderline ? {} : undefined,
                    size: 20,
                  }),
                ],
                spacing: { after: 100 },
                bullet: isCheckmark ? undefined : undefined,
              })
            );
          }
        });

        return elements;
      } catch (error) {
        console.error("Erro ao importar cabeçalho:", error);
        throw new Error(
          "Falha ao importar cabeçalho do documento: " +
            (error as Error).message
        );
      }
    },
    []
  );

  const generateQuestionDocx = useCallback(
    async (question: Question): Promise<Blob> => {
      try {
        const sections: Paragraph[] = [];

        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Questão",
                bold: true,
                size: 28,
              }),
            ],
            spacing: { after: 200 },
          })
        );

        if (question.title) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: question.title,
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 150 },
            })
          );
        }

        sections.push(
          new Paragraph({
            text: question.content || "",
            spacing: { after: 300 },
          })
        );

        if (
          question.type === "multipla" &&
          question.options &&
          question.options.length > 0
        ) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "Alternativas:",
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { before: 200, after: 150 },
            })
          );

          question.options.forEach((option, optIndex) => {
            const letter = String.fromCharCode(65 + optIndex);
            sections.push(
              new Paragraph({
                text: `${letter}) ${option}`,
                spacing: { after: 100 },
                indent: { left: 360 },
              })
            );
          });
        }

        if (question.subject) {
          sections.push(
            new Paragraph({
              text: "",
              spacing: { after: 200 },
            })
          );

          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Disciplina: ${question.subject}`,
                  italics: true,
                }),
              ],
              spacing: { after: 100 },
            })
          );
        }

        if (question.difficulty) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Dificuldade: ${question.difficulty}`,
                  italics: true,
                }),
              ],
              spacing: { after: 100 },
            })
          );
        }

        if (question.category) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Categoria: ${question.category}`,
                  italics: true,
                }),
              ],
              spacing: { after: 100 },
            })
          );
        }

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: sections,
            } as ISectionOptions,
          ],
        });

        const blob = await Packer.toBlob(doc);
        return blob;
      } catch (error) {
        console.error("Erro ao gerar DOCX:", error);
        throw new Error(
          "Falha ao gerar documento Word: " + (error as Error).message
        );
      }
    },
    []
  );

  const readDocx = useCallback(async (blob: Blob): Promise<string> => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error("Erro ao ler DOCX:", error);
      throw new Error(
        "Falha ao ler documento Word: " + (error as Error).message
      );
    }
  }, []);

  const parseQuestionsFromText = useCallback(
    (text: string): ParsedQuestion[] => {
      const questions: ParsedQuestion[] = [];
      const lines = text.split("\n").filter((line) => line.trim());

      let currentQuestion: ParsedQuestion | null = null;
      let currentAlternatives: Alternative[] = [];

      lines.forEach((line) => {
        const trimmed = line.trim();

        const questionMatch = trimmed.match(/^(\d+)\.\s*(.+)/);
        if (questionMatch) {
          if (currentQuestion !== null) {
            const q = currentQuestion as ParsedQuestion;
            q.alternatives = currentAlternatives;
            questions.push(q);
          }

          currentQuestion = {
            id: Date.now() + Math.random(),
            statement: questionMatch[2],
            subject: "",
            difficulty: "media",
            tags: [],
            alternatives: [],
          } as ParsedQuestion;
          currentAlternatives = [];
          return;
        }

        const altMatch = trimmed.match(/^([a-e])\)\s*(.+)/);
        if (altMatch && currentQuestion !== null) {
          currentAlternatives.push({
            letter: altMatch[1],
            text: altMatch[2],
          });
          return;
        }

        if (currentQuestion !== null && !altMatch) {
          (currentQuestion as ParsedQuestion).statement += " " + trimmed;
        }
      });

      if (currentQuestion !== null) {
        const q = currentQuestion as ParsedQuestion;
        q.alternatives = currentAlternatives;
        questions.push(q);
      }

      return questions;
    },
    []
  );

  const generatePdf = useCallback(
    async (questions: Question[], layout: Layout): Promise<Blob> => {
      try {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        let yPosition = parseFloat(layout.marginTop || "20");
        const pageHeight = doc.internal.pageSize.height;
        const marginLeft = parseFloat(layout.marginLeft || "20");
        const marginRight = parseFloat(layout.marginRight || "20");
        const marginBottom = parseFloat(layout.marginBottom || "20");
        const fontSize = parseFloat(layout.fontSize || "12");
        const lineHeight =
          (fontSize * parseFloat(layout.lineSpacing || "1.15")) / 2;

        // Adiciona cabeçalho
        if (layout.header || layout.headerText) {
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text(
            layout.header || layout.headerText || "",
            marginLeft,
            yPosition
          );
          yPosition += lineHeight * 2;
        }

        doc.setFontSize(fontSize);
        questions.forEach((question, index) => {
          if (yPosition > pageHeight - marginBottom - 40) {
            doc.addPage();
            yPosition = parseFloat(layout.marginTop || "20");
          }

          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}.`, marginLeft, yPosition);
          yPosition += lineHeight;

          if (question.title) {
            doc.setFont("helvetica", "bold");
            const titleLines = doc.splitTextToSize(
              question.title,
              doc.internal.pageSize.width - marginLeft - marginRight
            );
            doc.text(titleLines, marginLeft + 5, yPosition);
            yPosition += lineHeight * titleLines.length;
          }

          doc.setFont("helvetica", "normal");
          const contentLines = doc.splitTextToSize(
            question.content || "",
            doc.internal.pageSize.width - marginLeft - marginRight
          );
          doc.text(contentLines, marginLeft + 5, yPosition);
          yPosition += lineHeight * contentLines.length + lineHeight;

          if (
            question.type === "multipla" &&
            question.options &&
            question.options.length > 0
          ) {
            question.options.forEach((option, optIndex) => {
              if (yPosition > pageHeight - marginBottom - 20) {
                doc.addPage();
                yPosition = parseFloat(layout.marginTop || "20");
              }
              const letter = String.fromCharCode(97 + optIndex);
              const optText = `${letter}) ${option}`;
              const optLines = doc.splitTextToSize(
                optText,
                doc.internal.pageSize.width - marginLeft - marginRight - 10
              );
              doc.text(optLines, marginLeft + 10, yPosition);
              yPosition += lineHeight * optLines.length;
            });
          }

          yPosition += lineHeight;
        });

        if (layout.footer || layout.footerText) {
          const totalPages = doc.internal.pages.length - 1;
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
    },
    []
  );

  const saveFile = useCallback((blob: Blob, fileName: string): void => {
    saveAs(blob, fileName);
  }, []);

  return {
    generateDocx,
    generateQuestionDocx,
    generatePdf,
    readDocx,
    parseQuestionsFromText,
    importHeaderFromDocx,
    saveFile,
  };
}

export default useDocumentGenerator;
