import { useDocumentGenerator } from "./useDocumentGenerator";
import { useDriveClient } from "./useDriveClient";
import { LayoutFormData } from "../types/layout";
import { QuestionFormData } from "../types/question";

export function useImportHandlers() {
  const { readDocx, parseQuestionsFromText } = useDocumentGenerator();
  const driveClient = useDriveClient();

  const importQuestions = async (
    file: File | string,
    onSuccess?: (questions: QuestionFormData[]) => void
  ): Promise<QuestionFormData[]> => {
    try {
      let blob: Blob;

      if (file instanceof File) {
        blob = file;
      } else if (typeof file === "string" && driveClient.authorized) {
        blob = await driveClient.readDocxFile(file);
      } else {
        throw new Error("Fonte de arquivo inválida");
      }

      const text = await readDocx(blob);
      const parsed = parseQuestionsFromText(text);

      if (parsed.length === 0) {
        throw new Error("Nenhuma questão encontrada no documento");
      }

      const questions: QuestionFormData[] = parsed.map((q: any) => ({
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
        importedFrom: "arquivo DOCX",
      }));

      if (onSuccess) onSuccess(questions);
      return questions;
    } catch (error) {
      console.error("Erro ao importar questões:", error);
      throw error;
    }
  };

  const importLayout = async (
    file: File | string,
    onSuccess?: (layout: LayoutFormData) => void
  ): Promise<LayoutFormData> => {
    try {
      let blob: Blob;
      let fileName: string;

      if (file instanceof File) {
        blob = file;
        fileName = file.name;
      } else if (typeof file === "string" && driveClient.authorized) {
        blob = await driveClient.readDocxFile(file);
        fileName = `arquivo-${file}`;
      } else {
        throw new Error("Fonte de arquivo inválida");
      }

      const text = await readDocx(blob);
      const lines = text.split("\n").filter((l) => l.trim());

      const layout: LayoutFormData = {
        name: fileName.replace(".docx", "") || `Layout ${Date.now()}`,
        fontSize: "12pt",
        fontFamily: "Arial",
        lineSpacing: "1.5",
        marginTop: "10",
        marginBottom: "10",
        marginLeft: "10",
        marginRight: "10",
        headerText: lines[0] || "",
        headerLocked: false,
        footerText: lines[lines.length - 1] || "",
        importedFrom: fileName,
      };

      if (onSuccess) onSuccess(layout);
      return layout;
    } catch (error) {
      console.error("Erro ao importar layout:", error);
      throw error;
    }
  };

  const listDriveFiles = async (): Promise<{ id: string; name: string }[]> => {
    if (!driveClient.authorized) {
      throw new Error("Não autorizado no Google Drive");
    }

    return await driveClient.listDocxFiles();
  };

  return {
    importQuestions,
    importLayout,
    listDriveFiles,
    driveClient,
  };
}

export default useImportHandlers;
