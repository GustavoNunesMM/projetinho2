import React, { useState, useRef } from "react";
import { Plus, FileUp, Loader } from "lucide-react";
import MessageCard from "./MessageCard";
import MessageModal from "./MessageModal";
import Button from "@/components/common/Button";
import { Toast } from "@/components/common/Toast";
import { Message, MessageFormData } from "@/types/messages";
import { useMessages } from "@/hooks/useMessages";

const MessagesTab = () => {
  const {
    messages,
    loading,
    error,
    addMessage,
    updateMessage,
    deleteMessage,
    importMultipleMessages,
  } = useMessages();

  const [showModal, setShowModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [importing, setImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setShowModal(true);
  };

  const handleSave = async (messageData: MessageFormData) => {
    try {
      if (editingMessage) {
        await updateMessage(editingMessage.id, messageData);
        Toast({ message: "Texto atualizada com sucesso!" });
      } else {
        await addMessage(messageData);
        Toast({ message: "Texto criada com sucesso!" });
      }
      setShowModal(false);
      setEditingMessage(null);
    } catch (err) {
      Toast({ message: String(err) });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir esta texto?")) {
      return;
    }

    try {
      await deleteMessage(id);
      Toast({ message: "Texto excluída com sucesso!" });
    } catch (err) {
      Toast({ message: `Erro ao excluir: ${err}` });
    }
  };

  const handleLocalImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const importedMessages = await importMultipleMessages(file);
      Toast({
        message: `${importedMessages.length} texto(s) importada(s) com sucesso!`,
      });
    } catch (error) {
      Toast({ message: `Erro ao importar: ${(error as Error).message}` });
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin mr-2" />
        <span>Carregando mensagens...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Recarregar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar texto de instruções </h2>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLocalImport}
            accept=".txt,.docx"
            className="hidden"
            disabled={importing}
          />

          <Button
            variant="success"
            icon={importing ? Loader : FileUp}
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? "Importando..." : "Importar"}
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setEditingMessage(null);
              setShowModal(true);
            }}
          >
            Nova Texto
          </Button>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">
            Nenhuma texto cadastrada ainda.
          </p>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowModal(true)}
          >
            Criar Primeira Texto
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onEdit={() => handleEdit(message)}
              onDelete={() => handleDelete(message.id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <MessageModal
          message={editingMessage}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingMessage(null);
          }}
        />
      )}
    </div>
  );
};

export default MessagesTab;