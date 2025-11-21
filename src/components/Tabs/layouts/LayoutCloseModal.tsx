import Button from "@/components/common/Button.tsx";
import { Trash2, X } from "lucide-react";

interface props {
  onClose: () => void;
  onSubmit: () => void;
  layoutName: string;
}

const LayoutCloseModal = ({ onClose, onSubmit, layoutName }: props) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto absolute p-6">
        <div className="flex flex-col  text-center w-full gap-4 mb-6">
          <h2 className="text-2xl font-bold text-center">
            Deseja deletar o layout {layoutName}?
          </h2>
          <h3 className="text-start">
            Esta ação é permanente e irá apagar os dados
          </h3>
        </div>
        <Button
          className="absolute right-2 top-2"
          onClick={onClose}
          variant="light-danger"
          isIconOnly={true}
          aria-label="Fechar"
        >
          <X size={20} />
        </Button>
        <div className="flex gap-3 mt-6">
          <Button
            variant="danger"
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
  );
};

export default LayoutCloseModal;
