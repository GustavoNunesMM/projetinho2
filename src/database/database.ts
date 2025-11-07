import Database from "@tauri-apps/plugin-sql";
import { appDataDir, join } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";

// ==================== Tipagens ====================

export interface Question {
  id: number;
  title: string;
  content: string;
  contentImage: string | null;
  difficulty: "facil" | "media" | "dificil";
  subject: string;
  category: string;
  type: "multipla" | "aberta";
  options: string;
  optionImages: string | null;
  correctAnswer: string;
  explanation: string;
  importedFrom: string | null;
  created_at?: string;
}

export interface Category {
  id: number;
  nome: string;
  descricao?: string;
  created_at?: string;
}

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

// ==================== Inicialização ====================

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) return db;

  const dir = await appDataDir();
  const dbPath = await join(dir, "banco_questoes.db");

  const dirExists = await exists(dir);
  if (!dirExists) {
    await mkdir(dir, { recursive: true });
  }

  db = await Database.load(`sqlite:${dbPath}`);
  console.log("📦 Banco de dados carregado:", dbPath);

  await initializeDatabase(db);
  return db;
}

async function initializeDatabase(db: Database) {
  await db.execute(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      descricao TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      contentImage TEXT,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('facil', 'media', 'dificil')),
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('multipla', 'aberta')),
      options TEXT NOT NULL,
      optionImages TEXT,
      correctAnswer TEXT NOT NULL,
      explanation TEXT NOT NULL,
      importedFrom TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS layouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      header TEXT,
      footer TEXT,
      fontSize TEXT NOT NULL DEFAULT '12',
      fontFamily TEXT NOT NULL DEFAULT 'Arial',
      lineSpacing TEXT NOT NULL DEFAULT '1.5',
      marginTop TEXT NOT NULL DEFAULT '2.5',
      marginBottom TEXT NOT NULL DEFAULT '2.5',
      marginLeft TEXT NOT NULL DEFAULT '2.5',
      marginRight TEXT NOT NULL DEFAULT '2.5',
      headerText TEXT NOT NULL DEFAULT '',
      headerLocked INTEGER NOT NULL DEFAULT 0,
      footerText TEXT NOT NULL DEFAULT '',
      importedFrom TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✅ Tabelas verificadas/criadas com sucesso.");
}

// ==================== CRUD: Questões ====================

export async function insertQuestion(
  q: Omit<Question, "id" | "created_at">
): Promise<Question> {
  const db = await getDatabase();

  await db.execute("BEGIN");
  const result = await db.execute(
    `INSERT INTO questions (title, content, contentImage, difficulty, subject, category, type, options, optionImages, correctAnswer, explanation, importedFrom)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      q.title,
      q.content,
      q.contentImage,
      q.difficulty,
      q.subject,
      q.category,
      q.type,
      q.options,
      q.optionImages,
      q.correctAnswer,
      q.explanation,
      q.importedFrom,
    ]
  );
  await db.execute("COMMIT");

  const insertedId = result.lastInsertId;
  console.log("🧩 Questão inserida:", q.title, "ID:", insertedId);

  const inserted = await db.select<Question[]>(
    "SELECT * FROM questions WHERE id = ?",
    [insertedId]
  );

  return inserted[0];
}

export async function updateQuestion(
  id: number,
  q: Omit<Question, "id" | "created_at">
): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    `UPDATE questions SET 
      title = ?, content = ?, contentImage = ?, difficulty = ?, 
      subject = ?, category = ?, type = ?, options = ?, 
      optionImages = ?, correctAnswer = ?, explanation = ?, importedFrom = ?
     WHERE id = ?`,
    [
      q.title,
      q.content,
      q.contentImage,
      q.difficulty,
      q.subject,
      q.category,
      q.type,
      q.options,
      q.optionImages,
      q.correctAnswer,
      q.explanation,
      q.importedFrom,
      id,
    ]
  );
  console.log(`✏️ Questão ${id} atualizada`);
}

export async function getAllQuestions(): Promise<Question[]> {
  const db = await getDatabase();
  const rows = await db.select<Question[]>(
    "SELECT * FROM questions ORDER BY created_at DESC"
  );
  console.log("📋 Questões carregadas:", rows.length);
  return rows;
}

export async function deleteQuestion(id: number): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM questions WHERE id = ?", [id]);
  console.log(`🗑️ Questão ${id} removida`);
}

// ==================== CRUD: Categorias ====================

export async function insertCategory(
  cat: Omit<Category, "id" | "created_at">
): Promise<void> {
  const db = await getDatabase();
  await db.execute("BEGIN");
  await db.execute(`INSERT INTO categories (nome, descricao) VALUES (?, ?)`, [
    cat.nome,
    cat.descricao ?? "",
  ]);
  await db.execute("COMMIT");
  console.log("🏷️ Categoria criada:", cat.nome);
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDatabase();
  const rows = await db.select<Category[]>(
    "SELECT * FROM categories ORDER BY nome"
  );
  return rows;
}

// ==================== CRUD: Layouts ====================

export async function insertLayout(
  l: Omit<Layout, "id" | "created_at">
): Promise<Layout> {
  const db = await getDatabase();
  await db.execute("BEGIN");
  const result = await db.execute(
    `INSERT INTO layouts (name, header, footer, fontSize, fontFamily, lineSpacing, 
      marginTop, marginBottom, marginLeft, marginRight, headerText, headerLocked, 
      footerText, importedFrom) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      l.name,
      l.header ?? "",
      l.footer ?? "",
      l.fontSize,
      l.fontFamily,
      l.lineSpacing,
      l.marginTop,
      l.marginBottom,
      l.marginLeft,
      l.marginRight,
      l.headerText,
      l.headerLocked ? 1 : 0,
      l.footerText,
      l.importedFrom,
    ]
  );
  await db.execute("COMMIT");

  const insertedId = result.lastInsertId;
  console.log("📐 Layout criado:", l.name, "ID:", insertedId);

  const inserted = await db.select<Layout[]>(
    "SELECT * FROM layouts WHERE id = ?",
    [insertedId]
  );

  return {
    ...inserted[0],
    headerLocked: Boolean(inserted[0].headerLocked),
  };
}

export async function updateLayout(
  id: number,
  l: Omit<Layout, "id" | "created_at">
): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    `UPDATE layouts SET 
      name = ?, header = ?, footer = ?, fontSize = ?, fontFamily = ?, 
      lineSpacing = ?, marginTop = ?, marginBottom = ?, marginLeft = ?, 
      marginRight = ?, headerText = ?, headerLocked = ?, footerText = ?, 
      importedFrom = ?
     WHERE id = ?`,
    [
      l.name,
      l.header ?? "",
      l.footer ?? "",
      l.fontSize,
      l.fontFamily,
      l.lineSpacing,
      l.marginTop,
      l.marginBottom,
      l.marginLeft,
      l.marginRight,
      l.headerText,
      l.headerLocked ? 1 : 0,
      l.footerText,
      l.importedFrom,
      id,
    ]
  );
  console.log(`✏️ Layout ${id} atualizado`);
}

export async function getAllLayouts(): Promise<Layout[]> {
  const db = await getDatabase();
  const rows = await db.select<Layout[]>(
    "SELECT * FROM layouts ORDER BY created_at DESC"
  );
  return rows.map((row) => ({
    ...row,
    headerLocked: Boolean(row.headerLocked),
  }));
}

export async function deleteLayout(id: number): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM layouts WHERE id = ?", [id]);
  console.log(`🗑️ Layout ${id} removido`);
}

// ==================== Utilitários ====================

export async function getStatistics() {
  const db = await getDatabase();

  const q = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM questions"
  );
  const c = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM categories"
  );
  const l = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM layouts"
  );

  return {
    questions: q[0]?.count || 0,
    categories: c[0]?.count || 0,
    layouts: l[0]?.count || 0,
  };
}

export async function clearDatabase() {
  const db = await getDatabase();
  await db.execute("DELETE FROM questions");
  await db.execute("DELETE FROM categories");
  await db.execute("DELETE FROM layouts");
  console.log("🧹 Banco de dados limpo.");
}
