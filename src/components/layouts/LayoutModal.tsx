import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import Button from "../common/Button.tsx";
import LayoutForm from "./LayoutForm.tsx";
import { Layout, LayoutFormData } from "../../types/layout.ts";
import { Toast } from "../common/Toast.tsx";
interface LayoutModalProps {
  layout: Layout | null;
  onSave: (layout: LayoutFormData) => void;
  onClose: () => void;
}

const LayoutModal = ({ layout, onSave, onClose }: LayoutModalProps) => {
  const [formData, setFormData] = useState<LayoutFormData>({
    name: "",
    fontSize: "12",
    fontFamily: "Arial",
    lineSpacing: "1.5",
    marginTop: "2.5",
    marginBottom: "2.5",
    marginLeft: "3",
    marginRight: "3",
    headerText: "",
    headerLocked: false,
    footerText: "",
    importedFrom: null,
  });

  useEffect(() => {
    if (layout) {
      const { id, ...layoutData } = layout;
      setFormData(layoutData);
    }
  }, [layout]);

  const handleSubmit = () => {
    if (!formData.name) {
      Toast({
        message: "Por favor, preencha o nome do layout",
      });
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {layout ? "Editar Layout" : "Novo Layout"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>

          <LayoutForm formData={formData} setFormData={setFormData} />

          <div className="flex gap-3 mt-6">
            <Button
              variant="primary"
              icon={Save}
              onClick={handleSubmit}
              disabled={!formData.name}
              className="flex-1"
            >
              Salvar Layout
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

export default LayoutModal;
