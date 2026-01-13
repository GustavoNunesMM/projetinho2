import { useState, useEffect } from "react";
import {
  X,
  Download,
  FileText,
  Calendar,
  BookOpen,
  Building,
  Tag,
  Upload,
  Trash2,
} from "lucide-react";
import { Test } from "@/types/test";
import { renderAsync } from "docx-preview";
import Button from "@/components/common/Button";

interface TestModalProps {
  test: Test | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (test: Test) => void;
  onDelete?: (test: Test) => void;
}

export const TestModal: React.FC<TestModalProps> = ({
  test,
  isOpen,
  onClose,
  onDownload,
  onDelete,
}) => {
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !test) {
      setPreviewHtml("");
      return;
    }

    const generatePreview = async () => {
      setLoading(true);
      try {
        // Verificar se filePath é uma URL válida ou um caminho local
        let blob: Blob;
        
        if (test.filePath.startsWith("http://") || test.filePath.startsWith("https://") || test.filePath.startsWith("blob:")) {
          // É uma URL, fazer fetch
          const response = await fetch(test.filePath);
          if (!response.ok) {
            throw new Error("Erro ao carregar arquivo");
          }
          blob = await response.blob();
        } else {
          // É um caminho local, tentar usar File API ou mostrar mensagem
          // Em aplicações Electron/Tauri, você precisaria usar APIs específicas
          throw new Error("Visualização de arquivos locais não suportada via web");
        }

        const container = document.createElement("div");
        await renderAsync(blob, container, undefined, {
          className: "docx-preview",
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

        setPreviewHtml(container.innerHTML);
      } catch (error) {
        console.error("Erro ao gerar preview:", error);
        // Fallback: mostrar informações do documento
        setPreviewHtml(`
          <div class="text-center py-8">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2 text-gray-800">${test.title}</h3>
            <p class="text-gray-600 mb-2">${test.description || "Sem descrição"}</p>
            <p class="text-sm text-gray-500 mt-4">Visualização não disponível</p>
            <p class="text-xs text-gray-400 mt-2">Arquivo: ${test.fileName}</p>
          </div>
        `);
      } finally {
        setLoading(false);
      }
    };

    generatePreview();
  }, [isOpen, test]);

  if (!isOpen || !test) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Upload className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">{test.title}</h2>
              <p className="text-sm text-gray-500">{test.fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar com informações */}
          <div className="w-80 border-r border-gray-200 p-6 space-y-4 overflow-y-auto">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
              <p className="text-sm text-gray-600">{test.description}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">Disciplina:</span>
                  <span className="ml-2 text-gray-800">{test.subject}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">Ano/Série:</span>
                  <span className="ml-2 text-gray-800">{test.schoolYear}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">Bimestre:</span>
                  <span className="ml-2 text-gray-800">{test.quarter}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Building className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">Unidade:</span>
                  <span className="ml-2 text-gray-800">{test.schoolUnit}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Tag className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">Categoria:</span>
                  <span className="ml-2 text-gray-800">{test.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">Tamanho:</span>
                  <span className="ml-2 text-gray-800">
                    {formatFileSize(test.fileSize)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">Criado em:</span>
                  <span className="ml-2 text-gray-800">
                    {new Date(test.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {test.tags && (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {test.tags.split(",").map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <Button
                variant="primary"
                icon={Download}
                onClick={() => onDownload(test)}
                className="w-full justify-center"
              >
                Baixar Documento
              </Button>
              {onDelete && (
                <Button
                  variant="custom"
                  icon={Trash2}
                  onClick={() => {
                    onDelete(test);
                    onClose();
                  }}
                  className="w-full justify-center bg-red-600 hover:bg-red-700 text-white"
                >
                  Deletar Prova
                </Button>
              )}
            </div>
          </div>

          {/* Preview do documento */}
          <div className="flex-1 overflow-auto bg-gray-50 p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-6 h-6 text-blue-600 animate-pulse" />
                  </div>
                  <p className="text-gray-600">Carregando preview...</p>
                </div>
              </div>
            ) : (
              <div
                className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
