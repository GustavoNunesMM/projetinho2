"use client";

import { Input } from "@heroui/react";

import { InlineSuggestion } from "./InlineSuggestion.tsx";

import { UniqueFieldsListProps } from "@/types/document.ts";

export function UniqueFieldsList({
  fields,
  fieldValues,
  suggestionMap,
  aiLoading,
  onFieldChange,
  onApplyAISuggestion,
}: UniqueFieldsListProps) {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Campos Únicos
      </h4>

      {fields.map((field) => {
        const suggestion = suggestionMap[field.name];

        return (
          <div key={field.name}>
            <Input
              classNames={{ input: "text-sm", label: "text-sm" }}
              label={field.name}
              placeholder={`Digite o valor para ${field.name.toLowerCase()}`}
              value={(fieldValues[field.name] as string) || ""}
              variant="bordered"
              onChange={(e) => onFieldChange(field.name, e.target.value)}
            />

            {suggestion && !aiLoading && (
              <InlineSuggestion
                suggestion={suggestion}
                onApplyAll={() => onApplyAISuggestion(field.name, suggestion)}
              />
            )}

            {aiLoading && (
              <div className="mt-1.5 h-8 rounded-lg bg-purple-50 border border-purple-100 animate-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
}