import { useEffect, useState, useCallback } from "react";

import { DocumentTemplate } from "@/types/generate.ts";
import { AIFieldSuggestion, DefaultValuesProvider } from "@/types/document.ts";

interface UseDocumentFormOptions {
  template: DocumentTemplate;
  externalDefaultValues?: Record<string, string | string[]>;
  defaultValuesProvider?: DefaultValuesProvider;
  onApplyAISuggestionCallback?: (
    fieldName: string,
    suggestion: AIFieldSuggestion,
    applyTo?: "all" | "individual",
  ) => void;
  onGenerate: (
    fieldValues: Record<string, string | string[]>,
    documentName: string,
  ) => Promise<void>;
}

export function useDocumentForm({
  template,
  externalDefaultValues = {},
  defaultValuesProvider,
  onApplyAISuggestionCallback,
  onGenerate,
}: UseDocumentFormOptions) {
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

  useEffect(() => {
    const initialValues: Record<string, string | string[]> = {};

    template.fields.forEach((field) => {
      if (externalDefaultValues[field.name] !== undefined) {
        initialValues[field.name] = externalDefaultValues[field.name];
      } else if (
        field.sequentialIndices &&
        field.sequentialIndices.length > 0
      ) {
        const sorted = [...field.sequentialIndices].sort((a, b) => a - b);

        initialValues[field.name] = sorted.map(() => field.defaultValue || "");
      } else {
        initialValues[field.name] = field.defaultValue || "";
      }
    });

    setFieldValues(initialValues);
    setDocumentName(template.name + "_gerado");
    setPatterns({});
    setExpandedSequential(new Set());
  }, [template, externalDefaultValues]);

  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleSequentialFieldChange = useCallback(
    (fieldName: string, arrayIndex: number, value: string) => {
      setFieldValues((prev) => {
        const current = prev[fieldName];
        const arr = Array.isArray(current) ? [...current] : [];

        arr[arrayIndex] = value;

        return { ...prev, [fieldName]: arr };
      });
    },
    [],
  );

  const handleFillAllSequential = useCallback(
    (fieldName: string, value: string) => {
      const field = sequentialFields.find((f) => f.name === fieldName);

      if (!field?.sequentialIndices) return;
      const sorted = [...field.sequentialIndices].sort((a, b) => a - b);

      setFieldValues((prev) => ({
        ...prev,
        [fieldName]: sorted.map(() => value),
      }));
    },
    [sequentialFields],
  );

  const handlePatternChange = useCallback(
    (fieldName: string, value: string) => {
      setPatterns((prev) => ({ ...prev, [fieldName]: value }));
    },
    [],
  );

  const toggleSequentialExpanded = useCallback((fieldName: string) => {
    setExpandedSequential((prev) => {
      const next = new Set(prev);

      next.has(fieldName) ? next.delete(fieldName) : next.add(fieldName);

      return next;
    });
  }, []);

  const handleApplyDefaultValues = useCallback(() => {
    if (!defaultValuesProvider) {
      alert("Nenhum provedor de valores padrão configurado.");

      return;
    }

    try {
      const defaults = defaultValuesProvider.getDefaultValues(template);

      setFieldValues((prev) => {
        const updated = { ...prev };

        Object.entries(defaults).forEach(([fieldName, value]) => {
          const field = template.fields.find((f) => f.name === fieldName);

          if (!field) return;

          if (field.sequentialIndices && field.sequentialIndices.length > 0) {
            updated[fieldName] = Array.isArray(value)
              ? value
              : Array(field.sequentialIndices.length).fill(value);
          } else {
            updated[fieldName] = Array.isArray(value) ? value[0] || "" : value;
          }
        });

        return updated;
      });

      alert("✅ Valores padrão aplicados! Você pode editá-los antes de gerar.");
    } catch (error) {
      console.error("Erro ao aplicar valores padrão:", error);
      alert(`Erro: ${(error as Error).message}`);
    }
  }, [defaultValuesProvider, template]);

  const handleApplyAISuggestion = useCallback(
    (
      fieldName: string,
      suggestion: AIFieldSuggestion,
      applyTo: "all" | "individual" = "all",
      arrayIndex?: number,
    ) => {
      const targetField = template.fields.find((f) => f.name === fieldName);

      if (!targetField) return;

      const isSeq =
        targetField.sequentialIndices &&
        targetField.sequentialIndices.length > 0;

      if (isSeq) {
        const sorted = [...(targetField.sequentialIndices ?? [])].sort(
          (a, b) => a - b,
        );

        if (applyTo === "all") {
          if (Array.isArray(suggestion.suggestedValue)) {
            const values = [...suggestion.suggestedValue];

            while (values.length < sorted.length) values.push("");
            setFieldValues((prev) => ({
              ...prev,
              [fieldName]: values.slice(0, sorted.length),
            }));
          } else {
            setFieldValues((prev) => ({
              ...prev,
              [fieldName]: sorted.map(
                () => suggestion.suggestedValue as string,
              ),
            }));
          }
        } else {
          if (arrayIndex === undefined) return;

          const slotValue = Array.isArray(suggestion.suggestedValue)
            ? (suggestion.suggestedValue[arrayIndex] ?? "")
            : (suggestion.suggestedValue as string);

          setFieldValues((prev) => {
            const current = Array.isArray(prev[fieldName])
              ? [...(prev[fieldName] as string[])]
              : Array(sorted.length).fill("");

            current[arrayIndex] = slotValue;

            return { ...prev, [fieldName]: current };
          });
        }
      } else {
        const value = Array.isArray(suggestion.suggestedValue)
          ? suggestion.suggestedValue[0] || ""
          : suggestion.suggestedValue;

        setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
      }

      onApplyAISuggestionCallback?.(fieldName, suggestion, applyTo);
    },
    [template, onApplyAISuggestionCallback],
  );

  const handleGenerate = useCallback(async () => {
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
  }, [documentName, fieldValues, onGenerate]);

  return {
    fieldValues,
    documentName,
    generating,
    patterns,
    expandedSequential,
    uniqueFields,
    sequentialFields,
    setDocumentName,
    handleFieldChange,
    handleSequentialFieldChange,
    handleFillAllSequential,
    handlePatternChange,
    toggleSequentialExpanded,
    handleApplyDefaultValues,
    handleApplyAISuggestion,
    handleGenerate,
  };
}