import { useState, useEffect } from "react";
import { Layout, LayoutFormData } from "../types/layout";
import {
  getAllLayouts,
  insertLayout,
  updateLayout as updateLayoutDB,
  deleteLayout as deleteLayoutDB,
} from "../database/database";

function deserializeLayout(l: any): Layout {
  return {
    ...l,
    headerLocked: Boolean(l.headerLocked),
  };
}

function serializeLayout(l: LayoutFormData) {
  return {
    ...l,
    headerLocked: l.headerLocked ? 1 : 0,
  };
}

export const useLayouts = () => {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLayouts();
  }, []);

  const loadLayouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllLayouts();
      const deserialized = data.map(deserializeLayout);
      setLayouts(deserialized);
      console.log("📐 Layouts carregados:", deserialized.length);
    } catch (err) {
      const message = `Erro ao carregar layouts: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  const addLayout = async (layout: LayoutFormData): Promise<Layout> => {
    try {
      const serialized = serializeLayout(layout);
      const saved = await insertLayout(serialized as any);
      const deserialized = deserializeLayout(saved);

      setLayouts((prev) => [deserialized, ...prev]);
      console.log("✅ Layout adicionado:", deserialized.name);

      return deserialized;
    } catch (err) {
      const message = `Erro ao adicionar layout: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  const updateLayout = async (
    id: number,
    updatedLayout: LayoutFormData
  ): Promise<void> => {
    try {
      const serialized = serializeLayout(updatedLayout);
      await updateLayoutDB(id, serialized as any);

      const data = await getAllLayouts();
      const deserialized = data.map(deserializeLayout);
      setLayouts(deserialized);

      console.log("✏️ Layout atualizado:", id);
    } catch (err) {
      const message = `Erro ao atualizar layout: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  const deleteLayout = async (id: number): Promise<void> => {
    try {
      await deleteLayoutDB(id);
      setLayouts((prev) => prev.filter((l) => l.id !== id));
      console.log("🗑️ Layout deletado:", id);
    } catch (err) {
      const message = `Erro ao deletar layout: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  return {
    layouts,
    loading,
    error,
    addLayout,
    updateLayout,
    deleteLayout,
    refreshLayouts: loadLayouts,
  };
};
