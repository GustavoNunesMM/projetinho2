import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface DriveFile {
  id: string;
  name: string;
  parents?: string[];
}

interface DriveClientOptions {
  clientId?: string;
  apiKey?: string;
  discoveryDoc?: string;
  scope?: string;
  filesTTL?: number;
}

interface TokenResponse {
  error?: string;
  access_token?: string;
}

interface GapiClient {
  init: (config: { apiKey: string; discoveryDocs: string[] }) => Promise<void>;
  getToken: () => { access_token: string } | null;
  setToken: (token: string) => void;
  drive: {
    files: {
      list: (params: any) => Promise<{ result: { files?: DriveFile[] } }>;
      create: (params: any) => Promise<{ result: { id: string } }>;
    };
  };
}

interface TokenClient {
  callback: (response: TokenResponse) => void;
  requestAccessToken: (options: { prompt: string }) => void;
}

declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: GapiClient;
    };
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: () => void;
          }) => TokenClient;
          revoke: (token: string, callback: () => void) => void;
        };
      };
    };
  }
}

let gapiLoadedPromise: Promise<void> | null = null;
let gisLoadedPromise: Promise<void> | null = null;
let gapiInitialized = false;
let tokenClientSingleton: TokenClient | null = null;

let folderIdCache: string | null = null;
let folderIdPromise: Promise<string> | null = null;

let filesCache: DriveFile[] | null = null;
let filesCacheAt = 0;

const loadScriptOnce = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.body.appendChild(s);
  });

const now = (): number => Date.now();

export function useDriveClient(options: DriveClientOptions = {}) {
  const {
    clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID,
    apiKey = import.meta.env.VITE_GOOGLE_API_KEY,
    discoveryDoc = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    scope = "https://www.googleapis.com/auth/drive.file",
    filesTTL = 30_000,
  } = options;

  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!gapiLoadedPromise) {
      gapiLoadedPromise = loadScriptOnce("https://apis.google.com/js/api.js")
        .then(
          () =>
            new Promise<void>((resolve) => {
              window.gapi.load("client", resolve);
            })
        )
        .catch((e) => {
          console.error("Falha ao carregar gapi:", e);
          throw e;
        });
    }

    if (!gisLoadedPromise) {
      gisLoadedPromise = loadScriptOnce(
        "https://accounts.google.com/gsi/client"
      ).catch((e) => {
        console.error("Falha ao carregar gis:", e);
        throw e;
      });
    }

    Promise.all([gapiLoadedPromise, gisLoadedPromise])
      .then(async () => {
        if (!gapiInitialized) {
          await window.gapi.client.init({
            apiKey,
            discoveryDocs: [discoveryDoc],
          });
          gapiInitialized = true;
        }

        if (!tokenClientSingleton) {
          tokenClientSingleton =
            window.google.accounts.oauth2.initTokenClient({
              client_id: clientId,
              scope,
              callback: () => {},
            });
        }

        if (isMounted.current) {
          setReady(true);
          const token = window.gapi.client.getToken?.();
          setAuthorized(!!token);
        }
      })
      .catch((e) => {
        if (isMounted.current) setError(e as Error);
      });

    return () => {
      isMounted.current = false;
    };
  }, [apiKey, clientId, discoveryDoc, scope]);

  const signIn = useCallback(() => {
    if (!tokenClientSingleton) return Promise.reject(new Error('Token client not initialized'));
    return new Promise<boolean>((resolve, reject) => {
      tokenClientSingleton!.callback = async (resp: TokenResponse) => {
        if (resp?.error) {
          setAuthorized(false);
          reject(resp.error);
          return;
        }
        setAuthorized(true);
        resolve(true);
      };
      tokenClientSingleton!.requestAccessToken({ prompt: "consent" });
    });
  }, []);

  const signOut = useCallback(() => {
    try {
      const token = window.gapi.client.getToken?.();
      if (token) {
        window.google.accounts.oauth2.revoke(token.access_token, () => {});
        window.gapi.client.setToken("");
      }
      setAuthorized(false);
      filesCache = null;
      filesCacheAt = 0;
    } catch (e) {
      console.warn("Erro ao sair:", e);
    }
  }, []);

  const ensureFolder = useCallback(async (): Promise<string> => {
    if (folderIdCache) return folderIdCache;

    if (!folderIdPromise) {
      folderIdPromise = (async () => {
        const res = await window.gapi.client.drive.files.list({
          q: "name = 'banco_de_questoes' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
          fields: "files(id, name)",
        });

        if (res.result.files && res.result.files.length > 0) {
          folderIdCache = res.result.files[0].id;
          return folderIdCache;
        }

        const createRes = await window.gapi.client.drive.files.create({
          resource: {
            name: "banco_de_questoes",
            mimeType: "application/vnd.google-apps.folder",
          },
          fields: "id",
        });

        folderIdCache = createRes.result.id;
        return folderIdCache;
      })().finally(() => {
        folderIdPromise = null;
      });
    }

    return folderIdPromise;
  }, []);

  const listDocxFiles = useCallback(
    async ({ force = false }: { force?: boolean } = {}): Promise<DriveFile[]> => {
      if (!authorized) throw new Error("Não autorizado no Google Drive.");
      const freshEnough = now() - filesCacheAt < filesTTL;

      if (!force && filesCache && freshEnough) {
        return filesCache;
      }

      const baseFolderId = folderIdCache || (await ensureFolder());
      const query = `'${baseFolderId}' in parents and mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document' and trashed=false`;

      const res = await window.gapi.client.drive.files.list({
        q: query,
        fields: "files(id, name, parents)",
        pageSize: 100,
      });

      filesCache = res.result.files || [];
      filesCacheAt = now();
      return filesCache;
    },
    [authorized, ensureFolder, filesTTL]
  );

  const createDocxFile = useCallback(
    async (fileName: string, blob: Blob, parentId: string | null = null): Promise<any> => {
      if (!authorized) throw new Error("Não autorizado no Google Drive.");

      const baseFolderId = folderIdCache || (await ensureFolder());
      const parentFolder = parentId || baseFolderId;

      const metadata = {
        name: fileName.endsWith(".docx") ? fileName : `${fileName}.docx`,
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        parents: [parentFolder],
      };

      const form = new FormData();
      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      form.append("metadata", metadataBlob);
      form.append("file", blob);

      const res = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: new Headers({
            Authorization: `Bearer ${window.gapi.client.getToken()!.access_token}`,
          }),
          body: form,
        }
      );

      const result = await res.json();
      filesCache = null;
      filesCacheAt = 0;
      return result;
    },
    [authorized, ensureFolder]
  );

  const readDocxFile = useCallback(async (fileId: string): Promise<Blob> => {
    if (!authorized) throw new Error("Não autorizado no Google Drive.");
    const accessToken = window.gapi.client.getToken()!.access_token;

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
      }
    );

    if (!res.ok) throw new Error("Erro ao baixar arquivo .docx");
    return await res.blob();
  }, [authorized]);

  const refreshFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const list = await listDocxFiles({ force: true });
      if (isMounted.current) setFiles(list);
    } catch (e) {
      if (isMounted.current) setError(e as Error);
    } finally {
      if (isMounted.current) setLoadingFiles(false);
    }
  }, [listDocxFiles]);

  useEffect(() => {
    if (authorized) {
      refreshFiles();
    } else {
      setFiles([]);
    }
  }, [authorized, refreshFiles]);

  return useMemo(
    () => ({
      ready,
      authorized,
      loadingFiles,
      files,
      error,
      signIn,
      signOut,
      ensureFolder,
      listDocxFiles,
      createDocxFile,
      readDocxFile,
      refreshFiles,
    }),
    [
      ready,
      authorized,
      loadingFiles,
      files,
      error,
      signIn,
      signOut,
      ensureFolder,
      listDocxFiles,
      createDocxFile,
      readDocxFile,
      refreshFiles,
    ]
  );
}
