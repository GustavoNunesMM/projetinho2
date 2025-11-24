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
      questoes: multipla.map((q) => {
        const numeroQuestao = questions.indexOf(q) + 1;
        return {
          numero: numeroQuestao,
          alternativas: q.options
            .filter((opt) => opt)
            .map((_, i) => String.fromCharCode(65 + i)),
        };
      }),
    };
  }
  return { gerarGabarito };
}