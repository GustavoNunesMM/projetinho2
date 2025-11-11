import { useState, useEffect } from "react";
import { Question, QuestionFormData } from "../types/question";
import {
  getAllQuestions,
  insertQuestion,
  updateQuestion as updateQuestionDB,
  deleteQuestion as deleteQuestionDB,
} from "../database/database";
import { useDocumentGenerator } from "./useDocumentGenerator";

function serializeQuestion(q: QuestionFormData) {
  return {
    ...q,
    options: JSON.stringify(q.options),
    optionImages: JSON.stringify(q.optionImages),
  };
}

function deserializeQuestion(q: any): Question {
  return {
    ...q,
    options: typeof q.options === "string" ? JSON.parse(q.options) : [],
    optionImages:
      typeof q.optionImages === "string" ? JSON.parse(q.optionImages) : [],
  };
}

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { readDocx, parseQuestionsFromText } = useDocumentGenerator();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllQuestions();
      const deserialized = data.map(deserializeQuestion);
      setQuestions(deserialized);
      console.log("📚 Questões carregadas:", deserialized.length);
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
      const serialized = serializeQuestion(question);
      console.log("🔄 Adicionando questão:", {
        title: serialized.title,
        options: serialized.options,
      });

      const saved = await insertQuestion(serialized as any);
      const deserialized = deserializeQuestion(saved);

      setQuestions((prev) => [deserialized, ...prev]);
      console.log("✅ Questão adicionada no estado:", deserialized.id);

      await loadQuestions();

      return deserialized;
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
      const serialized = serializeQuestion(updatedQuestion);
      await updateQuestionDB(id, serialized as any);

      const data = await getAllQuestions();
      const deserialized = data.map(deserializeQuestion);
      setQuestions(deserialized);

      console.log("✏️ Questão atualizada:", id);
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
      console.log("🗑️ Questão deletada:", id);
    } catch (err) {
      const message = `Erro ao deletar questão: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  const importMultipleQuestions = async (file: File): Promise<Question[]> => {
    try {
      const text = await readDocx(file);
      const parsed = parseQuestionsFromText(text);

      if (parsed.length === 0) {
        throw new Error("Nenhuma questão encontrada no documento");
      }

      const importedQuestions: Question[] = [];

      for (const q of parsed) {
        const questionData: QuestionFormData = {
          title: q.statement || "Questão sem título",
          content: q.statement || "",
          contentImage: null,
          difficulty:
            q.difficulty === "dificil" || q.difficulty === "media" || q.difficulty === "facil"
              ? q.difficulty
              : "media",
          subject: q.subject || "Geral",
          category: q.category || "Importada",
          type: q.alternatives?.length ? "multipla" : "aberta",
          options: q.alternatives?.map((a: any) => a.text || a.texto || "") || [],
          optionImages: q.alternatives?.map(() => null) || [],
          correctAnswer: "",
          explanation: "",
          importedFrom: file.name,
        };

        const saved = await addQuestion(questionData);
        importedQuestions.push(saved);
      }

      console.log(`✅ ${importedQuestions.length} questões importadas com sucesso`);
      return importedQuestions;
    } catch (err) {
      const message = `Erro ao importar questões: ${(err as Error).message}`;
      console.error(message, err);
      throw err;
    }
  };

  return {
    questions,
    loading,
    error,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    importMultipleQuestions,
    refreshQuestions: loadQuestions,
  };
};
