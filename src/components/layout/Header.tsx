import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/common/Button";
import {
  LogOut,
  RefreshCw,
  Sparkles,
  Layout,
  List,
  MessageSquare,
  User,
  Database,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Toast } from "@/components/common/Toast";
import { Tabs, Tab } from "@heroui/react";
import { useTab } from "@/contexts/TabContext";

const Header = () => {
  const { user, logout, syncData, isSyncing } = useAuth();
  const { activeTab, setActiveTab } = useTab();
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
      Toast({
        message: error.message || "Erro ao sincronizar",
        color: "danger",
      });
    }
  };

  const tabs = [
    {
      key: "generate",
      title: "Gerar Questões",
      icon: Sparkles,
      description: "Criar novas questões com IA",
    },
    {
      key: "layouts",
      title: "Layouts",
      icon: Layout,
      description: "Gerenciar layouts de provas",
    },
    {
      key: "questions",
      title: "Banco de Questões",
      icon: Database,
      description: "Visualizar e editar questões",
    },
    {
      key: "messages",
      title: "Mensagens",
      icon: MessageSquare,
      description: "Central de comunicação",
    },
  ];

  return (
    <header className="bg-white text-black p-6 shadow-xl border-b border-gray-100 stick w-full">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <List className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                QuestPro By Gustavo
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Gerenciamento Inteligente de Questões
              </p>
              <p className="text-[10px] text-gray-500 font-medium">
                Feito por mim para pessoas em sofrimento pedagogico
              </p>
            </div>
          </div>

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
                  "w-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-2xl",
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

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 group hover:shadow-md transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-inner">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700 transition-colors cursor-default">
                  {user?.username}
                </p>
              </div>
            </div>

            <Button
              variant="custom"
              onClick={handleSync}
              disabled={isSyncing}
              className="bg-[#97dffc] hover:bg-[#87cfe8] text-gray-800 hover:text-gray-900 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold border-2 border-transparent hover:border-[#77bfd4]"
            >
              <RefreshCw
                className={`size-4 mr-2 transition-all duration-500 ${isSyncing ? "animate-spin" : "group-hover:rotate-180"}`}
              />
              {isSyncing ? "Sincronizando..." : "Sincronizar"}
            </Button>

            <Button
              variant="custom"
              onClick={handleLogout}
              className="bg-[#613dc1] hover:bg-[#5130b0] text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center">
                <LogOut className="size-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                Sair
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
