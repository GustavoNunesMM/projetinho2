import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { Input } from "@heroui/react";

import Button from "@/components/common/Button";
import Textarea from "@/components/common/Textarea";
import { AIAssistantPanel } from "@/components/AIAssistantPanel";
import { TableEditor } from "@/components/TableEditor";
import {
  DocumentTemplate,
  AIFieldSuggestion,
} from "@/types/documentGeneration";
import { AIDocumentService } from "@/services/aiService";

interface DocumentGeneratorFormProps {
  template: DocumentTemplate;
  onClose: () => void;
  onGenerate: (
    fieldValues: Record<string, string | string[]>,
    documentName: string,
  ) => Promise<void>;
}

const DocumentGeneratorForm = ({
  template,
  onGenerate,
  onClose,
}: DocumentGeneratorFormProps) => {
  const [fieldValues, setFieldValues] = useState<
    Record<string, string | string[]>
  >({});
  const [documentName, setDocumentName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [patterns, setPatterns] = useState<Record<string, string>>({});
  const [expandedSequential, setExpandedSequential] = useState<Set<string>>(
    new Set(),
  );
  
  // Estados para IA
  const [aiContext, setAiContext] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<AIFieldSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiService, setAiService] = useState<AIDocumentService | null>(null);

  // Separar campos únicos e sequenciais
  const uniqueFields = template.fields.filter(
    (f) => !f.sequentialIndices || f.sequentialIndices.length === 0,
  );
  const sequentialFields = template.fields.filter(
    (f) => f.sequentialIndices && f.sequentialIndices.length > 0,
  );

  // Tabelas dinâmicas do template
  const structure = Array.isArray(template.structure)
    ? template.structure
    : [];
  const dynamicTables = structure.filter((s) => s.isDynamic);

  console.log("=== CAMPOS DO TEMPLATE ===");
  console.log("Template fields:", template.fields);
  console.log("Unique fields:", uniqueFields);
  console.log("Sequential fields:", sequentialFields);
  console.log("Dynamic tables:", dynamicTables);

  // Inicializar serviço de IA (pode ser configurado via localStorage ou settings)
  useEffect(() => {
    const loadAIService = () => {
      try {
        const aiConfig = localStorage.getItem("aiServiceConfig");
        if (aiConfig) {
          const config = JSON.parse(aiConfig);
          setAiService(new AIDocumentService(config));
        }
      } catch (error) {
        console.warn("Erro ao carregar configuração de IA:", error);
      }
    };
    loadAIService();
  }, []);

  useEffect(() => {
    const initialValues: Record<string, string | string[]> = {};

    template.fields.forEach((field) => {
      if (field.sequentialIndices && field.sequentialIndices.length > 0) {
        // Campo sequencial - inicializar como array com tamanho correto
        const sortedIndices = [...field.sequentialIndices].sort(
          (a, b) => a - b,
        );

        initialValues[field.name] = sortedIndices.map(
          () => field.defaultValue || "",
        );
      } else {
        // Campo único
        initialValues[field.name] = field.defaultValue || "";
      }
    });
    setFieldValues(initialValues);
    setDocumentName(template.name + "_gerado");
  }, [template]);

  const handleFieldChange = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSequentialFieldChange = (
    fieldName: string,
    index: number,
    value: string,
  ) => {
    console.log(
      `📝 Mudança em campo sequencial: ${fieldName}[${index}] = "${value}"`,
    );
    setFieldValues((prev) => {
      const current = prev[fieldName];
      const array = Array.isArray(current) ? [...current] : [];

      array[index] = value;
      console.log(`   Array atualizado:`, array);

      return {
        ...prev,
        [fieldName]: array,
      };
    });
  };

  const handleFillAllSequential = (fieldName: string, value: string) => {
    const field = sequentialFields.find((f) => f.name === fieldName);

    if (!field?.sequentialIndices) return;

    const sortedIndices = [...field.sequentialIndices].sort((a, b) => a - b);
    const values = sortedIndices.map(() => value);

    console.log(`🔄 Preenchendo todos os ${fieldName}:`, values);

    setFieldValues((prev) => ({
      ...prev,
      [fieldName]: values,
    }));
  };

  const handleApplyPattern = (fieldName: string) => {
    const pattern = patterns[fieldName];

    if (!pattern) return;

    const field = sequentialFields.find((f) => f.name === fieldName);

    if (!field?.sequentialIndices) return;

    // Aplicar padrão com substituição de {n} pelo índice
    const sortedIndices = [...field.sequentialIndices].sort((a, b) => a - b);
    const values = sortedIndices.map((index) =>
      pattern.replace(/\{n\}/g, String(index)),
    );

    console.log(`🎨 Aplicando padrão "${pattern}" ao ${fieldName}:`, values);

    setFieldValues((prev) => ({
      ...prev,
      [fieldName]: values,
    }));
  };

  const toggleSequentialExpanded = (fieldName: string) => {
    setExpandedSequential((prev) => {
      const next = new Set(prev);

      if (next.has(fieldName)) {
        next.delete(fieldName);
      } else {
        next.add(fieldName);
      }

      return next;
    });
  };

  const handleGenerateAISuggestions = async () => {
    if (!aiContext.trim()) {
      alert("Por favor, forneça um contexto para a IA gerar sugestões.");
      return;
    }

    if (!aiService) {
      alert("Serviço de IA não configurado. Configure nas preferências do sistema.");
      return;
    }

    try {
      setAiLoading(true);
      setShowAIPanel(true);

      // Converter fieldValues para formato de string simples para a IA
      const existingValues: Record<string, string> = {};
      Object.entries(fieldValues).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          existingValues[key] = value.join(", ");
        } else {
          existingValues[key] = value;
        }
      });

      const suggestions = await aiService.suggestFieldValues(
        template,
        aiContext,
        existingValues,
      );

      setAiSuggestions(suggestions);
    } catch (error) {
      console.error("Erro ao gerar sugestões de IA:", error);
      alert(`Erro ao gerar sugestões: ${(error as Error).message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAISuggestion = (
    fieldName: string,
    suggestion: AIFieldSuggestion,
  ) => {
    const field = template.fields.find((f) => f.name === fieldName);
    
    if (!field) return;

    if (field.sequentialIndices && field.sequentialIndices.length > 0) {
      // Campo sequencial - aplicar a todos os índices
      const sortedIndices = [...field.sequentialIndices].sort((a, b) => a - b);
      const values = sortedIndices.map(() => suggestion.suggestedValue);
      
      setFieldValues((prev) => ({
        ...prev,
        [fieldName]: values,
      }));
    } else {
      // Campo único
      setFieldValues((prev) => ({
        ...prev,
        [fieldName]: suggestion.suggestedValue,
      }));
    }
  };

  const createTableRowHandlers = (tableIdx: number) => {
    const structureArray = Array.isArray(template.structure)
      ? template.structure
      : [];
    const tableStructure = structureArray[tableIdx];
    if (!tableStructure || !tableStructure.isDynamic) {
      return {
        onAddRow: async () => {},
        onRemoveRow: async () => {},
      };
    }

    return {
      onAddRow: async (rowIndex: number) => {
        // Adicionar nova linha aos campos sequenciais relacionados
        tableStructure.columnMapping.forEach((col) => {
          if (col.isSequential) {
            const field = template.fields.find((f) => f.name === col.fieldName);
            if (field && field.sequentialIndices) {
              const newIndex = Math.max(...field.sequentialIndices) + 1;
              field.sequentialIndices.push(newIndex);

              // Adicionar valor vazio para o novo índice
              const currentValues = Array.isArray(fieldValues[col.fieldName])
                ? [...(fieldValues[col.fieldName] as string[])]
                : [];
              currentValues.push("");

              setFieldValues((prev) => ({
                ...prev,
                [col.fieldName]: currentValues,
              }));
            }
          }
        });
      },
      onRemoveRow: async (rowIndex: number) => {
        // Remover linha dos campos sequenciais relacionados
        tableStructure.columnMapping.forEach((col) => {
          if (col.isSequential) {
            const field = template.fields.find((f) => f.name === col.fieldName);
            if (field && field.sequentialIndices) {
              const sortedIndices = [...field.sequentialIndices].sort(
                (a, b) => a - b,
              );
              const indexToRemove = sortedIndices[rowIndex];

              if (indexToRemove !== undefined) {
                field.sequentialIndices = field.sequentialIndices.filter(
                  (idx) => idx !== indexToRemove,
                );

                const currentValues = Array.isArray(fieldValues[col.fieldName])
                  ? [...(fieldValues[col.fieldName] as string[])]
                  : [];

                if (currentValues.length > rowIndex) {
                  currentValues.splice(rowIndex, 1);
                  setFieldValues((prev) => ({
                    ...prev,
                    [col.fieldName]: currentValues,
                  }));
                }
              }
            }
          }
        });
      },
    };
  };

  const handleTableFieldChange = (
    rowIndex: number,
    fieldName: string,
    value: string,
  ) => {
    const field = template.fields.find((f) => f.name === fieldName);
    if (!field || !field.sequentialIndices) return;

    const sortedIndices = [...field.sequentialIndices].sort((a, b) => a - b);
    const tableStructure = Array.isArray(template.structure)
      ? template.structure.find((s) =>
          s.columnMapping.some((cm) => cm.fieldName === fieldName),
        )
      : null;

    if (!tableStructure) return;
    
    const dataRowIndex = rowIndex - tableStructure.headerRows;
    if (dataRowIndex >= 0 && dataRowIndex < sortedIndices.length) {
      handleSequentialFieldChange(fieldName, dataRowIndex, value);
    }
  };

  const handleGenerate = async () => {
    if (!documentName.trim()) {
      return;
    }

    console.log("=== GERANDO DOCUMENTO ===");
    console.log("Document name:", documentName);
    console.log("Field values:", fieldValues);
    console.log("Sequential fields:", sequentialFields);

    try {
      setGenerating(true);
      await onGenerate(fieldValues, documentName);
      setFieldValues({});
      setDocumentName("");
      setPatterns({});
      setAiContext("");
      setAiSuggestions([]);
    } catch (error) {
      console.error("Erro ao gerar documento:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 truncate">
              Preencher Template: {template.name}
            </h3>
            <p className="text-xs text-gray-500">
              Preencha os campos abaixo para gerar o documento
            </p>
          </div>
        </div>
        <button
          aria-label="Fechar"
          className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 flex-shrink-0"
          onClick={onClose}
        >
          <X className="text-gray-500" size={18} />
        </button>
      </div>

      {/* Layout com duas colunas quando há sugestões de IA */}
      <div className={`${showAIPanel && aiSuggestions.length > 0 ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : ''}`}>
        <div className={`space-y-4 mb-6 ${showAIPanel && aiSuggestions.length > 0 ? 'lg:col-span-2 max-h-[70vh] overflow-y-auto' : 'max-h-[60vh] overflow-y-auto'}`}>
        <Input
          classNames={{
            input: "text-sm",
            label: "text-sm",
          }}
          label="Nome do Documento"
          placeholder="Digite o nome do documento gerado"
          value={documentName}
          variant="bordered"
          onChange={(e) => setDocumentName(e.target.value)}
        />

        {/* Campo de Contexto para IA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">
              Contexto para IA (opcional)
            </label>
            <Button
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-medium"
              icon={Sparkles}
              variant="custom"
              onClick={handleGenerateAISuggestions}
              disabled={aiLoading || !aiContext.trim() || !aiService}
            >
              {aiLoading ? "Gerando..." : "Gerar Sugestões com IA"}
            </Button>
          </div>
          <Textarea
            placeholder="Descreva o contexto do documento (ex: Plano de aula para 3º ano do ensino fundamental, tema: Meio Ambiente, duração: 2 horas)..."
            value={aiContext}
            onChange={(e) => setAiContext((e.target as HTMLInputElement).value)}
            rows={3}
          />
          {!aiService && (
            <p className="text-xs text-amber-600">
              ⚠️ Serviço de IA não configurado. Configure nas preferências do sistema.
            </p>
          )}
        </div>

        {/* Campos Únicos */}
        {uniqueFields.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Campos Únicos
            </h4>
            {uniqueFields.map((field) => (
              <Input
                key={field.name}
                classNames={{
                  input: "text-sm",
                  label: "text-sm",
                }}
                label={field.name}
                placeholder={`Digite o valor para {{${field.name}}}`}
                value={(fieldValues[field.name] as string) || ""}
                variant="bordered"
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
              />
            ))}
          </div>
        )}

        {/* Campos Sequenciais */}
        {sequentialFields.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Campos Sequenciais (Tabelas)
            </h4>
            {sequentialFields.map((field) => {
              const isExpanded = expandedSequential.has(field.name);
              const currentValues = Array.isArray(fieldValues[field.name])
                ? (fieldValues[field.name] as string[])
                : [];
              const pattern = patterns[field.name] || "";
              // Ordenar índices para garantir ordem correta
              const sortedIndices = field.sequentialIndices
                ? [...field.sequentialIndices].sort((a, b) => a - b)
                : [];

              return (
                <div
                  key={field.name}
                  className="border border-gray-200 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <label className="text-sm font-semibold text-gray-700 block break-words">
                        {field.name} ({sortedIndices.length} ocorrências)
                      </label>
                      <p className="text-xs text-gray-500">
                        Campo sequencial para tabelas
                      </p>
                    </div>
                    <Button
                      isIconOnly
                      aria-label={isExpanded ? "Recolher" : "Expandir"}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg"
                      variant="custom"
                      onClick={() => toggleSequentialExpanded(field.name)}
                    >
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </Button>
                  </div>

                  {/* Preenchimento em lote e padrão */}
                  <div className="flex gap-2">
                    <Input
                      classNames={{
                        input: "text-xs",
                        base: "flex-1",
                      }}
                      placeholder="Valor ou padrão (use {n} para índice, ex: Trimestre {n})"
                      size="sm"
                      value={pattern}
                      variant="bordered"
                      onChange={(e) =>
                        setPatterns((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (pattern.includes("{n}")) {
                            handleApplyPattern(field.name);
                          } else {
                            handleFillAllSequential(field.name, pattern);
                          }
                        }
                      }}
                    />
                    <Button
                      className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                      icon={Copy}
                      variant="custom"
                      onClick={() =>
                        handleFillAllSequential(field.name, pattern)
                      }
                    >
                      Todos
                    </Button>
                    <Button
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                      icon={Settings}
                      variant="custom"
                      onClick={() => handleApplyPattern(field.name)}
                    >
                      Padrão
                    </Button>
                  </div>

                  {/* Campos individuais (expandidos) */}
                  {isExpanded &&
                    sortedIndices.map((index, arrayIndex) => (
                      <Input
                        key={`${field.name}_${index}`}
                        classNames={{
                          input: "text-xs",
                          label: "text-xs",
                        }}
                        label={`${field.name} #${index}`}
                        placeholder={`Valor para {{${field.name}_${index}}}`}
                        size="sm"
                        value={currentValues[arrayIndex] || ""}
                        variant="bordered"
                        onChange={(e) =>
                          handleSequentialFieldChange(
                            field.name,
                            arrayIndex,
                            e.target.value,
                          )
                        }
                      />
                    ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Tabelas Dinâmicas */}
        {dynamicTables.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Tabelas Dinâmicas
            </h4>
            {dynamicTables.map((table) => {
              const handlers = createTableRowHandlers(table.tableIndex);

              return (
                <TableEditor
                  key={table.tableIndex}
                  template={template}
                  tableIndex={table.tableIndex}
                  onAddRow={handlers.onAddRow}
                  onRemoveRow={handlers.onRemoveRow}
                  onFieldChange={handleTableFieldChange}
                  values={fieldValues}
                />
              );
            })}
          </div>
        )}
        </div>

        {/* Painel de IA */}
        {showAIPanel && (
          <div className="lg:col-span-1">
            <AIAssistantPanel
              suggestions={aiSuggestions}
              onApplySuggestion={handleApplyAISuggestion}
              onRegenerate={handleGenerateAISuggestions}
              loading={aiLoading}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <Button
          className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
            !documentName.trim() || generating
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          }`}
          disabled={!documentName.trim() || generating}
          icon={Sparkles}
          variant="custom"
          onClick={handleGenerate}
        >
          {generating ? "Gerando..." : "Gerar Documento"}
        </Button>
        <Button
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium"
          variant="custom"
          onClick={onClose}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default DocumentGeneratorForm;