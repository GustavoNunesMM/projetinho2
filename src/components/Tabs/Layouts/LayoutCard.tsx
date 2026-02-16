import { Edit2, Trash2, Lock, Layout, FileText, Type, AlignJustify } from "lucide-react";
import { Layout as LayoutType } from "@/types/layout";
import Button from "@/components/common/Button";

interface LayoutCardProps {
  layout: LayoutType;
  onEdit: () => void;
  onDelete: () => void;
}

const LayoutCard = ({ layout, onEdit, onDelete }: LayoutCardProps) => {
  return (
    <div className="group bg-white rounded-2xl shadow-md border border-gray-100 p-6 transition-all duration-300 ease-out hover:shadow-xl hover:border-primary-200 hover:scale-[1.02] card-hover">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary-700 transition-colors duration-300">
                {layout.name}
              </h3>
              {layout.headerLocked && (
                <span
                  title="Cabeçalho bloqueado"
                  className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center"
                >
                  <Lock size={12} className="text-amber-600" />
                </span>
              )}
            </div>
            {layout.importedFrom && (
              <p className="text-xs text-primary-600 font-medium mt-0.5">
                Importado de Word
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <Button
            isIconOnly
            variant="custom"
            onClick={onEdit}
            aria-label="Editar layout"
            className="w-9 h-9 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <Edit2 size={16} />
          </Button>
          <Button
            isIconOnly
            variant="custom"
            onClick={onDelete}
            aria-label="Excluir layout"
            className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-hover:bg-primary-50/50 transition-colors duration-300">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <Type size={16} className="text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Fonte</p>
            <p className="text-sm font-semibold text-gray-700">
              {layout.fontFamily} • {layout.fontSize}pt
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-hover:bg-primary-50/50 transition-colors duration-300">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <AlignJustify size={16} className="text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Espaçamento</p>
            <p className="text-sm font-semibold text-gray-700">
              Linha: {layout.lineSpacing} • Margens: {layout.marginTop}cm / {layout.marginBottom}cm
            </p>
          </div>
        </div>

        {(layout.headerText || layout.footerText) && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl group-hover:bg-primary-50/50 transition-colors duration-300">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <FileText size={16} className="text-primary-600" />
            </div>
            <div className="min-w-0 flex-1">
              {layout.headerText && (
                <div className="mb-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Cabeçalho {layout.headerLocked && "🔒"}
                  </p>
                  <p className="text-sm text-gray-700 truncate">{layout.headerText}</p>
                </div>
              )}
              {layout.footerText && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Rodapé</p>
                  <p className="text-sm text-gray-700 truncate">{layout.footerText}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayoutCard;
