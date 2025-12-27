import { supabase } from "@/lib/supabase";
import {
  getAllQuestions,
  insertQuestion,
  getAllLayouts,
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

      result.uploaded = questionsResult.uploaded + layoutsResult.uploaded + messagesResult.uploaded;
      result.downloaded = questionsResult.downloaded + layoutsResult.downloaded + messagesResult.downloaded;
      result.errors = [...questionsResult.errors, ...layoutsResult.errors, ...messagesResult.errors];
      result.success = result.errors.length === 0;
    } catch (error: any) {
      result.success = false;
      result.errors.push(error.message);
    }

    return result;
  }

  async syncQuestions(): Promise<SyncResult> {
    const result: SyncResult = { success: true, uploaded: 0, downloaded: 0, errors: [] };

    try {
      const localQuestions = await getAllQuestions();
      
      const { data: remoteQuestions, error: fetchError } = await supabase
        .from("questions")
        .select("*")
        .eq("user_id", this.userId);

      if (fetchError) throw fetchError;

      const remoteMap = new Map(remoteQuestions?.map(q => [q.id, q]) || []);
      console.log('remoteMap', remoteMap)
      const localMap = new Map(localQuestions.map(q => [q.id, q]));
      console.log('localMap', localMap)

      for (const local of localQuestions) {
        const remote = remoteMap.get(local.id);
        
        if (!remote) {
          const { error } = await supabase.from("questions").insert({
            id: local.id,
            user_id: this.userId,
            title: local.title,
            content: local.content,
            content_image: local.contentImage,
            difficulty: local.difficulty,
            subject: local.subject,
            category: local.category,
            type: local.type,
            options: JSON.parse(local.options),
            option_images: JSON.parse(local.optionImages || "[]"),
            correct_answer: local.correctAnswer,
            explanation: local.explanation,
            imported_from: local.importedFrom,
            created_at: local.created_at,
          });

          if (error) {
            result.errors.push(`Erro ao enviar questão ${local.id}: ${error.message}`);
          } else {
            result.uploaded++;
          }
        }
      }

      for (const remote of remoteQuestions || []) {
        const local = localMap.get(remote.id);
        
        if (!local) {
          await insertQuestion({
            title: remote.title,
            content: remote.content,
            contentImage: remote.content_image,
            difficulty: remote.difficulty,
            subject: remote.subject,
            category: remote.category,
            type: remote.type,
            options: JSON.stringify(remote.options),
            optionImages: JSON.stringify(remote.option_images),
            correctAnswer: remote.correct_answer,
            explanation: remote.explanation,
            importedFrom: remote.imported_from,
          });
          result.downloaded++;
        }
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Erro na sincronização de questões: ${error.message}`);
    }

    return result;
  }

  async syncLayouts(): Promise<SyncResult> {
    const result: SyncResult = { success: true, uploaded: 0, downloaded: 0, errors: [] };

    try {
      const localLayouts = await getAllLayouts();
      
      const { data: remoteLayouts, error: fetchError } = await supabase
        .from("layouts")
        .select("*")
        .eq("user_id", this.userId);

      if (fetchError) throw fetchError;

      const remoteMap = new Map(remoteLayouts?.map(l => [l.id, l]) || []);
      const localMap = new Map(localLayouts.map(l => [l.id, l]));

      for (const local of localLayouts) {
        const remote = remoteMap.get(local.id);
        
        if (!remote) {
          const { error } = await supabase.from("layouts").insert({
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
          });

          if (error) {
            result.errors.push(`Erro ao enviar layout ${local.id}: ${error.message}`);
          } else {
            result.uploaded++;
          }
        }
      }

      for (const remote of remoteLayouts || []) {
        const local = localMap.get(remote.id);
        
        if (!local) {
          await insertLayout({
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
        }
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Erro na sincronização de layouts: ${error.message}`);
    }

    return result;
  }

  async syncMessages(): Promise<SyncResult> {
    const result: SyncResult = { success: true, uploaded: 0, downloaded: 0, errors: [] };

    try {
      const localMessages = await getAllMessages();
      
      const { data: remoteMessages, error: fetchError } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", this.userId);

      if (fetchError) throw fetchError;

      const remoteMap = new Map(remoteMessages?.map(m => [m.id, m]) || []);
      const localMap = new Map(localMessages.map(m => [m.id, m]));

      for (const local of localMessages) {
        const remote = remoteMap.get(local.id);
        
        if (!remote) {
          const { error } = await supabase.from("messages").insert({
            id: local.id,
            user_id: this.userId,
            title: local.title,
            items: local.items,
            is_list: local.isList === 1,
            is_ordered: local.isOrdered === 1,
            created_at: local.createdAt,
          });

          if (error) {
            result.errors.push(`Erro ao enviar mensagem ${local.id}: ${error.message}`);
          } else {
            result.uploaded++;
          }
        }
      }

      for (const remote of remoteMessages || []) {
        const local = localMap.get(remote.id);
        
        if (!local) {
          await insertMessage({
            title: remote.title,
            items: remote.items,
            isList: remote.is_list,
            isOrdered: remote.is_ordered,
          });
          result.downloaded++;
        }
      }
    } catch (error: any) {
      result.success = false;
      result.errors.push(`Erro na sincronização de mensagens: ${error.message}`);
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