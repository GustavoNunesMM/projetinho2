import { supabase } from "@/lib/supabase";
import {
  getAllQuestions,
  insertQuestion,
  getAllLayouts,
  getAllTests,
  insertTest,
  insertLayout,
  getAllMessages,
  insertMessage,
} from "@/database/database";

interface SyncResult {
  success: boolean;
  uploaded: number;
  downloaded: number;
  errors: string[];
}

export class SyncService {
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  async syncAll(): Promise<SyncResult> {
    if (!this.userId) {
      throw new Error("User ID não definido");
    }

    const result: SyncResult = {
      success: true,
      uploaded: 0,
      downloaded: 0,
      errors: [],
    };

    try {
      const questionsResult = await this.syncQuestions();
      const layoutsResult = await this.syncLayouts();
      const messagesResult = await this.syncMessages();
      const testsResult = await this.syncTests();

      result.uploaded =
        questionsResult.uploaded +
        layoutsResult.uploaded +
        messagesResult.uploaded +
        testsResult.uploaded;

      result.downloaded =
        questionsResult.downloaded +
        layoutsResult.downloaded +
        messagesResult.downloaded +
        testsResult.downloaded;

      result.errors = [
        ...questionsResult.errors,
        ...layoutsResult.errors,
        ...messagesResult.errors,
        ...testsResult.errors,
      ];
      result.success = result.errors.length === 0;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
    }

    return result;
  }

  async syncQuestions(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      uploaded: 0,
      downloaded: 0,
      errors: [],
    };

    try {
      const localQuestions = await getAllQuestions();

      const { data: remoteQuestions, error: fetchError } = await supabase
        .from("questions")
        .select("*")
        .eq("user_id", this.userId);

      if (fetchError) throw fetchError;

      const remoteMap = new Map(
        (remoteQuestions || []).map((q) => [Number(q.id), q]),
      );
      const localMap = new Map(localQuestions.map((q) => [Number(q.id), q]));

      for (const local of localQuestions) {
        const remote = remoteMap.get(local.id);

        if (!remote) {
          try {
            const questionData = {
              id: local.id,
              user_id: this.userId,
              title: local.title,
              content: local.content,
              content_image: local.contentImage,
              difficulty: local.difficulty,
              subject: local.subject,
              category: local.category,
              type: local.type,
              options:
                typeof local.options === "string"
                  ? JSON.parse(local.options)
                  : local.options,
              option_images:
                typeof local.optionImages === "string"
                  ? JSON.parse(local.optionImages || "[]")
                  : local.optionImages || [],
              correct_answer: local.correctAnswer,
              explanation: local.explanation,
              imported_from: local.importedFrom,
              created_at: local.created_at,
            };

            const { error } = await supabase
              .from("questions")
              .upsert(questionData, {
                onConflict: "id",
              });

            if (error) {
              result.errors.push(
                `Erro ao enviar questão ${local.id}: ${error.message}`,
              );
            } else {
              result.uploaded++;
            }
          } catch (uploadError: any) {
            result.errors.push(
              `Erro ao enviar questão ${local.id}: ${uploadError.message}`,
            );
          }
        }
      }

      for (const remote of remoteQuestions || []) {
        const remoteId = Number(remote.id);
        const local = localMap.get(remoteId);

        if (!local) {
          try {
            await insertQuestion({
              id: remoteId,
              title: remote.title,
              content: remote.content,
              contentImage: remote.content_image,
              difficulty: remote.difficulty,
              subject: remote.subject,
              category: remote.category,
              type: remote.type,
              options:
                typeof remote.options === "string"
                  ? remote.options
                  : JSON.stringify(remote.options),
              optionImages:
                typeof remote.option_images === "string"
                  ? remote.option_images
                  : JSON.stringify(remote.option_images || []),
              correctAnswer: remote.correct_answer,
              explanation: remote.explanation,
              importedFrom: remote.imported_from,
            });
            result.downloaded++;
          } catch (downloadError: any) {
            result.errors.push(
              `Erro ao baixar questão ${remoteId}: ${downloadError.message}`,
            );
          }
        }
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Erro na sincronização de questões: ${error.message}`);
    }

    return result;
  }

  async syncLayouts(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      uploaded: 0,
      downloaded: 0,
      errors: [],
    };

    try {
      const localLayouts = await getAllLayouts();

      const { data: remoteLayouts, error: fetchError } = await supabase
        .from("layouts")
        .select("*")
        .eq("user_id", this.userId);

      if (fetchError) throw fetchError;

      const remoteMap = new Map(
        (remoteLayouts || []).map((l) => [Number(l.id), l]),
      );
      const localMap = new Map(localLayouts.map((l) => [Number(l.id), l]));

      for (const local of localLayouts) {
        const remote = remoteMap.get(local.id);

        if (!remote) {
          try {
            const layoutData = {
              id: local.id,
              user_id: this.userId,
              name: local.name,
              font_size: local.fontSize,
              font_family: local.fontFamily,
              line_spacing: local.lineSpacing,
              margin_top: local.marginTop,
              margin_bottom: local.marginBottom,
              margin_left: local.marginLeft,
              margin_right: local.marginRight,
              header_text: local.headerText,
              header_locked: local.headerLocked === 1,
              footer_text: local.footerText,
              imported_from: local.importedFrom,
              created_at: local.created_at,
            };

            const { error } = await supabase
              .from("layouts")
              .upsert(layoutData, {
                onConflict: "id",
              });

            if (error) {
              result.errors.push(
                `Erro ao enviar layout ${local.id}: ${error.message}`,
              );
            } else {
              result.uploaded++;
            }
          } catch (uploadError: any) {
            result.errors.push(
              `Erro ao enviar layout ${local.id}: ${uploadError.message}`,
            );
          }
        }
      }

      for (const remote of remoteLayouts || []) {
        const remoteId = Number(remote.id);
        const local = localMap.get(remoteId);

        if (!local) {
          try {
            await insertLayout({
              id: remoteId,
              name: remote.name,
              fontSize: remote.font_size,
              fontFamily: remote.font_family,
              lineSpacing: remote.line_spacing,
              marginTop: remote.margin_top,
              marginBottom: remote.margin_bottom,
              marginLeft: remote.margin_left,
              marginRight: remote.margin_right,
              headerText: remote.header_text,
              headerLocked: remote.header_locked ? 1 : 0,
              footerText: remote.footer_text,
              importedFrom: remote.imported_from,
            });
            result.downloaded++;
          } catch (downloadError: any) {
            result.errors.push(
              `Erro ao baixar layout ${remoteId}: ${downloadError.message}`,
            );
          }
        }
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Erro na sincronização de layouts: ${error.message}`);
    }
    return result;
  }

  async syncMessages(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      uploaded: 0,
      downloaded: 0,
      errors: [],
    };

    try {
      const localMessages = await getAllMessages();

      const { data: remoteMessages, error: fetchError } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", this.userId);

      if (fetchError) throw fetchError;

      const remoteMap = new Map(
        (remoteMessages || []).map((m) => [Number(m.id), m]),
      );
      const localMap = new Map(localMessages.map((m) => [Number(m.id), m]));

      for (const local of localMessages) {
        const remote = remoteMap.get(local.id);

        if (!remote) {
          try {
            const messageData = {
              id: local.id,
              user_id: this.userId,
              title: local.title,
              items: local.items,
              is_list: local.isList,
              is_ordered: local.isOrdered,
              created_at: local.createdAt,
            };

            const { error } = await supabase
              .from("messages")
              .upsert(messageData, {
                onConflict: "id",
              });

            if (error) {
              result.errors.push(
                `Erro ao enviar mensagem ${local.id}: ${error.message}`,
              );
            } else {
              result.uploaded++;
            }
          } catch (uploadError: any) {
            result.errors.push(
              `Erro ao enviar mensagem ${local.id}: ${uploadError.message}`,
            );
          }
        }
      }

      for (const remote of remoteMessages || []) {
        const remoteId = Number(remote.id);
        const local = localMap.get(remoteId);

        if (!local) {
          try {
            await insertMessage({
              id: remoteId,
              title: remote.title,
              items: remote.items,
              isList: remote.is_list,
              isOrdered: remote.is_ordered,
            });
            result.downloaded++;
          } catch (downloadError: any) {
            result.errors.push(
              `Erro ao baixar mensagem ${remoteId}: ${downloadError.message}`,
            );
          }
        }
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(
        `Erro na sincronização de mensagens: ${error.message}`,
      );
    }

    return result;
  }

  async syncTests(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      uploaded: 0,
      downloaded: 0,
      errors: [],
    };

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("Erro de sessão ao sincronizar testes:", sessionError);
        result.errors.push("Sessão expirada. Faça login novamente.");
        result.success = false;
        return result;
      }

      const localTests = await getAllTests();

      const { data: remoteTests, error: fetchError } = await supabase
        .from("tests")
        .select("*")
        .eq("user_id", this.userId);

      if (fetchError) {
        console.error("Erro ao buscar testes remotos:", fetchError);
        throw fetchError;
      }

      const remoteMap = new Map(
        (remoteTests || []).map((t) => [Number(t.id), t]),
      );
      const localMap = new Map(localTests.map((t) => [Number(t.id), t]));

      for (const local of localTests) {
        const remote = remoteMap.get(local.id);

        if (!remote) {
          try {
            const testId =
              typeof local.id === "number"
                ? local.id
                : parseInt(String(local.id), 10);

            if (isNaN(testId)) {
              result.errors.push(`ID inválido para prova: ${local.id}`);
              continue;
            }

            const testData = {
              id: testId,
              user_id: this.userId,
              title: local.title,
              description: local.description || "",
              file_path: local.filePath,
              file_name: local.fileName,
              file_size: local.fileSize || 0,
              school_year: local.schoolYear,
              subject: local.subject,
              quarter: local.quarter,
              school_unit: local.schoolUnit,
              category: local.category,
              tags: local.tags || "",
            };

            const { error } = await supabase
              .from("tests")
              .upsert(testData, {
                onConflict: "id",
              });

            if (error) {
              console.error(`Erro ao enviar prova ${local.id}:`, error);
              
              if (error.code === "42501" || error.message?.includes("permission")) {
                result.errors.push(
                  `Erro de permissão ao enviar prova ${local.id}. Verifique as políticas RLS no Supabase.`,
                );
              } else {
                result.errors.push(
                  `Erro ao enviar prova ${local.id}: ${error.message || JSON.stringify(error)}`,
                );
              }
            } else {
              result.uploaded++;
            }
          } catch (uploadError: any) {
            console.error(`Erro ao enviar prova ${local.id}:`, uploadError);
            result.errors.push(
              `Erro ao enviar prova ${local.id}: ${uploadError.message}`,
            );
          }
        }
      }

      for (const remote of remoteTests || []) {
        const remoteId = Number(remote.id);
        const local = localMap.get(remoteId);

        if (!local) {
          try {
            await insertTest({
              id: remoteId,
              title: remote.title,
              description: remote.description,
              filePath: remote.file_path,
              fileName: remote.file_name,
              fileSize: remote.file_size,
              schoolYear: remote.school_year,
              subject: remote.subject,
              quarter: remote.quarter,
              schoolUnit: remote.school_unit,
              category: remote.category,
              tags: remote.tags,
            });
            result.downloaded++;
          } catch (downloadError: any) {
            result.errors.push(
              `Erro ao baixar prova ${remoteId}: ${downloadError.message}`,
            );
          }
        }
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Erro na sincronização de provas: ${error.message}`);
    }

    return result;
  }

  async uploadToSupabase(): Promise<SyncResult> {
    return this.syncAll();
  }

  async downloadFromSupabase(): Promise<SyncResult> {
    return this.syncAll();
  }
}

export const syncService = new SyncService();
