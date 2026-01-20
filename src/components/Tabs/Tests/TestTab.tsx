import { useRef, useState } from "react";
import {
  Database,
  Loader,
  FileUp,
  Plus,
  Upload,
  List,
  Search,
} from "lucide-react";
import { useTests } from "@/hooks/useTests";
import DropDown from "@/components/common/Dropdown";
import Button from "@/components/common/Button";
import { Toast } from "@/components/common/Toast";
import { TestFilters } from "@/components/Tabs/Tests/TestFilters";
import { TestCard } from "@/components/Tabs/Tests/TestCard";
import { TestModal } from "@/components/Tabs/Tests/TestModal";
import { useTestFilters } from "@/hooks/useTestFilters";
import DeleteModal from "@/components/modal/DeleteModal";
import { Test } from "@/types/test";

const TestTab = () => {
  const [importing, setImporting] = useState(false);
  const { tests, loading, error, deleteTest } = useTests();
  const {
    filters,
    updateFilter,
    filteredTests,
    uniqueSchoolYears,
    uniqueSubjects,
    uniqueQuarters,
    uniqueSchoolUnits,
    uniqueCategories,
  } = useTestFilters(tests);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [format, setFormat] = useState<"block" | "list" | "detail">("block");

  const handleLocalImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const list = []; //await importMultipleQuestions(file);
      Toast({ message: `${list.length} provas importada(s)!` });
    } catch (error) {
      Toast({ message: `Erro ao importar: ${(error as Error).message}` });
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleQuestionAction = (action: string) => {
    if (action === "import") {
      fileInputRef.current?.click();
    }
  };

  const handleViewTest = (test: Test) => {
    setSelectedTest(test);
    setShowModal(true);
  };

  const handleDownloadTest = (test: Test) => {
    
    Toast({ message: `Baixando ${test.fileName}...` });
  };


  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl animate-pulseGlow">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
        <p className="mt-6 text-lg font-medium text-gray-700">
          Carregando provas...
        </p>
        <p className="text-sm text-gray-500 mt-1">Aguarde um momento</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-16 animate-fadeIn">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Database className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-600 font-medium mb-2">Erro ao carregar</p>
        <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">{error}</p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Recarregar Página
        </Button>
      </div>
    );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center rounded-2xl p-6 shadow-lg border border-gray-100 animate-slideUp">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
              Banco de Provas
            </h2>
            <p className="text-sm text-gray-500">
              {tests.length} provas cadastradas
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLocalImport}
            accept=".docx"
            className="hidden"
            disabled={importing}
          />
          <div className="flex gap-3 max-md:hidden">
            <Button
              variant="custom"
              icon={importing ? Loader : FileUp}
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="bg-[#97dffc] hover:bg-[#87cfe8] text-gray-800 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium border border-[#87cfe8]"
            >
              {importing ? "Importando..." : "Importar Local"}
            </Button>
          </div>
          <DropDown
            triggerLabel={"Criar prova"}
            items={[{ key: "import", title: "Importar Word", icon: Upload }]}
            triggerIcon={List}
            placement="bottom-end"
            onAction={handleQuestionAction}
            className="md:hidden"
          ></DropDown>
        </div>
      </div>

      <div className="animate-slideUp stagger-1">
        <TestFilters
          filters={filters}
          onUpdateFilter={updateFilter}
          format={format}
          onUpdateFormat={(newFormat) => setFormat(newFormat)}
          uniqueSchoolYears={uniqueSchoolYears}
          uniqueSubjects={uniqueSubjects}
          uniqueQuarters={uniqueQuarters}
          uniqueSchoolUnits={uniqueSchoolUnits}
          uniqueCategories={uniqueCategories}
        />
      </div>

      {filteredTests.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-inner animate-scaleIn">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
            <Search className="w-10 h-10 text-primary-500" />
          </div>
          <p className="text-gray-600 font-medium mb-2">
            Nenhuma prova encontrada
          </p>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Tente ajustar os filtros ou importe uma nova prova para começar.
          </p>
          <Button
            variant="custom"
            icon={Plus}
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
          >
            Importar Primeira Prova
          </Button>
        </div>
      ) : (
        <div
          className={`${format === "block" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}`}
        >
          {filteredTests.map((test, index) => (
            <div
              key={test.id}
              className="animate-slideUp"
              style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
            >
              <TestCard
                test={test}
                onView={handleViewTest}
                onDownload={handleDownloadTest}
                onDelete={(test) => {
                  setSelectedTest(test);
                  setDeleteModal(true);
                }}
                format={format}
              />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TestModal
          test={selectedTest}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedTest(null);
          }}
          onDownload={handleDownloadTest}
          onDelete={(test) => {
            setSelectedTest(test);
            setDeleteModal(true);
          }}
        />
      )}

      <DeleteModal
        isOpen={deleteModal && !!selectedTest}
        onClose={() => {
          setDeleteModal(false);
        }}
        onSubmit={async () => {
          if (selectedTest) {
            try {
              await deleteTest(selectedTest.id);
              setDeleteModal(false);
              setShowModal(false); 
              setSelectedTest(null);
              Toast({ message: "Prova deletada com sucesso!" });
            } catch (error) {
              Toast({
                message: `Erro ao deletar prova: ${(error as Error).message}`,
              });
            }
          }
        }}
        elementName={selectedTest?.title || ""}
        type="test"
      />
    </div>
  );
};

export default TestTab;
