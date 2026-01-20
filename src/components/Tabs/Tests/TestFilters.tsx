import { Search, Filter, X } from "lucide-react";
import { TestFilters as TestFiltersType } from "@/types/test";
import Select from "@/components/common/Select";

interface TestFiltersProps {
  filters: TestFiltersType;
  onUpdateFilter: (key: keyof TestFiltersType, value: string) => void;
  format: "block" | "list" | "detail";
  onUpdateFormat: (format: "block" | "list" | "detail") => void;
  uniqueSchoolYears: string[];
  uniqueSubjects: string[];
  uniqueQuarters: string[];
  uniqueSchoolUnits: string[];
  uniqueCategories: string[];
}

export const TestFilters: React.FC<TestFiltersProps> = ({
  filters,
  onUpdateFilter,
  format,
  onUpdateFormat,
  uniqueSchoolYears,
  uniqueSubjects,
  uniqueQuarters,
  uniqueSchoolUnits,
  uniqueCategories,
}) => {

  const clearAllFilters = () => {
    onUpdateFilter("searchTerm", "");
    onUpdateFilter("schoolYear", "");
    onUpdateFilter("subject", "");
    onUpdateFilter("quarter", "");
    onUpdateFilter("schoolUnit", "");
    onUpdateFilter("category", "");
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-slideUp">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por título, descrição ou arquivo..."
            value={filters.searchTerm}
            onChange={(e) => onUpdateFilter("searchTerm", e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <Select
          value={filters.schoolYear}
          onChange={(e) => onUpdateFilter("schoolYear", e.target.value)}
          options={[
            { value: "", label: "Todos os Anos" },
            ...uniqueSchoolYears.map((year) => ({ value: year, label: year })),
          ]}
          placeholder="Selecione o ano"
        />

        <Select
          value={filters.subject}
          onChange={(e) => onUpdateFilter("subject", e.target.value)}
          options={[
            { value: "", label: "Todas as Disciplinas" },
            ...uniqueSubjects.map((subject) => ({ value: subject, label: subject })),
          ]}
          placeholder="Selecione a disciplina"
        />

        <Select
          value={filters.quarter}
          onChange={(e) => onUpdateFilter("quarter", e.target.value)}
          options={[
            { value: "", label: "Todos os Bimestres" },
            ...uniqueQuarters.map((quarter) => ({ value: quarter, label: quarter })),
          ]}
          placeholder="Selecione o bimestre"
        />

        <Select
          value={filters.schoolUnit}
          onChange={(e) => onUpdateFilter("schoolUnit", e.target.value)}
          options={[
            { value: "", label: "Todas as Unidades" },
            ...uniqueSchoolUnits.map((unit) => ({ value: unit, label: unit })),
          ]}
          placeholder="Selecione a unidade"
        />

        <Select
          value={filters.category}
          onChange={(e) => onUpdateFilter("category", e.target.value)}
          options={[
            { value: "", label: "Todas as Categorias" },
            ...uniqueCategories.map((category) => ({ value: category, label: category })),
          ]}
          placeholder="Selecione a categoria"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Visualização:</span>
          <div className="flex gap-1">
            {["block", "list", "detail"].map((viewFormat) => (
              <button
                key={viewFormat}
                onClick={() =>
                  onUpdateFormat(viewFormat as "block" | "list" | "detail")
                }
                className={`px-3 py-1 text-xs rounded-lg transition-all ${
                  format === viewFormat
                    ? "bg-primary-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {viewFormat === "block" && "Blocos"}
                {viewFormat === "list" && "Lista"}
                {viewFormat === "detail" && "Detalhes"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
