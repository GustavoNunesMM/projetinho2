import { useEffect, useRef, useState } from "react";

import { renderAsync } from "docx-preview";
import { X, Eye, Loader, AlertCircle } from "lucide-react";

import Button from "@/components/common/Button";
import Portal from "@/components/common/Portal";

interface PreviewModalProps {
  isPreviewOpen: boolean;
  setIsPreviewOpen: (arg: boolean) => void;
  previewBlob: Blob | null;
  setPreviewUrl: (arg: string | null) => void;
}

const PreviewModal = ({
  isPreviewOpen,
  setIsPreviewOpen,
  previewBlob,
  setPreviewUrl,
}: PreviewModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPreviewOpen) return;

    setIsRendering(true);
    setRenderError(null);

    if (!previewBlob) {
      setRenderError("Nenhum documento para visualizar");
      setIsRendering(false);
      return;
    }

    const renderDocument = async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));

      if (!containerRef.current) {
        setRenderError("Container não encontrado");
        setIsRendering(false);
        return;
      }

      try {
        containerRef.current.innerHTML = "";

        await renderAsync(previewBlob, containerRef.current, undefined, {
          className: "docx-preview-content",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
          breakPages: true,
          debug: false,
        });

        setIsRendering(false);
      } catch (e: any) {
        console.error("docx-preview erro:", e);
        setRenderError(`Erro ao renderizar: ${e.message || "Erro desconhecido"}`);
        setIsRendering(false);
      }
    };

    renderDocument();

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [isPreviewOpen, previewBlob]);

  if (!isPreviewOpen) return null;

  const handleClose = () => {
    setIsPreviewOpen(false);
    setPreviewUrl(null);
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full p-2 max-w-6xl h-[90vh] flex flex-col border border-gray-100 animate-scaleIn">
          <div className="flex items-center justify-between p-5 border-b border-gray-100  flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                  Pré-visualização
                </h2>
                <p className="text-xs text-gray-500">
                  Visualize o documento antes de exportar
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-auto bg-gray-100 min-h-0">
            {isRendering && (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <Loader className="w-8 h-8 text-white animate-spin" />
                </div>
                <p className="mt-4 text-gray-600 font-medium">
                  Renderizando documento...
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Isso pode levar alguns segundos
                </p>
              </div>
            )}

            {renderError && !isRendering && (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-red-600 font-medium">{renderError}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Tente gerar o documento novamente
                </p>
              </div>
            )}

            <div
              ref={containerRef}
              className="docx-container p-6"
              style={{
                visibility: isRendering || renderError ? "hidden" : "visible",
                position: isRendering || renderError ? "absolute" : "relative",
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <Button
              variant="custom"
              onClick={handleClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .docx-container {
          min-height: 100%;
        }
        .docx-container .docx-wrapper {
          background: transparent !important;
          padding: 0 !important;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .docx-container .docx-wrapper > section.docx {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
          margin-bottom: 20px !important;
          background: white !important;
          border-radius: 4px;
          overflow: hidden;
        }
        .docx-preview-content {
          width: 100%;
        }
      `}</style>
    </Portal>
  );
};

export default PreviewModal;
