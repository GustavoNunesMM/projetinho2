import React, { useState, useRef } from "react";
import { Plus, Upload } from "lucide-react";
import Button from "../common/Button.tsx";
import LayoutCard from "./LayoutCard.tsx";
import LayoutModal from "./LayoutModal.tsx";
import LayoutCloseModal from "./LayoutCloseModal.tsx";
import { Layout, LayoutFormData } from "../../types/layout.ts";

interface LayoutsTabProps {
  layouts: Layout[];
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
  const [editingLayout, setEditingLayout] = useState<Layout | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (layout: Layout) => {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Layouts</h2>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".docx"
            className="hidden"
          />
          <Button
            variant="success"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
          >
            Importar Word
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setEditingLayout(null);
              setShowModal(true);
            }}
          >
            Novo Layout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {layouts.map((layout) => (
          <LayoutCard
            key={layout.id}
            layout={layout}
            onEdit={() => handleEdit(layout)}
            onDelete={() => {
              setSelectedLayout(layout);
              setDeleteModal(true);
            }}
          />
        ))}
      </div>

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
