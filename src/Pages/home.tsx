import { useEffect } from "react";

import Container from "@/components/layout/Container.tsx";
import LayoutsTab from "@/components/Tabs/layouts/LayoutsTab.tsx";
import QuestionsTab from "@/components/Tabs/questions/QuestionsTab.tsx";
import GenerateTab from "@/components/Tabs/generate/GenerateTab.tsx";
import MessageTab from "@/components/Tabs/MessageTab/MessageTab.tsx";
import { useLayouts } from "@/hooks/useLayouts.ts";
import { useQuestions } from "@/hooks/useQuestions.ts";
import { useImportHandlers } from "@/hooks/useImportHandlers.ts";
import { Loader } from "lucide-react";
import { Toast } from "@/components/common/Toast.tsx";
import { LayoutFormData } from "@/types/index";
import { extractWordLayoutInfo } from "@/hooks/useDocumentGenerator/ExportWord";
import { useTab } from "@/contexts/TabContext";

const Home = () => {
  const { activeTab } = useTab();

  const {
    layouts,
    addLayout,
    updateLayout,
    deleteLayout,
    loading: layoutsLoading,
  } = useLayouts();
  const {
    questions,
    loading: questionsLoading,
    refreshQuestions,
  } = useQuestions();
  const { importLayout } = useImportHandlers();

  useEffect(() => {
    refreshQuestions();
  }, [ questions.length, layouts.length]);

  const handleImportLayout = async (file: File) => {
    try {
      const wordInfo = await extractWordLayoutInfo(file);

      await importLayout(file, async (importedLayout) => {
        const layoutForm: LayoutFormData = {
          name: importedLayout.name,
          headerText: importedLayout.name,
          footerText: "",
          headerLocked: false,
          importedFrom: file.name,
          ...wordInfo,
        };
        await addLayout(layoutForm);
      });

      Toast({ message: "Layout importado com sucesso!", color: "success" });
      return true;
    } catch (error: any) {
      Toast({
        message: `Erro ao importar layout: ${error.message}`,
        color: "danger",
      });
      return false;
    }
  };

  if (layoutsLoading || questionsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl animate-pulseGlow">
          <Loader className="w-10 h-10 text-white animate-spin" />
        </div>
        <p className="mt-6 text-xl font-semibold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
          QuestPro
        </p>
        <p className="text-gray-500 mt-2">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full ">
      <Container>
        <div className={activeTab === "generate" ? "animate-fadeIn" : "hidden"}>
          <GenerateTab layouts={layouts} questions={questions} />
        </div>

        <div className={activeTab === "layouts" ? "animate-fadeIn" : "hidden"}>
          <LayoutsTab
            layouts={layouts}
            onAdd={addLayout}
            onDelete={deleteLayout}
            onImport={handleImportLayout}
            onUpdate={updateLayout}
          />
        </div>

        <div className={activeTab === "questions" ? "animate-fadeIn" : "hidden"}>
          <QuestionsTab />
        </div>

        <div className={activeTab === "messages" ? "animate-fadeIn" : "hidden"}>
          <MessageTab />
        </div>
      </Container>
    </div>
  );
};

export default Home;
