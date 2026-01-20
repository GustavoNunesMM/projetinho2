import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  getDatabase,
  clearDatabase,
  getAllQuestions,
  getAllLayouts,
  getAllMessages,
  getAllTests,
} from "@/database/database";
import { useAuth } from "@/contexts/AuthContext";
import Portal from "./Portal";

function DatabaseViewerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [layouts, setLayouts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const loadData = async () => {
    setLoading(true);
    try {
      const [questionsData, layoutsData, messagesData, testsData] = await Promise.all([
        getAllQuestions(),
        getAllLayouts(),
        getAllMessages(),
        getAllTests(),
      ]);
      setQuestions(questionsData);
      setLayouts(layoutsData);
      setMessages(messagesData);
      setTests(testsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const renderData = (data: any[]) => {
    if (loading) {
      return <div className="text-center py-8">Carregando...</div>;
    }
    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Nenhum dado encontrado
        </div>
      );
    }
    return (
      <div className="max-h-[60vh] overflow-y-auto">
        <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <Modal isOpen={isOpen}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-100">
            <ModalHeader className="flex flex-col gap-1 border-b p-4">
              <h2 className="text-xl font-bold">
                📊 Visualizador de Banco de Dados
              </h2>
              <p className="text-sm text-gray-500">Dados do banco local</p>
            </ModalHeader>
            <ModalBody className="p-0">
              <Tabs
                className="w-full"
                classNames={{
                  tabList: "px-4 pt-2",
                  panel: "p-4",
                }}
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as string)}
              >
                <Tab key="profile" title="👤 Profile">
                  <div className="space-y-4">
                    {user ? (
                      <div>
                        <h3 className="font-semibold mb-2">
                          Informações do Usuário
                        </h3>
                        <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                          {JSON.stringify(user, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Nenhum usuário autenticado
                      </div>
                    )}
                  </div>
                </Tab>
                <Tab
                  key="questions"
                  title={`❓ Questions (${questions.length})`}
                >
                  {renderData(questions)}
                </Tab>
                <Tab key="tests" title={`📝 Tests (${tests.length})`}>
                  {renderData(tests)}
                </Tab>
                <Tab key="layouts" title={`🎨 Layouts (${layouts.length})`}>
                  {renderData(layouts)}
                </Tab>
                <Tab key="messages" title={`💬 Messages (${messages.length})`}>
                  {renderData(messages)}
                </Tab>
              </Tabs>
            </ModalBody>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button onPress={onClose} color="default" variant="light">
                Fechar
              </Button>
              <Button isLoading={loading} onPress={loadData} color="primary">
                🔄 Atualizar
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </Portal>
  );
}

export default function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDatabaseViewerOpen, setIsDatabaseViewerOpen] = useState(false);
  const handleTestConnection = async () => {
    try {
      const db = await getDatabase();
      console.log("✅ Conexão com banco OK", db);
      alert("✅ Banco de dados conectado!");
    } catch (error) {
      console.error("❌ Erro ao conectar:", error);
      alert(`❌ Erro: ${(error as Error).message}`);
    }
  };

  const handleClearDatabase = async () => {
    if (!confirm("⚠️ Isso vai DELETAR todos os dados! Continuar?")) {
      return;
    }

    try {
      await clearDatabase();
      console.log("🧹 Banco limpo");
      alert("✅ Banco de dados limpo! Recarregue a página.");
      window.location.reload();
    } catch (error) {
      console.error("❌ Erro ao limpar:", error);
      alert(`❌ Erro: ${(error as Error).message}`);
    }
  };

  const handleResetSchema = async () => {
    if (!confirm("⚠️ Isso vai RECRIAR as tabelas! Continuar?")) {
      return;
    }

    try {
      await getDatabase();
      console.log("🔄 Schema recriado");
      alert("✅ Schema recriado! Recarregue a página.");
      window.location.reload();
    } catch (error) {
      console.error("❌ Erro ao recriar:", error);
      alert(`❌ Erro: ${(error as Error).message}`);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary-700 transition z-50"
      >
        🔧 Dev Tools
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-primary-600 rounded-lg shadow-xl p-4 z-50 min-w-[300px]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-primary-600">🔧 Ferramentas Dev</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <Button
          color="primary"
          size="sm"
          className="w-full"
          onPress={handleTestConnection}
        >
          🔌 Testar Conexão
        </Button>

        <Button
          color="warning"
          size="sm"
          className="w-full"
          onPress={handleResetSchema}
        >
          🔄 Recriar Schema
        </Button>

        <Button
          color="danger"
          size="sm"
          className="w-full"
          onPress={handleClearDatabase}
        >
          🗑️ Limpar Dados
        </Button>

        <Button
          className="w-full"
          color="secondary"
          onPress={() => setIsDatabaseViewerOpen(true)}
          size="sm"
        >
          📊 Ver Banco de Dados
        </Button>
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
        <p>💡 Use para debug em desenvolvimento</p>
      </div>

      <DatabaseViewerModal
        isOpen={isDatabaseViewerOpen}
        onClose={() => setIsDatabaseViewerOpen(false)}
      />
    </div>
  );
}
