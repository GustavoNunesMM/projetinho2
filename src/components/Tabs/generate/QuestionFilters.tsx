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

  const formatOptions = [
    { value: "block", label: "Bloco" },
    { value: "list", label: "Lista" },
    { value: "detail", label: "Detalhe" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md animate-slideUp border border-gray-100 py-1 px-2 hover:shadow-lg  transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
          Filtros
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Select
          label="Tipo"
          value={filters.type}
          onChange={(e) => onUpdateFilter("type", e.target.value)}
          options={typeOptions}
          className="focus:ring-2 focus:ring-primary-400 rounded-xl"
        />
        <Select
          label="Dificuldade"
          value={filters.difficulty}
          onChange={(e) => onUpdateFilter("difficulty", e.target.value)}
          options={difficultyOptions}
          className="focus:ring-2 focus:ring-primary-400 rounded-xl"
        />
        {format && onUpdateFormat && (
          <Select
            label="Exibição"
            value={format}
            onChange={(e) => onUpdateFormat(e.target.value)}
            options={formatOptions}
            className="focus:ring-2 focus:ring-primary-400 rounded-xl"
          />
        )}
        <Input
          label="Conteúdo"
          value={filters.content}
          onChange={(e) => onUpdateFilter("content", e.target.value)}
          placeholder="Ex: Matemática"
          className="focus:ring-2 focus:ring-primary-400 rounded-xl"
        />
        <Input
          label="Categoria"
          value={filters.category}
          onChange={(e) => onUpdateFilter("category", e.target.value)}
          placeholder="Ex: Álgebra"
          className="focus:ring-2 focus:ring-primary-400 rounded-xl"
        />
      </div>

      <div className="mt-2 text-right">
        <span className="text-xs text-gray-500">
          Filtros ativos:{" "}
          <span className="font-semibold text-primary-600">
            {Object.values(filters).filter(Boolean).length}
          </span>
        </span>
      </div>
    </div>
  );
};

export default QuestionFilters;
