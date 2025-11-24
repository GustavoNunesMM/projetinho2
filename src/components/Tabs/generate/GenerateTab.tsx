import React, { useState, useEffect } from "react";
import LayoutSelector from "./LayoutSelector";
import QuestionFilters from "./QuestionFilters";
import QuestionList from "./QuestionList";
import DocumentGenerator from "./DocumentGenerator.tsx";
import DocumentPreview from "./DocumentPreview";
import { useFilters } from "@/hooks/useFilters.ts";
import { useSelection } from "@/hooks/useSelection";
import { Layout } from "@/types/layout";
import { Question } from "@/types/question";
import { Message } from "@/types/messages";
import { GabaritoData } from "@/types";

interface GenerateTabProps {
  layouts: Layout[];
  questions: Question[];
}

const GenerateTab: React.FC<GenerateTabProps> = ({ layouts, questions }) => {
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
  const [orderedQuestions, setOrderedQuestions] = useState<Question[]>([]);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1400);
  const [importedHeader, setImportedHeader] = useState<any[] | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [gabaritoData, setGabaritoData] = useState<GabaritoData | null>(null);
  const [isPrevisualize, setIsPrevisualize] = useState<boolean>(false);

  const { filters, updateFilter, filteredItems } = useFilters(questions);
  const { selectedIds, toggleSelection, selectAll } = useSelection();

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1400);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleReorder = (reorderedQuestions: Question[]) => {
    setOrderedQuestions(reorderedQuestions);
  };

  const questionsToGenerate =
    orderedQuestions.length > 0
      ? orderedQuestions.filter((q) => selectedIds.includes(q.id))
      : questions.filter((q) => selectedIds.includes(q.id));

  return (
    <div className={`${isLargeScreen ? "flex gap-6" : "space-y-6"}`}>
      <div className={`${isLargeScreen ? "flex-1" : "w-full"} space-y-6`}>
        <LayoutSelector
          layouts={layouts}
          selectedLayout={selectedLayout}
          onSelectLayout={setSelectedLayout}
        />

        {selectedLayout && (
          <>
            <QuestionFilters filters={filters} onUpdateFilter={updateFilter} />

            <QuestionList
              questions={filteredItems}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              onSelectAll={() => selectAll(filteredItems.map((q) => q.id))}
              onReorder={handleReorder}
            />

            <DocumentGenerator
              selectedLayout={selectedLayout}
              questions={questionsToGenerate}
              selectedQuestions={selectedIds}
              onHeaderChange={setImportedHeader}
              onMessageChange={setSelectedMessage}
              onGabaritoChange={setGabaritoData}
              isBigLayout={isLargeScreen}
              setVisualize={setIsPrevisualize}
            />
          </>
        )}
      </div>

      {isLargeScreen && selectedLayout && isPrevisualize && (
        <div className="w-[800px] sticky top-6 h-[calc(100vh-8rem)]">
          <DocumentPreview
            questions={questionsToGenerate}
            layout={selectedLayout}
            importedHeader={importedHeader}
            selectedMessage={selectedMessage}
            gabaritoData={gabaritoData}
          />
        </div>
      )}
    </div>
  );
};

export default GenerateTab;
