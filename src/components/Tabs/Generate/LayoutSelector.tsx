import React from "react";
import { Lock, Layout, Layers, Type, AlignJustify, Check } from "lucide-react";
import { Layout as LayoutType } from "@/types/layout";

interface LayoutSelectorProps {
  layouts: LayoutType[];
  selectedLayout: LayoutType | null;
  onSelectLayout: (layout: LayoutType) => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  layouts,
  selectedLayout,
  onSelectLayout,
}) => {
  if (layouts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-fadeIn">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
            Selecionar Layout
          </h2>
        </div>
        <div className="flex flex-col items-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-4 animate-float">
            <Layers className="w-8 h-8 text-primary-500" />
          </div>
          <p className="text-gray-500 text-center">
            Nenhum layout cadastrado.
            <br />
            <span className="text-primary-600 font-medium">
              Crie um na aba "Layouts"
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-slideUp hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
          <Layout className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
            Selecionar Layout
          </h2>
          <p className="text-xs text-gray-500">
            {layouts.length} layouts disponíveis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {layouts.map((layout, index) => (
          <div
            key={layout.id}
            onClick={() => onSelectLayout(layout)}
            className={`
              group relative rounded-xl p-4 cursor-pointer transition-all duration-300 
              border-2 animate-slideUp
              ${
                selectedLayout?.id === layout.id
                  ? "border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg scale-[1.02]"
                  : "border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/50 hover:shadow-md"
              }
            `}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {selectedLayout?.id === layout.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center shadow-md animate-bounceIn">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    selectedLayout?.id === layout.id
                      ? "bg-primary-600 shadow-md"
                      : "bg-primary-100 group-hover:bg-primary-200"
                  }`}
                >
                  <Layout
                    className={`w-4 h-4 ${selectedLayout?.id === layout.id ? "text-white" : "text-primary-600"}`}
                  />
                </div>
                <h3
                  className={`font-bold text-base transition-colors duration-300 ${
                    selectedLayout?.id === layout.id
                      ? "text-primary-700"
                      : "text-gray-800 group-hover:text-primary-600"
                  }`}
                >
                  {layout.name}
                </h3>
              </div>
              {layout.headerLocked && (
                <span
                  title="Cabeçalho bloqueado"
                  className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center"
                >
                  <Lock size={12} className="text-amber-600" />
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Type size={14} className="text-primary-500" />
                <span>
                  {layout.fontFamily} • {layout.fontSize}pt
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <AlignJustify size={14} className="text-primary-500" />
                <span>Espaçamento: {layout.lineSpacing}</span>
              </div>
            </div>

            {layout.importedFrom && (
              <div className="mt-3 pt-2 border-t border-gray-100">
                <p className="text-xs text-primary-600 font-medium">
                  📄 Importado de Word
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayoutSelector;
