import { useState } from 'react';

export const useSelection = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelection = (id: number): void => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const selectAll = (ids: number[]): void => {
    setSelectedIds(ids);
  };

  const clearSelection = (): void => {
    setSelectedIds([]);
  };

  const isSelected = (id: number): boolean => {
    return selectedIds.includes(id);
  };

  return {
    selectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
  };
};