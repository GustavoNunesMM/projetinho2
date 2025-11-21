// hooks/useGabarito.ts
import { Question } from "@/types/question";
import { GabaritoData } from "@/types";

export function useGabarito() {
  function gerarGabarito(
    questions: Question[],
    colunasPorLinha = 5
  ): GabaritoData {
    const multipla = questions.filter((q) => q.type === "multipla");
    return {
      colunasPorLinha,
      questoes: multipla.map((q, idx) => ({
        numero: idx + 1, // ordem de aparição
        alternativas: q.options
          .filter((opt) => opt) // remove vazias
          .map((_, i) => String.fromCharCode(65 + i)),
      })),
    };
  }
  return { gerarGabarito };
}
