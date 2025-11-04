// useQuestions.ts
import { useState, useEffect } from "react";
import { Question, QuestionFormData } from "../types/question";
import { useDocumentGenerator } from "./useDocumentGenerator";

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const { readDocx, parseQuestionsFromText } = useDocumentGenerator();

  useEffect(() => {
    const savedQuestions = localStorage.getItem("questionBankQuestions");
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("questionBankQuestions", JSON.stringify(questions));
  }, [questions]);

  const addQuestion = (question: QuestionFormData): Question => {
    const newQuestion: Question = { ...question, id: Date.now() };
    setQuestions([...questions, newQuestion]);
    return newQuestion;
  };

  const updateQuestion = (
    id: number,
    updatedQuestion: QuestionFormData
  ): void => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...updatedQuestion, id } : q))
    );
  };

  const deleteQuestion = (id: number): void => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const importQuestion = async (file: File): Promise<Question> => {
    try {
      const text = await readDocx(file);
      const parsedQuestions = parseQuestionsFromText(text);
      if (parsedQuestions.length === 0) {
        throw new Error("Nenhuma questão encontrada no arquivo");
      }
      const parsedQuestion = parsedQuestions[0];
      const questionData: QuestionFormData = {
        title: parsedQuestion.statement.substring(0, 50) + "...",
        content: parsedQuestion.statement,
        contentImage: null,
        difficulty:
          (parsedQuestion.difficulty as "facil" | "media" | "dificil") ||
          "media",
        subject: parsedQuestion.subject || "",
        category: "",
        type:
          parsedQuestion.alternatives && parsedQuestion.alternatives.length > 0
            ? "multipla"
            : "aberta",
        options: parsedQuestion.alternatives
          ? parsedQuestion.alternatives
              .map((alt) => alt.text || alt.texto || "")
              .slice(0, 4)
          : ["", "", "", ""],
        optionImages: [null, null, null, null],
        correctAnswer: "",
        explanation: "",
        importedFrom: file.name,
      };

      return addQuestion(questionData);
    } catch (error) {
      console.error("Erro ao importar questão:", error);
      throw new Error(`Falha ao importar questão: ${(error as Error).message}`);
    }
  };

  const importMultipleQuestions = async (file: File): Promise<Question[]> => {
    try {
      const text = await readDocx(file);
      const parsedQuestions = parseQuestionsFromText(text);

      if (parsedQuestions.length === 0) {
        throw new Error("Nenhuma questão encontrada no arquivo");
      }

      const importedQuestions: Question[] = [];

      for (const parsedQuestion of parsedQuestions) {
        const questionData: QuestionFormData = {
          title: parsedQuestion.statement.substring(0, 50) + "...",
          content: parsedQuestion.statement,
          contentImage: null,
          difficulty:
            (parsedQuestion.difficulty as "facil" | "media" | "dificil") ||
            "media",
          subject: parsedQuestion.subject || "",
          category: "",
          type:
            parsedQuestion.alternatives &&
            parsedQuestion.alternatives.length > 0
              ? "multipla"
              : "aberta",
          options: parsedQuestion.alternatives
            ? parsedQuestion.alternatives
                .map((alt) => alt.text || alt.texto || "")
                .slice(0, 4)
            : ["", "", "", ""],
          optionImages: [null, null, null, null],
          correctAnswer: "",
          explanation: "",
          importedFrom: file.name,
        };

        const newQuestion = addQuestion(questionData);
        importedQuestions.push(newQuestion);
      }

      return importedQuestions;
    } catch (error) {
      console.error("Erro ao importar questões:", error);
      throw new Error(
        `Falha ao importar questões: ${(error as Error).message}`
      );
    }
  };

  return {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    importQuestion,
    importMultipleQuestions,
  };
};
