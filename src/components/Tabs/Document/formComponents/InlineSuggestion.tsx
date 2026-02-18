"use client";

import { useState } from "react";
import { CheckCircle, ListChecks, ChevronDown, Sparkles } from "lucide-react";

import {
  InlineItemSuggestionProps,
  InlineSuggestionProps,
} from "@/types/document.ts";

function confidenceStyle(c: number) {
  if (c >= 0.8) return "text-green-700 bg-green-50 border-green-200";
  if (c >= 0.6) return "text-yellow-700 bg-yellow-50 border-yellow-200";

  return "text-orange-700 bg-orange-50 border-orange-200";
}

function confidenceLabel(c: number) {
  if (c >= 0.8) return "Alta";
  if (c >= 0.6) return "Média";

  return "Baixa";
}

export function InlineSuggestion({
  suggestion,
  onApplyAll,
  onExpandHint,
}: InlineSuggestionProps) {
  const [showReasoning, setShowReasoning] = useState(false);

  const displayValue = Array.isArray(suggestion.suggestedValue)
    ? suggestion.suggestedValue.join(", ")
    : suggestion.suggestedValue;

  const isSequential =
    suggestion.isSequential || Array.isArray(suggestion.suggestedValue);

  return (
    <div
      className={`mt-1.5 rounded-lg border px-3 py-2 text-xs ${confidenceStyle(suggestion.confidence)} transition-all`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="font-semibold">Sugestão IA</span>
            <span className="ml-auto opacity-60 shrink-0">
              {confidenceLabel(suggestion.confidence)}
            </span>
          </div>

          <p className="font-mono break-all line-clamp-2 opacity-90 leading-snug">
            {displayValue}
          </p>

          {suggestion.reasoning && (
            <button
              className="mt-1 underline underline-offset-2 opacity-55 hover:opacity-100 transition-opacity"
              onClick={() => setShowReasoning((v) => !v)}
            >
              {showReasoning ? "Ocultar raciocínio" : "Ver raciocínio"}
            </button>
          )}
          {showReasoning && suggestion.reasoning && (
            <p className="mt-1 italic opacity-70 leading-snug">
              {suggestion.reasoning}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <button
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-current font-medium hover:opacity-80 transition-opacity whitespace-nowrap"
            onClick={onApplyAll}
          >
            {isSequential ? (
              <>
                <ListChecks className="w-3 h-3" />
                Aplicar Todos
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                Inserir
              </>
            )}
          </button>

          {isSequential && onExpandHint && (
            <button
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-current font-medium hover:opacity-80 transition-opacity whitespace-nowrap opacity-75"
              onClick={onExpandHint}
            >
              <ChevronDown className="w-3 h-3" />
              Individual
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function InlineItemSuggestion({
  value,
  confidence,
  reasoning,
  onApply,
}: InlineItemSuggestionProps) {
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <div
      className={`mt-1 rounded-md border px-2.5 py-1.5 text-xs ${confidenceStyle(confidence)} transition-all`}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-3 h-3 shrink-0 opacity-70" />
        <p className="font-mono flex-1 min-w-0 truncate opacity-90">{value}</p>

        {reasoning && (
          <button
            className="underline underline-offset-2 opacity-50 hover:opacity-90 transition-opacity shrink-0"
            onClick={() => setShowReasoning((v) => !v)}
          >
            {showReasoning ? "◂" : "?"}
          </button>
        )}

        <button
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-current font-medium hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
          onClick={onApply}
        >
          <CheckCircle className="w-3 h-3" />
          Inserir
        </button>
      </div>

      {showReasoning && reasoning && (
        <p className="mt-1 italic opacity-70 leading-snug pl-5">{reasoning}</p>
      )}
    </div>
  );
}