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
  ImageRun,
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

const lineSpacingToValue = (spacing: string): number => {
  const value = parseFloat(spacing);
  return Math.round(value * 240);
};

const base64ToUint8Array = (base64: string): Uint8Array => {
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const getImageDimensions = (
  base64: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = base64;
  });
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

        if (importedHeaderContent && importedHeaderContent.length > 0) {
          importedHeaderContent.forEach((element) => {
            sections.push(element);
          });

          sections.push(
            new Paragraph({
              text: "_".repeat(80),
              spacing: { before: 200, after: 400 },
            })
          );
        } else if (layout.header || layout.headerText) {
          sections.push(
            new Paragraph({
              text: layout.header || layout.headerText || "",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            })
          );
        }

        for (let index = 0; index < questions.length; index++) {
          const question = questions[index];

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

          if (question.contentImage) {
            try {
              const imageData = base64ToUint8Array(question.contentImage);
              const dimensions = await getImageDimensions(
                question.contentImage
              );

              const maxWidth = 400;
              const scale =
                dimensions.width > maxWidth ? maxWidth / dimensions.width : 1;
              const width = dimensions.width * scale;
              const height = dimensions.height * scale;

              sections.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: imageData,
                      transformation: {
                        width: width,
                        height: height,
                      },
                    }),
                  ],
                  spacing: { before: 100, after: 200 },
                })
              );
            } catch (error) {
              console.error("Erro ao adicionar imagem do conteúdo:", error);
            }
          }

          if (
            question.type === "multipla" &&
            question.options &&
            question.options.length > 0
          ) {
            for (
              let optIndex = 0;
              optIndex < question.options.length;
              optIndex++
            ) {
              const option = question.options[optIndex];
              const letter = String.fromCharCode(97 + optIndex); 

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
                  indent: { left: 720 },
                })
              );

              if (question.optionImages && question.optionImages[optIndex]) {
                try {
                  const imageData = base64ToUint8Array(
                    question.optionImages[optIndex]!
                  );
                  const dimensions = await getImageDimensions(
                    question.optionImages[optIndex]!
                  );

                  const maxWidth = 300;
                  const scale =
                    dimensions.width > maxWidth
                      ? maxWidth / dimensions.width
                      : 1;
                  const width = dimensions.width * scale;
                  const height = dimensions.height * scale;

                  sections.push(
                    new Paragraph({
                      children: [
                        new ImageRun({
                          data: imageData,
                          transformation: {
                            width: width,
                            height: height,
                          },
                        }),
                      ],
                      spacing: { before: 50, after: 100 },
                      indent: { left: 720 },
                    })
                  );
                } catch (error) {
                  console.error(
                    `Erro ao adicionar imagem da alternativa ${letter}:`,
                    error
                  );
                }
              }
            }
          }

          sections.push(
            new Paragraph({
              text: "",
              spacing: { after: 400 },
            })
          );
        }

        if (layout.footer || layout.footerText) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: layout.footer || layout.footerText || "",
                  size: defaultFontSize - 4, 
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
                          size: 20, 
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

        if (question.contentImage) {
          try {
            const imageData = base64ToUint8Array(question.contentImage);
            const dimensions = await getImageDimensions(question.contentImage);

            const maxWidth = 400;
            const scale =
              dimensions.width > maxWidth ? maxWidth / dimensions.width : 1;
            const width = dimensions.width * scale;
            const height = dimensions.height * scale;

            sections.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imageData,
                    transformation: {
                      width: width,
                      height: height,
                    },
                  }),
                ],
                spacing: { before: 100, after: 200 },
              })
            );
          } catch (error) {
            console.error("Erro ao adicionar imagem do conteúdo:", error);
          }
        }

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

          for (
            let optIndex = 0;
            optIndex < question.options.length;
            optIndex++
          ) {
            const option = question.options[optIndex];
            const letter = String.fromCharCode(65 + optIndex);

            sections.push(
              new Paragraph({
                text: `${letter}) ${option}`,
                spacing: { after: 100 },
                indent: { left: 360 },
              })
            );

            if (question.optionImages && question.optionImages[optIndex]) {
              try {
                const imageData = base64ToUint8Array(
                  question.optionImages[optIndex]!
                );
                const dimensions = await getImageDimensions(
                  question.optionImages[optIndex]!
                );

                const maxWidth = 300;
                const scale =
                  dimensions.width > maxWidth ? maxWidth / dimensions.width : 1;
                const width = dimensions.width * scale;
                const height = dimensions.height * scale;

                sections.push(
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: imageData,
                        transformation: {
                          width: width,
                          height: height,
                        },
                      }),
                    ],
                    spacing: { before: 50, after: 100 },
                    indent: { left: 360 },
                  })
                );
              } catch (error) {
                console.error(
                  `Erro ao adicionar imagem da alternativa ${letter}:`,
                  error
                );
              }
            }
          }
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
        const pageWidth = doc.internal.pageSize.width;
        const marginLeft = parseFloat(layout.marginLeft || "20");
        const marginRight = parseFloat(layout.marginRight || "20");
        const marginBottom = parseFloat(layout.marginBottom || "20");
        const fontSize = parseFloat(layout.fontSize || "12");
        const lineHeight =
          (fontSize * parseFloat(layout.lineSpacing || "1.15")) / 2;

        if (layout.header || layout.headerText) {
          doc.setFontSize(16);
          doc.setFont("arial", "bold");
          doc.text(
            layout.header || layout.headerText || "",
            marginLeft,
            yPosition
          );
          yPosition += lineHeight * 2;
        }

        doc.setFontSize(fontSize);

        for (let index = 0; index < questions.length; index++) {
          const question = questions[index];

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
              pageWidth - marginLeft - marginRight
            );
            doc.text(titleLines, marginLeft + 5, yPosition);
            yPosition += lineHeight * titleLines.length;
          }

          doc.setFont("helvetica", "normal");
          const contentLines = doc.splitTextToSize(
            question.content || "",
            pageWidth - marginLeft - marginRight
          );
          doc.text(contentLines, marginLeft + 5, yPosition);
          yPosition += lineHeight * contentLines.length + lineHeight;

          if (question.contentImage) {
            try {
              const dimensions = await getImageDimensions(
                question.contentImage
              );

              const maxWidth = pageWidth - marginLeft - marginRight - 10;
              const scale =
                dimensions.width > maxWidth ? maxWidth / dimensions.width : 1;
              const imgWidth = dimensions.width * scale * 0.264583; 
              const imgHeight = dimensions.height * scale * 0.264583;

              if (yPosition + imgHeight > pageHeight - marginBottom) {
                doc.addPage();
                yPosition = parseFloat(layout.marginTop || "20");
              }

              doc.addImage(
                question.contentImage,
                "PNG",
                marginLeft + 5,
                yPosition,
                imgWidth,
                imgHeight
              );
              yPosition += imgHeight + lineHeight;
            } catch (error) {
              console.error(
                "Erro ao adicionar imagem do conteúdo no PDF:",
                error
              );
            }
          }

          if (
            question.type === "multipla" &&
            question.options &&
            question.options.length > 0
          ) {
            for (
              let optIndex = 0;
              optIndex < question.options.length;
              optIndex++
            ) {
              const option = question.options[optIndex];

              if (yPosition > pageHeight - marginBottom - 20) {
                doc.addPage();
                yPosition = parseFloat(layout.marginTop || "20");
              }

              const letter = String.fromCharCode(97 + optIndex);
              const optText = `${letter}) ${option}`;
              const optLines = doc.splitTextToSize(
                optText,
                pageWidth - marginLeft - marginRight - 10
              );
              doc.text(optLines, marginLeft + 10, yPosition);
              yPosition += lineHeight * optLines.length;

              if (question.optionImages && question.optionImages[optIndex]) {
                try {
                  const dimensions = await getImageDimensions(
                    question.optionImages[optIndex]!
                  );

                  const maxWidth = pageWidth - marginLeft - marginRight - 20;
                  const scale =
                    dimensions.width > maxWidth
                      ? maxWidth / dimensions.width
                      : 1;
                  const imgWidth = dimensions.width * scale * 0.264583;
                  const imgHeight = dimensions.height * scale * 0.264583;

                  if (yPosition + imgHeight > pageHeight - marginBottom) {
                    doc.addPage();
                    yPosition = parseFloat(layout.marginTop || "20");
                  }

                  doc.addImage(
                    question.optionImages[optIndex]!,
                    "PNG",
                    marginLeft + 10,
                    yPosition,
                    imgWidth,
                    imgHeight
                  );
                  yPosition += imgHeight + lineHeight / 2;
                } catch (error) {
                  console.error(
                    `Erro ao adicionar imagem da alternativa ${letter} no PDF:`,
                    error
                  );
                }
              }
            }
          }

          yPosition += lineHeight;
        }

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
