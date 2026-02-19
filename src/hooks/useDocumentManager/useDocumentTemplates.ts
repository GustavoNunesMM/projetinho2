import { useState, useEffect } from "react";
import { saveAs } from "file-saver";

import {
  getAllDocumentTemplates,
  insertDocumentTemplate,
  deleteDocumentTemplate as deleteTemplateDB,
  getDocumentTemplate,
  insertGeneratedDocument,
  getAllGeneratedDocuments,
  deleteGeneratedDocument as deleteGeneratedDocDB,
  DocumentTemplate as DBTemplate,
  GeneratedDocument as DBGeneratedDocument,
} from "@/database/database";
import { DocumentTemplate } from "@/types/generate.ts";
import { GeneratedDocument } from "@/types/document.ts";
import {
  extractFieldsFromDocx,
  processDocxTemplate,
} from "@/utils/templateProcessor";

function deserializeTemplate(t: DBTemplate): DocumentTemplate {
  return {
    ...t,
    fileContent: t.fileContent || null,
    fields: JSON.parse(t.fields),
    structure:
      typeof (t as any).structure === "string"
        ? JSON.parse((t as any).structure)
        : Array.isArray((t as any).structure)
          ? (t as any).structure
          : [],
  };
}

function deserializeGeneratedDocument(
  d: DBGeneratedDocument,
): GeneratedDocument {
  return {
    ...d,
    fileContent: d.fileContent || null,
    filledFields: JSON.parse(d.filledFields),
  };
}

export const useDocumentTemplates = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [generatedDocuments, setGeneratedDocuments] = useState<
    GeneratedDocument[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
    loadGeneratedDocuments();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDocumentTemplates();
      const deserialized = data.map(deserializeTemplate);

      setTemplates(deserialized);
    } catch (err) {
      const message = `Erro ao carregar templates: ${(err as Error).message}`;

      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  const loadGeneratedDocuments = async () => {
    try {
      const data = await getAllGeneratedDocuments();
      const deserialized = data.map(deserializeGeneratedDocument);

      setGeneratedDocuments(deserialized);
    } catch (err) {
      console.error("Erro ao carregar documentos gerados:", err);
    }
  };

  const uploadTemplate = async (file: File): Promise<DocumentTemplate> => {
    try {
      setError(null);

      const fields = await extractFieldsFromDocx(file);

      const fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const chunkSize = 0x8000; // 32KB chunks
      let base64String = "";

      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);

        base64String += String.fromCharCode.apply(null, Array.from(chunk));
      }
      base64String = btoa(base64String);

      const templateData = {
        name: fileName.replace(/\.docx?$/i, ""),
        filePath: "",
        fileName,
        fileSize: file.size,
        fileContent: base64String,
        fields: JSON.stringify(fields),
      };

      const saved = await insertDocumentTemplate(templateData);
      const deserialized = deserializeTemplate(saved);

      setTemplates((prev) => [deserialized, ...prev]);
      await loadTemplates();

      return deserialized;
    } catch (err) {
      const message = `Erro ao fazer upload do template: ${(err as Error).message}`;

      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  const deleteTemplate = async (id: number): Promise<void> => {
    try {
      setError(null);
      templates.find((t) => t.id === id);

      await deleteTemplateDB(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const message = `Erro ao deletar template: ${(err as Error).message}`;

      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  const generateDocument = async (
    templateId: number,
    fieldValues: Record<string, string | string[]>,
    documentName: string,
  ): Promise<GeneratedDocument> => {
    try {
      setError(null);

      const templateData = await getDocumentTemplate(templateId);

      if (!templateData) {
        throw new Error("Template não encontrado");
      }

      const template = deserializeTemplate(templateData);

      let templateBlob: Blob;

      if (template.fileContent) {
        const binaryString = atob(template.fileContent);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        templateBlob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
      } else {
        throw new Error("Template não possui conteúdo armazenado");
      }

      const expandedFieldValues: Record<string, string | string[]> = {
        ...fieldValues,
      };

      console.log("Template fields:", template.fields);
      console.log("Field values recebidos:", fieldValues);

      template.fields.forEach((field) => {
        if (field.sequentialIndices && field.sequentialIndices.length > 0) {
          const arrayValue = fieldValues[field.name];

          console.log(
            `Campo sequencial: ${field.name}, indices:`,
            field.sequentialIndices,
            "valores:",
            arrayValue,
          );
          if (Array.isArray(arrayValue)) {
            const sortedIndices = [...field.sequentialIndices].sort(
              (a, b) => a - b,
            );

            sortedIndices.forEach((index, arrayIndex) => {
              if (arrayValue[arrayIndex] !== undefined) {
                const key = `${field.name}_${index}`;

                expandedFieldValues[key] = arrayValue[arrayIndex];
                console.log(`Expandindo: ${key} = ${arrayValue[arrayIndex]}`);
              }
            });
          }
        }
      });

      console.log("Expanded field values:", expandedFieldValues);

      const processedBlob = await processDocxTemplate(
        templateBlob,
        expandedFieldValues,
      );

      const fileName = `${documentName || "documento_gerado"}_${Date.now()}.docx`;
      const arrayBuffer = await processedBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const chunkSize = 0x8000; // 32KB chunks
      let base64String = "";

      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);

        base64String += String.fromCharCode.apply(null, Array.from(chunk));
      }
      base64String = btoa(base64String);

      const serializableFieldValues: Record<string, string> = {};

      Object.keys(fieldValues).forEach((key) => {
        const value = fieldValues[key];

        if (Array.isArray(value)) {
          value.forEach((v, i) => {
            serializableFieldValues[`${key}_${i + 1}`] = v;
          });
        } else {
          serializableFieldValues[key] = value;
        }
      });

      const documentData = {
        templateId,
        name: documentName || "Documento Gerado",
        filePath: "",
        fileName,
        fileContent: base64String,
        filledFields: JSON.stringify(serializableFieldValues),
      };

      const saved = await insertGeneratedDocument(documentData);
      const deserialized = deserializeGeneratedDocument(saved);

      setGeneratedDocuments((prev) => [deserialized, ...prev]);
      await loadGeneratedDocuments();

      saveAs(processedBlob, fileName);

      return deserialized;
    } catch (err) {
      const message = `Erro ao gerar documento: ${(err as Error).message}`;

      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  const downloadGeneratedDocument = async (
    documentId: number,
  ): Promise<void> => {
    try {
      const document = generatedDocuments.find((d) => d.id === documentId);

      if (!document) {
        throw new Error("Documento não encontrado");
      }

      if (!document.fileContent) {
        throw new Error("Documento não possui conteúdo armazenado");
      }

      const binaryString = atob(document.fileContent);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      saveAs(blob, document.fileName);
    } catch (err) {
      const message = `Erro ao baixar documento: ${(err as Error).message}`;

      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  const deleteGeneratedDocument = async (id: number): Promise<void> => {
    try {
      setError(null);
      generatedDocuments.find((d) => d.id === id);

      await deleteGeneratedDocDB(id);
      setGeneratedDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      const message = `Erro ao deletar documento: ${(err as Error).message}`;

      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  return {
    templates,
    generatedDocuments,
    loading,
    error,
    uploadTemplate,
    deleteTemplate,
    generateDocument,
    downloadGeneratedDocument,
    deleteGeneratedDocument,
    refreshTemplates: loadTemplates,
    refreshGeneratedDocuments: loadGeneratedDocuments,
  };
};