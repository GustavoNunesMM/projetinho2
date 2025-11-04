import React, { useState } from "react";
import { Download, Loader, Upload, X } from "lucide-react";
import Button from "../common/Button.tsx";
import { useDocumentGenerator } from "../../hooks/useDocumentGenerator.ts";
import { useDriveClient } from "../../hooks/useDriveClient.ts";
import { Layout } from "../../types/layout";
import { Question } from "../../types/question";
import { Toast } from "../common/Toast.tsx";

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

  const { generateDocx, generatePdf, importHeaderFromDocx, saveFile } =
    useDocumentGenerator();
  const driveClient = useDriveClient();

  const selectedQuestionsData = questions.filter((q) =>
    selectedQuestions.includes(q.id)
  );
  const selectedCount = selectedQuestionsData.length;

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
      setImportedHeader(headerContent);
      setHeaderFileName(file.name);
      Toast({ message: "Cabeçalho importado com sucesso!" });
    } catch (error: any) {
      console.error("Erro ao importar cabeçalho:", error);
      Toast({ message: `Erro ao importar cabeçalho: ${error.message}` });
    }
  };

  const handleRemoveHeader = () => {
    setImportedHeader(null);
    setHeaderFileName(null);
    Toast({ message: "Cabeçalho removido" });
  };

  const handleGenerateDocument = async (format: "docx" | "pdf") => {
    if (!selectedLayout) {
      Toast({ message: "Selecione um layout primeiro!" });
      return;
    }
    if (selectedCount === 0) {
      Toast({ message: "Selecione pelo menos uma questão!" });
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
          importedHeader || undefined
        );
        fileName = `prova_${Date.now()}.docx`;
      } else {
        blob = await generatePdf(selectedQuestionsData, selectedLayout);
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
      Toast({ message: `Erro ao gerar documento: ${error.message}` });
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
          variant="primary"
          onClick={() => handleGenerateDocument("pdf")}
          disabled={!selectedLayout || selectedCount === 0 || generating}
          className="flex-1"
        >
          {renderButtonContent(
            `Gerar PDF (${selectedCount} questões)`,
            generating,
            Download
          )}
        </Button>
      </div>

      {/* Informações sobre configurações aplicadas */}
      {selectedLayout && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800 font-medium mb-2">
            ℹ️ Configurações do Layout Aplicadas:
          </p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>
              • Fonte: {selectedLayout.fontFamily}, Tamanho:{" "}
              {selectedLayout.fontSize}
            </li>
            <li>• Espaçamento de linha: {selectedLayout.lineSpacing}</li>
            <li>
              • Margens: Superior {selectedLayout.marginTop}, Inferior{" "}
              {selectedLayout.marginBottom}, Esquerda{" "}
              {selectedLayout.marginLeft}, Direita {selectedLayout.marginRight}
            </li>
            {importedHeader && (
              <li className="text-green-700 font-medium">
                • Cabeçalho customizado será incluído
              </li>
            )}
          </ul>
        </div>
      )}

      {driveClient.ready && (
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded">
          <p className="text-sm text-purple-800">
            {driveClient.authorized
              ? "✓ Conectado ao Google Drive. Documentos DOCX serão salvos localmente e você poderá optar por salvá-los também no Drive."
              : "💡 Faça login no Google Drive para salvar documentos automaticamente na nuvem."}
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentGenerator;
