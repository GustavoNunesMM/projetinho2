import React, { useEffect, useRef } from "react";
import { renderAsync } from "docx-preview";

import { Question, GabaritoData } from "@/types/question";
import { Layout } from "@/types/layout";
import { Message } from "@/types/messages";
import { useDocumentGenerator } from "@/hooks/wordManager/useDocumentGenerator";

interface DocumentPreviewProps {
  questions: Question[];
  layout: Layout;
  importedHeader?: any[] | null;
  selectedMessage?: Message | null;
  gabaritoData?: GabaritoData | null;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  questions,
  layout,
  importedHeader,
  selectedMessage,
  gabaritoData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { generateDocx } = useDocumentGenerator();

  useEffect(() => {
    if (!containerRef.current || questions.length === 0) return;

    const generatePreview = async () => {
      try {
        const blob = await generateDocx(
          questions,
          layout,
          importedHeader || undefined,
          selectedMessage || undefined,
          gabaritoData || undefined,
        );

        containerRef.current!.innerHTML = "";

        await renderAsync(blob, containerRef.current!, undefined, {
          className: "docx-preview",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
          breakPages: true,
          debug: false,
        });
      } catch (error) {
        console.error("Erro ao gerar preview:", error);
      }
    };

    generatePreview();

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [
    questions,
    layout,
    importedHeader,
    selectedMessage,
    gabaritoData,
    generateDocx,
  ]);

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-full flex items-center justify-center">
        <p className="text-gray-500">
          Selecione questões para visualizar o documento
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Pré-visualização</h2>
        <p className="text-sm text-gray-600 mt-1">
          Visualização idêntica ao documento Word gerado
        </p>
      </div>
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div
          ref={containerRef}
          className="max-w-full mx-auto bg-white shadow"
        />
      </div>
    </div>
  );
};

export default DocumentPreview;