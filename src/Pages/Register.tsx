import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Toast } from "@/components/common/Toast";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export const Register = ({ onSwitchToLogin }: RegisterProps) => {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Toast({ message: "As senhas não coincidem", color: "danger" });
      return;
    }

    if (password.length < 6) {
      Toast({ 
        message: "A senha deve ter no mínimo 6 caracteres", 
        color: "danger" 
      });
      return;
    }

    setLoading(true);

    try {
      await register({ username, email, password });
      Toast({ message: "Conta criada com sucesso!", color: "success" });
    } catch (error: any) {
      Toast({ 
        message: error.message || "Erro ao criar conta", 
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
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Criar Conta</h1>
          <p className="text-gray-600">Preencha os dados para se registrar</p>
        </CardHeader>
        <CardBody className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              label="Nome de usuário"
              placeholder="Digite seu nome"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              variant="bordered"
              startContent={<User className="w-4 h-4 text-gray-400" />}
            />
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
              placeholder="Mínimo 6 caracteres"
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
            <Input
              type={showConfirmPassword ? "text" : "password"}
              label="Confirmar senha"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              variant="bordered"
              startContent={<Lock className="w-4 h-4 text-gray-400" />}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none"
                >
                  {showConfirmPassword ? (
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
              Registrar
            </Button>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Faça login
                </button>
              </p>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};