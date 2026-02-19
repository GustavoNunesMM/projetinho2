"use client";

import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { AIConfigFormData, AIConfigRecord } from "@/types/aiTypes";

const STORAGE_KEY = "aiServiceConfig";

interface SupabaseAIConfig {
  id: string;
  user_id: string;
  name: string;
  provider: string;
  api_key: string;
  model: string;
  temperature: number;
  max_tokens: number;
  base_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function serialize(formData: AIConfigFormData): Partial<SupabaseAIConfig> {
  return {
    name: formData.name,
    provider: formData.provider,
    api_key: formData.apiKey,
    model: formData.model,
    temperature: formData.temperature,
    max_tokens: formData.maxTokens,
    base_url: formData.baseURL ?? "",
  };
}

function deserialize(row: SupabaseAIConfig): AIConfigRecord {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    provider: row.provider as AIConfigRecord["provider"],
    api_key: row.api_key,
    model: row.model,
    temperature: row.temperature,
    max_tokens: row.max_tokens,
    base_url: row.base_url,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function syncToLocalStorage(config: AIConfigRecord) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      provider: config.provider,
      apiKey: config.api_key,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.max_tokens,
      baseURL: config.base_url,
    }),
  );
}

export function useAIConfigs() {
  const [configs, setConfigs] = useState<AIConfigRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuário não autenticado.");

      const { data, error: fetchError } = await supabase
        .from("ai_configs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const parsed = (data || []).map(deserialize);

      setConfigs(parsed);

      const active = parsed.find((c) => c.is_active);

      if (active) syncToLocalStorage(active);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao buscar configurações.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createConfig = useCallback(
    async (formData: AIConfigFormData): Promise<AIConfigRecord | null> => {
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("Usuário não autenticado.");

        const isFirstConfig = configs.length === 0;

        // Se for a primeira, será marcada como ativa — desativa eventuais outras
        if (isFirstConfig) {
          await supabase
            .from("ai_configs")
            .update({ is_active: false })
            .eq("user_id", user.id);
        }

        const { data, error: insertError } = await supabase
          .from("ai_configs")
          .insert({
            ...serialize(formData),
            user_id: user.id,
            is_active: isFirstConfig,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const record = deserialize(data);

        setConfigs((prev) => [record, ...prev]);

        if (isFirstConfig) syncToLocalStorage(record);

        return record;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Erro ao criar configuração.",
        );

        return null;
      }
    },
    [configs.length],
  );

  const updateConfig = useCallback(
    async (
      id: string,
      formData: Partial<AIConfigFormData>,
    ): Promise<boolean> => {
      setError(null);

      try {
        const { data, error: updateError } = await supabase
          .from("ai_configs")
          .update(serialize(formData as AIConfigFormData))
          .eq("id", id)
          .select()
          .single();

        if (updateError) throw updateError;

        const record = deserialize(data);

        setConfigs((prev) => prev.map((c) => (c.id === id ? record : c)));

        // Se era a ativa, atualiza o localStorage também
        if (record.is_active) syncToLocalStorage(record);

        return true;
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao atualizar configuração.",
        );

        return false;
      }
    },
    [],
  );

  const deleteConfig = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null);

      try {
        const configToDelete = configs.find((c) => c.id === id);

        const { error: deleteError } = await supabase
          .from("ai_configs")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;

        const remaining = configs.filter((c) => c.id !== id);

        setConfigs(remaining);

        // Se deletou a ativa, promove a próxima disponível
        if (configToDelete?.is_active && remaining.length > 0) {
          await setActiveConfig(remaining[0].id);
        } else if (remaining.length === 0) {
          localStorage.removeItem(STORAGE_KEY);
        }

        return true;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Erro ao deletar configuração.",
        );

        return false;
      }
    },
    [configs],
  );

  const setActiveConfig = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuário não autenticado.");

      // Desativa todas do usuário
      const { error: deactivateError } = await supabase
        .from("ai_configs")
        .update({ is_active: false })
        .eq("user_id", user.id);

      if (deactivateError) throw deactivateError;

      // Ativa a selecionada
      const { data, error: activateError } = await supabase
        .from("ai_configs")
        .update({ is_active: true })
        .eq("id", id)
        .select()
        .single();

      if (activateError) throw activateError;

      const record = deserialize(data);

      setConfigs((prev) => prev.map((c) => ({ ...c, is_active: c.id === id })));

      syncToLocalStorage(record);

      return true;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao ativar configuração.",
      );

      return false;
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return {
    configs,
    loading,
    error,
    fetchConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    setActiveConfig,
  };
}