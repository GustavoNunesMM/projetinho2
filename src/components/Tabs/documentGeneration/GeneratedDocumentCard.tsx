import { FileText, Download, Trash2, Calendar } from "lucide-react";
import { GeneratedDocument } from "@/types/documentGeneration";
import Button from "@/components/common/Button";

interface GeneratedDocumentCardProps {
  document: GeneratedDocument;
  onDownload: () => void;
  onDelete: () => void;
}

const GeneratedDocumentCard = ({
  document,
  onDownload,
  onDelete,
}: GeneratedDocumentCardProps) => {
  return (
    <div className="group bg-white rounded-2xl shadow-md border border-gray-100 p-6 transition-all duration-300 ease-out hover:shadow-xl hover:border-primary-200 hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-4 gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 flex-shrink-0 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary-700 transition-colors duration-300 break-words overflow-wrap-anywhere">
              {document.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{document.fileName}</p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <Button
            isIconOnly
            variant="custom"
            onClick={onDownload}
            aria-label="Baixar documento"
            className="w-9 h-9 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <Download size={16} />
          </Button>
          <Button
            isIconOnly
            variant="custom"
            onClick={onDelete}
            aria-label="Excluir documento"
            className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl group-hover:bg-green-50/50 transition-colors duration-300">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <Calendar size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Gerado em
            </p>
            <p className="text-sm font-semibold text-gray-700">
              {new Date(document.createdAt).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        {Object.keys(document.filledFields).length > 0 && (
          <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-green-50/50 transition-colors duration-300">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
              Campos Preenchidos
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(document.filledFields).slice(0, 5).map((key) => (
                <span
                  key={key}
                  className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-md font-medium"
                >
                  {key}
                </span>
              ))}
              {Object.keys(document.filledFields).length > 5 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                  +{Object.keys(document.filledFields).length - 5}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedDocumentCard;
