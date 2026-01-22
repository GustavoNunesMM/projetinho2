import { useState, useEffect, useCallback } from "react";
import { UpdateInfo } from "@/components/common/UpdateModal";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { info } from "@tauri-apps/plugin-log";

interface UseUpdaterReturn {
  updateInfo: UpdateInfo | null;
  isUpdateAvailable: boolean;
  isChecking: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  checkForUpdates: () => Promise<void>;
  downloadAndInstallUpdate: () => Promise<void>;
  error: string | null;
}

export function useUpdater(): UseUpdaterReturn {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<any>(null);

  const checkForUpdates = useCallback(async () => {
    try {
      setIsChecking(true);
      setError(null);
      
      const update = await check();
      
      if (update) {
        setUpdateInfo({
          version: update.version,
          releaseDate: update.date ?? new Date().toISOString(),
          releaseNotes: update.body ?? "Atualização disponível",
          downloadUrl: "",
          size: 0,
        });
        setIsUpdateAvailable(true);
        setPendingUpdate(update);
        await info(`Update available: ${update.version}`);
      } else {
        setIsUpdateAvailable(false);
        setUpdateInfo(null);
        setPendingUpdate(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao verificar atualizações"
      );
    } finally {
      setIsChecking(false);
    }
  }, []);

  const downloadAndInstallUpdate = useCallback(async () => {
    if (!pendingUpdate) {
      setError("Nenhuma atualização pendente");
      return;
    }

    try {
      setError(null);
      setIsDownloading(true);
      setDownloadProgress(0);

      const progressCallback = (event: any) => {
        try {
          switch (event.event) {
            case "Started":
              setDownloadProgress(0);
              info(`Started downloading ${event.data?.contentLength || 0} bytes`);
              break;
            case "Progress":
              if (event.data?.contentLength > 0 && event.data?.chunkLength >= 0) {
                const progress =
                  (event.data.chunkLength / event.data.contentLength) * 100;
                const clampedProgress = Math.min(Math.max(progress, 0), 100);
                setDownloadProgress(clampedProgress);
                info(`Progress: ${Math.round(clampedProgress)}%`);
              }
              break;
            case "Finished":
              setDownloadProgress(100);
              info("Download and installation finished");
              break;
            case "Error":
              const errorMsg = event.data || "Erro durante download/instalação";
              info(`Error: ${errorMsg}`);
              throw new Error(errorMsg);
          }
        } catch (err) {
          throw err;
        }
      };

      await pendingUpdate.downloadAndInstall(progressCallback);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      info("Relançando aplicativo após atualização...");
      setIsDownloading(false);
      
      await relaunch();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao instalar atualização";
      setError(message);
      setIsDownloading(false);
      info(`Update error: ${message}`);
      throw err;
    }
  }, [pendingUpdate]);

  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  return {
    updateInfo,
    isUpdateAvailable,
    isChecking,
    isDownloading,
    downloadProgress,
    checkForUpdates,
    downloadAndInstallUpdate,
    error,
  };
}