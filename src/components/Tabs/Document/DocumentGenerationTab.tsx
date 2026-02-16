import { useState } from "react";
import { FileText, Loader, Plus } from "lucide-react";

import TemplateCard from "./TemplateCard";
import TemplateUploadModal from "./TemplateUploadModal";
import DocumentGeneratorForm from "./DocumentGeneratorForm";
import GeneratedDocumentCard from "./GeneratedDocumentCard";

import { useDocumentTemplates } from "@/hooks/useDocumentTemplates";
import Button from "@/components/common/Button";
import { Toast } from "@/components/common/Toast";
import DeleteModal from "@/components/modal/DeleteModal";
import {
  DocumentTemplate,
  GeneratedDocument,
} from "@/types/documentGeneration";

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
        <Button
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300"
          icon={Plus}
          variant="custom"
          onClick={() => setIsUploadModalOpen(true)}
        >
          Novo Template
        </Button>
      </div>

      {/* Template Selection or Form */}
      {selectedTemplate ? (
        <DocumentGeneratorForm
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onGenerate={handleGenerate}
        />
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
    </div>
  );
};

export default DocumentGenerationTab;