import React from "react";
import { Edit, Trash2, List, ListOrdered, MessageSquare, FileText } from "lucide-react";
import { Message } from "@/types/messages";
import Button from "@/components/common/Button";

interface MessageCardProps {
  message: Message;
  onEdit: () => void;
  onDelete: () => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="group bg-white rounded-2xl shadow-md border border-gray-100 p-6 transition-all duration-300 ease-out hover:shadow-xl hover:border-primary-200 hover:scale-[1.01]">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary-700 transition-colors duration-300">
              {message.title}
            </h3>
            {message.isList && (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full font-medium mt-1">
                {message.isOrdered ? (
                  <ListOrdered size={12} />
                ) : (
                  <List size={12} />
                )}
                {message.isOrdered ? "Lista Ordenada" : "Lista"}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <Button
            isIconOnly
            variant="custom"
            onClick={onEdit}
            aria-label="Editar"
            className="w-9 h-9 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <Edit size={16} />
          </Button>
          <Button
            isIconOnly
            variant="custom"
            onClick={onDelete}
            aria-label="Excluir"
            className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-xl group-hover:bg-primary-50/50 transition-colors duration-300">
        {message.isList ? (
          message.isOrdered ? (
            <ol className="space-y-2">
              {message.items.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ol>
          ) : (
            <ul className="space-y-2">
              {message.items.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                  <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )
        ) : (
          <div className="space-y-2">
            {message.items.map((item, index) => (
              <p key={index} className="text-sm text-gray-700 leading-relaxed">
                {item}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <FileText size={12} />
        <span>{message.items.length} {message.items.length === 1 ? 'item' : 'itens'}</span>
      </div>
    </div>
  );
};

export default MessageCard;
