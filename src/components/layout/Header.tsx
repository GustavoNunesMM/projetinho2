import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@heroui/react";
import { LogOut } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sistema de Questões</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Olá, {user?.username}</span>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onClick={handleLogout}
            startContent={<LogOut className="w-4 h-4" />}
          >
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;