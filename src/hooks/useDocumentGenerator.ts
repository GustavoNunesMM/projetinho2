import { useCallback } from "react";
import { saveAs } from "file-saver";
import {
  generateDocx,
  readDocx,
  generateQuestionDocx,
  parseQuestionsFromText,
} from "./useDocumentGenerator/ExportWord";
import { importHeaderFromDocx } from "./useDocumentGenerator/importHeader";
import { generatePdf } from "./useDocumentGenerator/exportPdf";

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
