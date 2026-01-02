import { Trash2, AlertTriangle } from "lucide-react";
import Portal from "@/components/common/Portal";
import Button from "@/components/common/Button";

interface DeleteModalProps {
  onClose: () => void;
  onSubmit: () => void;
  elementName: string;
  type: "question" | "layout" | "message";
}

const DeleteModal = ({
  onClose,
  onSubmit,
  elementName,
  type = "question",
}: DeleteModalProps) => {
  const getEntityName = () => {
    switch (type) {
      case "question":
        return "a questão";
      case "layout":
        return "o layout";
      case "message":
        return "a mensagem";
      default:
        return "o item";
    }
  };

  const entityName = getEntityName();

  return (
    <Portal>
      <div className="inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center fixed w-full h-full p-4 z-[9999] animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl p-2 max-w-md w-full overflow-hidden border border-gray-100 animate-scaleIn">
          <div className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4 animate-bounceIn">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Deletar {entityName}
              </h2>
              <p className="text-gray-600">
                Deseja realmente excluir {entityName}{" "}
                <span className="font-semibold text-primary-700">
                  "{elementName}"
                </span>
                ?
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="custom"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl transition-all duration-300 font-medium"
              >
                Cancelar
              </Button>
              <Button
                variant="custom"
                icon={Trash2}
                onClick={onSubmit}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold transform hover:scale-[1.02]"
              >
                Deletar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default DeleteModal;
