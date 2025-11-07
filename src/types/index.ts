// ==================== Question Types ====================

export interface Question {
  id: number;
  title: string;
  content: string;
  contentImage: string | null;
  difficulty: "facil" | "media" | "dificil";
  subject: string;
  category: string;
  type: "multipla" | "aberta";
  options: string[]; // Array no frontend
  optionImages: (string | null)[]; // Array no frontend
  correctAnswer: string;
  explanation: string;
  importedFrom: string | null;
  created_at?: string;
}

export interface QuestionFormData extends Omit<Question, "id" | "created_at"> {}

// Interface para o banco de dados (com arrays serializados)
export interface QuestionDB extends Omit<Question, "options" | "optionImages"> {
  options: string; // JSON string no banco
  optionImages: string | null; // JSON string no banco
}

// ==================== Layout Types ====================

export interface Layout {
  id: number;
  name: string;
  header?: string;
  footer?: string;
  fontSize: string;
  fontFamily: string;
  lineSpacing: string;
  marginTop: string;
  marginBottom: string;
  marginLeft: string;
  marginRight: string;
  headerText: string;
  headerLocked: boolean;
  footerText: string;
  importedFrom: string | null;
  created_at?: string;
}

export interface LayoutFormData extends Omit<Layout, "id" | "created_at"> {}

// ==================== Category Types ====================

export interface Category {
  id: number;
  nome: string;
  descricao?: string;
  created_at?: string;
}

export interface CategoryFormData extends Omit<Category, "id" | "created_at"> {}

// ==================== Utility Types ====================

export interface Statistics {
  questions: number;
  categories: number;
  layouts: number;
}

export interface ImportResult {
  success: boolean;
  count: number;
  errors?: string[];
}

// ==================== Helper Functions ====================

/**
 * Converte Question do frontend para o formato do banco de dados
 */
export function questionToDB(
  question: Omit<Question, "id" | "created_at">
): Omit<QuestionDB, "id" | "created_at"> {
  return {
    ...question,
    options: JSON.stringify(question.options),
    optionImages: JSON.stringify(question.optionImages),
  };
}

/**
 * Converte Question do banco de dados para o formato do frontend
 */
export function questionFromDB(questionDB: QuestionDB): Question {
  return {
    ...questionDB,
    options:
      typeof questionDB.options === "string"
        ? JSON.parse(questionDB.options)
        : questionDB.options,
    optionImages: questionDB.optionImages
      ? typeof questionDB.optionImages === "string"
        ? JSON.parse(questionDB.optionImages)
        : questionDB.optionImages
      : [],
  };
}
