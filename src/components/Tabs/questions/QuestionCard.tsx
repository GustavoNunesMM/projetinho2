import { Edit2, Trash2, Save } from "lucide-react";
import { Chip } from "@heroui/react";
import { useDocumentGenerator } from "@/hooks/useDocumentGenerator";
import { useState, useRef } from "react";
import { Question } from "@/types/question";
import { Toast } from "@/components/common/Toast.tsx";
import Button from "@/components/common/Button.tsx";
import PreviewModal from "./PreviewModal";
interface QuestionCardProps {
  question: Question;
  onEdit: () => void;
  onDelete: () => void;
  format?: "block" | "list" | "detail";
  onHoverPreview?: (q: Question) => void;
}
type ChipColor =
  | "success"
  | "warning"
  | "danger"
  | "default"
  | "primary"
  | "secondary";

const QuestionCard = ({
  question,
  onEdit,
  onDelete,
  format,
  onHoverPreview,
}: QuestionCardProps) => {
  const { generateQuestionDocx, saveFile } = useDocumentGenerator();
  const [hovering, setHovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const isList = format === "list";
  const isDetail = format === "detail";

  const HOVER_DELAY = 1500; 

  const startHover = () => {
    setHovering(true);
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 100 / (HOVER_DELAY /100)));
    }, 50);

    timerRef.current = setTimeout(() => {
      clearInterval(progressRef.current!);
      setProgress(100);
      onHoverPreview ? onHoverPreview(question) : setShowPreview(true);
    }, HOVER_DELAY);
  };

  const endHover = () => {
    clearTimeout(timerRef.current!);
    clearInterval(progressRef.current!);
    setHovering(false);
    setProgress(0);
  };

  const handleMouseEnter = () => startHover();
  const handleMouseLeave = () => endHover();

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

  const handleSaveFile = async () => {
    try {
      const blob = await generateQuestionDocx(question);
      const fileName = `${question.title || "questao"}.docx`;
      saveFile(blob, fileName);
      Toast({
        message: `Documento ${fileName.toUpperCase()} gerado com sucesso!`,
      });
    } catch (error) {
      console.error("Erro ao salvar questão:", error);
      Toast({
        message: `Falha ao gerar o documento`,
        color: "danger",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div
        className={`
      relative rounded-lg shadow transition-transform duration-200
      ${isList ? "p-3" : "p-6"}
      ${hovering ? "scale-[1.01]" : ""}
    `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {hovering && (
          <div
            className="absolute top-0 left-0 h-1 bg-blue-500 rounded-t"
            style={{ width: `${progress}%` }}
          />
        )}

        <div className={`flex justify-between items-start mb-2`}>
          <h3 className={`font-bold ${isList ? "text-base" : "text-xl"}`}>
            {question.title}
          </h3>
            <div className="flex gap-2">
              <Button
                isIconOnly
                variant="light"
                onClick={onEdit}
                aria-label="Editar"
              >
                <Edit2 size={16} />
              </Button>
              <Button
                isIconOnly
                variant="light-danger"
                onClick={onDelete}
                aria-label="Excluir"
              >
                <Trash2 size={16} />
              </Button>
              <Button
                isIconOnly
                variant="light-success"
                onClick={handleSaveFile}
                aria-label="Salvar como Word"
              >
                <Save size={16} />
              </Button>
            </div>
        </div>

        {isList ? (
          <p className="text-sm text-gray-600 line-clamp-2">
            {question.content}
          </p>
        ) : isDetail ? (
          <div className="space-y-2 text-sm text-gray-700">
            <p>{question.content}</p>
            <div className="flex gap-2 flex-wrap">
              <Chip size="sm" color={getDifficultyColor(question.difficulty)}>
                {question.difficulty}
              </Chip>
              <Chip size="sm" color={getTypeColor(question.type)}>
                {question.type === "multipla" ? "Múltipla Escolha" : "Aberta"}
              </Chip>
              {question.subject && <Chip size="sm">{question.subject}</Chip>}
              {question.category && <Chip size="sm">{question.category}</Chip>}
            </div>
            {question.type === "multipla" && (
              <div>
                <p className="font-medium mb-1">Alternativas:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                  {question.options.map(
                    (opt, idx) => opt && <li key={idx}>{opt}</li>
                  )}
                </ol>
              </div>
            )}
          </div>
        ) : (
          <>
            <p className="text-gray-700 mb-3">{question.content}</p>
            <div className="flex gap-2 mb-3 flex-wrap">
              <Chip size="sm" color={getTypeColor(question.type)}>
                {question.type === "multipla" ? "Múltipla Escolha" : "Aberta"}
              </Chip>
              <Chip size="sm" color={getDifficultyColor(question.difficulty)}>
                {question.difficulty}
              </Chip>
              {question.subject && <Chip size="sm">{question.subject}</Chip>}
              {question.category && <Chip size="sm">{question.category}</Chip>}
            </div>
            {question.type === "multipla" &&
              question.options.some((opt) => opt) && (
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
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}
          </>
        )}
      </div>

      {showPreview && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          question={question}
        />
      )}
    </div>
  );
};

export default QuestionCard;
