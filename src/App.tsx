import { useState, useEffect } from "react";
import Header from "./components/layout/Header.tsx";
import Container from "./components/layout/Container.tsx";
import LayoutsTab from "./components/layouts/LayoutsTab.tsx";
import QuestionsTab from "./components/questions/QuestionsTab.tsx";
import GenerateTab from "./components/generate/GenerateTab.tsx";
import { useLayouts } from "./hooks/useLayouts.ts";
import { useQuestions } from "./hooks/useQuestions.ts";
import { useImportHandlers } from "./hooks/useImportHandlers.ts";
import { Tabs, Tab } from "@heroui/react";
import { Toast } from "./components/common/Toast.tsx";
import { LayoutFormData } from "./types/index";
import { getDatabase, getStatistics } from "./database/database.ts";

const App = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const { layouts, addLayout, updateLayout, deleteLayout } = useLayouts();
  const [stats, setStats] = useState({
    questions: 0,
    categories: 0,
    layouts: 0,
  });

  const { questions, addQuestion, updateQuestion, deleteQuestion } =
    useQuestions();

  useEffect(() => {
    loadStats();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const statistics = await getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const { importLayout } = useImportHandlers();

  const handleImportLayout = async (file: File) => {
    try {
      await importLayout(file, (importedLayout) => {
        const layoutForm: LayoutFormData = {
          name: importedLayout.name,
          fontSize: "12pt",
          fontFamily: "Arial",
          lineSpacing: "1.5",
          marginTop: "10",
          marginBottom: "10",
          marginLeft: "10",
          marginRight: "10",
          headerText: "",
          headerLocked: false,
          footerText: "",
          importedFrom: "arquivo",
        };
        addLayout(layoutForm);
      });
      Toast({
        message: "Layout importado com sucesso",
      });
      return true;
    } catch (error) {
      Toast({
        message: "Erro ao importar layout",
      });
      return false;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Tabs
        variant="underlined"
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(String(key))}
        aria-label="App Navigation"
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
            <QuestionsTab
              questions={questions}
              onAdd={addQuestion}
              onDelete={deleteQuestion}
              onUpdate={updateQuestion}
            />
          </Container>
        </Tab>
      </Tabs>
    </div>
  );
};

export default App;
