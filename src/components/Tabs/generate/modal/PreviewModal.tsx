import { useEffect, useRef } from "react";
import { renderAsync } from "docx-preview";
import Button from "@/components/common/Button";
import { X } from "lucide-react";

interface props {
  isPreviewOpen: boolean;
  setIsPreviewOpen: (arg: any) => void;
  previewBlob: Blob | null;
  setPreviewUrl: (arg: any) => void;
}

const PreviewModal = ({
  isPreviewOpen,
  setIsPreviewOpen,
  previewBlob,
  setPreviewUrl,
}: props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPreviewOpen || !previewBlob || !containerRef.current) return;

    containerRef.current.innerHTML = "";

    renderAsync(previewBlob, containerRef.current, undefined, {
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
    }).catch((e) => {
      console.error("docx-preview erro:", e);
    });

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [isPreviewOpen, previewBlob]);

  if (!isPreviewOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Pré-visualização do Documento</h2>
          <button
            onClick={() => {
              setIsPreviewOpen(false);
              setPreviewUrl(null);
            }}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div
            ref={containerRef}
            className="max-w-4xl mx-auto bg-white shadow"
          />
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={() => {
              setIsPreviewOpen(false);
              setPreviewUrl(null);
            }}
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;