import React, { useState, useRef } from "react";
import { Plus, Upload, Layout, Layers } from "lucide-react";
import Button from "@/components/common/Button.tsx";
import LayoutCard from "./LayoutCard.tsx";
import LayoutModal from "./LayoutModal.tsx";
import LayoutCloseModal from "./LayoutCloseModal.tsx";
import { Layout as LayoutType, LayoutFormData } from "@/types/layout.ts";

interface LayoutsTabProps {
  layouts: LayoutType[];
  onAdd: (layout: LayoutFormData) => void;
  onUpdate: (id: number, layout: LayoutFormData) => void;
  onDelete: (id: number) => void;
  onImport: (file: File) => Promise<boolean>;
}

const LayoutsTab = ({
  layouts,
  onAdd,
  onUpdate,
  onDelete,
  onImport,
}: LayoutsTabProps) => {
  const [showModal, setShowModal] = useState(false);
  const [editingLayout, setEditingLayout] = useState<LayoutType | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<LayoutType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (layout: LayoutType) => {
    setEditingLayout(layout);
    setShowModal(true);
  };

  const handleSave = (layoutData: LayoutFormData) => {
    if (editingLayout) {
      onUpdate(editingLayout.id, layoutData);
    } else {
      onAdd(layoutData);
    }
    setShowModal(false);
    setEditingLayout(null);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await onImport(file);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-slideUp">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
              Gerenciar Layouts
            </h2>
            <p className="text-sm text-gray-500">
              {layouts.length} layouts configurados
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".docx"
            className="hidden"
          />
          <Button
            variant="custom"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#97dffc] hover:bg-[#87cfe8] text-gray-800 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium border border-[#87cfe8]"
          >
            Importar Word
          </Button>
          <Button
            variant="custom"
            icon={Plus}
            onClick={() => {
              setEditingLayout(null);
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
          >
            Novo Layout
          </Button>
        </div>
      </div>

      {layouts.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-inner animate-scaleIn">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
            <Layers className="w-10 h-10 text-primary-500" />
          </div>
          <p className="text-gray-600 font-medium mb-2">
            Nenhum layout cadastrado
          </p>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Crie um novo layout ou importe de um documento Word existente.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="custom"
              icon={Upload}
              onClick={() => fileInputRef.current?.click()}
              className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-medium border border-gray-200"
            >
              Importar Word
            </Button>
            <Button
              variant="custom"
              icon={Plus}
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
            >
              Criar Primeiro Layout
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {layouts.map((layout, index) => (
            <div
              key={layout.id}
              className="animate-slideUp"
              style={{ animationDelay: `${Math.min(index * 0.08, 0.4)}s` }}
            >
              <LayoutCard
                layout={layout}
                onEdit={() => handleEdit(layout)}
                onDelete={() => {
                  setSelectedLayout(layout);
                  setDeleteModal(true);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {deleteModal && selectedLayout && (
        <LayoutCloseModal
          onClose={() => {
            setSelectedLayout(null);
            setDeleteModal(false);
          }}
          onSubmit={() => {
            onDelete(selectedLayout.id);
            setDeleteModal(false);
            setSelectedLayout(null);
          }}
          layoutName={selectedLayout.name}
        />
      )}

      {showModal && (
        <LayoutModal
          layout={editingLayout}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingLayout(null);
          }}
        />
      )}
    </div>
  );
};

export default LayoutsTab;
