import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Toast } from "@/components/common/Toast";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

interface LoginProps {
  onSwitchToRegister: () => void;
}

export const Login = ({ onSwitchToRegister }: LoginProps) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      Toast({ message: "Login realizado com sucesso!", color: "success" });
    } catch (error: any) {
      Toast({ 
        message: error.message || "Erro ao fazer login", 
        color: "danger" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-col gap-1 items-center pb-6 pt-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Bem-vindo</h1>
          <p className="text-gray-600">Faça login para continuar</p>
        </CardHeader>
        <CardBody className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variant="bordered"
              startContent={<Mail className="w-4 h-4 text-gray-400" />}
            />
            <Input
              type={showPassword ? "text" : "password"}
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              variant="bordered"
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              }
            />
            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={loading}
              className="mt-2"
            >
              Entrar
            </Button>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Registre-se
                </button>
              </p>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

