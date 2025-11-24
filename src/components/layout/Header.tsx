import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/common/Button";
import { LogOut, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Toast } from "@/components/common/Toast";

const Header = () => {
  const { user, logout, syncData, isSyncing } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleSync = async () => {
    try {
      await syncData();
      Toast({ message: "Dados sincronizados com sucesso!", color: "success" });
    } catch (error: any) {
      Toast({ message: error.message || "Erro ao sincronizar", color: "danger" });
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sistema de Questões</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Olá, {user?.username}</span>
          <Button 
            variant="primary" 
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={`size-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;