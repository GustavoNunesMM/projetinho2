import { useState, useEffect } from "react";
import { X, Save, FileText } from "lucide-react";
import Button from "@/components/common/Button";
import Portal from "@/components/common/Portal";
import QuestionForm from "./QuestionForm";
import { Toast } from "@/components/common/Toast";
import { Question, QuestionFormData } from "@/types/question";

interface QuestionModalProps {
  question: Question | null;
  onSave: (question: QuestionFormData) => void;
  onClose: () => void;
}

const QuestionModal = ({ question, onSave, onClose }: QuestionModalProps) => {
  const [formData, setFormData] = useState<QuestionFormData>({
    title: "",
    content: "",
    contentImage: null,
    difficulty: "media",
    subject: "",
    category: "",
    type: "multipla",
    options: ["", "", "", ""],
    optionImages: [null, null, null, null],
    correctAnswer: "",
    explanation: "",
    importedFrom: null,
  });

  useEffect(() => {
    if (question) {
      const { id, ...questionData } = question;
      setFormData(questionData);
    }
  }, [question]);

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      Toast({
        message: "Questão precisa de titulo e conteúdo!",
      });
      return;
    }
    onSave(formData);
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl p-2 w-full max-h-[90vh] overflow-y-auto border border-gray-100 animate-scaleIn">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                    {question ? "Editar Questão" : "Nova Questão"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Preencha os campos abaixo
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Fechar"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <QuestionForm formData={formData} setFormData={setFormData} />

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="custom"
                icon={Save}
                onClick={handleSubmit}
                disabled={!formData.title || !formData.content}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  !formData.title || !formData.content
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                }`}
              >
                Salvar Questão
              </Button>
              <Button
                variant="custom"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default QuestionModal;
