import { useCallback } from "react";
import { saveAs } from "file-saver";

import {
  generateDocx,
  readDocx,
  generateQuestionDocx,
  parseQuestionsFromText,
} from "@/hooks/wordManager/ExportWord.ts";
import { importHeaderFromDocx } from "@/hooks/wordManager/importHeader.ts";
import { generatePdf } from "@/hooks/wordManager/exportPdf.ts";

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