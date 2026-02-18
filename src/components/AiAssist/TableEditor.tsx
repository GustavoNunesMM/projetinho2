"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  Table as TableIcon,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { DocumentTemplate, TableStructure } from "@/types/generate.ts";
import { WordTableExtractor } from "@/services/wordTableExtractor";

interface WordTableEditorProps {
  onSave?: (
    template: DocumentTemplate,
    values: Record<string, string | string[]>,
  ) => Promise<void>;
}

export function TableEditor({ onSave }: WordTableEditorProps) {
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.name.endsWith(".docx")) {
      setError("Por favor, selecione um arquivo .docx");

      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const extractor = new WordTableExtractor();
      const result = await extractor.extractFromDocx(file);

      const newTemplate: DocumentTemplate = {
        id: Date.now(),
        name: file.name.replace(".docx", ""),
        filePath: "",
        fileName: file.name,
        fileSize: file.size,
        fields: result.fields,
        structure: result.structure,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTemplate(newTemplate);

      const initialValues: Record<string, string | string[]> = {};

      result.fields.forEach((field) => {
        if (field.sequentialIndices && field.sequentialIndices.length > 0) {
          initialValues[field.name] = field.sequentialIndices.map(() => "");
        } else {
          initialValues[field.name] = "";
        }
      });
      setValues(initialValues);

      setSuccess(
        `Tabela extraída com sucesso! ${result.fields.length} campos encontrados.`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao processar arquivo",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSequentialFieldChange = (
    fieldName: string,
    index: number,
    value: string,
  ) => {
    setValues((prev) => {
      const current = prev[fieldName];
      const array = Array.isArray(current) ? [...current] : [];

      array[index] = value;

      return { ...prev, [fieldName]: array };
    });
  };

  const handleAddRow = (tableIndex: number) => {
    if (!template || !template.structure) return;

    const structure = template.structure[tableIndex];

    if (!structure || !structure.isDynamic) return;

    structure.columnMapping.forEach((col) => {
      if (col.isSequential) {
        const field = template.fields.find((f) => f.name === col.fieldName);

        if (field && field.sequentialIndices) {
          const newIndex = Math.max(...field.sequentialIndices) + 1;

          field.sequentialIndices.push(newIndex);

          const currentValues = Array.isArray(values[col.fieldName])
            ? [...(values[col.fieldName] as string[])]
            : [];

          currentValues.push("");

          setValues((prev) => ({
            ...prev,
            [col.fieldName]: currentValues,
          }));
        }
      }
    });

    structure.rows += 1;
    setTemplate({ ...template });
  };

  const handleRemoveRow = (tableIndex: number, rowIndex: number) => {
    if (!template || !template.structure) return;
    if (!confirm("Tem certeza que deseja remover esta linha?")) return;

    const structure = template.structure[tableIndex];

    if (!structure || !structure.isDynamic) return;

    structure.columnMapping.forEach((col) => {
      if (col.isSequential) {
        const field = template.fields.find((f) => f.name === col.fieldName);

        if (field && field.sequentialIndices) {
          const dataRowIndex = rowIndex - structure.headerRows;

          if (
            dataRowIndex >= 0 &&
            dataRowIndex < field.sequentialIndices.length
          ) {
            field.sequentialIndices.splice(dataRowIndex, 1);

            const currentValues = Array.isArray(values[col.fieldName])
              ? [...(values[col.fieldName] as string[])]
              : [];

            currentValues.splice(dataRowIndex, 1);

            setValues((prev) => ({
              ...prev,
              [col.fieldName]: currentValues,
            }));
          }
        }
      }
    });

    structure.rows -= 1;
    setTemplate({ ...template });
  };

  const handleSave = async () => {
    if (!template || !onSave) return;

    setLoading(true);
    setError(null);

    try {
      await onSave(template, values);
      setSuccess("Template e valores salvos com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (structure: TableStructure) => {
    const dataRows = structure.rows - structure.headerRows;

    return (
      <div
        key={structure.tableIndex}
        className="border rounded-lg overflow-hidden mb-6"
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <TableIcon className="w-5 h-5" />
                Tabela {structure.tableIndex + 1}
              </h3>
              <p className="text-sm opacity-90">
                {structure.columns} colunas • {dataRows} linhas de dados
                {structure.isDynamic && " • Dinâmica"}
              </p>
            </div>

            {structure.isDynamic && (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600
                         rounded-lg hover:bg-blue-50 transition-colors"
                disabled={loading}
                onClick={() => handleAddRow(structure.tableIndex)}
              >
                <Plus className="w-4 h-4" />
                Adicionar Linha
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                {structure.columnMapping.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    <div className="flex flex-col">
                      <span
                        className="truncate max-w-[200px]"
                        title={col.placeholder}
                      >
                        {col.placeholder}
                      </span>
                      <span className="text-xs text-gray-400 normal-case">
                        {col.fieldName}
                        {col.isSequential && " (sequencial)"}
                      </span>
                    </div>
                  </th>
                ))}
                {structure.isDynamic && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: dataRows }).map((_, rowIdx) => {
                const actualRowIndex = rowIdx + structure.headerRows;

                return (
                  <tr key={rowIdx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {rowIdx + 1}
                    </td>

                    {structure.columnMapping.map((col, colIdx) => {
                      const field = template?.fields.find(
                        (f) => f.name === col.fieldName,
                      );

                      if (!field)
                        return (
                          <td key={colIdx} className="px-3 py-2">
                            -
                          </td>
                        );

                      const fieldValues = values[col.fieldName];
                      const value = Array.isArray(fieldValues)
                        ? fieldValues[rowIdx] || ""
                        : "";

                      return (
                        <td key={colIdx} className="px-3 py-2">
                          {col.fieldType === "select" ? (
                            <select
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              value={value}
                              onChange={(e) =>
                                handleSequentialFieldChange(
                                  col.fieldName,
                                  rowIdx,
                                  e.target.value,
                                )
                              }
                            >
                              <option value="">Selecione...</option>
                              {col.fieldName === "TRIMESTRE" && (
                                <>
                                  <option value="1º Trimestre">
                                    1º Trimestre
                                  </option>
                                  <option value="2º Trimestre">
                                    2º Trimestre
                                  </option>
                                  <option value="3º Trimestre">
                                    3º Trimestre
                                  </option>
                                  <option value="4º Trimestre">
                                    4º Trimestre
                                  </option>
                                </>
                              )}
                              {col.fieldName === "ANO" && (
                                <>
                                  <option value="2026">2026</option>
                                  <option value="2027">2027</option>
                                </>
                              )}
                            </select>
                          ) : col.fieldType === "date" ? (
                            <input
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              type="date"
                              value={value}
                              onChange={(e) =>
                                handleSequentialFieldChange(
                                  col.fieldName,
                                  rowIdx,
                                  e.target.value,
                                )
                              }
                            />
                          ) : (
                            <textarea
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-y min-h-[60px]"
                              placeholder={
                                field.description || "Digite aqui..."
                              }
                              value={value}
                              onChange={(e) =>
                                handleSequentialFieldChange(
                                  col.fieldName,
                                  rowIdx,
                                  e.target.value,
                                )
                              }
                            />
                          )}
                        </td>
                      );
                    })}

                    {structure.isDynamic && (
                      <td className="px-3 py-2">
                        <button
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                          disabled={loading || dataRows <= 1}
                          title="Remover linha"
                          onClick={() =>
                            handleRemoveRow(
                              structure.tableIndex,
                              actualRowIndex,
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Editor de Tabelas Word
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Faça upload de um arquivo .docx para extrair e editar tabelas
          </p>
        </div>

        {!template && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <label className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700 font-medium">
                Clique para selecionar
              </span>
              <span className="text-gray-600">
                {" "}
                ou arraste um arquivo .docx
              </span>
              <input
                accept=".docx"
                className="hidden"
                disabled={loading}
                type="file"
                onChange={handleFileUpload}
              />
            </label>
            <p className="text-xs text-gray-400 mt-2">
              Apenas arquivos Word (.docx)
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">Processando arquivo...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-800">Erro</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {template && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                {template.name}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm text-blue-700">
                <div>
                  <span className="font-medium">Campos:</span>{" "}
                  {template.fields.length}
                </div>
                <div>
                  <span className="font-medium">Tabelas:</span>{" "}
                  {template.structure?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Tamanho:</span>{" "}
                  {(template.fileSize / 1024).toFixed(2)} KB
                </div>
              </div>
            </div>
          </div>
        )}

        {template && template.structure && template.structure.length > 0 && (
          <div className="space-y-6">
            {template.structure.map((structure) => renderTable(structure))}
          </div>
        )}

        {template && (
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              onClick={handleSave}
            >
              <Save className="w-5 h-5" />
              Salvar Template e Valores
            </button>
            <button
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => {
                setTemplate(null);
                setValues({});
                setError(null);
                setSuccess(null);
              }}
            >
              Novo Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}