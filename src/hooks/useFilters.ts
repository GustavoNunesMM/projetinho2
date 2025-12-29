import { useState, useMemo, useEffect } from "react";
import { Question } from "@/types/question";

interface Filters {
  type: Question["type"] | "";
  difficulty: Question["difficulty"] | "";
  content: string;
  category: string;
}

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
export const useFilters = (items: Question[]) => {
  const [filters, setFilters] = useState<Filters>({
    type: "",
    difficulty: "",
    content: "",
    category: "",
  });

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      type: "",
      difficulty: "",
      content: "",
      category: "",
    });
  };

  const debouncedContent = useDebounce(filters.content, 300);
  const debouncedCategory = useDebounce(filters.category, 300);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType = !filters.type || item.type === filters.type;
      const matchesDifficulty =
        !filters.difficulty || item.difficulty === filters.difficulty;
      const matchesContent =
        !filters.content ||
        item.subject.toLowerCase().includes(filters.content.toLowerCase());
      const matchesCategory =
        !filters.category ||
        item.category.toLowerCase().includes(filters.category.toLowerCase());

      return (
        matchesType && matchesDifficulty && matchesContent && matchesCategory
      );
    });
  }, [items, debouncedContent,debouncedCategory , filters.difficulty, 
       filters.type]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredItems,
  };
};
