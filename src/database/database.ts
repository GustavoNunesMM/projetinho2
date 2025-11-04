import Database from "@tauri-apps/plugin-sql";
import { appDataDir, join } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";

// ==================== Tipagens ====================

export interface Question {
  id?: number;
  enunciado: string;
  alternativa_correta: string;
  nivel: string;
  imagem?: string | null; // caminho da imagem opcional
  created_at?: string;
}

export interface Category {
  id?: number;
  nome: string;
  descricao?: string;
  created_at?: string;
}

export interface Layout {
  id?: number;
  nome: string;
  cabecalho?: string;
  rodape?: string;
  imagem?: string | null;
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
      enunciado TEXT NOT NULL,
      alternativa_correta TEXT NOT NULL,
      nivel TEXT NOT NULL,
      imagem TEXT,
      categoria_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS layouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      cabecalho TEXT,
      rodape TEXT,
      imagem TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✅ Tabelas verificadas/criadas com sucesso.");
}

// ==================== CRUD: Questões ====================

export async function insertQuestion(q: Question): Promise<void> {
  const db = await getDatabase();

  await db.execute("BEGIN");
  await db.execute(
    `INSERT INTO questions (enunciado, alternativa_correta, nivel, imagem)
     VALUES (?, ?, ?, ?)`,
    [q.enunciado, q.alternativa_correta, q.nivel, q.imagem ?? null]
  );
  await db.execute("COMMIT");

  console.log("🧩 Questão inserida:", q.enunciado);
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

export async function insertCategory(cat: Category): Promise<void> {
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

export async function insertLayout(l: Layout): Promise<void> {
  const db = await getDatabase();
  await db.execute("BEGIN");
  await db.execute(
    `INSERT INTO layouts (nome, cabecalho, rodape, imagem) VALUES (?, ?, ?, ?)`,
    [l.nome, l.cabecalho ?? "", l.rodape ?? "", l.imagem ?? null]
  );
  await db.execute("COMMIT");
  console.log("📐 Layout criado:", l.nome);
}

export async function getAllLayouts(): Promise<Layout[]> {
  const db = await getDatabase();
  const rows = await db.select<Layout[]>(
    "SELECT * FROM layouts ORDER BY created_at DESC"
  );
  return rows;
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
