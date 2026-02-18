import { useState, useEffect, useRef } from "react";
import { FileText, Loader, Plus, Sparkles } from "lucide-react";

import TemplateCard from "./TemplateCard";
import TemplateUploadModal from "./TemplateUploadModal";
import DocumentGeneratorForm, {
  DocumentGeneratorFormRef,
} from "./DocumentGeneratorForm";
import GeneratedDocumentCard from "./GeneratedDocumentCard";
import DefaultValuesManager from "./DefaultValuesManager";

import { AIAssistantPanel } from "@/components/AiAssist/AIAssistantPanel.tsx";
import { useDocumentTemplates } from "@/hooks/useDocumentManager/useDocumentTemplates";
import Button from "@/components/common/Button";
import { Toast } from "@/components/common/Toast";
import DeleteModal from "@/components/modal/DeleteModal";
import Textarea from "@/components/common/Textarea";
import {
  DocumentTemplate,
  GeneratedDocument,
  AIFieldSuggestion,
} from "@/types/documentGeneration";
import { AIDocumentService } from "@/services/aiService";

const DocumentGenerationTab = () => {
  const {
    templates,
    generatedDocuments,
    loading,
    error,
    uploadTemplate,
    deleteTemplate,
    generateDocument,
    downloadGeneratedDocument,
    deleteGeneratedDocument,
  } = useDocumentTemplates();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocumentTemplate | null>(null);
  const [deleteTemplateModal, setDeleteTemplateModal] = useState(false);
  const [deleteDocumentModal, setDeleteDocumentModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<DocumentTemplate | null>(null);
  const [documentToDelete, setDocumentToDelete] =
    useState<GeneratedDocument | null>(null);

  const [isDefaultValuesManagerOpen, setIsDefaultValuesManagerOpen] =
    useState(false);
  const [defaultValues, setDefaultValues] = useState<
    Record<string, string | string[]>
  >({});

  const formRef = useRef<DocumentGeneratorFormRef>(null);

  const [aiContext, setAiContext] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<AIFieldSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiService, setAiService] = useState<AIDocumentService | null>(null);

  useEffect(() => {
    const loadAIService = () => {
      try {
        const aiConfig = localStorage.getItem("aiServiceConfig");

        if (aiConfig) {
          const config = JSON.parse(aiConfig);

          setAiService(new AIDocumentService(config));
        }
      } catch (error) {
        console.warn("Erro ao carregar configuração de IA:", error);
      }
    };

    loadAIService();
  }, []);

  const handleGenerateAISuggestions = async () => {
    if (!selectedTemplate) {
      Toast({
        message: "Selecione um template primeiro",
        color: "warning",
      });

      return;
    }

    if (!aiContext.trim()) {
      Toast({
        message: "Por favor, forneça um contexto para a IA gerar sugestões.",
        color: "warning",
      });

      return;
    }

    if (!aiService) {
      Toast({
        message: "Serviço de IA não configurado. Configure nas preferências.",
        color: "danger",
      });

      return;
    }

    try {
      setAiLoading(true);

      const suggestions = await aiService.suggestFieldValues(
        selectedTemplate,
        aiContext,
      );

      setAiSuggestions(suggestions);
      Toast({
        message: `${suggestions.length} sugestões geradas com sucesso!`,
        color: "success",
      });
    } catch (error) {
      console.error("Erro ao gerar sugestões de IA:", error);
      Toast({
        message: `Erro ao gerar sugestões: ${(error as Error).message}`,
        color: "danger",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAISuggestion = (
    fieldName: string,
    _suggestion: AIFieldSuggestion,
    _applyTo?: "all" | "individual",
  ) => {
    Toast({
      message: `Sugestão aplicada ao campo ${fieldName}`,
      color: "success",
    });
  };

  const handleUpload = async (file: File) => {
    try {
      await uploadTemplate(file);
      Toast({
        message: "Template uploaded successfully!",
        color: "success",
      });
    } catch (error: any) {
      Toast({
        message: error.message || "Error uploading template",
        color: "danger",
      });
      throw error;
    }
  };

  const handleDeleteTemplate = (template: DocumentTemplate) => {
    setTemplateToDelete(template);
    setDeleteTemplateModal(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    try {
      await deleteTemplate(templateToDelete.id);
      Toast({
        message: "Template excluído com sucesso!",
        color: "success",
      });
      setDeleteTemplateModal(false);
      setTemplateToDelete(null);
    } catch (error: any) {
      Toast({
        message: error.message || "Erro ao excluir template",
        color: "danger",
      });
    }
  };

  const handleGenerate = async (
    fieldValues: Record<string, string | string[]>,
    documentName: string,
  ) => {
    if (!selectedTemplate) return;

    try {
      await generateDocument(selectedTemplate.id, fieldValues, documentName);
      Toast({
        message: "Documento gerado com sucesso!",
        color: "success",
      });
      setSelectedTemplate(null);
    } catch (error: any) {
      Toast({
        message: error.message || "Erro ao gerar documento",
        color: "danger",
      });
      throw error;
    }
  };

  const handleDownload = async (id: number) => {
    try {
      await downloadGeneratedDocument(id);
      Toast({
        message: "Download iniciado!",
        color: "success",
      });
    } catch (error: any) {
      Toast({
        message: error.message || "Erro ao baixar documento",
        color: "danger",
      });
    }
  };

  const handleDeleteGenerated = (document: GeneratedDocument) => {
    setDocumentToDelete(document);
    setDeleteDocumentModal(true);
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;
    try {
      await deleteGeneratedDocument(documentToDelete.id);
      Toast({
        message: "Documento excluído com sucesso!",
        color: "success",
      });
      setDeleteDocumentModal(false);
      setDocumentToDelete(null);
    } catch (error: any) {
      Toast({
        message: error.message || "Erro ao excluir documento",
        color: "danger",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
          <Loader className="w-8 h-8 text-white animate-spin" />
        </div>
        <p className="mt-4 text-gray-600 font-medium">
          Carregando templates...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
            Geração de Documentação
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Crie documentos a partir de templates com campos preenchíveis
          </p>
        </div>
        <div className="flex gap-2 ">
          <Button
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300"
            icon={Plus}
            variant="custom"
            onClick={() => setIsUploadModalOpen(true)}
          >
            Novo Template
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm"
            variant="custom"
            onClick={() => setIsDefaultValuesManagerOpen(true)}
          >
            Gerenciar Valores Padrões
          </Button>
        </div>
      </div>

      {/* Template Selection or Form */}
      {selectedTemplate ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Principal */}
          <div className="lg:col-span-2">
            <DocumentGeneratorForm
              ref={formRef}
              defaultValues={defaultValues}
              template={selectedTemplate}
              onApplyAISuggestion={(fieldName, suggestion, applyTo) => {
                // Confirmação de aplicação
                handleApplyAISuggestion(fieldName, suggestion, applyTo);
              }}
              onClose={() => {
                setSelectedTemplate(null);
                setAiSuggestions([]);
                setAiContext("");
                setDefaultValues({});
              }}
              onGenerate={handleGenerate}
            />
          </div>

          {/* Painel de IA */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Campo de Contexto */}
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Assistente IA
                  </h3>
                </div>
                <Textarea
                  placeholder="Descreva o contexto do documento (ex: Plano de aula para 3º ano, tema: Meio Ambiente)..."
                  rows={4}
                  value={aiContext}
                  onChange={(e) =>
                    setAiContext((e.target as HTMLInputElement).value)
                  }
                />
                <Button
                  className="w-full mt-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
                  disabled={aiLoading || !aiContext.trim() || !aiService}
                  icon={Sparkles}
                  variant="custom"
                  onClick={handleGenerateAISuggestions}
                >
                  {aiLoading ? "Gerando..." : "Gerar Sugestões com IA"}
                </Button>
                {!aiService && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ Serviço de IA não configurado. Configure nas
                    preferências.
                  </p>
                )}
              </div>

              {/* Painel de Sugestões */}
              <AIAssistantPanel
                loading={aiLoading}
                suggestions={aiSuggestions}
                onApplySuggestion={(fieldName, suggestion, applyTo) => {
                  // Aplicar sugestão diretamente no form através da ref
                  if (formRef.current) {
                    formRef.current.applyAISuggestion(
                      fieldName,
                      suggestion,
                      applyTo,
                    );
                    // Confirmar aplicação
                    handleApplyAISuggestion(fieldName, suggestion, applyTo);
                  }
                }}
                onRegenerate={handleGenerateAISuggestions}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Templates Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Templates Disponíveis ({templates.length})
            </h3>
            {templates.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium mb-2">
                  Nenhum template cadastrado
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Comece fazendo upload de um template DOCX com campos marcados
                </p>
                <Button
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300"
                  icon={Plus}
                  variant="custom"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  Adicionar Primeiro Template
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onDelete={() => handleDeleteTemplate(template)}
                    onSelect={() => setSelectedTemplate(template)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Generated Documents Section */}
          {generatedDocuments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Documentos Gerados ({generatedDocuments.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedDocuments.map((document) => (
                  <GeneratedDocumentCard
                    key={document.id}
                    document={document}
                    onDelete={() => handleDeleteGenerated(document)}
                    onDownload={() => handleDownload(document.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      <TemplateUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      {/* Delete Template Modal */}
      {deleteTemplateModal && templateToDelete && (
        <DeleteModal
          elementName={templateToDelete.name}
          isOpen={deleteTemplateModal}
          type="template"
          onClose={() => {
            setDeleteTemplateModal(false);
            setTemplateToDelete(null);
          }}
          onSubmit={confirmDeleteTemplate}
        />
      )}

      {/* Delete Document Modal */}
      {deleteDocumentModal && documentToDelete && (
        <DeleteModal
          elementName={documentToDelete.name}
          isOpen={deleteDocumentModal}
          type="document"
          onClose={() => {
            setDeleteDocumentModal(false);
            setDocumentToDelete(null);
          }}
          onSubmit={confirmDeleteDocument}
        />
      )}

      <DefaultValuesManager
        isOpen={isDefaultValuesManagerOpen}
        onApply={(values: Record<string, string | string[]>) => {
          setDefaultValues(values);
          Toast({
            message: "Valores padrões aplicados com sucesso!",
            color: "success",
          });
        }}
        onClose={() => setIsDefaultValuesManagerOpen(false)}
      />
    </div>
  );
};

export default DocumentGenerationTab;