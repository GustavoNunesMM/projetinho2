import Button from "../common/Button.tsx";
import { Trash2, X } from "lucide-react";

interface props {
  onClose: () => void;
  onSubmit: () => void;
  layoutName: string;
}

const LayoutCloseModal = ({ onClose, onSubmit, layoutName }: props) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Deletar layout {layoutName}</h2>
            <Button onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </Button>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="primary"
              icon={Trash2}
              onClick={onSubmit}
              className="flex-1"
            >
              Deletar Layout
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

export default LayoutCloseModal;
