import Button from "@/components/common/Button";
import Portal from "@/components/common/Portal";
import { X, Loader, Check, MessageSquare, FileText } from "lucide-react";
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
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-2 max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 animate-scaleIn mx-4">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-primary-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                  Selecionar Texto
                </h3>
                <p className="text-xs text-gray-500">
                  Escolha um texto para adicionar ao documento
                </p>
              </div>
            </div>
            <button
              onClick={() => openModalMessages(false)}
              className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50/50">
            {loadingMessages ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg animate-pulseGlow">
                  <Loader className="w-7 h-7 text-white animate-spin" />
                </div>
                <p className="mt-4 text-gray-600 font-medium">
                  Carregando textos...
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float">
                  <FileText className="w-8 h-8 text-primary-500" />
                </div>
                <p className="text-gray-600 font-medium mb-2">
                  Nenhum texto cadastrado
                </p>
                <p className="text-sm text-gray-400">
                  Vá para a aba "Mensagens" para criar um novo texto.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`
                      group p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 animate-slideUp
                      ${
                        selectedMessage?.id === message.id
                          ? "border-primary-500 bg-gradient-to-r from-primary-50 to-white shadow-lg scale-[1.01]"
                          : "border-gray-200 bg-white hover:border-primary-300 hover:shadow-md hover:bg-primary-50/30"
                      }
                    `}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              selectedMessage?.id === message.id
                                ? "bg-primary-600 shadow-md"
                                : "bg-primary-100 group-hover:bg-primary-200"
                            }`}
                          >
                            <MessageSquare
                              className={`w-4 h-4 ${
                                selectedMessage?.id === message.id
                                  ? "text-white"
                                  : "text-primary-600"
                              }`}
                            />
                          </div>
                          <h4
                            className={`font-bold transition-colors duration-300 ${
                              selectedMessage?.id === message.id
                                ? "text-primary-700"
                                : "text-gray-800 group-hover:text-primary-600"
                            }`}
                          >
                            {message.title}
                          </h4>
                        </div>
                        <div className="text-sm text-gray-600 pl-10">
                          {message.isList ? (
                            message.isOrdered ? (
                              <ol className="space-y-1">
                                {message.items.slice(0, 3).map((item, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                                {message.items.length > 3 && (
                                  <li className="text-gray-400 pl-7">
                                    ... e mais {message.items.length - 3} itens
                                  </li>
                                )}
                              </ol>
                            ) : (
                              <ul className="space-y-1">
                                {message.items.slice(0, 3).map((item, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                                {message.items.length > 3 && (
                                  <li className="text-gray-400 pl-3.5">
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
                        <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0 ml-3 animate-bounceIn">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <Button
              variant="custom"
              onClick={() => openModalMessages(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl transition-all duration-300 font-medium"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default MessagesModal;
