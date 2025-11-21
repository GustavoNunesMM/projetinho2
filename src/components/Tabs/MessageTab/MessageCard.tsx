import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Edit, Trash2, List, ListOrdered } from "lucide-react";
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
    <Card shadow="sm" className="mb-4">
      <CardBody className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{message.title}</h3>
            {message.isList ? (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                {message.isOrdered ? (
                  <ListOrdered size={12} />
                ) : (
                  <List size={12} />
                )}
                {message.isOrdered ? "Ordenada" : "Lista"}
              </span>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button
              isIconOnly
              variant="light"
              onClick={onEdit}
              aria-label="Editar"
            >
              <Edit size={16} />
            </Button>
            <Button
              isIconOnly
              variant="light-danger"
              onClick={onDelete}
              aria-label="Excluir"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {message.isList ? (
            message.isOrdered ? (
              <ol className="list-decimal list-inside space-y-1">
                {message.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {message.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )
          ) : (
            <div className="space-y-1">
              {message.items.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default MessageCard;
