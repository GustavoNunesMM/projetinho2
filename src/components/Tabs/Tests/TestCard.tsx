import {
  FileText,
  Download,
  Eye,
  Calendar,
  BookOpen,
  Building,
  Tag,
  Upload,
  Trash2,
} from "lucide-react";

import { Test } from "@/types/test";

interface TestCardProps {
  test: Test;
  onView: (test: Test) => void;
  onDownload: (test: Test) => void;
  onDelete?: (test: Test) => void;
  format: "block" | "list" | "detail";
}

export const TestCard: React.FC<TestCardProps> = ({
  test,
  onView,
  onDownload,
  onDelete,
  format,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getLayoutPreview = () => {
    if (format === "block") {
      return (
        <div
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
          onClick={() => onView(test)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                  {test.title}
                </h3>
                <p className="text-sm text-gray-500">{test.fileName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                onClick={() => {
                  onView(test);
                }}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                onClick={() => {
                  onDownload(test);
                }}
              >
                <Download className="w-4 h-4" />
              </button>
              {onDelete && (
                <button
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  onClick={() => {
                    onDelete(test);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {test.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {test.subject}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {test.schoolYear}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
              <Building className="w-3 h-3" />
              {test.schoolUnit}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatFileSize(test.fileSize)}</span>
            <span>{new Date(test.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      );
    }

    if (format === "list") {
      return (
        <div
          className="bg-white rounded-lg p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group"
          onClick={() => onView(test)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Upload className="w-8 h-8 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 group-hover:text-primary-600 transition-colors">
                  {test.title}
                </h4>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{test.subject}</span>
                  <span>{test.schoolYear}</span>
                  <span>{formatFileSize(test.fileSize)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                onClick={() => {
                  onView(test);
                }}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                onClick={() => {
                  onDownload(test);
                }}
              >
                <Download className="w-4 h-4" />
              </button>
              {onDelete && (
                <button
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  onClick={() => {
                    onDelete(test);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="bg-white rounded-lg p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={() => onView(test)}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-start gap-3 mb-3">
              <Upload className="w-8 h-8 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors mb-1">
                  {test.title}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{test.fileName}</p>
                <p className="text-gray-600 text-sm">{test.description}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{test.subject}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {test.schoolYear} - {test.quarter}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{test.schoolUnit}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{test.category}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {formatFileSize(test.fileSize)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              onView(test);
            }}
          >
            <Eye className="w-4 h-4" />
            Visualizar
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => {
              onDownload(test);
            }}
          >
            <Download className="w-4 h-4" />
            Baixar
          </button>
          {onDelete && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              onClick={() => {
                onDelete(test);
              }}
            >
              <Trash2 className="w-4 h-4" />
              Deletar
            </button>
          )}
        </div>
      </div>
    );
  };

  return getLayoutPreview();
};