"use client";

import {
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
  Sparkles,
  List,
  ListChecks,
} from "lucide-react";

import { AIFieldSuggestion } from "@/types/documentGeneration.ts";

interface AIAssistantPanelProps {
  suggestions: AIFieldSuggestion[];
  onApplySuggestion: (
    fieldName: string,
    suggestion: AIFieldSuggestion,
    applyTo?: "all" | "individual",
  ) => void;
  onRegenerate?: () => void;
  loading?: boolean;
}

export function AIAssistantPanel({
  suggestions,
  onApplySuggestion,
  onRegenerate,
  loading = false,
}: AIAssistantPanelProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50";
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-50";

    return "text-orange-600 bg-orange-50";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "Alta";
    if (confidence >= 0.6) return "Média";

    return "Baixa";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Assistente IA</h3>
        </div>

        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3" />
          <p className="text-sm">Gerando sugestões...</p>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Assistente IA</h3>
        </div>

        <div className="text-center py-8">
          <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            Forneça um contexto e clique em "Gerar Sugestões com IA" para obter
            recomendações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Assistente IA</h3>
        </div>

        {onRegenerate && (
          <button
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50
                     rounded-lg transition-colors"
            title="Regenerar sugestões"
            onClick={onRegenerate}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{suggestions.length}</span> sugestões
          disponíveis
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Confiança média:{" "}
          <span className="font-medium">
            {(
              (suggestions.reduce((acc, s) => acc + s.confidence, 0) /
                suggestions.length) *
              100
            ).toFixed(0)}
            %
          </span>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {suggestions.map((suggestion, idx) => {
          const isSequential =
            suggestion.isSequential || Array.isArray(suggestion.suggestedValue);
          const displayValue = Array.isArray(suggestion.suggestedValue)
            ? suggestion.suggestedValue.join(", ")
            : suggestion.suggestedValue;

          return (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              {/* Field Name */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm text-gray-800">
                    {suggestion.fieldName}
                  </h4>
                  {isSequential && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Sequencial
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceColor(
                    suggestion.confidence,
                  )}`}
                >
                  {getConfidenceLabel(suggestion.confidence)}
                </span>
              </div>

              {/* Suggested Value */}
              <div className="bg-gray-50 rounded p-2 mb-2">
                <p className="text-sm text-gray-700 font-mono break-all line-clamp-3">
                  {displayValue}
                </p>
              </div>

              {/* Reasoning */}
              {suggestion.reasoning && (
                <div className="text-xs text-gray-500 mb-3 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{suggestion.reasoning}</span>
                </div>
              )}

              {/* Apply Buttons */}
              {isSequential && Array.isArray(suggestion.suggestedValue) ? (
                // Campo sequencial com valores múltiplos - opção de aplicar individualmente
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="flex items-center justify-center gap-2 px-3 py-2
                             bg-purple-500 text-white text-xs rounded-lg
                             hover:bg-purple-600 transition-colors"
                    onClick={() =>
                      onApplySuggestion(suggestion.fieldName, suggestion, "all")
                    }
                  >
                    <ListChecks className="w-3 h-3" />
                    Aplicar Todos
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 px-3 py-2
                             bg-blue-500 text-white text-xs rounded-lg
                             hover:bg-blue-600 transition-colors"
                    onClick={() =>
                      onApplySuggestion(
                        suggestion.fieldName,
                        suggestion,
                        "individual",
                      )
                    }
                  >
                    <List className="w-3 h-3" />
                    Individual
                  </button>
                </div>
              ) : isSequential ? (
                // Campo sequencial com valor único - opção de replicar
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="flex items-center justify-center gap-2 px-3 py-2
                             bg-purple-500 text-white text-xs rounded-lg
                             hover:bg-purple-600 transition-colors"
                    onClick={() =>
                      onApplySuggestion(suggestion.fieldName, suggestion, "all")
                    }
                  >
                    <CheckCircle className="w-3 h-3" />
                    Replicar p/ Todos
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 px-3 py-2
                             bg-blue-500 text-white text-xs rounded-lg
                             hover:bg-blue-600 transition-colors"
                    onClick={() =>
                      onApplySuggestion(
                        suggestion.fieldName,
                        suggestion,
                        "individual",
                      )
                    }
                  >
                    <CheckCircle className="w-3 h-3" />
                    Primeiro Vazio
                  </button>
                </div>
              ) : (
                // Campo único - botão simples
                <button
                  className="w-full flex items-center justify-center gap-2 px-3 py-2
                           bg-purple-500 text-white text-sm rounded-lg
                           hover:bg-purple-600 transition-colors"
                  onClick={() =>
                    onApplySuggestion(suggestion.fieldName, suggestion)
                  }
                >
                  <CheckCircle className="w-4 h-4" />
                  Aplicar
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          As sugestões são geradas por IA e devem ser revisadas antes do uso
          final.
        </p>
      </div>
    </div>
  );
}