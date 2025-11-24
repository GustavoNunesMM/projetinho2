import React from "react";
import { Badge, Checkbox } from "@heroui/react";
import Button from "@/components/common/Button";
import { Question } from "@/types/question";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

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
      className={`border rounded-lg p-4 transition ${
        isSelected
          ? "border-blue-600 bg-blue-50"
          : "border-gray-200 hover:border-blue-300"
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab self-center flex  active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={20} />
        </div>
        <Checkbox
          isSelected={isSelected}
          onChange={() => onToggle(question.id)}
          className="mt-1"
        />
        <div className="flex-1" onClick={() => onToggle(question.id)}>
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Selecionar Questões ({selectedIds.length} selecionadas)
        </h2>
        <Button variant="primary" onClick={onSelectAll}>
          Selecionar Todas
        </Button>
      </div>

      {orderedQuestions.length === 0 ? (
        <p className="text-gray-500">
          Nenhuma questão encontrada com os filtros aplicados.
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedQuestions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              {orderedQuestions.map((question) => (
                <SortableQuestionItem
                  key={question.id}
                  question={question}
                  isSelected={selectedIds.includes(question.id)}
                  onToggle={onToggleSelection}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default QuestionList;