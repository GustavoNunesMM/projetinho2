import { useState, useEffect } from "react";
import { Message, MessageFormData } from "@/types/messages";
import {
  getAllMessages,
  insertMessage,
  updateMessage as updateMessageDB,
  deleteMessage as deleteMessageDB,
} from "../database/database";

function serializeMessage(m: MessageFormData) {
  return {
    ...m,
    items: JSON.stringify(m.items),
  };
}

function deserializeMessage(m: any): Message {
  return {
    ...m,
    items: typeof m.items === "string" ? JSON.parse(m.items) : [],
  };
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllMessages();
      const deserialized = data.map(deserializeMessage);
      setMessages(deserialized);
    } catch (err) {
      const message = `Erro ao carregar mensagens: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (message: MessageFormData): Promise<Message> => {
    try {
      const serialized = serializeMessage(message);
      const saved = await insertMessage(serialized as any);
      const deserialized = deserializeMessage(saved);
      setMessages((prev) => [deserialized, ...prev]);
      await loadMessages();
      return deserialized;
    } catch (err) {
      const message = `Erro ao adicionar texto: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  const updateMessage = async (
    id: number,
    updatedMessage: MessageFormData
  ): Promise<void> => {
    try {
      const serialized = serializeMessage(updatedMessage);
      await updateMessageDB(id, serialized as any);
      const data = await getAllMessages();
      const deserialized = data.map(deserializeMessage);
      setMessages(deserialized);
    } catch (err) {
      const message = `Erro ao atualizar texto: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  const deleteMessage = async (id: number): Promise<void> => {
    try {
      await deleteMessageDB(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      const message = `Erro ao deletar texto: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  const importMultipleMessages = async (file: File): Promise<Message[]> => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error("Nenhuma texto encontrada no arquivo");
      }

      const importedMessages: Message[] = [];

      for (const line of lines) {
        const messageData: MessageFormData = {
          title: `Texto importada - ${new Date().toLocaleString()}`,
          items: [line.trim()],
          isList: false,
          isOrdered: false,
        };

        const saved = await addMessage(messageData);
        importedMessages.push(saved);
      }

      return importedMessages;
    } catch (err) {
      const message = `Erro ao importar mensagens: ${(err as Error).message}`;
      console.error(message, err);
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    addMessage,
    updateMessage,
    deleteMessage,
    importMultipleMessages,
    refreshMessages: loadMessages,
  };
};