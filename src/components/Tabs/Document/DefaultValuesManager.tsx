"use client";

import { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Edit2 } from "lucide-react";
import { Input } from "@heroui/react";

import Portal from "@/components/common/Portal";
import Button from "@/components/common/Button";

interface DefaultValueEntry {
  id: string;
  field: string;
  defaultValue: string;
}

const STORAGE_KEY = "documentDefaultValues";

export default function DefaultValuesManager({
  isOpen,
  onClose,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (values: Record<string, string | string[]>) => void;
}) {
  const [entries, setEntries] = useState<DefaultValueEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ field: "", defaultValue: "" });

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        try {
          setEntries(JSON.parse(saved));
        } catch (error) {
          console.error("Erro ao carregar valores padrões:", error);
        }
      }
    }
  }, [isOpen]);

  // Salvar valores
  const saveEntries = (newEntries: DefaultValueEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const handleAdd = () => {
    if (!newEntry.field.trim() || !newEntry.defaultValue.trim()) {
      return;
    }

    const entry: DefaultValueEntry = {
      id: Date.now().toString(),
      field: newEntry.field.trim(),
      defaultValue: newEntry.defaultValue.trim(),
    };

    const updated = [...entries, entry];

    saveEntries(updated);
    setNewEntry({ field: "", defaultValue: "" });
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSaveEdit = (id: string, field: string, defaultValue: string) => {
    const updated = entries.map((entry) =>
      entry.id === id ? { ...entry, field, defaultValue } : entry,
    );

    saveEntries(updated);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este valor padrão?")) {
      const updated = entries.filter((entry) => entry.id !== id);

      saveEntries(updated);
    }
  };

  const handleApply = () => {
    // Converter array de entradas para objeto Record
    const values: Record<string, string | string[]> = {};

    entries.forEach((entry) => {
      values[entry.field] = entry.defaultValue;
    });
    onApply(values);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Gerenciar Valores Padrões
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Configure valores padrões que serão aplicados a qualquer
                template
              </p>
            </div>
            <button
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all"
              onClick={onClose}
            >
              <X className="text-gray-500" size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Adicionar Novo */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Adicionar Novo Valor Padrão
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  classNames={{ input: "text-sm", label: "text-sm" }}
                  label="Campo (Field)"
                  placeholder="Ex: NOME_ESCOLA, ANO, etc."
                  value={newEntry.field}
                  variant="bordered"
                  onChange={(e) =>
                    setNewEntry((prev) => ({ ...prev, field: e.target.value }))
                  }
                />
                <Input
                  classNames={{ input: "text-sm", label: "text-sm" }}
                  label="Valor Padrão (DefaultValue)"
                  placeholder="Ex: Escola Municipal, 2024, etc."
                  value={newEntry.defaultValue}
                  variant="bordered"
                  onChange={(e) =>
                    setNewEntry((prev) => ({
                      ...prev,
                      defaultValue: e.target.value,
                    }))
                  }
                />
              </div>
              <Button
                className="mt-4 bg-primary-600 hover:bg-primary-700 text-white"
                disabled={
                  !newEntry.field.trim() || !newEntry.defaultValue.trim()
                }
                icon={Plus}
                variant="custom"
                onClick={handleAdd}
              >
                Adicionar
              </Button>
            </div>

            {/* Lista de Valores */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Valores Padrões Configurados ({entries.length})
              </h3>
              {entries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Nenhum valor padrão configurado</p>
                  <p className="text-sm mt-2">
                    Adicione valores acima para começar
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {editingId === entry.id ? (
                        <EditForm
                          entry={entry}
                          onCancel={() => setEditingId(null)}
                          onSave={(field, defaultValue) =>
                            handleSaveEdit(entry.id, field, defaultValue)
                          }
                        />
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Campo
                              </p>
                              <p className="font-medium text-gray-800">
                                {entry.field}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Valor Padrão
                              </p>
                              <p className="font-medium text-gray-800">
                                {entry.defaultValue}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                              onClick={() => handleEdit(entry.id)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <Button
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl"
              variant="custom"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2.5 rounded-xl shadow-lg"
              disabled={entries.length === 0}
              icon={Save}
              variant="custom"
              onClick={handleApply}
            >
              Aplicar Valores
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function EditForm({
  entry,
  onSave,
  onCancel,
}: {
  entry: DefaultValueEntry;
  onSave: (field: string, defaultValue: string) => void;
  onCancel: () => void;
}) {
  const [field, setField] = useState(entry.field);
  const [defaultValue, setDefaultValue] = useState(entry.defaultValue);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          classNames={{ input: "text-sm", label: "text-sm" }}
          label="Campo (Field)"
          value={field}
          variant="bordered"
          onChange={(e) => setField(e.target.value)}
        />
        <Input
          classNames={{ input: "text-sm", label: "text-sm" }}
          label="Valor Padrão (DefaultValue)"
          value={defaultValue}
          variant="bordered"
          onChange={(e) => setDefaultValue(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
          disabled={!field.trim() || !defaultValue.trim()}
          icon={Save}
          variant="custom"
          onClick={() => onSave(field, defaultValue)}
        >
          Salvar
        </Button>
        <Button
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm"
          variant="custom"
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}