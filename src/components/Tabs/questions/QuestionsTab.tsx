import React, { useState, useRef } from "react";
import {
  Plus,
  FileUp,
  Cloud,
  Loader,
  Database,
  Search,
  Sparkles,
} from "lucide-react";
import QuestionCard from "./QuestionCard";
import QuestionModal from "./QuestionModal";
import QuestionFilters from "@/components/Tabs/generate/QuestionFilters";
import { useImportHandlers } from "@/hooks/useImportHandlers";
import Button from "@/components/common/Button";
import useDocumentGenerator from "@/hooks/useDocumentGenerator";
import { Toast } from "@/components/common/Toast";
import { deleteAllQuestion } from "@/database/database";
import { Question, QuestionFormData } from "@/types/question";
import { DriveFile, DriveFileSelectorProps } from "@/types/drive";
import { useQuestions } from "@/hooks/useQuestions";
import { useFilters } from "@/hooks/useFilters";

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
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [importing, setImporting] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importQuestions, driveClient } = useImportHandlers();
  const { generateQuestionDocx } = useDocumentGenerator();

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleSave = async (questionData: QuestionFormData) => {
    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, questionData);
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
      setEditingQuestion(null);
    } catch (err) {
      Toast({ message: String(err) });
    }
  };

  const handleDelete = async (id: number) => {
    // if (!confirm("Deseja realmente excluir esta questão?")) return;
    try {
      await deleteQuestion(id);
      Toast({ message: "Questão excluída com sucesso!" });
    } catch (err) {
      Toast({ message: `Erro ao excluir: ${err}` });
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
          variant="primary"
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-300"
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
            type="file"
            ref={fileInputRef}
            onChange={handleLocalImport}
            accept=".docx"
            className="hidden"
            disabled={importing}
          />
          <Button
            variant="custom"
            icon={importing ? Loader : FileUp}
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-[#97dffc] hover:bg-[#87cfe8] text-gray-800 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium border border-[#87cfe8]"
          >
            {importing ? "Importando..." : "Importar Local"}
          </Button>
          <Button
            variant="light-danger"
            onClick={() => deleteAllQuestion()}
            className="  px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium "
          >
            Deletar questões
          </Button>

          {driveClient.ready && driveClient.authorized && (
            <Button
              variant="custom"
              icon={Cloud}
              onClick={() => setShowDriveModal(true)}
              disabled={importing}
              className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium border border-gray-200"
            >
              Importar do Drive
            </Button>
          )}

          <Button
            variant="custom"
            icon={Plus}
            onClick={() => {
              setEditingQuestion(null);
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
          >
            Nova Questão
          </Button>
        </div>
      </div>

      <div className="animate-slideUp stagger-1">
        <QuestionFilters
          filters={filters}
          onUpdateFilter={updateFilter}
          format={format}
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
            variant="custom"
            icon={Plus}
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
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
                question={question}
                onEdit={() => handleEdit(question)}
                onDelete={() => handleDelete(question.id)}
                format={format}
              />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <QuestionModal
          question={editingQuestion}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingQuestion(null);
          }}
        />
      )}

      {showDriveModal && (
        <DriveFileSelector
          onSelect={handleDriveImport}
          onClose={() => setShowDriveModal(false)}
          driveClient={driveClient}
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
        Toast({ message: "Erro ao listar Drive: " + err.message })
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
                onClick={() => onSelect(file.id)}
                className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-white hover:border-primary-300 transition-all duration-300 group animate-slideUp"
                style={{ animationDelay: `${index * 0.05}s` }}
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
            variant="custom"
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionsTab;
