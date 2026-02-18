"use client";

import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { Input } from "@heroui/react";

import Button from "@/components/common/Button";
import { TableEditor } from "@/components/AiAssist/TableEditor.tsx";
import {
  DocumentTemplate,
  AIFieldSuggestion,
  DefaultValuesProvider,
} from "@/types/documentGeneration";

export interface DocumentGeneratorFormRef {
  applyAISuggestion: (
    fieldName: string,
    suggestion: AIFieldSuggestion,
    applyTo?: "all" | "individual",
  ) => void;
}

interface DocumentGeneratorFormProps {
  template: DocumentTemplate;
  onClose: () => void;
  onGenerate: (
    fieldValues: Record<string, string | string[]>,
    documentName: string,
  ) => Promise<void>;
  defaultValuesProvider?: DefaultValuesProvider;
  defaultValues?: Record<string, string | string[]>;
  aiSuggestions?: AIFieldSuggestion[];
  onApplyAISuggestion?: (
    fieldName: string,
    suggestion: AIFieldSuggestion,
    applyTo?: "all" | "individual",
  ) => void;
}

const DocumentGeneratorForm = forwardRef<
  DocumentGeneratorFormRef,
  DocumentGeneratorFormProps
>(
  (
    {
      template,
      onGenerate,
      onClose,
      defaultValuesProvider,
      defaultValues: externalDefaultValues = {},
      aiSuggestions: _aiSuggestions = [],
      onApplyAISuggestion,
    },
    ref,
  ) => {
    const [fieldValues, setFieldValues] = useState<
      Record<string, string | string[]>
    >({});
    const [documentName, setDocumentName] = useState("");
    const [generating, setGenerating] = useState(false);
    const [patterns, setPatterns] = useState<Record<string, string>>({});
    const [expandedSequential, setExpandedSequential] = useState<Set<string>>(
      new Set(),
    );

    const uniqueFields = template.fields.filter(
      (f) => !f.sequentialIndices || f.sequentialIndices.length === 0,
    );
    const sequentialFields = template.fields.filter(
      (f) => f.sequentialIndices && f.sequentialIndices.length > 0,
    );

    const structure = Array.isArray(template.structure)
      ? template.structure
      : [];
    const dynamicTables = structure.filter((s) => s.isDynamic);

    useEffect(() => {
      const initialValues: Record<string, string | string[]> = {};

      template.fields.forEach((field) => {
        if (externalDefaultValues[field.name] !== undefined) {
          initialValues[field.name] = externalDefaultValues[field.name];
        } else if (
          field.sequentialIndices &&
          field.sequentialIndices.length > 0
        ) {
          const sortedIndices = [...field.sequentialIndices].sort(
            (a, b) => a - b,
          );

          initialValues[field.name] = sortedIndices.map(
            () => field.defaultValue || "",
          );
        } else {
          initialValues[field.name] = field.defaultValue || "";
        }
      });

      setFieldValues(initialValues);
      setDocumentName(template.name + "_gerado");
    }, [template, externalDefaultValues]);

    const handleApplyDefaultValues = () => {
      if (!defaultValuesProvider) {
        alert("Nenhum provedor de valores padrão configurado.");

        return;
      }

      try {
        const defaultValues = defaultValuesProvider.getDefaultValues(template);

        console.log("📋 Aplicando valores padrão externos:", defaultValues);

        setFieldValues((prev) => {
          const updated = { ...prev };

          Object.entries(defaultValues).forEach(([fieldName, value]) => {
            const field = template.fields.find((f) => f.name === fieldName);

            if (field) {
              if (
                field.sequentialIndices &&
                field.sequentialIndices.length > 0
              ) {
                if (Array.isArray(value)) {
                  updated[fieldName] = value;
                } else {
                  const count = field.sequentialIndices.length;

                  updated[fieldName] = Array(count).fill(value);
                }
              } else {
                updated[fieldName] = Array.isArray(value)
                  ? value[0] || ""
                  : value;
              }
            }
          });

          return updated;
        });

        alert(
          "✅ Valores padrão aplicados! Você pode editá-los antes de gerar.",
        );
      } catch (error) {
        console.error("Erro ao aplicar valores padrão:", error);
        alert(`Erro: ${(error as Error).message}`);
      }
    };

    const handleFieldChange = (fieldName: string, value: string) => {
      setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
    };

    const handleSequentialFieldChange = (
      fieldName: string,
      index: number,
      value: string,
    ) => {
      setFieldValues((prev) => {
        const current = prev[fieldName];
        const array = Array.isArray(current) ? [...current] : [];

        array[index] = value;

        return { ...prev, [fieldName]: array };
      });
    };

    const handleFillAllSequential = (fieldName: string, value: string) => {
      const field = sequentialFields.find((f) => f.name === fieldName);

      if (!field?.sequentialIndices) return;

      const sortedIndices = [...field.sequentialIndices].sort((a, b) => a - b);
      const values = sortedIndices.map(() => value);

      setFieldValues((prev) => ({ ...prev, [fieldName]: values }));
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

    const handleApplyAISuggestion = (
      fieldName: string,
      suggestion: AIFieldSuggestion,
      applyTo: "all" | "individual" = "all",
    ) => {
      const targetField = template.fields.find((f) => f.name === fieldName);

      if (!targetField) return;

      if (
        targetField.sequentialIndices &&
        targetField.sequentialIndices.length > 0
      ) {
        const sortedIndices = [...targetField.sequentialIndices].sort(
          (a, b) => a - b,
        );

        if (Array.isArray(suggestion.suggestedValue)) {
          const values = [...suggestion.suggestedValue];

          while (values.length < sortedIndices.length) {
            values.push("");
          }
          setFieldValues((prev) => ({
            ...prev,
            [fieldName]: values.slice(0, sortedIndices.length),
          }));
        } else {
          if (applyTo === "all") {
            const values = sortedIndices.map(
              () => suggestion.suggestedValue as string,
            );

            setFieldValues((prev) => ({ ...prev, [fieldName]: values }));
          } else {
            setFieldValues((prev) => {
              const current = Array.isArray(prev[fieldName])
                ? [...(prev[fieldName] as string[])]
                : [];

              const firstEmptyIndex = current.findIndex((v) => !v);

              if (firstEmptyIndex !== -1) {
                current[firstEmptyIndex] = suggestion.suggestedValue as string;
              } else {
                current[0] = suggestion.suggestedValue as string;
              }

              return { ...prev, [fieldName]: current };
            });
          }
        }
      } else {
        const value = Array.isArray(suggestion.suggestedValue)
          ? suggestion.suggestedValue[0] || ""
          : suggestion.suggestedValue;

        setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
      }

      if (onApplyAISuggestion) {
        onApplyAISuggestion(fieldName, suggestion, applyTo);
      }
    };

    useImperativeHandle(ref, () => ({
      applyAISuggestion: handleApplyAISuggestion,
    }));

    const handleGenerate = async () => {
      if (!documentName.trim()) return;

      try {
        setGenerating(true);
        await onGenerate(fieldValues, documentName);
        setFieldValues({});
        setDocumentName("");
        setPatterns({});
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
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all"
            onClick={onClose}
          >
            <X className="text-gray-500" size={18} />
          </button>
        </div>

        <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
          <Input
            classNames={{ input: "text-sm", label: "text-sm" }}
            label="Nome do Documento"
            placeholder="Digite o nome do documento gerado"
            value={documentName}
            variant="bordered"
            onChange={(e) => setDocumentName(e.target.value)}
          />
          {defaultValuesProvider && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Valores Padrão Disponíveis
                  </h4>
                  <p className="text-xs text-green-600 mt-1">
                    Preencha automaticamente com valores pré-configurados
                  </p>
                </div>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  icon={Wand2}
                  variant="custom"
                  onClick={handleApplyDefaultValues}
                >
                  Aplicar Padrões
                </Button>
              </div>
            </div>
          )}
          {}{" "}
          {uniqueFields.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase">
                Campos Únicos
              </h4>
              {uniqueFields.map((field) => (
                <Input
                  key={field.name}
                  classNames={{ input: "text-sm", label: "text-sm" }}
                  label={field.name}
                  placeholder={`Digite o valor para ${field.name.toLowerCase()}`}
                  value={(fieldValues[field.name] as string) || ""}
                  variant="bordered"
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                />
              ))}
            </div>
          )}
          {sequentialFields.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase">
                Campos Sequenciais
              </h4>
              {sequentialFields.map((field) => {
                const isExpanded = expandedSequential.has(field.name);
                const currentValues = Array.isArray(fieldValues[field.name])
                  ? (fieldValues[field.name] as string[])
                  : [];
                const pattern = patterns[field.name] || "";
                const sortedIndices = field.sequentialIndices
                  ? [...field.sequentialIndices].sort((a, b) => a - b)
                  : [];

                return (
                  <div
                    key={field.name}
                    className="border border-gray-200 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-gray-700">
                          {field.name} ({sortedIndices.length} ocorrências)
                        </label>
                      </div>
                      <Button
                        isIconOnly
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg"
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

                    <div className="flex gap-2">
                      <Input
                        classNames={{ input: "text-xs", base: "flex-1" }}
                        placeholder="Valor ou padrão (use {n} para índice)"
                        size="sm"
                        value={pattern}
                        variant="bordered"
                        onChange={(e) =>
                          setPatterns((prev) => ({
                            ...prev,
                            [field.name]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 text-xs"
                        icon={Copy}
                        variant="custom"
                        onClick={() =>
                          handleFillAllSequential(field.name, pattern)
                        }
                      >
                        Todos
                      </Button>
                    </div>

                    {isExpanded &&
                      sortedIndices.map((index, arrayIndex) => (
                        <Input
                          key={`${field.name}_${index}`}
                          classNames={{ input: "text-xs", label: "text-xs" }}
                          label={`${field.name} #${index}`}
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
          {dynamicTables.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Tabelas Dinâmicas
              </h4>
              {dynamicTables.map((table) => {
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
                    onAddRow: async () => {
                      tableStructure.columnMapping.forEach((col) => {
                        if (col.isSequential) {
                          const sequentialField = template.fields.find(
                            (f) => f.name === col.fieldName,
                          );

                          if (
                            sequentialField &&
                            sequentialField.sequentialIndices
                          ) {
                            const newIndex =
                              Math.max(...sequentialField.sequentialIndices) +
                              1;

                            sequentialField.sequentialIndices.push(newIndex);

                            const currentValues = Array.isArray(
                              fieldValues[col.fieldName],
                            )
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
                    onRemoveRow: async (rowIndexToRemove: number) => {
                      tableStructure.columnMapping.forEach((col) => {
                        if (col.isSequential) {
                          const sequentialField = template.fields.find(
                            (f) => f.name === col.fieldName,
                          );

                          if (
                            sequentialField &&
                            sequentialField.sequentialIndices
                          ) {
                            const sortedIndices = [
                              ...sequentialField.sequentialIndices,
                            ].sort((a, b) => a - b);
                            const indexToRemove =
                              sortedIndices[rowIndexToRemove];

                            if (indexToRemove !== undefined) {
                              sequentialField.sequentialIndices =
                                sequentialField.sequentialIndices.filter(
                                  (idx) => idx !== indexToRemove,
                                );

                              const currentValues = Array.isArray(
                                fieldValues[col.fieldName],
                              )
                                ? [...(fieldValues[col.fieldName] as string[])]
                                : [];

                              if (currentValues.length > rowIndexToRemove) {
                                currentValues.splice(rowIndexToRemove, 1);
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
                  const field = template.fields.find(
                    (f) => f.name === fieldName,
                  );

                  if (!field || !field.sequentialIndices) return;

                  const sortedIndices = [...field.sequentialIndices].sort(
                    (a, b) => a - b,
                  );
                  const tableStructure = Array.isArray(template.structure)
                    ? template.structure.find((s) =>
                        s.columnMapping.some(
                          (cm) => cm.fieldName === fieldName,
                        ),
                      )
                    : null;

                  if (!tableStructure) return;

                  const dataRowIndex = rowIndex - tableStructure.headerRows;

                  if (
                    dataRowIndex >= 0 &&
                    dataRowIndex < sortedIndices.length
                  ) {
                    handleSequentialFieldChange(fieldName, dataRowIndex, value);
                  }
                };

                const handlers = createTableRowHandlers(table.tableIndex);

                return (
                  <TableEditor
                    key={table.tableIndex}
                    tableIndex={table.tableIndex}
                    template={template}
                    values={fieldValues}
                    onAddRow={handlers.onAddRow}
                    onFieldChange={handleTableFieldChange}
                    onRemoveRow={handlers.onRemoveRow}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            className={`flex-1 py-2.5 rounded-xl font-semibold ${
              !documentName.trim() || generating
                ? "bg-gray-200 text-gray-400"
                : "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg"
            }`}
            disabled={!documentName.trim() || generating}
            icon={Sparkles}
            variant="custom"
            onClick={handleGenerate}
          >
            {generating ? "Gerando..." : "Gerar Documento"}
          </Button>
          <Button
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl"
            variant="custom"
            onClick={onClose}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  },
);

DocumentGeneratorForm.displayName = "DocumentGeneratorForm";

export default DocumentGeneratorForm;