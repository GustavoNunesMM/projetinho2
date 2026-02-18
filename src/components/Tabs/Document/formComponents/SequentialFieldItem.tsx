"use client";

import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { Input } from "@heroui/react";

import { InlineSuggestion, InlineItemSuggestion } from "./InlineSuggestion.tsx";

import Button from "@/components/common/Button.tsx";
import {
  SequentialFieldsListProps,
  SequentialFieldItemProps,
} from "@/types/document.ts";

export function SequentialFieldItem({
  field,
  currentValues,
  pattern,
  isExpanded,
  suggestion,
  aiLoading,
  onToggleExpand,
  onPatternChange,
  onFillAll,
  onSlotChange,
  onApplyAll,
  onApplyIndividual,
  onExpandForIndividual,
}: SequentialFieldItemProps) {
  const sortedIndices = field.sequentialIndices
    ? [...field.sequentialIndices].sort((a, b) => a - b)
    : [];

  function slotSuggestionValue(arrayIndex: number): string {
    if (!suggestion) return "";
    if (Array.isArray(suggestion.suggestedValue)) {
      return suggestion.suggestedValue[arrayIndex] ?? "";
    }

    return suggestion.suggestedValue as string;
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">
          {field.name}{" "}
          <span className="font-normal text-gray-400">
            ({sortedIndices.length} ocorrências)
          </span>
        </label>
        <Button
          isIconOnly
          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg"
          variant="custom"
          onClick={onToggleExpand}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          classNames={{ input: "text-xs", base: "flex-1" }}
          placeholder="Valor ou padrão (use {n} para índice)"
          size="sm"
          value={pattern}
          variant="bordered"
          onChange={(e) => onPatternChange(e.target.value)}
        />
        <Button
          className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 text-xs"
          icon={Copy}
          variant="custom"
          onClick={() => onFillAll(pattern)}
        >
          Todos
        </Button>
      </div>

      {!isExpanded ? (
        <>
          {suggestion && !aiLoading && (
            <InlineSuggestion
              suggestion={suggestion}
              onApplyAll={() => onApplyAll(suggestion)}
              onExpandHint={onExpandForIndividual}
            />
          )}
          {aiLoading && (
            <div className="h-8 rounded-lg bg-purple-50 border border-purple-100 animate-pulse" />
          )}
        </>
      ) : (
        <div className="space-y-2 pt-1">
          {sortedIndices.map((originalIndex, arrayIndex) => {
            const itemValue = slotSuggestionValue(arrayIndex);

            return (
              <div key={`${field.name}_${originalIndex}`}>
                <Input
                  classNames={{ input: "text-xs", label: "text-xs" }}
                  label={`${field.name} #${originalIndex}`}
                  size="sm"
                  value={currentValues[arrayIndex] || ""}
                  variant="bordered"
                  onChange={(e) => onSlotChange(arrayIndex, e.target.value)}
                />

                {suggestion && !aiLoading && itemValue && (
                  <InlineItemSuggestion
                    confidence={suggestion.confidence}
                    reasoning={suggestion.reasoning}
                    value={itemValue}
                    onApply={() => onApplyIndividual(suggestion, arrayIndex)}
                  />
                )}

                {aiLoading && (
                  <div className="mt-1 h-6 rounded-md bg-purple-50 border border-purple-100 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SequentialFieldsList({
  fields,
  fieldValues,
  patterns,
  expandedSequential,
  suggestionMap,
  aiLoading,
  onToggleExpand,
  onPatternChange,
  onFillAll,
  onSlotChange,
  onApplyAll,
  onApplyIndividual,
}: SequentialFieldsListProps) {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Campos Sequenciais
      </h4>

      {fields.map((field) => {
        const currentValues = Array.isArray(fieldValues[field.name])
          ? (fieldValues[field.name] as string[])
          : [];

        return (
          <SequentialFieldItem
            key={field.name}
            aiLoading={aiLoading}
            currentValues={currentValues}
            field={field}
            isExpanded={expandedSequential.has(field.name)}
            pattern={patterns[field.name] || ""}
            suggestion={suggestionMap[field.name]}
            onApplyAll={(s) => onApplyAll(field.name, s)}
            onApplyIndividual={(s, idx) =>
              onApplyIndividual(field.name, s, idx)
            }
            onExpandForIndividual={() => onToggleExpand(field.name)}
            onFillAll={(val) => onFillAll(field.name, val)}
            onPatternChange={(val) => onPatternChange(field.name, val)}
            onSlotChange={(idx, val) => onSlotChange(field.name, idx, val)}
            onToggleExpand={() => onToggleExpand(field.name)}
          />
        );
      })}
    </div>
  );
}