import { Edit2, Trash2, Save } from "lucide-react";
import { Chip, Button } from "@heroui/react";
import { useDocumentGenerator } from "../../hooks/useDocumentGenerator";
import { Question } from "../../types/question";

interface QuestionCardProps {
  question: Question;
  onEdit: () => void;
  onDelete: () => void;
}

type ChipColor =
  | "success"
  | "warning"
  | "danger"
  | "default"
  | "primary"
  | "secondary";

const QuestionCard = ({ question, onEdit, onDelete }: QuestionCardProps) => {
  const { generateQuestionDocx } = useDocumentGenerator();
  const getDifficultyColor = (difficulty: string): ChipColor => {
    const variants: Record<string, ChipColor> = {
      facil: "success",
      media: "warning",
      dificil: "danger",
    };
    return variants[difficulty] || "default";
  };

  const getTypeColor = (type: string): ChipColor => {
    return type === "multipla" ? "secondary" : "warning";
  };
  const saveFile = (question: any) => {
    generateQuestionDocx(question);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold flex-1">{question.title}</h3>
        <div className="flex gap-2">
          <Button
            isIconOnly
            variant="light"
            color="primary"
            onPress={onEdit}
            aria-label="Editar"
          >
            <Edit2 size={16} />
          </Button>
          <Button
            isIconOnly
            variant="light"
            color="danger"
            onPress={onDelete}
            aria-label="Excluir"
          >
            <Trash2 size={16} />
          </Button>
          <Button
            isIconOnly
            variant="light"
            color="danger"
            onPress={saveFile}
            aria-label="Salvar como word"
          >
            <Save size={16} />
          </Button>
        </div>
      </div>

      <p className="text-gray-700 mb-3">{question.content}</p>

      {question.contentImage && (
        <div className="mb-3">
          <img
            src={question.contentImage}
            alt="Imagem do enunciado"
            className="max-w-md rounded border"
          />
        </div>
      )}

      <div className="flex gap-2 mb-3 flex-wrap">
        <Chip size="sm" color={getTypeColor(question.type)}>
          {question.type === "multipla" ? "Múltipla Escolha" : "Aberta"}
        </Chip>
        <Chip size="sm" color={getDifficultyColor(question.difficulty)}>
          {question.difficulty}
        </Chip>
        <Chip size="sm" color="default">
          {question.subject}
        </Chip>
        <Chip size="sm" color="secondary">
          {question.category}
        </Chip>
        {question.importedFrom && (
          <Chip size="sm" color="primary">
            Importada de: {question.importedFrom}
          </Chip>
        )}
      </div>

      {question.type === "multipla" && question.options.some((opt) => opt) && (
        <div className="border-t pt-3">
          <p className="font-medium mb-2">Alternativas:</p>
          <div className="space-y-2">
            {question.options.map(
              (option, idx) =>
                option && (
                  <div key={idx}>
                    <p className="text-sm text-gray-600">
                      {String.fromCharCode(65 + idx)}) {option}
                    </p>
                    {question.optionImages[idx] && (
                      <img
                        src={question.optionImages[idx]!}
                        alt={`Imagem alternativa ${String.fromCharCode(65 + idx)}`}
                        className="max-w-xs rounded border mt-1 ml-4"
                      />
                    )}
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
