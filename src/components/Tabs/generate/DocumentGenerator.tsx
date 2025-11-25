import React, { useEffect, useState } from "react";
import {
  Download,
  Loader,
  Upload,
  X,
  MessageSquareText,
  Check,
  Eye,
} from "lucide-react";
import Button from "@/components/common/Button.tsx";
import { useDocumentGenerator } from "@/hooks/useDocumentGenerator.ts";
import { useDriveClient } from "@/hooks/useDriveClient.ts";
import { useMessages } from "@/hooks/useMessages.ts";
import { Layout } from "@/types/layout";
import { Question } from "@/types/question";
import { Message } from "@/types/messages";
import { Toast } from "@/components/common/Toast.tsx";
import MessagesModal from "./modal/MessagesModal";
import PreviewModal from "./modal/PreviewModal";
import { useGabarito } from "@/hooks/useGabarito";
import { GabaritoModal } from "./modal/GabaritoModal";
import { GabaritoData } from "@/types";

interface DocumentGeneratorProps {
  selectedLayout: Layout | null;
  questions: Question[];
  selectedQuestions?: number[];
  onHeaderChange?: (header: any[] | null) => void;
  onMessageChange?: (message: Message | null) => void;
  onGabaritoChange?: (gabarito: GabaritoData | null) => void;
  setVisualize: (preVisualize: boolean) => void;
  isBigLayout: boolean;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({
  selectedLayout,
  questions,
  selectedQuestions = [],
  onHeaderChange,
  onMessageChange,
  onGabaritoChange,
  setVisualize,
  isBigLayout = true,
}) => {
  const [generating, setGenerating] = useState(false);
  const [importedHeader, setImportedHeader] = useState<any[] | null>(null);
  const [headerFileName, setHeaderFileName] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalMessagesOpen, openModalMessages] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [gabaritoData, setGabaritoData] = useState<GabaritoData | null>(null);
  const [isGabaritoModalOpen, setIsGabaritoModalOpen] = useState(false);
  const [haveValidQuestion, sethaveValidQuestion] = useState(false);
  const { gerarGabarito } = useGabarito();
  const { generateDocx, generatePdf, importHeaderFromDocx, saveFile } =
    useDocumentGenerator();
  const { messages, loading: loadingMessages } = useMessages();
  const driveClient = useDriveClient();

  const selectedQuestionsData = questions.filter((q) =>
    selectedQuestions.includes(q.id)
  );
  const selectedCount = selectedQuestionsData.length;

  useEffect(() => {
    const valid = selectedQuestionsData.some((q) => q.type === "multipla");
    sethaveValidQuestion(valid);
  }, [selectedQuestionsData]);

  useEffect(() => {
    if (onHeaderChange) onHeaderChange(importedHeader);
  }, [importedHeader, onHeaderChange]);

  useEffect(() => {
    if (onMessageChange) onMessageChange(selectedMessage);
  }, [selectedMessage, onMessageChange]);

  useEffect(() => {
    if (onGabaritoChange) onGabaritoChange(gabaritoData);
    gerarGabarito(selectedQuestionsData);
  }, [gabaritoData, onGabaritoChange]);

  const handleImportHeader = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".docx")) {
      Toast({ message: "Por favor, selecione um arquivo .docx" });
      return;
    }

    try {
      Toast({ message: "Importando cabeçalho..." });
      const headerContent = await importHeaderFromDocx(file);
      console.log(headerContent);
      setImportedHeader(headerContent);
      setHeaderFileName(file.name);
      Toast({ message: "Cabeçalho importado com sucesso!" });
    } catch (error: any) {
      Toast({
        message: `Erro ao importar cabeçalho: ${error.message}`,
        color: "danger",
      });
    }
  };

  const handleRemoveHeader = () => {
    setImportedHeader(null);
    setHeaderFileName(null);
    Toast({ message: "Cabeçalho removido" });
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    openModalMessages(false);
    Toast({ message: `Texto "${message.title}" selecionada!` });
  };

  const handleRemoveMessage = () => {
    setSelectedMessage(null);
    Toast({ message: "Texto removida" });
  };
  const handlePreviewModal = (state: boolean): any => {
    if (isBigLayout) {
      return setVisualize(state);
    }
    return setIsPreviewOpen(state);
  };
  const handleGenerateDocument = async (format: "docx" | "pdf") => {
    if (!selectedLayout) {
      Toast({ message: "Selecione um layout primeiro!" });
      return;
    }
    if (selectedCount === 0) {
      Toast({ message: "Selecione pelo menos uma questão!", color: "warning" });
      return;
    }

    setGenerating(true);
    try {
      let blob: Blob;
      let fileName: string;

      if (format === "docx") {
        blob = await generateDocx(
          selectedQuestionsData,
          selectedLayout,
          importedHeader || undefined,
          selectedMessage || undefined,
          gabaritoData || undefined
        );
        fileName = `prova_${Date.now()}.docx`;
      } else {
        blob = await generatePdf(
          selectedQuestionsData,
          selectedLayout,
          importedHeader || undefined
        );
        fileName = `prova_${Date.now()}.pdf`;
      }

      saveFile(blob, fileName);

      if (format === "docx" && driveClient.authorized) {
        const shouldSaveToDrive = confirm(
          "Documento gerado! Deseja também salvá-lo no Google Drive?"
        );
        if (shouldSaveToDrive) {
          await driveClient.createDocxFile(fileName, blob);
          Toast({ message: "Documento salvo localmente e no Google Drive!" });
        }
      } else {
        Toast({
          message: `Documento ${format.toUpperCase()} gerado com sucesso!`,
        });
      }
    } catch (error: any) {
      console.error("Erro ao gerar documento:", error);
      Toast({
        message: `Erro ao gerar documento: ${error.message}`,
        color: "danger",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = async () => {
    if (!selectedLayout || selectedCount === 0) return;
    setGenerating(true);
    try {
      const blob = await generateDocx(
        selectedQuestionsData,
        selectedLayout,
        importedHeader || undefined,
        selectedMessage || undefined,
        gabaritoData || undefined
      );
      setPreviewBlob(blob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      handlePreviewModal(true);
    } catch (err: any) {
      Toast({
        message: `Erro ao gerar preview: ${err.message}`,
        color: "danger",
      });
    } finally {
      setGenerating(false);
    }
  };

  const renderButtonContent = (
    label: string,
    isLoading: boolean,
    Icon: React.FC<{ className?: string }>
  ) => (
    <span className="flex items-center justify-center gap-2">
      {isLoading ? (
        <Loader className="animate-spin w-5 h-5" />
      ) : (
        <Icon className="w-5 h-5" />
      )}
      {label}
    </span>
  );

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6">
      <h2 className="text-2xl font-bold mb-4">Gerar Documento</h2>

      {!selectedLayout && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">
            ⚠️ Selecione um layout na aba "Layouts" antes de gerar o documento.
          </p>
        </div>
      )}

      <div className="mb-6 p-4 bg-purple/10 border border-purple/50 rounded-2xl">
        <h3 className="text-lg font-semibold mb-3">
          Cabeçalho Customizado (Opcional)
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Importe um arquivo .docx contendo apenas o cabeçalho formatado
          (tabelas, texto com formatação, etc.) que será adicionado ao início do
          documento.
        </p>

        {!importedHeader ? (
          <div className="flex items-center gap-3">
            <label
              htmlFor="header-upload"
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-purple text-white rounded hover:bg-purple-dark transition"
            >
              <Upload className="w-5 h-5" />
              Importar Cabeçalho (.docx)
            </label>
            <input
              id="header-upload"
              type="file"
              accept=".docx"
              onChange={handleImportHeader}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-2xl">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span className="text-sm font-medium">{headerFileName}</span>
            </div>
            <button
              onClick={handleRemoveHeader}
              className="text-red-500 hover:text-red-700 transition"
              title="Remover cabeçalho"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="mb-6 p-4 bg-purple/10 border border-purple/50 rounded-2xl flex flex-col gap-2">
        <h3 className="text-lg font-semibold mb-3">
          Texto Adicional (Opcional)
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Adicione um texto de instrução ou mensagem que será incluído no
          documento.
        </p>

        <div className="flex items-center gap-3">
          {!selectedMessage ? (
            <Button
              variant="primary"
              onClick={() => openModalMessages(true)}
              disabled={loadingMessages}
              className="bg-purple text-white rounded hover:bg-purple-dark"
            >
              <MessageSquareText size={16} />
              Selecionar Texto
            </Button>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-2xl w-full">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 " />
                <span className="text-sm font-medium">
                  {selectedMessage.title}
                </span>
              </div>
              <button
                onClick={handleRemoveMessage}
                className="text-red-500 hover:text-red-700 transition"
                title="Remover texto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 p-4 bg-purple/10 border border-purple/50 rounded-2xl">
        <h3 className="text-lg font-semibold mb-3">Gabarito (Opcional)</h3>
        <p className="text-sm text-gray-600 mb-3">
          Gere um gabarito/cartão de respostas para as questões de múltipla
          escolha.
        </p>
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="primary"
            className="bg-purple text-white rounded hover:bg-purple-dark"
            onClick={() => {
              const gabarito = gerarGabarito(selectedQuestionsData);
              setGabaritoData(gabarito);
              setIsGabaritoModalOpen(true);
            }}
            disabled={!haveValidQuestion}
          >
            <MessageSquareText size={16} />
            Adicionar Gabarito
          </Button>
        </div>

        {gabaritoData && (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-2xl w-full">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 " />
              <span className="text-sm font-medium">
                Gabarito gerado ({gabaritoData.questoes.length} questões)
              </span>
            </div>
            <button
              onClick={handleRemoveMessage}
              className="text-red-500 hover:text-red-700 transition"
              title="Remover texto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <MessagesModal
        isModalMessagesOpen={isModalMessagesOpen}
        openModalMessages={() => openModalMessages(false)}
        messages={messages}
        loadingMessages={loadingMessages}
        selectedMessage={selectedMessage}
        handleSelectMessage={handleSelectMessage}
      />
      <PreviewModal
        isPreviewOpen={isPreviewOpen}
        setIsPreviewOpen={handlePreviewModal}
        previewBlob={previewBlob}
        setPreviewUrl={setPreviewUrl}
      />
      {gabaritoData && (
        <GabaritoModal
          isOpen={isGabaritoModalOpen}
          onClose={() => setIsGabaritoModalOpen(false)}
          gabarito={gabaritoData}
          onConfirm={(cols) => {
            setGabaritoData({ ...gabaritoData, colunasPorLinha: cols });
          }}
        />
      )}

      <div className="flex gap-4">
        <Button
          variant="primary"
          onClick={() => handleGenerateDocument("docx")}
          disabled={!selectedLayout || selectedCount === 0 || generating}
          className="flex-1"
        >
          {renderButtonContent(
            `Gerar DOCX (${selectedCount} questões)`,
            generating,
            Download
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={generating || selectedCount === 0}
        >
          <Eye className="w-4 h-4 mr-2" />
          Pré-visualizar
        </Button>
      </div>

      {selectedLayout && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Configurações Aplicadas:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Layout: {selectedLayout.name}</li>
            <li>
              • Fonte: {selectedLayout.fontFamily} ({selectedLayout.fontSize})
            </li>
            <li>• Espaçamento: {selectedLayout.lineSpacing}</li>
            {importedHeader && <li>• Cabeçalho customizado incluído</li>}
            {selectedMessage && <li>• Texto adicional incluída</li>}
            {gabaritoData && <li>• Gabarito incluído</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DocumentGenerator;
