import { TemplateField } from "@/types/generate.ts";

export interface GeneratedDocument {
  id: number;
  templateId: number;
  name: string;
  filePath: string;
  fileName: string;
  fileContent?: string | null;
  filledFields: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface AIFieldSuggestion {
  fieldName: string;
  suggestedValue: string | string[];
  confidence: number;
  reasoning: string;
  sources?: string[];
  isSequential?: boolean;
}

export interface DefaultValuesProvider {
  getDefaultValues(template: TemplateField): Record<string, string | string[]>;
}

export interface SequentialFieldsListProps {
  fields: TemplateField[];
  fieldValues: Record<string, string | string[]>;
  patterns: Record<string, string>;
  expandedSequential: Set<string>;
  suggestionMap: Record<string, AIFieldSuggestion>;
  aiLoading: boolean;
  onToggleExpand: (fieldName: string) => void;
  onPatternChange: (fieldName: string, value: string) => void;
  onFillAll: (fieldName: string, value: string) => void;
  onSlotChange: (fieldName: string, arrayIndex: number, value: string) => void;
  onApplyAll: (fieldName: string, suggestion: AIFieldSuggestion) => void;
  onApplyIndividual: (
    fieldName: string,
    suggestion: AIFieldSuggestion,
    arrayIndex: number,
  ) => void;
}

export interface SequentialFieldItemProps {
  field: TemplateField;
  currentValues: string[];
  pattern: string;
  isExpanded: boolean;
  suggestion?: AIFieldSuggestion;
  aiLoading: boolean;
  onToggleExpand: () => void;
  onPatternChange: (value: string) => void;
  onFillAll: (value: string) => void;
  onSlotChange: (arrayIndex: number, value: string) => void;
  onApplyAll: (suggestion: AIFieldSuggestion) => void;
  onApplyIndividual: (
    suggestion: AIFieldSuggestion,
    arrayIndex: number,
  ) => void;
  onExpandForIndividual: () => void;
}

export interface UniqueFieldsListProps {
  fields: TemplateField[];
  fieldValues: Record<string, string | string[]>;
  suggestionMap: Record<string, AIFieldSuggestion>;
  aiLoading: boolean;
  onFieldChange: (fieldName: string, value: string) => void;
  onApplyAISuggestion: (
    fieldName: string,
    suggestion: AIFieldSuggestion,
  ) => void;
}

export interface InlineItemSuggestionProps {
  value: string;
  confidence: number;
  reasoning?: string;
  onApply: () => void;
}

export interface InlineSuggestionProps {
  suggestion: AIFieldSuggestion;
  onApplyAll: () => void;
  onExpandHint?: () => void;
}

export interface TemplateCardProps {
  template: TemplateField;
  onDelete: () => void;
  onSelect: () => void;
}

export interface AIContextPanelProps {
  aiContext: string;
  onAiContextChange: (value: string) => void;
  onGenerateAISuggestions: () => void;
  onRegenerate: () => void;
  aiLoading: boolean;
  aiServiceAvailable: boolean;
  aiSuggestions: AIFieldSuggestion[];
}