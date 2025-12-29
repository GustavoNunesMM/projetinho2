import React, { useState, useRef } from "react";
import { Plus, FileUp, Loader, MessageSquare, FileText } from "lucide-react";
import MessageCard from "./MessageCard";
import MessageModal from "./MessageModal";
import Button from "@/components/common/Button";
import { deleteAllMessages } from "@/database/database";
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
        Toast({ message: "Texto atualizado com sucesso!" });
      } else {
        await addMessage(messageData);
        Toast({ message: "Texto criado com sucesso!" });
      }
      setShowModal(false);
      setEditingMessage(null);
    } catch (err) {
      Toast({ message: String(err) });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir este texto?")) {
      return;
    }

    try {
      await deleteMessage(id);
      Toast({ message: "Texto excluído com sucesso!" });
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
        message: `${importedMessages.length} texto(s) importado(s) com sucesso!`,
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
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl animate-pulseGlow">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
        <p className="mt-6 text-lg font-medium text-gray-700">
          Carregando textos...
        </p>
        <p className="text-sm text-gray-500 mt-1">Aguarde um momento</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 animate-fadeIn">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-600 font-medium mb-2">Erro ao carregar</p>
        <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">{error}</p>
        <Button
          variant="custom"
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
        >
          Recarregar Página
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-slideUp">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
              Textos de Instruções
            </h2>
            <p className="text-sm text-gray-500">
              {messages.length} textos cadastrados
            </p>
          </div>
        </div>
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
            variant="custom"
            icon={importing ? Loader : FileUp}
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-[#97dffc] hover:bg-[#87cfe8] text-gray-800 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium border border-[#87cfe8]"
          >
            {importing ? "Importando..." : "Importar"}
          </Button>
          <Button
            variant="light-danger"
            onClick={() => deleteAllMessages()}
            className="  px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium "
          >
            Deletar questões
          </Button>
          <Button
            variant="custom"
            icon={Plus}
            onClick={() => {
              setEditingMessage(null);
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
          >
            Novo Texto
          </Button>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-inner animate-scaleIn">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
            <FileText className="w-10 h-10 text-primary-500" />
          </div>
          <p className="text-gray-600 font-medium mb-2">
            Nenhum texto cadastrado
          </p>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Crie textos de instruções para usar em suas provas e avaliações.
          </p>
          <Button
            variant="custom"
            icon={Plus}
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
          >
            Criar Primeiro Texto
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className="animate-slideUp"
              style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
            >
              <MessageCard
                message={message}
                onEdit={() => handleEdit(message)}
                onDelete={() => handleDelete(message.id)}
              />
            </div>
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
