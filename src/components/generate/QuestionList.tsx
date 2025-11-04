import React from "react";
import { Badge, Checkbox } from "@heroui/react";
import Button from "../common/Button";
import { Question } from "../../types/question";

interface QuestionListProps {
  questions: Question[];
  selectedIds: number[];
  onToggleSelection: (id: number) => void;
  onSelectAll: () => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  selectedIds,
  onToggleSelection,
  onSelectAll,
}) => {
  const getDifficultyVariant = (
    difficulty: Question["difficulty"]
  ): "primary" | "warning" | "danger" | "default" => {
    const variants: Record<
      Question["difficulty"],
      "primary" | "warning" | "danger"
    > = {
      facil: "primary",
      media: "warning",
      dificil: "danger",
    };
    return variants[difficulty] || "default";
  };

  const getTypeVariant = (
    type: Question["type"]
  ): "primary" | "warning" | "default" => {
    return type === "multipla" ? "primary" : "warning";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Selecionar Questões ({selectedIds.length} selecionadas)
        </h2>
        <Button variant="primary" onClick={onSelectAll}>
          Selecionar Todas
        </Button>
      </div>

      {questions.length === 0 ? (
        <p className="text-gray-500">
          Nenhuma questão encontrada com os filtros aplicados.
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {questions.map((question) => (
            <div
              key={question.id}
              onClick={() => onToggleSelection(question.id)}
              className={`border rounded-lg p-4 cursor-pointer transition ${
                selectedIds.includes(question.id)
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-start">
                <Checkbox
                  isSelected={selectedIds.includes(question.id)}
                  onChange={() => {}}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <h3 className="font-bold">{question.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {question.content.substring(0, 100)}...
                  </p>
                  {question.contentImage && (
                    <div className="mt-2">
                      <Badge variant="solid">Com imagem</Badge>
                    </div>
                  )}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge color={getTypeVariant(question.type)}>
                      {question.type === "multipla" ? "Múltipla" : "Aberta"}
                    </Badge>
                    <Badge color={getDifficultyVariant(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    <Badge color="default">{question.subject}</Badge>
                    <Badge color="primary">{question.category}</Badge>
                    {question.importedFrom && (
                      <Badge color="primary">Importada</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionList;
