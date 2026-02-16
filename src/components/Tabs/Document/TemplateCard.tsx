import { FileText, Tag, Trash2 } from "lucide-react";

import { DocumentTemplate } from "@/types/documentGeneration";
import Button from "@/components/common/Button";

interface TemplateCardProps {
  template: DocumentTemplate;
  onDelete: () => void;
  onSelect: () => void;
}

const TemplateCard = ({ template, onDelete, onSelect }: TemplateCardProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <button
      className="group bg-white rounded-2xl shadow-md border border-gray-100 p-6 transition-all duration-300 ease-out hover:shadow-xl hover:border-primary-200 hover:scale-[1.02] cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-4 gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary-700 transition-colors duration-300 break-words overflow-wrap-anywhere">
              {template.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {template.fileName}
            </p>
          </div>
        </div>
        <button
          className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            isIconOnly
            aria-label="Excluir template"
            className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all duration-200 hover:scale-110"
            variant="custom"
            onClick={onDelete}
          >
            <Trash2 size={16} />
          </Button>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-hover:bg-primary-50/50 transition-colors duration-300">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <Tag className="text-primary-600" size={16} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Campos ({template.fields.length})
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {template.fields.slice(0, 5).map((field, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-md font-medium"
                >
                  {field.name}
                </span>
              ))}
              {template.fields.length > 5 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                  +{template.fields.length - 5}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>{formatFileSize(template.fileSize)}</span>
          <span>{new Date(template.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </button>
  );
};

export default TemplateCard;