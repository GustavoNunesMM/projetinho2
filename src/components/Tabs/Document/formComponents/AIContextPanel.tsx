"use client";

import { RefreshCw, Sparkles } from "lucide-react";

import Button from "@/components/common/Button.tsx";
import Textarea from "@/components/common/Textarea.tsx";
import { AIContextPanelProps } from "@/types/document.ts";

export function AIContextPanel({
  aiContext,
  onAiContextChange,
  onGenerateAISuggestions,
  onRegenerate,
  aiLoading,
  aiServiceAvailable,
  aiSuggestions,
}: AIContextPanelProps) {
  const avgConfidence =
    aiSuggestions.length > 0
      ? (
          (aiSuggestions.reduce((a, s) => a + s.confidence, 0) /
            aiSuggestions.length) *
          100
        ).toFixed(0)
      : null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-4 sticky top-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
        <span className="text-sm font-semibold text-gray-800">
          Assistente IA
        </span>

        {avgConfidence && (
          <span className="ml-auto text-xs text-gray-500 whitespace-nowrap">
            {aiSuggestions.length} sugestões · <strong>{avgConfidence}%</strong>{" "}
            confiança
          </span>
        )}

        {aiSuggestions.length > 0 && (
          <button
            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-100 transition-colors"
            title="Regenerar sugestões"
            onClick={onRegenerate}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <Textarea
        placeholder="Descreva o contexto do documento (ex: Plano de aula para 3º ano, tema: Meio Ambiente)..."
        rows={5}
        value={aiContext}
        onChange={(e) =>
          onAiContextChange((e.target as HTMLInputElement).value)
        }
      />

      <Button
        className="w-full mt-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-sm"
        disabled={aiLoading || !aiContext.trim() || !aiServiceAvailable}
        icon={Sparkles}
        variant="custom"
        onClick={onGenerateAISuggestions}
      >
        {aiLoading ? "Gerando..." : "Gerar Sugestões com IA"}
      </Button>

      {!aiServiceAvailable && (
        <p className="text-xs text-amber-600 mt-2">
          ⚠️ Serviço de IA não configurado. Configure nas preferências.
        </p>
      )}

      {aiSuggestions.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 leading-snug">
          As sugestões aparecem abaixo de cada campo. Campos sequenciais
          expandidos mostram sugestões por item individual.
        </p>
      )}
    </div>
  );
}