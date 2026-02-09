import { useState } from "react";
import { X, Upload, FileText, Loader } from "lucide-react";
import Button from "@/components/common/Button";
import Portal from "@/components/common/Portal";
import { Toast } from "@/components/common/Toast";

interface TemplateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

const TemplateUploadModal = ({
  isOpen,
  onClose,
  onUpload,
}: TemplateUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".docx")) {
      Toast({
        message: "Por favor, selecione um arquivo .docx",
        color: "danger",
      });
      return;
    }
    setFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Toast({
        message: "Por favor, selecione um arquivo",
        color: "danger",
      });
      return;
    }

    try {
      setUploading(true);
      await onUpload(file);
      setFile(null);
      onClose();
      Toast({
        message: "Template carregado com sucesso!",
        color: "success",
      });
    } catch (error: any) {
      Toast({
        message: error.message || "Erro ao carregar template",
        color: "danger",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl p-2 w-full border border-gray-100 animate-scaleIn">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                    Carregar Template
                  </h2>
                  <p className="text-xs text-gray-500">
                    Faça upload de um documento DOCX com campos marcados
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Fechar"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
              }`}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Selecionar outro arquivo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">
                      Arraste e solte o arquivo aqui
                    </p>
                    <p className="text-sm text-gray-500">ou</p>
                    <label className="inline-block mt-2">
                      <input
                        type="file"
                        accept=".docx"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                      <span className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer">
                        Clique para selecionar
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    Apenas arquivos .docx são aceitos
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="custom"
                icon={uploading ? Loader : Upload}
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  !file || uploading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                }`}
              >
                {uploading ? "Carregando..." : "Carregar Template"}
              </Button>
              <Button
                variant="custom"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default TemplateUploadModal;
