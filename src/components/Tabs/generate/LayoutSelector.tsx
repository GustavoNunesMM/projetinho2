import React from "react";
import { Lock } from "lucide-react";
import { Layout } from "@/types/layout";

interface LayoutSelectorProps {
  layouts: Layout[];
  selectedLayout: Layout | null;
  onSelectLayout: (layout: Layout) => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  layouts,
  selectedLayout,
  onSelectLayout,
}) => {
  if (layouts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Selecionar Layout</h2>
        <p className="text-gray-500">
          Nenhum layout cadastrado. Crie um na aba "Layouts".
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 pb-6">
      <h2 className="text-2xl font-bold mb-2">Selecionar Layout</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 scroll-auto overflow-x ">
        {layouts.map((layout) => (
          <div
            key={layout.id}
            onClick={() => onSelectLayout(layout)}
            className={`border-2 rounded-lg p-2 cursor-pointer transition ${
              selectedLayout?.id === layout.id
                ? "border-purple bg-purple-50"
                : "border-gray-200 hover:border-purple/50"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-lg">{layout.name}</h3>
              {layout.headerLocked && (
                <Lock size={16} className="text-gray-500" />
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Fonte: {layout.fontFamily} {layout.fontSize}pt
            </p>
            <p className="text-sm text-gray-600">
              Espaçamento: {layout.lineSpacing}
            </p>
            {layout.importedFrom && (
              <p className="text-xs text-purple mt-2">
                Importado: {layout.importedFrom}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayoutSelector;
