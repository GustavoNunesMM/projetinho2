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
import { renderAsync } from "docx-preview";

import { Test } from "@/types/test";
import Button from "@/components/common/Button";
import Portal from "@/components/common/Portal";

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
        if (
          test.filePath.startsWith("http://") ||
          test.filePath.startsWith("https://")
        ) {
          const response = await fetch(test.filePath);

          if (!response.ok) {
            throw new Error("Erro ao carregar arquivo");
          }
          const blob = await response.blob();

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
        } else if (test.filePath.startsWith("blob:")) {
          try {
            const response = await fetch(test.filePath);

            if (!response.ok) {
              throw new Error("Blob URL expirada");
            }
            const blob = await response.blob();

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
          } catch (blobError) {
            throw new Error(
              "URL do arquivo expirou. Faça login e salve novamente para acesso permanente.",
            );
          }
        } else {
          throw new Error(
            "Preview disponível apenas para documentos salvos na nuvem",
          );
        }
      } catch (error) {
        console.error("Erro ao gerar preview:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";

        setPreviewHtml(`
          <div class="text-center py-8">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2 text-gray-800">${test.title}</h3>
            <p class="text-gray-600 mb-2">${test.description || "Sem descrição"}</p>
            <p class="text-sm text-gray-500 mt-4">${errorMessage}</p>
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
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border border-gray-100 animate-scaleIn">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Upload className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {test.title}
                </h2>
                <p className="text-sm text-gray-500">{test.fileName}</p>
              </div>
            </div>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex">
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
                    <span className="ml-2 text-gray-800">
                      {test.schoolYear}
                    </span>
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
                    <span className="ml-2 text-gray-800">
                      {test.schoolUnit}
                    </span>
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
                  className="w-full justify-center"
                  icon={Download}
                  variant="primary"
                  onClick={() => onDownload(test)}
                >
                  Baixar Documento
                </Button>
                {onDelete && (
                  <Button
                    className="w-full"
                    icon={Trash2}
                    variant="light-danger"
                    onClick={() => {
                      onDelete(test);
                    }}
                  >
                    Deletar Prova
                  </Button>
                )}
              </div>
            </div>

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
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                  className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};