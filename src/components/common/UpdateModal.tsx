import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
} from "@heroui/react";
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";

import Button from "./Button";

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
  onUpdate: () => void;
  downloadProgress?: number;
  isDownloading?: boolean;
  error?: string | null;
}

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes: string;
  downloadUrl: string;
  signature?: string;
  size: number;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  onUpdate,
  downloadProgress: externalProgress = 0,
  isDownloading = false,
  error: externalError = null,
}) => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "downloading" | "installing" | "completed" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (externalProgress > 0) {
      setDownloadProgress(externalProgress);
    }
  }, [externalProgress]);

  useEffect(() => {
    if (isDownloading && status !== "downloading" && status !== "installing") {
      setStatus("downloading");
    } else if (!isDownloading && status === "downloading") {
      setStatus("installing");
      setTimeout(() => {
        setStatus("completed");
      }, 2000);
    }
  }, [isDownloading, status]);

  useEffect(() => {
    if (externalError) {
      setError(externalError);
      setStatus("error");
    }
  }, [externalError]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStatus("idle");
        setDownloadProgress(0);
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    try {
      setStatus("downloading");
      setError(null);
      await onUpdate();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "downloading":
      case "installing":
        return <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "error":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "downloading":
        return "Baixando atualização...";
      case "installing":
        return "Instalando atualização...";
      case "completed":
        return "Atualização concluída com sucesso!";
      case "error":
        return "Erro na atualização";
      default:
        return "Atualização disponível";
    }
  };

  return (
    <Modal isOpen={isOpen} size="lg" onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span>Atualização Disponível</span>
              </div>
            </ModalHeader>
            <ModalBody>
              {status === "idle" && updateInfo && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Versão {updateInfo.version}
                    </h3>
                    <p className="text-sm text-blue-700 mb-2">
                      Data de lançamento:{" "}
                      {new Date(updateInfo.releaseDate).toLocaleDateString(
                        "pt-BR",
                      )}
                    </p>
                    <p className="text-sm text-blue-700">
                      Tamanho: {(updateInfo.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>

                  {updateInfo.releaseNotes && (
                    <div>
                      <h4 className="font-semibold mb-2">Novidades:</h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap">
                          {updateInfo.releaseNotes}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(status === "downloading" || status === "installing") && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="mt-2 text-gray-600">{getStatusMessage()}</p>
                  </div>
                  {status === "downloading" && (
                    <Progress
                      className="w-full"
                      color="primary"
                      formatOptions={{ style: "percent" }}
                      showValueLabel={true}
                      value={downloadProgress}
                    />
                  )}
                </div>
              )}

              {status === "completed" && (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <p className="text-lg font-semibold text-green-700">
                    {getStatusMessage()}
                  </p>
                  <p className="text-sm text-gray-600">
                    O aplicativo será reiniciado em alguns segundos...
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="text-center space-y-4">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <p className="text-lg font-semibold text-red-700">
                    {getStatusMessage()}
                  </p>
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                      {error}
                    </p>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              {status === "idle" && (
                <>
                  <Button variant="danger" onClick={onClose}>
                    Agora não
                  </Button>
                  <Button variant="primary" onClick={handleUpdate}>
                    Atualizar agora
                  </Button>
                </>
              )}
              {status === "error" && (
                <>
                  <Button variant="light" onClick={onClose}>
                    Fechar
                  </Button>
                  <Button variant="light-success" onClick={handleUpdate}>
                    Tentar novamente
                  </Button>
                </>
              )}
              {status === "completed" && (
                <Button variant="success" onClick={onClose}>
                  Fechar
                </Button>
              )}
              {(status === "downloading" || status === "installing") && (
                <div>Aguarde...</div>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UpdateModal;