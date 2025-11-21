import Select from "@/components/common/Select";
import Input from "@/components/common/Input";

interface QuestionFiltersProps {
  filters: {
    type: string;
    difficulty: string;
    content: string;
    category: string;
  };
  format?: string;
  onUpdateFilter: (key: string, value: string) => void;
  onUpdateFormat?: (arg: any) => void;
}

const QuestionFilters = ({
  filters,
  onUpdateFilter,
  format,
  onUpdateFormat,
}: QuestionFiltersProps) => {
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
  const formatoptions = [
    { value: "block", label: "Bloco" },
    { value: "list", label: "Lista" },
    { value: "detail", label: "Detalhe" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Filtros</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        {format && onUpdateFormat && (
          <Select
            label="Exibição"
            value={format}
            onChange={(e) => onUpdateFormat(e.target.value)}
            options={formatoptions}
          />
        )}
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
