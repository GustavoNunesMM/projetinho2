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
    Toast({ message: `Mensagem "${message.title}" selecionada!` });
  };

  const handleRemoveMessage = () => {
    setSelectedMessage(null);
    Toast({ message: "Mensagem removida" });
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
        selectedMessage || undefined
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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Gerar Documento</h2>

      {!selectedLayout && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800">
            ⚠️ Selecione um layout na aba "Layouts" antes de gerar o documento.
          </p>
        </div>
      )}

      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
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
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
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
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm font-medium text-green-800">
                {headerFileName}
              </span>
            </div>
            <button
              onClick={handleRemoveHeader}
              className="text-red-500 hover:text-red-700 transition"
              title="Remover cabeçalho"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="mb-2 bg-gray-50 border border-gray-200 rounded p-4">
        <div className="flex items-center  justify-between">
          <h3 className="text-lg font-semibold">
            Mensagens Adicionais (Opcional)
          </h3>
          <Button
            variant="primary"
            onClick={() => openModalMessages(true)}
            disabled={!selectedLayout || selectedCount === 0}
          >
            <MessageSquareText size={16} />
            Selecionar Mensagem
          </Button>
        </div>

        {selectedMessage && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {selectedMessage.title}
                </span>
              </div>
              <button
                onClick={handleRemoveMessage}
                className="text-red-500 hover:text-red-700 transition"
                title="Remover mensagem"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-gray-600 ml-7">
              {selectedMessage.isList ? (
                selectedMessage.isOrdered ? (
                  <ol className="list-decimal list-inside">
                    {selectedMessage.items.slice(0, 3).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                    {selectedMessage.items.length > 3 && (
                      <li>
                        ... e mais {selectedMessage.items.length - 3} itens
                      </li>
                    )}
                  </ol>
                ) : (
                  <ul className="list-disc list-inside">
                    {selectedMessage.items.slice(0, 3).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                    {selectedMessage.items.length > 3 && (
                      <li>
                        ... e mais {selectedMessage.items.length - 3} itens
                      </li>
                    )}
                  </ul>
                )
              ) : (
                <div>
                  {selectedMessage.items.slice(0, 2).map((item, idx) => (
                    <p key={idx}>{item}</p>
                  ))}
                  {selectedMessage.items.length > 2 && (
                    <p>... e mais {selectedMessage.items.length - 2} itens</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mb-2 bg-gray-50 border border-gray-200 rounded p-4">
        <div className="flex items-center justify-between ">
          <h3 className="text-lg font-semibold">
            Gabarito / Cartão de Respostas
          </h3>
          <Button
            variant="primary"
            onClick={() => {
              const data = gerarGabarito(selectedQuestionsData, 5);
              setGabaritoData(data);
              setIsGabaritoModalOpen(true);
            }}
            disabled={
              !selectedLayout || selectedCount === 0 || !haveValidQuestion
            }
          >
            <MessageSquareText size={16} />
            Adicionar Gabarito
          </Button>
        </div>

        {gabaritoData && (
          <div className=" p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Gabarito gerado ({gabaritoData.questoes.length} questões)
                </span>
              </div>
              <button
                onClick={() => setGabaritoData(null)}
                className="text-red-500 hover:text-red-700 transition"
                title="Remover gabarito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
        setIsPreviewOpen={setIsPreviewOpen}
        previewBlob={previewBlob}
        setPreviewUrl={setPreviewUrl}
        saveFile={saveFile}
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
          disabled={!selectedLayout || selectedCount === 0 || generating}
          className="flex-1"
        >
          {renderButtonContent("Visualizar", generating, Eye)}
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
            {selectedMessage && <li>• Mensagem adicional incluída</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DocumentGenerator;
