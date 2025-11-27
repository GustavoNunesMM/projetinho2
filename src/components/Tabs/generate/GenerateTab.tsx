import React, { useState } from "react";
import LayoutSelector from "./LayoutSelector";
import QuestionFilters from "./QuestionFilters";
import QuestionList from "./QuestionList";
import DocumentGenerator from "./DocumentGenerator.tsx";
import { useFilters } from "@/hooks/useFilters.ts";
import { useSelection } from "@/hooks/useSelection";
import { Layout } from "@/types/layout";
import { Question } from "@/types/question";

interface GenerateTabProps {
  layouts: Layout[];
  questions: Question[];
}

const GenerateTab: React.FC<GenerateTabProps> = ({ layouts, questions }) => {
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
  const [orderedQuestions, setOrderedQuestions] = useState<Question[]>([]);

  const { filters, updateFilter, filteredItems } = useFilters(questions);
  const { selectedIds, toggleSelection, selectAll } = useSelection();

  const handleReorder = (reorderedQuestions: Question[]) => {
    setOrderedQuestions(reorderedQuestions);
  };

  const questionsToGenerate =
    orderedQuestions.length > 0
      ? orderedQuestions.filter((q) => selectedIds.includes(q.id))
      : questions.filter((q) => selectedIds.includes(q.id));

  return (
    <div className="space-y-6">
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
          />
        </>
      )}
    </div>
  );
};

export default GenerateTab;
