import { useState } from "react";
import { Button } from "@heroui/react";
import { getDatabase, clearDatabase } from "../../database/database";

export default function DevTools() {
  const [isOpen, setIsOpen] = useState(false);

  const handleTestConnection = async () => {
    try {
      const db = await getDatabase();
      console.log("✅ Conexão com banco OK");
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
      // Força recriação do banco
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
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition z-50"
      >
        🔧 Dev Tools
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-purple-600 rounded-lg shadow-xl p-4 z-50 min-w-[300px]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-purple-600">🔧 Ferramentas Dev</h3>
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
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
        <p>💡 Use para debug em desenvolvimento</p>
      </div>
    </div>
  );
}
