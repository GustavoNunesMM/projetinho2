import { useState, useEffect } from "react";
import Header from "./components/layout/Header.tsx";
import Container from "./components/layout/Container.tsx";
import LayoutsTab from "./components/layouts/LayoutsTab.tsx";
import QuestionsTab from "./components/questions/QuestionsTab.tsx";
import GenerateTab from "./components/generate/GenerateTab.tsx";
import DevTools from "./components/common/DevTools.tsx";
import { useLayouts } from "./hooks/useLayouts.ts";
import { useQuestions } from "./hooks/useQuestions.ts";
import { useImportHandlers } from "./hooks/useImportHandlers.ts";
import { Tabs, Tab, Spinner } from "@heroui/react";
import { Toast } from "./components/common/Toast.tsx";
import { LayoutFormData } from "./types/index";
import { getStatistics } from "./database/database.ts";
import ViewTab from "./components/viewTab/viewTab.tsx";
const App = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [stats, setStats] = useState({
    questions: 0,
    categories: 0,
    layouts: 0,
  });

  const {
    layouts,
    addLayout,
    updateLayout,
    deleteLayout,
    loading: layoutsLoading,
    error: layoutsError,
  } = useLayouts();

  const {
    questions,
    loading: questionsLoading,
    error: questionsError,
  } = useQuestions();

  const { importLayout } = useImportHandlers();

  useEffect(() => {
    loadStats();
  }, [activeTab, questions.length, layouts.length]);

  const loadStats = async () => {
    try {
      const statistics = await getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const handleImportLayout = async (file: File) => {
    try {
      await importLayout(file, async (importedLayout) => {
        const layoutForm: LayoutFormData = {
          name: importedLayout.name,
          fontSize: "12",
          fontFamily: "Arial",
          lineSpacing: "1.5",
          marginTop: "2.5",
          marginBottom: "2.5",
          marginLeft: "2.5",
          marginRight: "2.5",
          headerText: importedLayout.name,
          headerLocked: false,
          footerText: "",
          importedFrom: file.name,
        };
        await addLayout(layoutForm);
      });
      Toast({
        message: "Layout importado com sucesso!",
        color: "success",
      });
      return true;
    } catch (error) {
      Toast({
        message: `Erro ao importar layout: ${(error as Error).message}`,
        color: "danger",
      });
      return false;
    }
  };

  // Loading state
  if (layoutsLoading || questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Carregando dados do banco...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <DevTools />
      {/* Estatísticas */}
      <div className="bg-blue-50 border-b border-blue-200 py-3">
        <Container>
          <div className="flex gap-6 text-sm">
            <span className="font-medium">
              📐 Layouts: <span className="text-blue-600">{stats.layouts}</span>
            </span>
            <span className="font-medium">
              📝 Questões:{" "}
              <span className="text-blue-600">{stats.questions}</span>
            </span>
            <span className="font-medium">
              🏷️ Categorias:{" "}
              <span className="text-blue-600">{stats.categories}</span>
            </span>
          </div>
        </Container>
      </div>

      <Tabs
        variant="underlined"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(String(key))}
        aria-label="App Navigation"
        className="px-6"
      >
        <Tab key="generate" title="Gerar">
          <Container>
            <GenerateTab layouts={layouts} questions={questions} />
          </Container>
        </Tab>

        <Tab key="layouts" title="Layouts">
          <Container>
            <LayoutsTab
              layouts={layouts}
              onAdd={addLayout}
              onDelete={deleteLayout}
              onImport={handleImportLayout}
              onUpdate={updateLayout}
            />
          </Container>
        </Tab>

        <Tab key="questions" title="Questões">
          <Container>
            <QuestionsTab />
          </Container>
        </Tab>
        <Tab key="view" title="Visualização">
          <Container>
            <ViewTab selectedQuestions={questions} layout={layouts[0]} />
          </Container>
        </Tab>
      </Tabs>
    </div>
  );
};

export default App;
