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
}

export interface QuestionFormData extends Omit<Question, "id"> {}
