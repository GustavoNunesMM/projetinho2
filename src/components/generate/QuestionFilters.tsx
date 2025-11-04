import React from "react";
import Select from "../common/Select";
import Input from "../common/Input";

interface QuestionFiltersProps {
  filters: {
    type: string;
    difficulty: string;
    content: string;
    category: string;
  };
  onUpdateFilter: (key: string, value: string) => void;
}

const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  filters,
  onUpdateFilter,
}) => {
  const typeOptions = [
    { value: "", label: "Todos" },
    { value: "multipla", label: "Múltipla Escolha" },
    { value: "aberta", label: "Aberta" },
  ];

  const difficultyOptions = [
    { value: "", label: "Todas" },
    { value: "facil", label: "Fácil" },
    { value: "media", label: "Média" },
    { value: "dificil", label: "Difícil" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Filtros</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          label="Tipo"
          value={filters.type}
          onChange={(e) => onUpdateFilter("type", e.target.value)}
          options={typeOptions}
        />
        <Select
          label="Dificuldade"
          value={filters.difficulty}
          onChange={(e) => onUpdateFilter("difficulty", e.target.value)}
          options={difficultyOptions}
        />
        <Input
          label="Conteúdo"
          value={filters.content}
          onChange={(e) => onUpdateFilter("content", e.target.value)}
          placeholder="Ex: Matemática"
        />
        <Input
          label="Categoria"
          value={filters.category}
          onChange={(e) => onUpdateFilter("category", e.target.value)}
          placeholder="Ex: Álgebra"
        />
      </div>
    </div>
  );
};

export default QuestionFilters;
