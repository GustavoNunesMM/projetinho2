import { useCallback } from "react";
import { saveAs } from "file-saver";
import {
  generateDocx,
  readDocx,
  generateQuestionDocx,
  parseQuestionsFromText,
} from "./useDocumentGenerator/ExportWord";
import { useHeaderFromWord } from "./useDocumentGenerator/importHeader";
import { generatePdf } from "./useDocumentGenerator/exportPdf";
const { importHeaderFromDocx } = useHeaderFromWord();

export function useDocumentGenerator() {
  const saveFile = useCallback((blob: Blob, fileName: string): void => {
    saveAs(blob, fileName);
  }, []);

  return {
    generateQuestionDocx,
    generateDocx,
    generatePdf,
    readDocx,
    parseQuestionsFromText,
    importHeaderFromDocx,
    saveFile,
  };
}

export default useDocumentGenerator;
