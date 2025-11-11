import Database from "@tauri-apps/plugin-sql";

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

export interface Layout {
  id: number;
  name: string;
  fontSize: string;
  fontFamily: string;
  lineSpacing: string;
  marginTop: string;
  marginBottom: string;
  marginLeft: string;
  marginRight: string;
  headerText: string;
  headerLocked: number;
  footerText: string;
  importedFrom: string | null;
  created_at?: string;
}

// ==================== Inicialização ====================

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) return db;

  db = await Database.load("sqlite:banco_questoes.db");
  console.log("📦 Banco SQLite Tauri carregado");

  await initializeDatabase(db);
  return db;
}
async function initializeDatabase(db: Database) {
  await db.execute(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      contentImage TEXT,
      difficulty TEXT NOT NULL CHECK(difficulty IN ('facil', 'media', 'dificil')),
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('multipla', 'aberta')),
      options TEXT NOT NULL DEFAULT '[]',
      optionImages TEXT DEFAULT '[]',
      correctAnswer TEXT NOT NULL DEFAULT '',
      explanation TEXT NOT NULL DEFAULT '',
      importedFrom TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS layouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
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

  console.log("✅ Schema do banco criado/atualizado");
}
// ==================== CRUD: Questões ====================

export async function insertQuestion(
  q: Omit<Question, "id" | "created_at">
): Promise<Question> {
  const db = await getDatabase();

  console.log("📝 Inserindo questão:", {
    title: q.title,
    type: q.type,
    difficulty: q.difficulty,
  });

  const result = await db.execute(
    `INSERT INTO questions (
      title, content, contentImage, difficulty, subject, category, 
      type, options, optionImages, correctAnswer, explanation, importedFrom
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      q.title,
      q.content,
      q.contentImage || null,
      q.difficulty,
      q.subject,
      q.category,
      q.type,
      q.options,
      q.optionImages || "[]",
      q.correctAnswer,
      q.explanation,
      q.importedFrom || null,
    ]
  );

  const insertedId = Number(result.lastInsertId);
  console.log("✅ Questão inserida com ID:", insertedId);

  const inserted = await db.select<Question[]>(
    "SELECT * FROM questions WHERE id = $1",
    [insertedId]
  );

  if (!inserted || inserted.length === 0) {
    throw new Error("Falha ao recuperar questão inserida");
  }

  return inserted[0];
}

export async function updateQuestion(
  id: number,
  q: Omit<Question, "id" | "created_at">
): Promise<void> {
  const db = await getDatabase();

  await db.execute(
    `UPDATE questions SET 
      title = $1, content = $2, contentImage = $3, difficulty = $4, 
      subject = $5, category = $6, type = $7, options = $8, 
      optionImages = $9, correctAnswer = $10, explanation = $11, importedFrom = $12
     WHERE id = $13`,
    [
      q.title,
      q.content,
      q.contentImage || null,
      q.difficulty,
      q.subject,
      q.category,
      q.type,
      q.options,
      q.optionImages || "[]",
      q.correctAnswer,
      q.explanation,
      q.importedFrom || null,
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
  await db.execute("DELETE FROM questions WHERE id = $1", [id]);
  console.log(`🗑️ Questão ${id} removida`);
}

// ==================== CRUD: Layouts ====================

export async function insertLayout(
  l: Omit<Layout, "id" | "created_at">
): Promise<Layout> {
  const db = await getDatabase();

  console.log("📐 Inserindo layout:", {
    name: l.name,
    fontSize: l.fontSize,
    fontFamily: l.fontFamily,
  });

  const result = await db.execute(
    `INSERT INTO layouts (
      name, fontSize, fontFamily, lineSpacing, 
      marginTop, marginBottom, marginLeft, marginRight, 
      headerText, headerLocked, footerText, importedFrom
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      l.name,
      l.fontSize,
      l.fontFamily,
      l.lineSpacing,
      l.marginTop,
      l.marginBottom,
      l.marginLeft,
      l.marginRight,
      l.headerText,
      l.headerLocked,
      l.footerText,
      l.importedFrom || null,
    ]
  );

  const insertedId = Number(result.lastInsertId);
  console.log("✅ Layout criado com ID:", insertedId);

  const inserted = await db.select<Layout[]>(
    "SELECT * FROM layouts WHERE id = $1",
    [insertedId]
  );

  if (!inserted || inserted.length === 0) {
    throw new Error("Falha ao recuperar layout inserido");
  }

  return inserted[0];
}

export async function updateLayout(
  id: number,
  l: Omit<Layout, "id" | "created_at">
): Promise<void> {
  const db = await getDatabase();

  await db.execute(
    `UPDATE layouts SET 
      name = $1, fontSize = $2, fontFamily = $3, lineSpacing = $4, 
      marginTop = $5, marginBottom = $6, marginLeft = $7, marginRight = $8,
      headerText = $9, headerLocked = $10, footerText = $11, importedFrom = $12
     WHERE id = $13`,
    [
      l.name,
      l.fontSize,
      l.fontFamily,
      l.lineSpacing,
      l.marginTop,
      l.marginBottom,
      l.marginLeft,
      l.marginRight,
      l.headerText,
      l.headerLocked,
      l.footerText,
      l.importedFrom || null,
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
  console.log("📐 Layouts carregados:", rows.length);
  return rows;
}

export async function deleteLayout(id: number): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM layouts WHERE id = $1", [id]);
  console.log(`🗑️ Layout ${id} removido`);
}

// ==================== Utilitários ====================

export async function getStatistics() {
  const db = await getDatabase();

  const q = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM questions"
  );
  const l = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM layouts"
  );

  return {
    questions: q[0]?.count || 0,
    categories: 0,
    layouts: l[0]?.count || 0,
  };
}

export async function clearDatabase() {
  const db = await getDatabase();
  await db.execute("DELETE FROM questions");
  await db.execute("DELETE FROM layouts");
  console.log("🧹 Banco limpo");
}
