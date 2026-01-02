import { Message } from "@/types/messages";
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

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) return db;

  db = await Database.load("sqlite:banco_questoes.db");

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
      name TEXT NOT NULL,
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
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      items TEXT NOT NULL,
      isList INTEGER DEFAULT 0,
      isOrdered INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// ==================== CRUD: Questões ====================

export async function insertQuestion(
  q: Omit<Question, "created_at"> & { id?: number }
): Promise<Question> {
  const db = await getDatabase();

  const hasId = q.id !== undefined && q.id !== null;
  
  if (hasId) {
    const existing = await db.select<Question[]>(
      "SELECT * FROM questions WHERE id = $1",
      [q.id]
    );
    
    if (existing && existing.length > 0) {
      return existing[0];
    }
  }

  const columns = hasId
    ? `id, title, content, contentImage, difficulty, subject, category, type, options, optionImages, correctAnswer, explanation, importedFrom`
    : `title, content, contentImage, difficulty, subject, category, type, options, optionImages, correctAnswer, explanation, importedFrom`;
  const placeholders = hasId
    ? `$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13`
    : `$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12`;
  const values = hasId
    ? [
        q.id,
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
    : [
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
      ];

  const result = await db.execute(
    `INSERT INTO questions (${columns}) VALUES (${placeholders})`,
    values
  );

  const insertedId = hasId ? q.id! : Number(result.lastInsertId);

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
}

export async function getAllQuestions(): Promise<Question[]> {
  const db = await getDatabase();
  const rows = await db.select<Question[]>(
    "SELECT * FROM questions ORDER BY created_at DESC"
  );
  return rows;
}

export async function deleteQuestion(id: number): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM questions WHERE id = $1", [id]);
  await db.execute("PRAGMA wal_checkpoint(TRUNCATE)");
}

export async function deleteAllQuestion(): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM questions");
  await db.execute("PRAGMA wal_checkpoint(TRUNCATE)");
}

// ==================== CRUD: Layouts ====================

export async function insertLayout(
  l: Omit<Layout, "created_at"> & { id?: number }
): Promise<Layout> {
  const db = await getDatabase();

  const hasId = l.id !== undefined && l.id !== null;
  
  if (hasId) {
    const existing = await db.select<Layout[]>(
      "SELECT * FROM layouts WHERE id = $1",
      [l.id]
    );
    
    if (existing && existing.length > 0) {
      return existing[0];
    }
  }

  const columns = hasId 
    ? `id, name, fontSize, fontFamily, lineSpacing, marginTop, marginBottom, marginLeft, marginRight, headerText, headerLocked, footerText, importedFrom`
    : `name, fontSize, fontFamily, lineSpacing, marginTop, marginBottom, marginLeft, marginRight, headerText, headerLocked, footerText, importedFrom`;
  const placeholders = hasId 
    ? `$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13`
    : `$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12`;
  const values = hasId
    ? [
        l.id,
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
    : [
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
      ];

  const result = await db.execute(
    `INSERT INTO layouts (${columns}) VALUES (${placeholders})`,
    values
  );

  const insertedId = hasId ? l.id! : Number(result.lastInsertId);

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
}

export async function getAllLayouts(): Promise<Layout[]> {
  const db = await getDatabase();
  const rows = await db.select<Layout[]>(
    "SELECT * FROM layouts ORDER BY created_at DESC"
  );
  return rows;
}

export async function deleteLayout(id: number): Promise<void> {
  const db = await getDatabase();
  console.log(db, id);
  await db.execute("DELETE FROM layouts WHERE id = $1", [id]);
  await db.execute("PRAGMA wal_checkpoint(TRUNCATE)");
}

export async function deleteAllLayout(): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM layouts");
  await db.execute("PRAGMA wal_checkpoint(TRUNCATE)");
}
// ===================== CRUD: Messages ===================
export async function getAllMessages(): Promise<Message[]> {
  const db = await getDatabase();
  return await db.select("SELECT * FROM messages ORDER BY createdAt DESC");
}

export async function insertMessage(
  message: Omit<Message, "createdAt" | "updatedAt"> & { id?: number }
): Promise<Message> {
  const db = await getDatabase();
  
  const hasId = message.id !== undefined && message.id !== null;
  
  if (hasId) {
    const existing = await db.select<Message[]>(
      "SELECT * FROM messages WHERE id = ?",
      [message.id]
    );
    
    if (existing && existing.length > 0) {
      return existing[0];
    }
  }

  const columns = hasId
    ? `id, title, items, isList, isOrdered, createdAt, updatedAt`
    : `title, items, isList, isOrdered, createdAt, updatedAt`;
  const placeholders = hasId
    ? `?, ?, ?, ?, datetime('now'), datetime('now')`
    : `?, ?, ?, ?, datetime('now'), datetime('now')`;
  const values = hasId
    ? [
        message.id,
        message.title,
        message.items,
        message.isList ? 1 : 0,
        message.isOrdered ? 1 : 0,
      ]
    : [
        message.title,
        message.items,
        message.isList ? 1 : 0,
        message.isOrdered ? 1 : 0,
      ];

  const result = await db.execute(
    `INSERT INTO messages (${columns}) VALUES (${placeholders})`,
    values
  );

  const insertedId = hasId ? message.id! : Number(result.lastInsertId);
  const inserted = await db.select<Message[]>(
    "SELECT * FROM messages WHERE id = ?",
    [insertedId]
  );

  if (!inserted || inserted.length === 0) {
    throw new Error("Falha ao recuperar mensagem inserida");
  }

  return inserted[0];
}

export async function updateMessage(
  id: number,
  message: Omit<Message, "createdAt" | "updatedAt">
): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    `UPDATE messages 
     SET title = ?, items = ?, isList = ?, isOrdered = ?, updatedAt = datetime('now')
     WHERE id = ?`,
    [
      message.title,
      message.items,
      message.isList ? 1 : 0,
      message.isOrdered ? 1 : 0,
      id,
    ]
  );
}

export async function deleteMessage(id: number): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM messages WHERE id = ?", [id]);
}

export async function deleteAllMessages(): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM messages");
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
  const m = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM messages"
  );

  return {
    questions: q[0]?.count || 0,
    categories: 0,
    layouts: l[0]?.count || 0,
    message: m[0]?.count || 0,
  };
}

export async function clearDatabase() {
  const db = await getDatabase();
  await db.execute("DELETE FROM questions");
  await db.execute("DELETE FROM layouts");
}
