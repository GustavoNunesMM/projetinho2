import { useState } from "react";

import { AIDocumentService, AIServiceConfig } from "@/services/aiService.ts";
import {
  AIFieldSuggestion,
  TemplateField,
} from "@/types/documentGeneration.ts";
import { getCachedSuggestion, cacheSuggestion } from "@/database/database.ts";

function simpleHash(str: string): string {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);

    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(16);
}

export function useAI() {
  const [service, setService] = useState<AIDocumentService | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = (config: AIServiceConfig) => {
    setService(new AIDocumentService(config));
  };

  const getCachedSuggestionsFromDB = async (
    templateId: number,
    fields: TemplateField[],
    contextHash: string,
  ): Promise<AIFieldSuggestion[]> => {
    const suggestions: AIFieldSuggestion[] = [];

    for (const field of fields) {
      const cached = await getCachedSuggestion(
        templateId,
        field.name,
        contextHash,
      );

      if (cached) {
        suggestions.push({
          fieldName: cached.field_name,
          suggestedValue: cached.suggestion,
          confidence: cached.confidence,
          reasoning: cached.reasoning || "Sugestão em cache",
          sources: cached.sources ? JSON.parse(cached.sources) : [],
        });
      }
    }

    return suggestions;
  };

  const cacheSuggestionsInDB = async (
    templateId: number,
    contextHash: string,
    suggestions: AIFieldSuggestion[],
  ): Promise<void> => {
    for (const suggestion of suggestions) {
      try {
        await cacheSuggestion(
          templateId,
          suggestion.fieldName,
          contextHash,
          suggestion.suggestedValue,
          suggestion.confidence,
          suggestion.reasoning,
        );
      } catch (err) {
        console.warn(
          `Erro ao cachear sugestão para ${suggestion.fieldName}:`,
          err,
        );
      }
    }
  };

  const generateSuggestions = async (
    templateId: number,
    fields: TemplateField[],
    context: string,
    existingValues?: Record<string, string>,
  ): Promise<AIFieldSuggestion[]> => {
    if (!service) {
      throw new Error("AI Service não inicializado");
    }

    setLoading(true);
    setError(null);

    try {
      const contextHash = simpleHash(context);

      const cached = await getCachedSuggestionsFromDB(
        templateId,
        fields,
        contextHash,
      );

      if (cached && cached.length > 0) {
        console.log("Usando sugestões do cache");

        return cached;
      }

      const template = { id: templateId, fields } as any;
      const suggestions = await service.suggestFieldValues(
        template,
        context,
        existingValues,
      );

      await cacheSuggestionsInDB(templateId, contextHash, suggestions);

      return suggestions;
    } catch (err) {
      const message = (err as Error).message;

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateField = async (
    field: TemplateField,
    value: string,
  ): Promise<{ valid: boolean; errors: string[] }> => {
    if (!service) {
      throw new Error("AI Service não inicializado");
    }

    try {
      return await service.validateFieldValue(field, value);
    } catch (err) {
      console.error("Erro ao validar campo:", err);

      return { valid: false, errors: ["Erro ao validar campo"] };
    }
  };

  return {
    service,
    loading,
    error,
    initialize,
    generateSuggestions,
    validateField,
  };
}