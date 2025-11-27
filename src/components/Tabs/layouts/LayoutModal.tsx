import { useState, useEffect } from "react";
import { X, Save, Layout } from "lucide-react";
import Button from "@/components/common/Button.tsx";
import Portal from "@/components/common/Portal.tsx";
import LayoutForm from "./LayoutForm.tsx";
import { Layout as LayoutType, LayoutFormData } from "@/types/layout.ts";
import { Toast } from "@/components/common/Toast.tsx";

interface LayoutModalProps {
  layout: LayoutType | null;
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
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl p-2 w-full max-h-[90vh] overflow-y-auto border border-gray-100 animate-scaleIn">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Layout className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                    {layout ? "Editar Layout" : "Novo Layout"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Configure as propriedades do documento
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

            <LayoutForm formData={formData} setFormData={setFormData} />

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="custom"
                icon={Save}
                onClick={handleSubmit}
                disabled={!formData.name}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  !formData.name
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                }`}
              >
                Salvar Layout
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

export default LayoutModal;
