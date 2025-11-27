import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
} from "@heroui/react";
import { Toast } from "@/components/common/Toast";
import { Eye, EyeOff, LogIn, Mail, Lock, User } from "lucide-react";

export const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const tabs = [
    {
      key: "login",
      title: "Login",
      icon: LogIn,
      description: "Faça login para continuar",
    },
    {
      key: "register",
      title: "Registro",
      icon: Lock,
      description: "Preencha os dados para se registrar",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-500">
        <CardHeader className="flex flex-col gap-1 items-center pb-6 pt-8">
          <div className="flex-1 flex justify-center">
            <Tabs
              variant="solid"
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(String(key))}
              aria-label="Navegação principal"
              radius="full"
              classNames={{
                base: "group",
                tabList:
                  "bg-gray-50 shadow-inner-lg gap-1 border border-gray-200",
                cursor:
                  "w-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-2xl transition-all duration-300",
                tab: "max-w-fit px-0 h-11 data-[hover=true]:bg-transparent",
                tabContent:
                  "group-data-[selected=true]:text-white text-gray-700 font-semibold transition-all duration-500 ease-out group-data-[hover=true]:text-primary-600 group-data-[hover=true]:scale-105",
              }}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.key}
                  title={
                    <div className="flex items-center space-x-3 px-6 py-2.5 transition-all duration-300 ease-out hover:scale-105">
                      <tab.icon
                        size={18}
                        className="transition-all duration-300 group-data-[selected=true]:scale-110 group-data-[selected=true]:rotate-12"
                      />
                      <span className="text-sm">{tab.title}</span>
                    </div>
                  }
                  aria-label={tab.description}
                />
              ))}
            </Tabs>
          </div>
        </CardHeader>
        <div
          key={activeTab}
          className="animate-in fade-in slide-in-from-right-4 duration-500"
        >
          {activeTab === "login" ? <LoginCard /> : <RegisterCard />}
        </div>
      </Card>
    </div>
  );
};

const LoginCard = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await login({ email, password });
      Toast({ message: "Login realizado com sucesso!", color: "success" });
    } catch (error: any) {
      Toast({
        message: error.message || "Erro ao fazer login",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardBody className="px-8 pb-8">
      <div className="flex flex-col gap-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
          <Input
            type="email"
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="bordered"
            startContent={<Mail className="w-4 h-4 text-gray-400" />}
            classNames={{
              input: "transition-all duration-300",
              inputWrapper:
                "transition-all duration-300 hover:border-primary-400",
            }}
          />
        </div>
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
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
                className="focus:outline-none transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <div className="relative w-4 h-4">
                  <Eye
                    className={`w-4 h-4 text-gray-400 absolute transition-all duration-300 ${
                      showPassword
                        ? "opacity-0 rotate-180 scale-0"
                        : "opacity-100 rotate-0 scale-100"
                    }`}
                  />
                  <EyeOff
                    className={`w-4 h-4 text-gray-400 absolute transition-all duration-300 ${
                      showPassword
                        ? "opacity-100 rotate-0 scale-100"
                        : "opacity-0 -rotate-180 scale-0"
                    }`}
                  />
                </div>
              </button>
            }
            classNames={{
              input: "transition-all duration-300",
              inputWrapper:
                "transition-all duration-300 hover:border-primary-400",
            }}
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <Button
            color="primary"
            size="lg"
            isLoading={loading}
            className="mt-2 w-full transition-all duration-300 hover:scale-105 active:scale-95"
            onPress={handleSubmit}
          >
            Entrar
          </Button>
        </div>
      </div>
    </CardBody>
  );
};

const RegisterCard = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      Toast({ message: "As senhas não coincidem", color: "danger" });
      return;
    }

    if (password.length < 6) {
      Toast({
        message: "A senha deve ter no mínimo 6 caracteres",
        color: "danger",
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
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardBody className="px-8 pb-8">
      <div className="flex flex-col gap-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
          <Input
            type="text"
            label="Nome de usuário"
            placeholder="Digite seu nome"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            variant="bordered"
            startContent={<User className="w-4 h-4 text-gray-400" />}
            classNames={{
              input: "transition-all duration-300",
              inputWrapper:
                "transition-all duration-300 hover:border-primary-400",
            }}
          />
        </div>
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
          <Input
            type="email"
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="bordered"
            startContent={<Mail className="w-4 h-4 text-gray-400" />}
            classNames={{
              input: "transition-all duration-300",
              inputWrapper:
                "transition-all duration-300 hover:border-primary-400",
            }}
          />
        </div>
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
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
                className="focus:outline-none transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <div className="relative w-4 h-4">
                  <Eye
                    className={`w-4 h-4 text-gray-400 absolute transition-all duration-300 ${
                      showPassword
                        ? "opacity-0 rotate-180 scale-0"
                        : "opacity-100 rotate-0 scale-100"
                    }`}
                  />
                  <EyeOff
                    className={`w-4 h-4 text-gray-400 absolute transition-all duration-300 ${
                      showPassword
                        ? "opacity-100 rotate-0 scale-100"
                        : "opacity-0 -rotate-180 scale-0"
                    }`}
                  />
                </div>
              </button>
            }
            classNames={{
              input: "transition-all duration-300",
              inputWrapper:
                "transition-all duration-300 hover:border-primary-400",
            }}
          />
        </div>
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 delay-250">
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
                className="focus:outline-none transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <div className="relative w-4 h-4">
                  <Eye
                    className={`w-4 h-4 text-gray-400 absolute transition-all duration-300 ${
                      showConfirmPassword
                        ? "opacity-0 rotate-180 scale-0"
                        : "opacity-100 rotate-0 scale-100"
                    }`}
                  />
                  <EyeOff
                    className={`w-4 h-4 text-gray-400 absolute transition-all duration-300 ${
                      showConfirmPassword
                        ? "opacity-100 rotate-0 scale-100"
                        : "opacity-0 -rotate-180 scale-0"
                    }`}
                  />
                </div>
              </button>
            }
            classNames={{
              input: "transition-all duration-300",
              inputWrapper:
                "transition-all duration-300 hover:border-primary-400",
            }}
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <Button
            color="primary"
            size="lg"
            isLoading={loading}
            className="mt-2 w-full transition-all duration-300 hover:scale-105 active:scale-95"
            onPress={handleSubmit}
          >
            Registrar
          </Button>
        </div>
      </div>
    </CardBody>
  );
};
