// LayoutCard.tsx
import { Edit2, Trash2, Lock } from "lucide-react";
import { Layout } from "../../types/layout";

interface LayoutCardProps {
  layout: Layout;
  onEdit: () => void;
  onDelete: () => void;
}

const LayoutCard = ({ layout, onEdit, onDelete }: LayoutCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold">{layout.name}</h3>
          {layout.headerLocked && (
            <span title="Cabeçalho bloqueado">
              <Lock size={18} className="text-gray-500" />
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-700"
            aria-label="Editar layout"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
            aria-label="Excluir layout"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <strong>Fonte:</strong> {layout.fontFamily} {layout.fontSize}pt
        </p>
        <p>
          <strong>Espaçamento:</strong> {layout.lineSpacing}
        </p>
        <p>
          <strong>Margens:</strong> Superior {layout.marginTop}cm, Inferior{" "}
          {layout.marginBottom}cm
        </p>
        {layout.headerText && (
          <p>
            <strong>Cabeçalho:</strong> {layout.headerText}{" "}
            {layout.headerLocked && "🔒"}
          </p>
        )}
        {layout.footerText && (
          <p>
            <strong>Rodapé:</strong> {layout.footerText}
          </p>
        )}
        {layout.importedFrom && (
          <p className="text-blue-600">
            <strong>Importado de:</strong> {layout.importedFrom}
          </p>
        )}
      </div>
    </div>
  );
};

export default LayoutCard;
