export interface Question {
  id: number;
  title: string;
  content: string;
  contentImage: string | null;
  difficulty: "facil" | "media" | "dificil";
  subject: string;
  category: string;
  type: "multipla" | "aberta";
  options: string[];
  optionImages: (string | null)[];
  correctAnswer: string;
  explanation: string;
  importedFrom: string | null;
  created_at?: string;
}

export interface DriveFile {
  id: string;
  name: string;
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

export interface QuestionFormData extends Omit<Question, "id"> {}

export interface ParsedQuestion {
  id?: number;
  statement: string;
  subject?: string;
  difficulty?: "facil" | "media" | "dificil";
  tags?: string[];
  alternatives?: { letter?: string; text?: string }[];
}
