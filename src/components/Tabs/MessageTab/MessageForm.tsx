import React, { useEffect } from "react";
import { Checkbox } from "@heroui/react";
import Textarea from "@/components/common/Textarea";
import { Trash2 } from "lucide-react";
import { Message, MessageFormData } from "@/types/messages";
interface QuestionFormProps {
  message: Message | null;
  formData: MessageFormData;
  setFormData: React.Dispatch<React.SetStateAction<MessageFormData>>;
}

const MessageForm = ({ formData, setFormData, message }: QuestionFormProps) => {
  useEffect(() => {
    if (message) {
      const { id, createdAt, updatedAt, ...messageData } = message;
      setFormData(messageData);
    }
  }, [message]);

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleItemKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Enter" && index === formData.items.length - 1) {
      e.preventDefault();
      setFormData({ ...formData, items: [...formData.items, ""] });
    }
  };

  const handleItemBlur = (index: number) => {
    if (index === formData.items.length - 1 && formData.items[index].trim()) {
      setFormData({ ...formData, items: [...formData.items, ""] });
    }
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Título</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite o título da Texto"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center select-none cursor-pointer">
          <Checkbox
            color="primary"
            radius="md"
            isSelected={formData.isList}
            onValueChange={(e) => setFormData({ ...formData, isList: e })}
          ></Checkbox>

          <span className="text-sm font-medium">É uma lista</span>
        </label>

        {formData.isList && (
          <label className="flex items-center ">
            <Checkbox
              color="primary"
              radius="md"
              isSelected={formData.isOrdered}
              onValueChange={(e) => setFormData({ ...formData, isOrdered: e })}
            ></Checkbox>

            <span className="text-sm font-medium select-none cursor-pointer">
              Lista ordenada
            </span>
          </label>
        )}
      </div>

      {formData.isList ? (
        <>
          <label className="block text-sm font-medium mb-2">Itens</label>
          <div className="space-y-2 flex flex-col">
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {formData.isList && formData.isOrdered && (
                  <span className="text-sm font-medium text-gray-600 w-6">
                    {index + 1}.
                  </span>
                )}
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  onKeyDown={(e) => handleItemKeyDown(index, e)}
                  onBlur={() => handleItemBlur(index)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Item ${index + 1}`}
                />
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    aria-label="Remover item"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <label className="block text-sm font-medium mb-2">Conteúdo</label>
          <Textarea
            label="Texto"
            value={formData.items.join()}
            onChange={(e) =>
              setFormData({ ...formData, items: [e.target.value] })
            }
          />
        </>
      )}
    </div>
  );
};

export default MessageForm;
