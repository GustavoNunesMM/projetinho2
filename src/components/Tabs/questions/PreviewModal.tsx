import { X, FileText } from "lucide-react";
import { Chip } from "@heroui/react";
import { Question } from "@/types/question";
import Button from "@/components/common/Button";
import Portal from "@/components/common/Portal";

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
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl p-2 w-full max-h-[90vh] flex flex-col mx-4 border border-gray-100 animate-scaleIn">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-white to-primary-50/50">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent truncate">
                  {question.title}
                </h2>
                <div className="flex gap-2 flex-wrap mt-1">
                  {question.difficulty && (
                    <Chip
                      size="sm"
                      color={difficultyColor[question.difficulty] || "default"}
                      variant="flat"
                    >
                      {question.difficulty}
                    </Chip>
                  )}
                  {question.subject && (
                    <Chip size="sm" color="primary" variant="flat">
                      {question.subject}
                    </Chip>
                  )}
                  {question.category && (
                    <Chip size="sm" color="secondary" variant="flat">
                      {question.category}
                    </Chip>
                  )}
                  {question.importedFrom && (
                    <Chip size="sm" color="success" variant="flat">
                      Importado
                    </Chip>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 flex-shrink-0 ml-3"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-5 bg-gradient-to-b from-white to-gray-50/30">
            <div
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: question.content }}
            />

            {hasContentImage && (
              <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
                <img
                  src={question.contentImage!}
                  alt="Imagem do enunciado"
                  className="max-w-md rounded-lg border border-gray-200 shadow-md"
                />
              </div>
            )}

            {question.type === "multipla" && question.options.some((o) => o) && (
              <div className="mt-4">
                <p className="font-semibold mb-3 text-gray-700">Alternativas:</p>
                <div className="space-y-3">
                  {question.options.map(
                    (opt, idx) =>
                      opt && (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                            question.correctAnswer === opt
                              ? "border-green-500 bg-green-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50/30"
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                              question.correctAnswer === opt
                                ? "bg-green-500 text-white"
                                : "bg-primary-100 text-primary-700"
                            }`}
                          >
                            {letter(idx)}
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-800">{opt}</p>
                            {question.optionImages[idx] && (
                              <img
                                src={question.optionImages[idx]!}
                                alt={`Imagem alternativa ${letter(idx)}`}
                                className="max-w-xs rounded-lg border border-gray-200 mt-3 shadow-sm"
                              />
                            )}
                          </div>
                          {question.correctAnswer === opt && (
                            <span className="text-green-600 font-semibold text-sm flex items-center gap-1 flex-shrink-0">
                              ✓ Correta
                            </span>
                          )}
                        </div>
                      )
                  )}
                </div>
              </div>
            )}

            {question.type === "aberta" && question.correctAnswer && (
              <div className="p-4 border-l-4 border-primary-500 bg-primary-50 rounded-r-xl">
                <p className="font-semibold text-primary-900">Resposta esperada:</p>
                <p className="text-primary-800 mt-1">{question.correctAnswer}</p>
              </div>
            )}

            {question.explanation && (
              <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                <p className="font-semibold mb-2 text-gray-700">Explicação:</p>
                <p className="text-gray-600 leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <Button
              variant="custom"
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl transition-all duration-300 font-medium"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default PreviewModal;
