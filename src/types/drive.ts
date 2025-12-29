export interface DriveFile {
  id: string;
  name: string;
  parents?: string[];
}

export interface DriveClient {
  ready: boolean;
  authorized: boolean;
  listDocxFiles: () => Promise<DriveFile[]>;
}

export interface DriveFileSelectorProps {
  onSelect: (fileId: string) => void;
  onClose: () => void;
  driveClient: DriveClient;
}

export interface DriveClientOptions {
  clientId?: string;
  apiKey?: string;
  discoveryDoc?: string;
  scope?: string;
  filesTTL?: number;
}

export interface TokenResponse {
  error?: string;
  access_token?: string;
}