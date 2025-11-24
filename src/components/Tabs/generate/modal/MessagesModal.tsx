import Button from "@/components/common/Button";
import { X, Loader, Check } from "lucide-react";
import { Message } from "@/types/messages";

interface MessagesModalProps {
  isModalMessagesOpen: boolean;
  openModalMessages: (open: boolean) => void;
  messages: Message[];
  loadingMessages: boolean;
  selectedMessage: Message | null;
  handleSelectMessage: (msg: Message) => void;
}

const MessagesModal: React.FC<MessagesModalProps> = ({
  isModalMessagesOpen,
  openModalMessages,
  messages,
  loadingMessages,
  selectedMessage,
  handleSelectMessage,
}) => {
  if (!isModalMessagesOpen) return null; 

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold">Selecionar Texto</h3>
          <button
            onClick={() => openModalMessages(false)}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loadingMessages ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin mr-2" />
              <span>Carregando mensagens...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Nenhuma Texto cadastrada ainda.
              </p>
              <p className="text-sm text-gray-400">
                Vá para a aba "Mensagens" para criar uma nova texto.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleSelectMessage(message)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedMessage?.id === message.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {message.title}
                      </h4>
                      <div className="text-sm text-gray-600">
                        {message.isList ? (
                          message.isOrdered ? (
                            <ol className="list-decimal list-inside space-y-1">
                              {message.items.slice(0, 3).map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                              {message.items.length > 3 && (
                                <li className="text-gray-400">
                                  ... e mais {message.items.length - 3} itens
                                </li>
                              )}
                            </ol>
                          ) : (
                            <ul className="list-disc list-inside space-y-1">
                              {message.items.slice(0, 3).map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                              {message.items.length > 3 && (
                                <li className="text-gray-400">
                                  ... e mais {message.items.length - 3} itens
                                </li>
                              )}
                            </ul>
                          )
                        ) : (
                          <div className="space-y-1">
                            {message.items.slice(0, 2).map((item, idx) => (
                              <p key={idx}>{item}</p>
                            ))}
                            {message.items.length > 2 && (
                              <p className="text-gray-400">
                                ... e mais {message.items.length - 2} itens
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedMessage?.id === message.id && (
                      <Check className="w-6 h-6 text-blue-600 flex-shrink-0 ml-3" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={() => openModalMessages(false)}
            className="w-full"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessagesModal;
