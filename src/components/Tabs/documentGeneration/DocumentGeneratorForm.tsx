import { useState, useEffect } from "react";
import { FileText, Sparkles, X, Copy, Settings, ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/common/Button";
import { DocumentTemplate } from "@/types/documentGeneration";
import { Input } from "@heroui/react";

interface DocumentGeneratorFormProps {
  template: DocumentTemplate;
  onGenerate: (
    fieldValues: Record<string, string | string[]>,
    documentName: string,
  ) => Promise<void>;
  onClose: () => void;
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
  const [expandedSequential, setExpandedSequential] = useState<
    Set<string>
  >(new Set());

  // Separar campos únicos e sequenciais
  const uniqueFields = template.fields.filter(
    (f) => !f.sequentialIndices || f.sequentialIndices.length === 0,
  );
  const sequentialFields = template.fields.filter(
    (f) => f.sequentialIndices && f.sequentialIndices.length > 0,
  );
  
  console.log("=== CAMPOS DO TEMPLATE ===");
  console.log("Template fields:", template.fields);
  console.log("Unique fields:", uniqueFields);
  console.log("Sequential fields:", sequentialFields);

  useEffect(() => {
    const initialValues: Record<string, string | string[]> = {};
    template.fields.forEach((field) => {
      if (field.sequentialIndices && field.sequentialIndices.length > 0) {
        // Campo sequencial - inicializar como array com tamanho correto
        const sortedIndices = [...field.sequentialIndices].sort((a, b) => a - b);
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
    console.log(`📝 Mudança em campo sequencial: ${fieldName}[${index}] = "${value}"`);
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
          onClick={onClose}
          className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 flex-shrink-0"
          aria-label="Fechar"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
        <Input
          label="Nome do Documento"
          placeholder="Digite o nome do documento gerado"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          variant="bordered"
          classNames={{
            input: "text-sm",
            label: "text-sm",
          }}
        />

        {/* Campos Únicos */}
        {uniqueFields.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Campos Únicos
            </h4>
            {uniqueFields.map((field) => (
              <Input
                key={field.name}
                label={field.name}
                placeholder={`Digite o valor para {{${field.name}}}`}
                value={(fieldValues[field.name] as string) || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                variant="bordered"
                classNames={{
                  input: "text-sm",
                  label: "text-sm",
                }}
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
                      variant="custom"
                      onClick={() => toggleSequentialExpanded(field.name)}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg"
                      aria-label={
                        isExpanded ? "Recolher" : "Expandir"
                      }
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
                      placeholder="Valor ou padrão (use {n} para índice, ex: Trimestre {n})"
                      value={pattern}
                      onChange={(e) =>
                        setPatterns((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      variant="bordered"
                      size="sm"
                      classNames={{
                        input: "text-xs",
                        base: "flex-1",
                      }}
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
                      variant="custom"
                      icon={Copy}
                      onClick={() => handleFillAllSequential(field.name, pattern)}
                      className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                    >
                      Todos
                    </Button>
                    <Button
                      variant="custom"
                      icon={Settings}
                      onClick={() => handleApplyPattern(field.name)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                    >
                      Padrão
                    </Button>
                  </div>

                  {/* Campos individuais (expandidos) */}
                  {isExpanded &&
                    sortedIndices.map((index, arrayIndex) => (
                      <Input
                        key={`${field.name}_${index}`}
                        label={`${field.name} #${index}`}
                        placeholder={`Valor para {{${field.name}_${index}}}`}
                        value={currentValues[arrayIndex] || ""}
                        onChange={(e) =>
                          handleSequentialFieldChange(
                            field.name,
                            arrayIndex,
                            e.target.value,
                          )
                        }
                        variant="bordered"
                        size="sm"
                        classNames={{
                          input: "text-xs",
                          label: "text-xs",
                        }}
                      />
                    ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <Button
          variant="custom"
          icon={Sparkles}
          onClick={handleGenerate}
          disabled={!documentName.trim() || generating}
          className={`flex-1 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
            !documentName.trim() || generating
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          }`}
        >
          {generating ? "Gerando..." : "Gerar Documento"}
        </Button>
        <Button
          variant="custom"
          onClick={onClose}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default DocumentGeneratorForm;
