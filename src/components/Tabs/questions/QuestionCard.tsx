import { Edit2, Trash2, Save, FileText } from "lucide-react";
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
      setProgress((p) => (p >= 100 ? 100 : p + 100 / (HOVER_DELAY / 100)));
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
    <div className="group">
      <div
        className={`
          relative bg-white rounded-2xl shadow-md border border-gray-100
          transition-all duration-300 ease-out
          hover:shadow-xl hover:border-primary-200 hover:scale-[1.01]
          ${isList ? "p-4" : "p-6"}
          ${hovering ? "ring-2 ring-primary-300 ring-opacity-50" : ""}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {hovering && (
          <div
            className="absolute top-0 left-1 overflow-hidden h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-2xl transition-all duration-100"
            style={{ width: `${progress - 1}%` }}
          />
        )}

        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center group-hover:from-primary-200 group-hover:to-primary-300 transition-all duration-300">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <h3
              className={`font-bold text-gray-800 group-hover:text-primary-700 transition-colors duration-300 ${isList ? "text-base" : "text-lg"}`}
            >
              {question.title}
            </h3>
          </div>
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <Button
              isIconOnly
              variant="custom"
              onClick={onEdit}
              aria-label="Editar"
              className="w-9 h-9 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-lg transition-all duration-200 hover:scale-110"
            >
              <Edit2 size={16} />
            </Button>
            <Button
              isIconOnly
              variant="custom"
              onClick={onDelete}
              aria-label="Excluir"
              className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all duration-200 hover:scale-110"
            >
              <Trash2 size={16} />
            </Button>
            <Button
              isIconOnly
              variant="custom"
              onClick={handleSaveFile}
              aria-label="Salvar como Word"
              className="w-9 h-9 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-all duration-200 hover:scale-110"
            >
              <Save size={16} />
            </Button>
          </div>
        </div>

        {isList ? (
          <p className="text-sm text-gray-600 line-clamp-2 pl-13">
            {question.content}
          </p>
        ) : isDetail ? (
          <div className="space-y-3 text-sm text-gray-700">
            <p className="leading-relaxed">{question.content}</p>
            <div className="flex gap-2 flex-wrap">
              <Chip
                size="sm"
                color={getDifficultyColor(question.difficulty)}
                className="font-medium"
              >
                {question.difficulty}
              </Chip>
              <Chip
                size="sm"
                color={getTypeColor(question.type)}
                className="font-medium"
              >
                {question.type === "multipla" ? "Múltipla Escolha" : "Aberta"}
              </Chip>
              {question.subject && (
                <Chip size="sm" className="bg-gray-100 text-gray-700">
                  {question.subject}
                </Chip>
              )}
              {question.category && (
                <Chip size="sm" className="bg-primary-50 text-primary-700">
                  {question.category}
                </Chip>
              )}
            </div>
            {question.type === "multipla" && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                <p className="font-medium mb-2 text-gray-700">Alternativas:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-600">
                  {question.options.map(
                    (opt, idx) =>
                      opt && (
                        <li key={idx} className="pl-1">
                          {opt}
                        </li>
                      )
                  )}
                </ol>
              </div>
            )}
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {question.content}
            </p>
            <div className="flex gap-2 mb-4 flex-wrap">
              <Chip
                size="sm"
                color={getTypeColor(question.type)}
                className="font-medium"
              >
                {question.type === "multipla" ? "Múltipla Escolha" : "Aberta"}
              </Chip>
              <Chip
                size="sm"
                color={getDifficultyColor(question.difficulty)}
                className="font-medium"
              >
                {question.difficulty}
              </Chip>
              {question.subject && (
                <Chip size="sm" className="bg-gray-100 text-gray-700">
                  {question.subject}
                </Chip>
              )}
              {question.category && (
                <Chip size="sm" className="bg-primary-50 text-primary-700">
                  {question.category}
                </Chip>
              )}
            </div>
            {question.type === "multipla" &&
              question.options.some((opt) => opt) && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold mb-3 text-gray-700">
                    Alternativas:
                  </p>
                  <div className="space-y-2">
                    {question.options.map(
                      (option, idx) =>
                        option && (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg hover:bg-primary-50 transition-colors duration-200"
                          >
                            <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <p className="text-sm text-gray-700">{option}</p>
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
