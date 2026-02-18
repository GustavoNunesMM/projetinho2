import React, { useState, useRef } from "react";
import {
  Plus,
  FileUp,
  Cloud,
  Loader,
  Database,
  Search,
  Sparkles,
  Upload,
  List,
  Download,
} from "lucide-react";

import QuestionCard from "./QuestionCard";
import QuestionModal from "./QuestionModal";
import ImportQuestionsModal from "./ImportQuestionsModal";

import QuestionFilters from "@/components/Tabs/Generate/QuestionFilters";
import { useImportHandlers } from "@/hooks/useDocumentManager/useImportHandlers.ts";
import Button from "@/components/common/Button";
import useDocumentGenerator from "@/hooks/wordManager/useDocumentGenerator";
import { Toast } from "@/components/common/Toast";
import { deleteAllQuestion } from "@/database/database";
import { Question, QuestionFormData } from "@/types/question";
import { DriveFile, DriveFileSelectorProps } from "@/types/drive";
import { useQuestions } from "@/hooks/useQuestions";
import { useFilters } from "@/hooks/useFilters";
import DevOnly from "@/components/common/DevOnly";
import DeleteModal from "@/components/modal/DeleteModal";
import DropDown from "@/components/common/Dropdown";

const QuestionsTab = () => {
  const {
    questions,
    loading,
    error,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    importMultipleQuestions,
  } = useQuestions();

  const { filters, updateFilter, filteredItems } = useFilters(questions);
  const [format, setFormat] = useState<"block" | "list" | "detail">("block");

  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );
  const [importing, setImporting] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importQuestions, driveClient } = useImportHandlers();
  const { generateQuestionDocx } = useDocumentGenerator();

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setShowModal(true);
  };

  const handleSave = async (questionData: QuestionFormData) => {
    try {
      if (selectedQuestion) {
        await updateQuestion(selectedQuestion.id, questionData);
        Toast({ message: "Questão atualizada com sucesso!" });
      } else {
        const question = await addQuestion(questionData);

        Toast({ message: "Questão criada com sucesso!" });
        try {
          await generateQuestionDocx(question);
        } catch {
          Toast({ message: "Erro ao gerar o documento da questão." });
          console.error("Erro ao gerar o documento da questão.");
        }
      }
      setShowModal(false);
      setSelectedQuestion(null);
    } catch (err) {
      Toast({ message: String(err) });
    }
  };

  const handleLocalImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    setImporting(true);
    try {
      const list = await importMultipleQuestions(file);

      Toast({ message: `${list.length} questão(ões) importada(s)!` });
    } catch (error) {
      Toast({ message: `Erro ao importar: ${(error as Error).message}` });
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleQuestionAction = async (key: string) => {
    switch (key) {
      case "new":
        setSelectedQuestion(null);
        setShowModal(true);
        break;
      case "import":
        fileInputRef.current?.click();
        break;
      case "import-drive":
        setShowDriveModal(true);
        break;
      case "import-community":
        setShowImportModal(true);
        break;
      default:
        break;
    }
  };

  const handleImportFromCommunity = async (questionData: QuestionFormData) => {
    try {
      await addQuestion(questionData);
      Toast({ message: "Questão importada com sucesso!" });
    } catch (error: any) {
      Toast({ message: `Erro ao importar: ${error.message}` });
      throw error;
    }
  };

  const handleDriveImport = async (fileId: string) => {
    setImporting(true);
    try {
      const list = await importQuestions(fileId, async (qs) => {
        const out: Question[] = [];

        for (const q of qs) out.push(await addQuestion(q));

        return out;
      });

      Toast({ message: `${list.length} do Drive!` });
      setShowDriveModal(false);
    } catch (error) {
      Toast({ message: `Drive: ${(error as Error).message}` });
    } finally {
      setImporting(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl animate-pulseGlow">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
        <p className="mt-6 text-lg font-medium text-gray-700">
          Carregando questões...
        </p>
        <p className="text-sm text-gray-500 mt-1">Aguarde um momento</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-16 animate-fadeIn">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Database className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-600 font-medium mb-2">Erro ao carregar</p>
        <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">{error}</p>
        <Button
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-300"
          variant="primary"
          onClick={() => window.location.reload()}
        >
          Recarregar Página
        </Button>
      </div>
    );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center  rounded-2xl p-6 shadow-lg border border-gray-100 animate-slideUp">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
              Banco de Questões
            </h2>
            <p className="text-sm text-gray-500">
              {questions.length} questões cadastradas
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            accept=".docx"
            className="hidden"
            disabled={importing}
            type="file"
            onChange={handleLocalImport}
          />
          <div className="flex gap-3 max-md:hidden">
            <Button
              className="bg-[#97dffc] hover:bg-[#87cfe8] text-gray-800 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium border border-[#87cfe8]"
              disabled={importing}
              icon={importing ? Loader : FileUp}
              variant="custom"
              onClick={() => fileInputRef.current?.click()}
            >
              {importing ? "Importando..." : "Importar Local"}
            </Button>
            <DevOnly>
              <Button
                className="  px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium "
                variant="light-danger"
                onClick={() => deleteAllQuestion()}
              >
                Deletar questões
              </Button>
            </DevOnly>

            {driveClient.ready && driveClient.authorized && (
              <Button
                className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium border border-gray-200"
                disabled={importing}
                icon={Cloud}
                variant="custom"
                onClick={() => setShowDriveModal(true)}
              >
                Importar do Drive
              </Button>
            )}

            <Button
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
              disabled={importing}
              icon={Download}
              variant="custom"
              onClick={() => setShowImportModal(true)}
            >
              Importar da Comunidade
            </Button>

            <Button
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
              icon={Plus}
              variant="custom"
              onClick={() => {
                setSelectedQuestion(null);
                setShowModal(true);
              }}
            >
              Nova Questão
            </Button>
          </div>
          <DropDown
            className="md:hidden"
            items={[
              { key: "new", title: "Nova questão", icon: Plus },
              { key: "import", title: "Importar Word", icon: Upload },
              {
                key: "import-drive",
                title: "Importar do Drive",
                icon: Cloud,
                isDisabled: !driveClient.ready || !driveClient.authorized,
              },
              {
                key: "import-community",
                title: "Importar da Comunidade",
                icon: Download,
              },
            ]}
            placement="bottom-end"
            triggerIcon={List}
            triggerLabel={"Criar questão"}
            onAction={handleQuestionAction}
          />
        </div>
      </div>

      <div className="animate-slideUp stagger-1">
        <QuestionFilters
          filters={filters}
          format={format}
          onUpdateFilter={updateFilter}
          onUpdateFormat={(newFormat) => setFormat(newFormat)}
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-inner animate-scaleIn">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
            <Search className="w-10 h-10 text-primary-500" />
          </div>
          <p className="text-gray-600 font-medium mb-2">
            Nenhuma questão encontrada
          </p>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Tente ajustar os filtros ou crie uma nova questão para começar.
          </p>
          <Button
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
            icon={Plus}
            variant="custom"
            onClick={() => setShowModal(true)}
          >
            Criar Primeira Questão
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((question, index) => (
            <div
              key={question.id}
              className="animate-slideUp"
              style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
            >
              <QuestionCard
                format={format}
                question={question}
                onDelete={() => {
                  setDeleteModal(true);
                  setSelectedQuestion(question);
                }}
                onEdit={() => handleEdit(question)}
              />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <QuestionModal
          question={selectedQuestion}
          onClose={() => {
            setShowModal(false);
            setSelectedQuestion(null);
          }}
          onSave={handleSave}
        />
      )}

      {deleteModal && (
        <DeleteModal
          elementName={selectedQuestion!.title}
          type="question"
          onClose={() => {
            setSelectedQuestion(null);
            setDeleteModal(false);
          }}
          onSubmit={() => {
            deleteQuestion(selectedQuestion!.id);
            setDeleteModal(false);
            setSelectedQuestion(null);
          }}
        />
      )}
      {showDriveModal && (
        <DriveFileSelector
          driveClient={driveClient}
          onClose={() => setShowDriveModal(false)}
          onSelect={handleDriveImport}
        />
      )}

      {showImportModal && (
        <ImportQuestionsModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportFromCommunity}
        />
      )}
    </div>
  );
};

const DriveFileSelector = ({
  onSelect,
  onClose,
  driveClient,
}: DriveFileSelectorProps) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    driveClient
      .listDocxFiles()
      .then(setFiles)
      .catch((err) =>
        Toast({ message: "Erro ao listar Drive: " + err.message }),
      )
      .finally(() => setLoading(false));
  }, [driveClient]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl border border-gray-100 animate-scaleIn">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
              Google Drive
            </h3>
            <p className="text-sm text-gray-500">Selecione um arquivo .docx</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulseGlow">
              <Loader className="w-6 h-6 text-white animate-spin" />
            </div>
            <p className="text-gray-600 font-medium">Carregando arquivos...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Nenhum arquivo .docx encontrado no Drive
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {files.map((file, index) => (
              <button
                key={file.id}
                className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-white hover:border-primary-300 transition-all duration-300 group animate-slideUp"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => onSelect(file.id)}
              >
                <div className="font-medium text-gray-800 group-hover:text-primary-700 transition-colors">
                  {file.name}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
          <Button
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium"
            variant="custom"
            onClick={onClose}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionsTab;