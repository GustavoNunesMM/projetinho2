import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import Button from "../common/Button";
import QuestionForm from "./QuestionForm";
import { Toast } from "../common/Toast";
import { Question, QuestionFormData } from "../../types/question";

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
        message: "Questão precisa de titulo e conteudo!",
      });
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {question ? "Editar Questão" : "Nova Questão"}
            </h2>
            <Button variant="outline" onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </Button>
          </div>

          <QuestionForm formData={formData} setFormData={setFormData} />

          <div className="flex gap-3 mt-6">
            <Button
              variant="primary"
              icon={Save}
              onClick={handleSubmit}
              disabled={!formData.title || !formData.content}
              className="flex-1"
            >
              Salvar Questão
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
