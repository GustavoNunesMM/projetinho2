import { useState, useEffect } from "react";
import { Layout, LayoutFormData } from "../types/layout";

interface ElectronAPI {
  loadLayouts: () => Promise<Layout[]>;
  saveLayout: (layout: Layout) => void;
  deleteLayout: (id: number) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export const useLayouts = () => {
  const [layouts, setLayouts] = useState<Layout[]>([]);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.loadLayouts().then(setLayouts);
    } else {
      const savedLayouts = localStorage.getItem("questionBankLayouts");
      if (savedLayouts) {
        setLayouts(JSON.parse(savedLayouts));
      }
    }
  }, []);

  useEffect(() => {
    if (window.electronAPI) {
      layouts.forEach((layout) => {
        window.electronAPI!.saveLayout(layout);
      });
    } else {
      localStorage.setItem("questionBankLayouts", JSON.stringify(layouts));
    }
  }, [layouts]);

  const addLayout = (layout: LayoutFormData): Layout => {
    const newLayout: Layout = { ...layout, id: Date.now() };
    setLayouts([...layouts, newLayout]);
    return newLayout;
  };

  const updateLayout = (id: number, updatedLayout: LayoutFormData) => {
    setLayouts(
      layouts.map((l) => (l.id === id ? { ...updatedLayout, id } : l))
    );
  };

  const deleteLayout = (id: number) => {
    if (window.electronAPI) {
      window.electronAPI.deleteLayout(id);
    }
    setLayouts(layouts.filter((l) => l.id !== id));
  };

  return {
    layouts,
    addLayout,
    updateLayout,
    deleteLayout,
  };
};
