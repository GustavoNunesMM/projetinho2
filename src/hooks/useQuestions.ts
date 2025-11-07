import { useState, useEffect } from "react";
import { Question, QuestionFormData } from "../types/index";
import { useDocumentGenerator } from "./useDocumentGenerator";
import {
  getAllQuestions,
  insertQuestion,
  updateQuestion as updateQuestionDB,
  deleteQuestion as deleteQuestionDB,
} from "../database/database";

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { readDocx, parseQuestionsFromText } = useDocumentGenerator();

  // Carregar questões do banco ao montar
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllQuestions();

      // Deserializar arrays JSON
      const questionsWithArrays = data.map((q) => ({
        ...q,
        options:
          typeof q.options === "string"
            ? JSON.parse(q.options)
            : q.options || [],
        optionImages: q.optionImages
          ? typeof q.optionImages === "string"
            ? JSON.parse(q.optionImages)
            : q.optionImages
          : [null, null, null, null],
      }));

      setQuestions(questionsWithArrays as Question[]);
    } catch (err) {
      const message = `Erro ao carregar questões: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async (question: QuestionFormData): Promise<Question> => {
    try {
      // Serializar arrays para JSON antes de salvar
      const questionToSave = {
        ...question,
        options: JSON.stringify(question.options),
        optionImages: JSON.stringify(question.optionImages),
      };

      const savedQuestion = await insertQuestion(questionToSave as any);

      // Deserializar arrays de volta para o estado
      const questionWithArrays = {
        ...savedQuestion,
        options: JSON.parse(savedQuestion.options as any),
        optionImages: JSON.parse((savedQuestion.optionImages as any) || "[]"),
      } as Question;

      setQuestions((prev) => [questionWithArrays, ...prev]);
      return questionWithArrays;
    } catch (err) {
      const message = `Erro ao adicionar questão: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  const updateQuestion = async (
    id: number,
    updatedQuestion: QuestionFormData
  ): Promise<void> => {
    try {
      // Serializar arrays para JSON antes de salvar
      const questionToUpdate = {
        ...updatedQuestion,
        options: JSON.stringify(updatedQuestion.options),
        optionImages: JSON.stringify(updatedQuestion.optionImages),
      };

      await updateQuestionDB(id, questionToUpdate as any);

      // Atualizar estado local
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === id
            ? {
                ...updatedQuestion,
                id,
              }
            : q
        )
      );
    } catch (err) {
      const message = `Erro ao atualizar questão: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  const deleteQuestion = async (id: number): Promise<void> => {
    try {
      await deleteQuestionDB(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      const message = `Erro ao deletar questão: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
      throw err;
    }
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

      return await addQuestion(questionData);
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

        const newQuestion = await addQuestion(questionData);
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
    loading,
    error,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    importQuestion,
    importMultipleQuestions,
    refreshQuestions: loadQuestions,
  };
};
