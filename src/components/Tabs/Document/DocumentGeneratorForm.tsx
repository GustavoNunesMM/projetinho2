"use client";

import { useImperativeHandle, forwardRef } from "react";
import { FileText, Sparkles, Wand2, X } from "lucide-react";
import { Input } from "@heroui/react";

import { AIContextPanel } from "./formComponents/AIContextPanel.tsx";
import { UniqueFieldsList } from "./formComponents/UniqueFieldsList.tsx";
import { SequentialFieldsList } from "./formComponents/SequentialFieldItem.tsx";

import { useDocumentForm } from "@/hooks/useDocumentForm";
import { DocumentTemplate } from "@/types/generate.ts";
import { AIFieldSuggestion, DefaultValuesProvider } from "@/types/document.ts";
import Button from "@/components/common/Button";

export interface DocumentGeneratorFormRef {
  applyAISuggestion: (
    fieldName: string,
    suggestion: AIFieldSuggestion,
    applyTo?: "all" | "individual",
    arrayIndex?: number,
  ) => void;
}

interface DocumentGeneratorFormProps {
  template: DocumentTemplate;
  onClose: () => void;
  onGenerate: (
    fieldValues: Record<string, string | string[]>,
    documentName: string,
  ) => Promise<void>;
  defaultValuesProvider?: DefaultValuesProvider;
  defaultValues?: Record<string, string | string[]>;
  aiSuggestions?: AIFieldSuggestion[];
  aiLoading: boolean;
  onRegenerate: () => void;
  onApplyAISuggestion?: (
    fieldName: string,
    suggestion: AIFieldSuggestion,
    applyTo?: "all" | "individual",
  ) => void;
  aiContext?: string;
  onAiContextChange?: (value: string) => void;
  onGenerateAISuggestions?: () => void;
  aiServiceAvailable?: boolean;
}

const DocumentGeneratorForm = forwardRef<
  DocumentGeneratorFormRef,
  DocumentGeneratorFormProps
>(
  (
    {
      template,
      onGenerate,
      onClose,
      defaultValuesProvider,
      defaultValues: externalDefaultValues = {},
      aiSuggestions = [],
      aiLoading,
      onRegenerate,
      onApplyAISuggestion,
      aiContext = "",
      onAiContextChange,
      onGenerateAISuggestions,
      aiServiceAvailable = true,
    },
    ref,
  ) => {
    const {
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
    } = useDocumentForm({
      template,
      externalDefaultValues,
      defaultValuesProvider,
      onApplyAISuggestionCallback: onApplyAISuggestion,
      onGenerate,
    });

    const suggestionMap = aiSuggestions.reduce<
      Record<string, AIFieldSuggestion>
    >((acc, s) => {
      acc[s.fieldName] = s;

      return acc;
    }, {});

    useImperativeHandle(ref, () => ({
      applyAISuggestion: handleApplyAISuggestion,
    }));

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-800 truncate">
                Preencher Template: {template.name}
              </h3>
              <p className="text-xs text-gray-500">
                Preencha os campos abaixo para gerar o documento
              </p>
            </div>
          </div>
          <button
            aria-label="Fechar"
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all shrink-0 ml-3"
            onClick={onClose}
          >
            <X className="text-gray-500" size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col">
            <div className="space-y-4 overflow-y-auto max-h-[65vh] pr-1 flex-1">
              <Input
                classNames={{ input: "text-sm", label: "text-sm" }}
                label="Nome do Documento"
                placeholder="Digite o nome do documento gerado"
                value={documentName}
                variant="bordered"
                onChange={(e) => setDocumentName(e.target.value)}
              />

              {defaultValuesProvider && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2">
                        <Wand2 className="w-4 h-4" />
                        Valores Padrão Disponíveis
                      </h4>
                      <p className="text-xs text-green-600 mt-0.5">
                        Preencha automaticamente com valores pré-configurados
                      </p>
                    </div>
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shrink-0"
                      icon={Wand2}
                      variant="custom"
                      onClick={handleApplyDefaultValues}
                    >
                      Aplicar Padrões
                    </Button>
                  </div>
                </div>
              )}

              <UniqueFieldsList
                aiLoading={aiLoading}
                fieldValues={fieldValues}
                fields={uniqueFields}
                suggestionMap={suggestionMap}
                onApplyAISuggestion={(fieldName, suggestion) =>
                  handleApplyAISuggestion(fieldName, suggestion, "all")
                }
                onFieldChange={handleFieldChange}
              />

              <SequentialFieldsList
                aiLoading={aiLoading}
                expandedSequential={expandedSequential}
                fieldValues={fieldValues}
                fields={sequentialFields}
                patterns={patterns}
                suggestionMap={suggestionMap}
                onApplyAll={(fieldName, suggestion) =>
                  handleApplyAISuggestion(fieldName, suggestion, "all")
                }
                onApplyIndividual={(fieldName, suggestion, arrayIndex) =>
                  handleApplyAISuggestion(
                    fieldName,
                    suggestion,
                    "individual",
                    arrayIndex,
                  )
                }
                onFillAll={handleFillAllSequential}
                onPatternChange={handlePatternChange}
                onSlotChange={handleSequentialFieldChange}
                onToggleExpand={toggleSequentialExpanded}
              />
            </div>

            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-100">
              <Button
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                  !documentName.trim() || generating
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl"
                }`}
                disabled={!documentName.trim() || generating}
                icon={Sparkles}
                variant="custom"
                onClick={handleGenerate}
              >
                {generating ? "Gerando..." : "Gerar Documento"}
              </Button>
              <Button
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl"
                variant="custom"
                onClick={onClose}
              >
                Cancelar
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <AIContextPanel
              aiContext={aiContext}
              aiLoading={aiLoading}
              aiServiceAvailable={aiServiceAvailable}
              aiSuggestions={aiSuggestions}
              onAiContextChange={(v) => onAiContextChange?.(v)}
              onGenerateAISuggestions={() => onGenerateAISuggestions?.()}
              onRegenerate={onRegenerate}
            />
          </div>
        </div>
      </div>
    );
  },
);

DocumentGeneratorForm.displayName = "DocumentGeneratorForm";

export default DocumentGeneratorForm;