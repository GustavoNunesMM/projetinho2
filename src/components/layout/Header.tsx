import React, { useState } from "react";
import {
  LogOut,
  RefreshCw,
  Sparkles,
  Layout,
  List,
  MessageSquare,
  NotebookText,
  User,
  Database,
  FileText,
  BrainCircuit,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, Tab } from "@heroui/react";

import { Toast } from "@/components/common/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTab } from "@/contexts/TabContext";
import DropDown from "@/components/common/Dropdown";
import AIConfigModal from "@/components/modal/AIConfigModal.tsx";

const Header = () => {
  const { user, logout, syncData, isSyncing } = useAuth();
  const { activeTab, setActiveTab } = useTab();
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(true);
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

  const handleOpenIaModal = () => {
    setIsAiModalOpen(true);
  };

  const tabs = [
    {
      key: "generate",
      title: "Gerar prova",
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
      description: "Criar notas",
    },
    {
      key: "proves",
      title: "Documentos",
      icon: NotebookText,
      description: "Testes já feitos",
    },
    {
      key: "document-generation",
      title: "Geração de documentação",
      icon: FileText,
      description: "Gerar documentos a partir de templates",
    },
  ];

  const handleUserAction = (key: string) => {
    switch (key) {
      case "sync":
        handleSync();
        break;
      case "iaConfig":
        handleOpenIaModal();
        break;
      case "exit":
        handleLogout();
        break;
      default:
        break;
    }
  };
  const handleTabsAction = (key: string) => {
    setActiveTab(key);
  };
  const handleCloseIaModal = () => {
    setIsAiModalOpen(false);
  };

  return (
    <>
      <header className="bg-white text-black shadow-xl p-1 border-b border-gray-100 stick w-full">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/*<div className="flex items-center space-x-3 group">
            <div className="min-w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <List className="w-5 h-5 text-white" />
            </div>
          </div>*/}

            <div className="flex-1 flex justify-center ">
              <Tabs
                aria-label="Navegação principal"
                classNames={{
                  base: "group max-md:hidden",
                  tabList:
                    "bg-gray-50 shadow-inner-lg gap-1 border border-gray-200",
                  cursor:
                    "w-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-2xl",
                  tab: "max-w-fit px-0 h-11 data-[hover=true]:bg-transparent",
                  tabContent:
                    "group-data-[selected=true]:text-white text-gray-700 font-semibold transition-all duration-500 ease-out group-data-[hover=true]:text-primary-600 group-data-[hover=true]:scale-105",
                }}
                radius="full"
                selectedKey={activeTab}
                variant="solid"
                onSelectionChange={(key) => setActiveTab(String(key))}
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.key}
                    aria-label={tab.description}
                    title={
                      <div className="flex items-center space-x-3 px-6 py-2.5 transition-all duration-300 ease-out hover:scale-105">
                        <tab.icon
                          className="transition-all duration-300 group-data-[selected=true]:scale-110 group-data-[selected=true]:rotate-12"
                          size={18}
                        />
                        <span className="text-sm">{tab.title}</span>
                      </div>
                    }
                  />
                ))}
              </Tabs>
              <DropDown
                className="md:hidden w-full mx-4"
                items={tabs}
                placement="bottom-end"
                triggerIcon={
                  tabs.find((t) => t.key === activeTab)?.icon || List
                }
                triggerLabel={activeTab}
                onAction={handleTabsAction}
              />
            </div>

            <div className="flex items-center gap-4">
              <DropDown
                items={[
                  {
                    key: "sync",
                    title: "Sincronizar",
                    icon: RefreshCw,
                    isDisabled: isSyncing,
                    iconClass: `transition-all duration-500 ${isSyncing ? "animate-spin" : "group-hover:rotate-180"}`,
                  },
                  {
                    key: "iaConfig",
                    title: "Configurar I.A",
                    icon: BrainCircuit,
                    iconClass:
                      "transition-all duration-500 group-hover:translate-x-0.5",
                  },
                  {
                    key: "exit",
                    icon: LogOut,
                    iconClass: `transition-all duration-500 group-hover:translate-x-0.5`,
                    title: "Sair",
                    color: "danger",
                  },
                ]}
                placement="bottom-end"
                triggerIcon={User}
                triggerLabel={user?.username || "Usuário"}
                variant="outline"
                onAction={handleUserAction}
              />
            </div>
          </div>
        </div>
      </header>
      <AIConfigModal isOpen={isAiModalOpen} onClose={handleCloseIaModal} />
    </>
  );
};

export default React.memo(Header);