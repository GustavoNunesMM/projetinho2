import { useState, useEffect } from "react";
import { Test, TestFormData } from "@/types/test";
import {
  getAllTests,
  insertTest,
  updateTest as updateTestDB,
  deleteTest as deleteTestDB,
} from "@/database/database";

export const useTests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTests();
      setTests(data);
    } catch (err) {
      const message = `Erro ao carregar provas: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  const addTest = async (test: TestFormData): Promise<Test> => {
    try {
      const saved = await insertTest(test);
      setTests((prev) => [saved, ...prev]);
      await loadTests();
      return saved;
    } catch (err) {
      const message = `Erro ao adicionar prova: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  const updateTest = async (id: number, updatedTest: TestFormData): Promise<void> => {
    try {
      await updateTestDB(id, updatedTest);
      await loadTests();
    } catch (err) {
      const message = `Erro ao atualizar prova: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  const deleteTest = async (id: number): Promise<void> => {
    try {
      await deleteTestDB(id);
      setTests((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const message = `Erro ao deletar prova: ${(err as Error).message}`;
      setError(message);
      console.error(message, err);
      throw err;
    }
  };

  return {
    tests,
    loading,
    error,
    loadTests,
    addTest,
    updateTest,
    deleteTest,
  };
};