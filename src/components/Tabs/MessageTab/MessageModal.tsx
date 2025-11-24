import { useState } from "react";
import { X, Save } from "lucide-react";
import Button from "@/components/common/Button";
import MessageForm from "./MessageForm";
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
    <div className="fixed inset-0 bg-black/50  flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {message ? "Editar Texto" : "Nova Texto"}
            </h2>
            <Button
              variant="light"
              onClick={onClose}
              aria-label="Fechar"
              isIconOnly={true}
            >
              <X size={20} />
            </Button>
          </div>
          <MessageForm message={message} formData={formData} setFormData={setFormData}/>

          <div className="flex gap-3 mt-6">
            <Button
              variant="primary"
              icon={Save}
              onClick={handleSubmit}
              disabled={!formData.title.trim()}
              className="flex-1"
            >
              Salvar Texto
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

export default MessageModal;
