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
import { GripVertical, Database, Search, Image } from "lucide-react";

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
      className={`
        group relative rounded-xl border-2 p-4 transition-all duration-300 ease-out
        ${
          isSelected
            ? "border-primary-500 bg-gradient-to-r from-primary-50 to-white shadow-md"
            : "border-gray-200 bg-white hover:border-primary-300 hover:shadow-lg hover:bg-primary-50/30"
        }
        ${isDragging ? "shadow-xl z-10" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-primary-500 self-center p-1 rounded transition-colors duration-200"
        >
          <GripVertical size={18} />
        </div>

        <div className="absolute top-3 right-3">
          <Checkbox
            isSelected={isSelected}
            onChange={() => onToggle(question.id)}
            color="secondary"
            size="sm"
            classNames={{
              wrapper: "before:border-primary-400 after:bg-primary-600",
            }}
          />
        </div>

        <div
          className="flex-1 cursor-pointer"
          onClick={() => onToggle(question.id)}
        >
          <h3 className="font-bold text-gray-800 group-hover:text-primary-700 transition-colors duration-200 pr-8">
            {question.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {question.content.substring(0, 120)}
            {question.content.length > 120 && "..."}
          </p>

          {question.contentImage && (
            <div className="mt-2">
              <Chip
                variant="flat"
                size="sm"
                startContent={<Image size={12} />}
                className="bg-primary-100 text-primary-700"
              >
                Com imagem
              </Chip>
            </div>
          )}

          <div className="flex gap-2 mt-3 flex-wrap">
            <Chip
              size="sm"
              color={getTypeVariant(question.type)}
              variant="flat"
              className="font-medium"
            >
              {question.type === "multipla" ? "Múltipla" : "Aberta"}
            </Chip>
            <Chip
              size="sm"
              color={getDifficultyVariant(question.difficulty)}
              variant="flat"
              className="font-medium"
            >
              {question.difficulty}
            </Chip>
            {question.subject && (
              <Chip size="sm" variant="flat" className="bg-gray-100 text-gray-700">
                {question.subject}
              </Chip>
            )}
            {question.category && (
              <Chip
                size="sm"
                variant="flat"
                className="bg-primary-50 text-primary-700"
              >
                {question.category}
              </Chip>
            )}
            {question.importedFrom && (
              <Chip
                size="sm"
                variant="flat"
                className="bg-blue-50 text-blue-700"
              >
                Importada
              </Chip>
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-slideUp hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
              Questões Disponíveis
            </h3>
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-primary-600">
                {selectedIds.length}
              </span>{" "}
              de {questions.length} selecionadas
            </p>
          </div>
        </div>
        <Button
          variant="custom"
          onClick={onSelectAll}
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm font-medium"
        >
          Selecionar Todas
        </Button>
      </div>

      {orderedQuestions.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
            <Search className="w-8 h-8 text-primary-500" />
          </div>
          <p className="text-gray-500 font-medium">Nenhuma questão encontrada</p>
          <p className="text-gray-400 text-sm mt-1">
            Tente ajustar os filtros acima
          </p>
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
            <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-gray-100">
              {orderedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
                >
                  <SortableQuestionItem
                    question={question}
                    isSelected={selectedIds.includes(question.id)}
                    onToggle={onToggleSelection}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default QuestionList;
