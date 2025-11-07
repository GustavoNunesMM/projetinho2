import React, { useState, useRef } from "react";
import { Plus, FileUp, Cloud, Loader } from "lucide-react";
import QuestionCard from "./QuestionCard";
import QuestionModal from "./QuestionModal";
import { useImportHandlers } from "../../hooks/useImportHandlers.ts";
import Button from "../common/Button";
import useDocumentGenerator from "../../hooks/useDocumentGenerator.ts";
import { Toast } from "../common/Toast.tsx";
import { Question, QuestionFormData } from "../../types/index";
import { useQuestions } from "../../hooks/useQuestions";

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

  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [importing, setImporting] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const { generateQuestionDocx } = useDocumentGenerator();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importQuestions, driveClient } = useImportHandlers();

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
        } catch (docError) {
          console.error("Erro ao gerar documento:", docError);
          // Não bloqueia o salvamento se falhar a geração do documento
        }
      }
      setShowModal(false);
      setEditingQuestion(null);
    } catch (err) {
      Toast({ message: String(err) });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir esta questão?")) {
      return;
    }

    try {
      await deleteQuestion(id);
      Toast({ message: "Questão excluída com sucesso!" });
    } catch (err) {
      Toast({ message: `Erro ao excluir: ${err}` });
    }
  };

  const handleLocalImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const importedQuestions = await importMultipleQuestions(file);
      Toast({
        message: `${importedQuestions.length} questão(ões) importada(s) com sucesso!`,
      });
    } catch (error) {
      Toast({ message: `Erro ao importar: ${(error as Error).message}` });
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  const handleDriveImport = async (fileId: string) => {
    setImporting(true);
    try {
      const importedQuestions = await importQuestions(
        fileId,
        async (questions: any) => {
          const imported: Question[] = [];
          for (const q of questions) {
            const newQ = await addQuestion(q);
            imported.push(newQ);
          }
          return imported;
        }
      );

      Toast({
        message: `${importedQuestions.length} questão(ões) importada(s) do Drive!`,
      });
      setShowDriveModal(false);
    } catch (error) {
      Toast({
        message: `Erro ao importar do Drive: ${(error as Error).message}`,
      });
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin mr-2" />
        <span>Carregando questões...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Recarregar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Questões</h2>
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
            variant="success"
            icon={importing ? Loader : FileUp}
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? "Importando..." : "Importar Local"}
          </Button>

          {driveClient.ready && driveClient.authorized && (
            <Button
              variant="primary"
              icon={Cloud}
              onClick={() => setShowDriveModal(true)}
              disabled={importing}
            >
              Importar do Drive
            </Button>
          )}

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setEditingQuestion(null);
              setShowModal(true);
            }}
          >
            Nova Questão
          </Button>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">
            Nenhuma questão cadastrada ainda.
          </p>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowModal(true)}
          >
            Criar Primeira Questão
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onEdit={() => handleEdit(question)}
              onDelete={() => handleDelete(question.id)}
            />
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

interface DriveFile {
  id: string;
  name: string;
}

interface DriveClient {
  ready: boolean;
  authorized: boolean;
  listDocxFiles: () => Promise<DriveFile[]>;
}

interface DriveFileSelectorProps {
  onSelect: (fileId: string) => void;
  onClose: () => void;
  driveClient: DriveClient;
}

const DriveFileSelector = ({
  onSelect,
  onClose,
  driveClient,
}: DriveFileSelectorProps) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadFiles = async () => {
      try {
        const driveFiles = await driveClient.listDocxFiles();
        setFiles(driveFiles);
      } catch (error) {
        Toast({
          message:
            "Erro ao listar arquivos do Drive: " + (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };
    loadFiles();
  }, [driveClient]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
        <h3 className="text-xl font-bold mb-4">
          Selecionar Arquivo do Google Drive
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <Loader className="inline-block animate-spin mb-2" />
            <p>Carregando arquivos...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum arquivo .docx encontrado no Drive
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => onSelect(file.id)}
                className="w-full text-left p-3 border rounded hover:bg-gray-50 transition"
              >
                <div className="font-medium">{file.name}</div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionsTab;
