import React from "react";
import { Chip, Checkbox } from "@heroui/react";
import Button from "@/components/common/Button";
import { Question } from "@/types/question";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, BarChart3 } from "lucide-react";

interface QuestionListProps {
  questions: Question[];
  selectedIds: number[];
  onToggleSelection: (id: number) => void;
  onSelectAll: () => void;
  onReorder?: (questions: Question[]) => void;
}

interface SortableQuestionItemProps {
  question: Question;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

const SortableQuestionItem: React.FC<SortableQuestionItemProps> = ({
  question,
  isSelected,
  onToggle,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-2xl border p-4 transition-all duration-300
        ${isSelected ? "border-purple-500 bg-purple-50 shadow-md" : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg"}`}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab self-center flex  active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={18} />
        </div>
        <div className="absolute top-3 right-3">
          <Checkbox
            isSelected={isSelected}
            onChange={() => onToggle(question.id)}
            color="primary"
            size="sm"
          />
        </div>
        <div className="flex-1" onClick={() => onToggle(question.id)}>
          <h3 className="font-bold">{question.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {question.content.substring(0, 100)}...
          </p>
          {question.contentImage && (
            <div className="mt-2">
              <Chip variant="solid">Com imagem</Chip>
            </div>
          )}
          <div className="flex gap-2 mt-2 flex-wrap">
            <Chip color={getTypeVariant(question.type)}>
              {question.type === "multipla" ? "Múltipla" : "Aberta"}
            </Chip>
            <Chip color={getDifficultyVariant(question.difficulty)}>
              {question.difficulty}
            </Chip>
            {question.subject && (
              <Chip color="default">{question.subject}</Chip>
            )}
            {question.category && (
              <Chip color="primary">{question.category}</Chip>
            )}
            {question.importedFrom && <Chip color="primary">Importada</Chip>}
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onReorder,
}) => {
  const [orderedQuestions, setOrderedQuestions] = React.useState(questions);

  React.useEffect(() => {
    setOrderedQuestions(questions);
  }, [questions]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        if (onReorder) {
          onReorder(newOrder);
        }

        return newOrder;
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 overflow-y">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold ">
            Banco de Questões
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {selectedIds.length} de {questions.length} selecionadas
          </p>
        </div>
        <Button variant="primary" onClick={onSelectAll} className="bg-purple text-white rounded hover:bg-purple-dark">
          Selecionar todas
        </Button>
      </div>

      {orderedQuestions.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <BarChart3 size={40} className="mx-auto mb-2 text-gray-300" />
          Nenhuma questão encontrada com os filtros aplicados.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedQuestions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2">
              {orderedQuestions.map((question) => (
                <SortableQuestionItem
                  key={question.id}
                  question={question}
                  isSelected={selectedIds.includes(question.id)}
                  onToggle={onToggleSelection}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default QuestionList;
