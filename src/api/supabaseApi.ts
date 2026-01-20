import { supabase } from "@/lib/supabase";
import { Test, TestFormData } from "@/types/test";
import { Question, QuestionFormData } from "@/types/question";
import { Layout } from "@/types/layout";
import { Message } from "@/types/messages";

// ==================== Tipos ====================

interface SupabaseQuestion {
  id: number;
  user_id: string;
  title: string;
  content: string;
  content_image: string | null;
  difficulty: "facil" | "media" | "dificil";
  subject: string;
  category: string;
  type: "multipla" | "aberta";
  options: string[] | string;
  option_images: (string | null)[] | string;
  correct_answer: string;
  explanation: string;
  imported_from: string | null;
  created_at: string;
}

interface SupabaseLayout {
  id: number;
  user_id: string;
  name: string;
  font_size: string;
  font_family: string;
  line_spacing: string;
  margin_top: string;
  margin_bottom: string;
  margin_left: string;
  margin_right: string;
  header_text: string;
  header_locked: boolean;
  footer_text: string;
  imported_from: string | null;
  created_at: string;
}

interface SupabaseMessage {
  id: number;
  user_id: string;
  title: string;
  items: string;
  is_list: boolean;
  is_ordered: boolean;
  created_at: string;
}

interface SupabaseTest {
  id: number;
  user_id: string;
  title: string;
  description: string;
  file_path: string;
  file_name: string;
  file_size: number;
  school_year: string;
  subject: string;
  quarter: string;
  school_unit: string;
  category: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

// ==================== Helpers ====================

function serializeQuestion(q: QuestionFormData): Partial<SupabaseQuestion> {
  return {
    title: q.title,
    content: q.content,
    content_image: q.contentImage,
    difficulty: q.difficulty,
    subject: q.subject,
    category: q.category,
    type: q.type,
    options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || "[]"),
    option_images: Array.isArray(q.optionImages)
      ? q.optionImages
      : JSON.parse(q.optionImages || "[]"),
    correct_answer: q.correctAnswer,
    explanation: q.explanation,
    imported_from: q.importedFrom,
  };
}

function deserializeQuestion(q: SupabaseQuestion): Question {
  return {
    id: q.id,
    title: q.title,
    content: q.content,
    contentImage: q.content_image,
    difficulty: q.difficulty,
    subject: q.subject,
    category: q.category,
    type: q.type,
    options:
      typeof q.options === "string"
        ? JSON.parse(q.options)
        : q.options,
    optionImages:
      typeof q.option_images === "string"
        ? JSON.parse(q.option_images || "[]")
        : q.option_images || [],
    correctAnswer: q.correct_answer,
    explanation: q.explanation,
    importedFrom: q.imported_from,
    created_at: q.created_at,
  };
}

function serializeLayout(l: Omit<Layout, "id">): Partial<SupabaseLayout> {
  return {
    name: l.name,
    font_size: l.fontSize,
    font_family: l.fontFamily,
    line_spacing: l.lineSpacing,
    margin_top: l.marginTop,
    margin_bottom: l.marginBottom,
    margin_left: l.marginLeft,
    margin_right: l.marginRight,
    header_text: l.headerText,
    header_locked: typeof l.headerLocked === "boolean" ? l.headerLocked : l.headerLocked === 1,
    footer_text: l.footerText,
    imported_from: l.importedFrom,
  };
}

function deserializeLayout(l: SupabaseLayout): Layout {
  return {
    id: l.id,
    name: l.name,
    fontSize: l.font_size,
    fontFamily: l.font_family,
    lineSpacing: l.line_spacing,
    marginTop: l.margin_top,
    marginBottom: l.margin_bottom,
    marginLeft: l.margin_left,
    marginRight: l.margin_right,
    headerText: l.header_text,
    headerLocked: l.header_locked,
    footerText: l.footer_text,
    importedFrom: l.imported_from,
  };
}

function serializeTest(t: TestFormData): Partial<SupabaseTest> {
  return {
    title: t.title,
    description: t.description,
    file_path: t.filePath,
    file_name: t.fileName,
    file_size: t.fileSize,
    school_year: t.schoolYear,
    subject: t.subject,
    quarter: t.quarter,
    school_unit: t.schoolUnit,
    category: t.category,
    tags: t.tags,
  };
}

function deserializeTest(t: SupabaseTest): Test {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    filePath: t.file_path,
    fileName: t.file_name,
    fileSize: t.file_size,
    schoolYear: t.school_year,
    subject: t.subject,
    quarter: t.quarter,
    schoolUnit: t.school_unit,
    category: t.category,
    tags: t.tags,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  };
}

// ==================== CRUD: Tests ====================

export async function getAllTestsSupabase(userId: string): Promise<Test[]> {
  const { data, error } = await supabase
    .from("tests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(deserializeTest);
}

export async function getTestByIdSupabase(
  id: number,
  userId: string
): Promise<Test | null> {
  const { data, error } = await supabase
    .from("tests")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data ? deserializeTest(data) : null;
}

export async function uploadTestFileToStorage(
  file: Blob,
  fileName: string,
  userId: string
): Promise<string> {
  const filePath = `${userId}/${Date.now()}_${fileName}`;

  const { error } = await supabase.storage
    .from("tests")
    .upload(filePath, file, {
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      upsert: false,
    });

  if (error) {
    // Se o bucket não existir, criar um erro mais descritivo
    if (
      error.message.includes("Bucket not found") ||
      error.message.includes("not found")
    ) {
      throw new Error(
        "Bucket 'tests' não encontrado no Supabase Storage. Crie o bucket 'tests' no Supabase Dashboard.",
      );
    }
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("tests").getPublicUrl(filePath);

  return publicUrl;
}

export async function insertTestSupabase(
  test: TestFormData,
  userId: string,
  id?: number
): Promise<Test> {
  // Gerar ID se não fornecido (usando timestamp + random para evitar colisões)
  const testId = id !== undefined ? id : Date.now() + Math.floor(Math.random() * 1000);

  const testData: Partial<SupabaseTest> = {
    ...serializeTest(test),
    user_id: userId,
    id: testId,
  };

  const { data, error } = await supabase
    .from("tests")
    .insert(testData)
    .select()
    .single();

  if (error) {
    console.error("Erro ao inserir teste no Supabase:", error);
    console.error("Dados tentados:", testData);
    throw error;
  }

  return deserializeTest(data);
}

export async function updateTestSupabase(
  id: number,
  test: TestFormData,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("tests")
    .update({
      ...serializeTest(test),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function deleteTestSupabase(
  id: number,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("tests")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

// ==================== CRUD: Questions ====================

export async function getAllQuestionsSupabase(userId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(deserializeQuestion);
}

export async function getQuestionByIdSupabase(
  id: number,
  userId: string
): Promise<Question | null> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data ? deserializeQuestion(data) : null;
}

export async function insertQuestionSupabase(
  question: QuestionFormData,
  userId: string,
  id?: number
): Promise<Question> {
  const questionData: Partial<SupabaseQuestion> = {
    ...serializeQuestion(question),
    user_id: userId,
  };

  if (id !== undefined) {
    questionData.id = id;
  }

  const { data, error } = await supabase
    .from("questions")
    .insert(questionData)
    .select()
    .single();

  if (error) throw error;

  return deserializeQuestion(data);
}

export async function updateQuestionSupabase(
  id: number,
  question: QuestionFormData,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("questions")
    .update(serializeQuestion(question))
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function deleteQuestionSupabase(
  id: number,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

// ==================== CRUD: Layouts ====================

export async function getAllLayoutsSupabase(userId: string): Promise<Layout[]> {
  const { data, error } = await supabase
    .from("layouts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(deserializeLayout);
}

export async function getLayoutByIdSupabase(
  id: number,
  userId: string
): Promise<Layout | null> {
  const { data, error } = await supabase
    .from("layouts")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data ? deserializeLayout(data) : null;
}

export async function insertLayoutSupabase(
  layout: Omit<Layout, "id">,
  userId: string,
  id?: number
): Promise<Layout> {
  const layoutData: Partial<SupabaseLayout> = {
    ...serializeLayout(layout),
    user_id: userId,
  };

  if (id !== undefined) {
    layoutData.id = id;
  }

  const { data, error } = await supabase
    .from("layouts")
    .insert(layoutData)
    .select()
    .single();

  if (error) throw error;

  return deserializeLayout(data);
}

export async function updateLayoutSupabase(
  id: number,
  layout: Omit<Layout, "id">,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("layouts")
    .update(serializeLayout(layout))
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function deleteLayoutSupabase(
  id: number,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("layouts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

// ==================== CRUD: Messages ====================

export async function getAllMessagesSupabase(userId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((m: SupabaseMessage) => ({
    id: m.id,
    title: m.title,
    items: typeof m.items === "string" ? JSON.parse(m.items) : m.items,
    isList: m.is_list,
    isOrdered: m.is_ordered,
    createdAt: m.created_at,
    updatedAt: m.created_at,
  }));
}

export async function getMessageByIdSupabase(
  id: number,
  userId: string
): Promise<Message | null> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    items: typeof data.items === "string" ? JSON.parse(data.items) : data.items,
    isList: data.is_list,
    isOrdered: data.is_ordered,
    createdAt: data.created_at,
    updatedAt: data.created_at,
  };
}

export async function insertMessageSupabase(
  message: Omit<Message, "createdAt" | "updatedAt">,
  userId: string,
  id?: number
): Promise<Message> {
  const messageData: Partial<SupabaseMessage> = {
    user_id: userId,
    title: message.title,
    items: Array.isArray(message.items) ? JSON.stringify(message.items) : message.items,
    is_list: message.isList,
    is_ordered: message.isOrdered,
  };

  if (id !== undefined) {
    messageData.id = id;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert(messageData)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    items: typeof data.items === "string" ? JSON.parse(data.items) : data.items,
    isList: data.is_list,
    isOrdered: data.is_ordered,
    createdAt: data.created_at,
    updatedAt: data.created_at,
  };
}

export async function updateMessageSupabase(
  id: number,
  message: Omit<Message, "createdAt" | "updatedAt">,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({
      title: message.title,
      items: Array.isArray(message.items) ? JSON.stringify(message.items) : message.items,
      is_list: message.isList,
      is_ordered: message.isOrdered,
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function deleteMessageSupabase(
  id: number,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
