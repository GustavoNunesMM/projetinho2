import React, { useEffect, useState } from "react";
import {
  Download,
  Loader,
  Upload,
  X,
  MessageSquareText,
  Check,
  Eye,
  FileText,
  Settings,
  ClipboardList,
  Sparkles,
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
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({
  selectedLayout,
  questions,
  selectedQuestions = [],
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
    Toast({ message: `Texto "${message.title}" selecionado!` });
  };

  const handleRemoveMessage = () => {
    setSelectedMessage(null);
    Toast({ message: "Texto removido" });
  };

  const handleRemoveGabarito = () => {
    setGabaritoData(null);
    Toast({ message: "Gabarito removido" });
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
      setIsPreviewOpen(true);
    } catch (err: any) {
      Toast({
        message: `Erro ao gerar preview: ${err.message}`,
        color: "danger",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-slideUp hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
            Gerar Documento
          </h2>
          <p className="text-xs text-gray-500">
            Configure e exporte sua prova
          </p>
        </div>
      </div>

      {!selectedLayout && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 animate-fadeIn">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Settings className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-amber-800 font-medium text-sm">
              Selecione um layout primeiro
            </p>
            <p className="text-amber-600 text-xs mt-0.5">
              Escolha um layout acima antes de gerar o documento.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div className="p-4 bg-gradient-to-r from-primary-50 to-white border border-primary-100 rounded-xl transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Cabeçalho Customizado
              </h3>
              <p className="text-xs text-gray-500">Opcional</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3 pl-11">
            Importe um arquivo .docx contendo o cabeçalho formatado.
          </p>

          {!importedHeader ? (
            <div className="pl-11">
              <label
                htmlFor="header-upload"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl cursor-pointer hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
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
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl ml-11">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium text-green-800">
                  {headerFileName}
                </span>
              </div>
              <button
                onClick={handleRemoveHeader}
                className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-500 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                title="Remover cabeçalho"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-gradient-to-r from-primary-50 to-white border border-primary-100 rounded-xl transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <MessageSquareText className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Texto Adicional</h3>
              <p className="text-xs text-gray-500">Opcional</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3 pl-11">
            Adicione um texto de instrução que será incluído no documento.
          </p>

          <div className="pl-11">
            {!selectedMessage ? (
              <Button
                variant="custom"
                onClick={() => openModalMessages(true)}
                disabled={loadingMessages}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm font-medium"
              >
                <MessageSquareText size={16} className="mr-2" />
                Selecionar Texto
              </Button>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-800">
                    {selectedMessage.title}
                  </span>
                </div>
                <button
                  onClick={handleRemoveMessage}
                  className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-500 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                  title="Remover texto"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-primary-50 to-white border border-primary-100 rounded-xl transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Gabarito</h3>
              <p className="text-xs text-gray-500">Opcional</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3 pl-11">
            Gere um gabarito para as questões de múltipla escolha.
          </p>

          <div className="pl-11">
            {!gabaritoData ? (
              <Button
                variant="custom"
                className={`px-4 py-2.5 rounded-xl shadow-md text-sm font-medium transition-all duration-300 ${
                  haveValidQuestion
                    ? "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white hover:shadow-lg transform hover:scale-105"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                onClick={() => {
                  const gabarito = gerarGabarito(selectedQuestionsData);
                  setGabaritoData(gabarito);
                  setIsGabaritoModalOpen(true);
                }}
                disabled={!haveValidQuestion}
              >
                <ClipboardList size={16} className="mr-2" />
                Adicionar Gabarito
              </Button>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-800">
                    Gabarito gerado ({gabaritoData.questoes.length} questões)
                  </span>
                </div>
                <button
                  onClick={handleRemoveGabarito}
                  className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-500 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                  title="Remover gabarito"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
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
        setIsPreviewOpen={setIsPreviewOpen}
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

      <div className="flex gap-3">
        <Button
          variant="custom"
          onClick={() => handleGenerateDocument("docx")}
          disabled={!selectedLayout || selectedCount === 0 || generating}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
            !selectedLayout || selectedCount === 0 || generating
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            {generating ? (
              <Loader className="animate-spin w-5 h-5" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Gerar DOCX ({selectedCount} questões)
          </span>
        </Button>
        <Button
          variant="custom"
          onClick={handlePreview}
          disabled={generating || selectedCount === 0}
          className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
            generating || selectedCount === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border-2 border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-400 shadow-md hover:shadow-lg"
          }`}
        >
          <Eye className="w-4 h-4 mr-2" />
          Visualizar
        </Button>
      </div>

      {selectedLayout && (
        <div className="mt-5 p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-blue-900">
              Configurações Aplicadas
            </h3>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span>{selectedLayout.name}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span>
                {selectedLayout.fontFamily} {selectedLayout.fontSize}
              </span>
            </div>
            {importedHeader && (
              <div className="flex items-center gap-2 text-green-700">
                <Check className="w-3.5 h-3.5" />
                <span>Cabeçalho</span>
              </div>
            )}
            {selectedMessage && (
              <div className="flex items-center gap-2 text-green-700">
                <Check className="w-3.5 h-3.5" />
                <span>Texto</span>
              </div>
            )}
            {gabaritoData && (
              <div className="flex items-center gap-2 text-green-700">
                <Check className="w-3.5 h-3.5" />
                <span>Gabarito</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentGenerator;
