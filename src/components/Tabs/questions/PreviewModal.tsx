import { X } from "lucide-react";
import { Chip } from "@heroui/react";
import { Question } from "@/types/question";
import Button from "@/components/common/Button";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  question,
}) => {
  if (!isOpen) return null;

  const difficultyColor = {
    facil: "success",
    media: "warning",
    dificil: "danger",
  } as Record<string, "success" | "warning" | "danger" | "default">;

  const letter = (idx: number) => String.fromCharCode(65 + idx);

  const hasContentImage = !!question.contentImage;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold">{question.title}</h2>

            {question.difficulty && (
              <Chip
                size="sm"
                color={difficultyColor[question.difficulty] || "default"}
              >
                {question.difficulty}
              </Chip>
            )}
            {question.subject && (
              <Chip size="sm" color="primary">
                {question.subject}
              </Chip>
            )}
            {question.category && (
              <Chip size="sm" color="secondary">
                {question.category}
              </Chip>
            )}
            {question.importedFrom && (
              <Chip size="sm" color="success">
                Importado: {question.importedFrom}
              </Chip>
            )}
          </div>
          <Button
            variant={"light-danger"}
            isIconOnly={true}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div
            className="text-gray-800"
            dangerouslySetInnerHTML={{ __html: question.content }}
          />

          {hasContentImage && (
            <div className="flex justify-center">
              <img
                src={question.contentImage!}
                alt="Imagem do enunciado"
                className="max-w-md rounded border"
              />
            </div>
          )}

          {question.type === "multipla" && question.options.some((o) => o) && (
            <div>
              <p className="font-semibold mb-2">Alternativas:</p>
              <div className="space-y-3">
                {question.options.map(
                  (opt, idx) =>
                    opt && (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded border ${
                          question.correctAnswer === opt
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
                        }`}
                      >
                        <span className="font-bold text-gray-700">
                          {letter(idx)})
                        </span>
                        <div className="flex-1">
                          <p className="text-gray-800">{opt}</p>
                          {/* IMAGEM DA ALTERNATIVA */}
                          {question.optionImages[idx] && (
                            <img
                              src={question.optionImages[idx]!}
                              alt={`Imagem alternativa ${letter(idx)}`}
                              className="max-w-xs rounded border mt-2"
                            />
                          )}
                        </div>
                        {question.correctAnswer === opt && (
                          <span className="text-green-600 font-semibold">
                            ✓ Correta
                          </span>
                        )}
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {question.type === "aberta" && (
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
              <p className="font-semibold text-blue-900">Resposta correta:</p>
              <p className="text-blue-800 mt-1">{question.correctAnswer}</p>
            </div>
          )}

          {question.explanation && (
            <div className="mt-4 p-4 border rounded bg-gray-50">
              <p className="font-semibold mb-1">Explicação:</p>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
