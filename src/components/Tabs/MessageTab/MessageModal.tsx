import { useState } from "react";
import { X, Save, MessageSquare } from "lucide-react";

import MessageForm from "./MessageForm";
import Button from "@/components/common/Button";
import Portal from "@/components/common/Portal";

import { Toast } from "@/components/common/Toast";
import { Message, MessageFormData } from "@/types/messages";

interface MessageModalProps {
  message: Message | null;
  onSave: (message: MessageFormData) => void;
  onClose: () => void;
}

const MessageModal = ({ message, onSave, onClose }: MessageModalProps) => {
  const [formData, setFormData] = useState<MessageFormData>({
    title: "",
    items: [""],
    isList: false,
    isOrdered: false,
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Toast({ message: "Texto precisa de título!" });
      return;
    }

    const filteredItems = formData.items.filter((item) => item.trim());
    if (filteredItems.length === 0) {
      Toast({ message: "Adicione pelo menos um item!" });
      return;
    }

    onSave({ ...formData, items: filteredItems });
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl p-2 w-full max-h-[90vh] overflow-y-auto border border-gray-100 animate-scaleIn">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                    {message ? "Editar Texto" : "Novo Texto"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Configure o texto de instrução
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

            <MessageForm
              message={message}
              formData={formData}
              setFormData={setFormData}
            />

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="custom"
                icon={Save}
                onClick={handleSubmit}
                disabled={!formData.title.trim()}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  !formData.title.trim()
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                }`}
              >
                Salvar Texto
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

export default MessageModal;
