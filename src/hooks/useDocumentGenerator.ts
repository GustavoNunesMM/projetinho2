import { useCallback } from "react";
import { saveAs } from "file-saver";
import { generateDocx, readDocx } from "./useDocumentGenerator/ExportWord";
import { useHeaderFromWord } from "./useDocumentGenerator/importHeader";
import { generatePdf } from "./useDocumentGenerator/exportPdf";
const { importHeaderFromDocx } = useHeaderFromWord();
export function useDocumentGenerator() {
  const saveFile = useCallback((blob: Blob, fileName: string): void => {
    saveAs(blob, fileName);
  }, []);

  return {
    generateDocx,
    generatePdf,
    readDocx,
    importHeaderFromDocx,
    saveFile,
  };
}

export default useDocumentGenerator;
