import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardBody,
  Button,
  Tabs,
  Tab,
  Spinner,
  Divider,
} from "@heroui/react";
import {
  Eye,
  Download,
  FileText,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  AlertCircle,
} from "lucide-react";
import { renderAsync } from "docx-preview";
import { motion } from "framer-motion";
import { useDocumentGenerator } from "../../hooks/useDocumentGenerator";
import { Question } from "../../types/question";
import { Layout } from "../../types/layout";

interface ViewTabProps {
  selectedQuestions: Question[];
  layout: Layout;
}

export default function ViewTab({ selectedQuestions, layout }: ViewTabProps) {
  const [documentType, setDocumentType] = useState<"pdf" | "docx">("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentBlob, setDocumentBlob] = useState<Blob | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const docxContainerRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLIFrameElement>(null);

  const { generateDocx, generatePdf, saveFile } = useDocumentGenerator();

  // Limpa URLs anteriores ao desmontar
  useEffect(() => {
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [documentUrl]);

  // Gera o documento quando o tipo muda ou quando solicitado
  const generatePreview = async () => {
    if (selectedQuestions.length === 0) {
      setError("Selecione pelo menos uma questão para visualizar");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let blob: Blob;

      if (documentType === "pdf") {
        blob = await generatePdf(selectedQuestions, layout);
      } else {
        blob = await generateDocx(selectedQuestions, layout);
      }

      setDocumentBlob(blob);

      // Revoga URL anterior se existir
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }

      const url = URL.createObjectURL(blob);
      setDocumentUrl(url);

      // Renderiza DOCX se for o caso
      if (documentType === "docx" && docxContainerRef.current) {
        docxContainerRef.current.innerHTML = "";
        await renderAsync(blob, docxContainerRef.current, undefined, {
          className: "docx-preview",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
        });
      }
    } catch (err) {
      console.error("Erro ao gerar preview:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao gerar visualização do documento"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Gera preview automaticamente quando questões, layout ou tipo mudam
  useEffect(() => {
    if (selectedQuestions.length > 0) {
      generatePreview();
    } else {
      setDocumentBlob(null);
      setDocumentUrl(null);
      setError(null);
    }
  }, [selectedQuestions, layout, documentType]);

  const handleDownload = () => {
    if (!documentBlob) return;

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `prova_${timestamp}.${documentType}`;

    saveFile(documentBlob, filename);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-6">
      {/* Header com controles */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="w-6 h-6" />
            Visualização de Documento
          </h2>
          <p className="text-sm text-default-500 mt-1">
            {selectedQuestions.length} questão(ões) selecionada(s)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs
            selectedKey={documentType}
            onSelectionChange={(key) => setDocumentType(key as "pdf" | "docx")}
            size="sm"
            color="primary"
          >
            <Tab key="pdf" title="PDF" />
            <Tab key="docx" title="DOCX" />
          </Tabs>
        </div>
      </motion.div>

      <Divider />

      {/* Barra de ferramentas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between bg-default-100 rounded-lg p-3"
      >
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="flat"
            startContent={<ZoomOut className="w-4 h-4" />}
            onPress={handleZoomOut}
            isDisabled={scale <= 0.5 || !documentBlob}
          >
            Diminuir
          </Button>
          <Button
            size="sm"
            variant="flat"
            onPress={handleResetZoom}
            isDisabled={!documentBlob}
          >
            {Math.round(scale * 100)}%
          </Button>
          <Button
            size="sm"
            variant="flat"
            startContent={<ZoomIn className="w-4 h-4" />}
            onPress={handleZoomIn}
            isDisabled={scale >= 2 || !documentBlob}
          >
            Aumentar
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            color="primary"
            variant="flat"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={generatePreview}
            isLoading={isGenerating}
            isDisabled={selectedQuestions.length === 0}
          >
            Atualizar
          </Button>
          <Button
            size="sm"
            color="success"
            startContent={<Download className="w-4 h-4" />}
            onPress={handleDownload}
            isDisabled={!documentBlob || isGenerating}
          >
            Baixar {documentType.toUpperCase()}
          </Button>
        </div>
      </motion.div>

      {/* Área de visualização */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 overflow-hidden"
      >
        <Card className="h-full">
          <CardBody className="overflow-auto p-0">
            {isGenerating ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Spinner size="lg" color="primary" />
                  <p className="mt-4 text-default-500">
                    Gerando {documentType.toUpperCase()}...
                  </p>
                  <p className="text-xs text-default-400 mt-2">
                    Aguarde enquanto o documento é processado
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                  <AlertCircle className="w-16 h-16 mx-auto text-danger mb-4" />
                  <p className="text-danger font-semibold text-lg mb-2">
                    Erro ao gerar documento
                  </p>
                  <p className="text-sm text-default-500 mb-4">{error}</p>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={generatePreview}
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            ) : selectedQuestions.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                  <Eye className="w-16 h-16 mx-auto text-default-300 mb-4" />
                  <p className="text-default-500 font-semibold text-lg mb-2">
                    Nenhuma questão selecionada
                  </p>
                  <p className="text-sm text-default-400">
                    Selecione questões na aba anterior para visualizar o
                    documento
                  </p>
                </div>
              </div>
            ) : documentType === "pdf" && documentUrl ? (
              <div className="h-full overflow-auto bg-gray-100 flex justify-center p-4">
                <div
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top center",
                    width: "100%",
                    minHeight: "100%",
                  }}
                >
                  <iframe
                    ref={pdfContainerRef}
                    src={documentUrl}
                    className="w-full border-none shadow-lg"
                    style={{
                      height: `${Math.max(842, window.innerHeight - 200)}px`,
                      backgroundColor: "white",
                    }}
                    title="PDF Preview"
                  />
                </div>
              </div>
            ) : documentType === "docx" && documentUrl ? (
              <div className="p-8 bg-gray-100 min-h-full overflow-auto">
                <div
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top center",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <div
                    ref={docxContainerRef}
                    className="docx-wrapper max-w-4xl mx-auto bg-white shadow-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto text-default-300 mb-4" />
                  <p className="text-default-500">Carregando visualização...</p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Informações do rodapé */}
      {documentBlob && !isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between text-xs text-default-400 bg-default-100 rounded-lg px-4 py-2"
        >
          <div className="flex items-center gap-4">
            <span>
              <strong>Layout:</strong> {layout?.name || "Padrão"}
            </span>
            <span>
              <strong>Fonte:</strong> {layout?.fontFamily || "Arial"}{" "}
              {layout?.fontSize || "12"}pt
            </span>
            <span>
              <strong>Questões:</strong> {selectedQuestions.length}
            </span>
          </div>
          <div>
            <span>
              <strong>Tamanho:</strong> {(documentBlob.size / 1024).toFixed(2)}{" "}
              KB
            </span>
          </div>
        </motion.div>
      )}

      <style>{`
        .docx-wrapper {
          font-family: 'Calibri', 'Arial', sans-serif;
          min-height: 842px;
        }
        
        .docx-preview {
          background: white;
          padding: 2rem;
          min-height: 100%;
        }

        .docx-preview p {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        .docx-preview table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }

        .docx-preview table td,
        .docx-preview table th {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        .docx-preview h1, .docx-preview h2, .docx-preview h3 {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }

        .docx-preview ul, .docx-preview ol {
          margin-left: 2rem;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}
