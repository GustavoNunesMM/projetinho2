"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Info,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Input, Select, SelectItem } from "@heroui/react";

import Portal from "@/components/common/Portal";
import Button from "@/components/common/Button";
import { useAIConfigs } from "@/hooks/useAiConfig";
import { AIConfigFormData, AIConfigRecord, AIProvider } from "@/types/aiTypes";

const AI_PROVIDERS: {
  value: AIProvider;
  label: string;
  description: string;
}[] = [
  { value: "openai", label: "OpenAI", description: "GPT-4, GPT-4o, etc." },
  {
    value: "anthropic",
    label: "Anthropic",
    description: "Claude 3.5 Sonnet, Claude 3 Opus, etc.",
  },
  {
    value: "deepseek",
    label: "DeepSeek",
    description: "Deepseek-chat e reasoner",
  },
  {
    value: "custom",
    label: "Custom API",
    description: "API personalizada (Ollama, etc.)",
  },
];

const DEFAULT_MODELS: Record<AIProvider, string[]> = {
  openai: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "gpt-4o"],
  anthropic: [
    "claude-3-5-sonnet-20241022",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
  ],
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
  custom: [
    "llama3.1:8b",
    "llama3.1:70b",
    "qwen3:14b",
    "qwen2.5-coder:7b-ctx8k",
  ],
};

const EMPTY_FORM: AIConfigFormData = {
  name: "",
  provider: "openai",
  apiKey: "",
  model: "gpt-4",
  temperature: 0.9,
  maxTokens: 2048,
  baseURL: "",
};

type ViewMode = "list" | "create" | "edit";

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIConfigModal({ isOpen, onClose }: AIConfigModalProps) {
  const {
    configs,
    loading,
    error: hookError,
    createConfig,
    updateConfig,
    deleteConfig,
    setActiveConfig,
  } = useAIConfigs();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingConfig, setEditingConfig] = useState<AIConfigRecord | null>(
    null,
  );
  const [formData, setFormData] = useState<AIConfigFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setViewMode("list");
      setEditingConfig(null);
      setFormData(EMPTY_FORM);
      setFormErrors({});
    }
  }, [isOpen]);

  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setEditingConfig(null);
    setViewMode("create");
  };

  const openEdit = (config: AIConfigRecord) => {
    setFormData({
      name: config.name,
      provider: config.provider,
      apiKey: config.api_key,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.max_tokens,
      baseURL: config.base_url ?? "",
    });
    setFormErrors({});
    setEditingConfig(config);
    setViewMode("edit");
  };

  const backToList = () => {
    setViewMode("list");
    setEditingConfig(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
  };

  const handleProviderChange = (provider: AIProvider) => {
    setFormData((prev) => ({
      ...prev,
      provider,
      model: DEFAULT_MODELS[provider]?.[0] ?? "",
      baseURL: "",
    }));
    clearError("provider");
  };

  const setField = <K extends keyof AIConfigFormData>(
    key: K,
    value: AIConfigFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  };

  const clearError = (field: string) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };

      delete next[field];

      return next;
    });
  };

  const isOllama =
    formData.provider === "custom" &&
    (formData.baseURL?.includes("ollama") ||
      formData.baseURL?.includes("11434"));

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Nome é obrigatório.";
    if (!isOllama && !formData.apiKey?.trim())
      errors.apiKey = "API Key é obrigatória para este provedor.";
    if (formData.provider === "custom" && !formData.baseURL?.trim())
      errors.baseURL = "Base URL é obrigatória para APIs customizadas.";
    if (formData.temperature < 0 || formData.temperature > 2)
      errors.temperature = "A temperatura deve estar entre 0 e 2.";
    if (formData.maxTokens < 1 || formData.maxTokens > 4096)
      errors.maxTokens = "Max Tokens deve estar entre 1 e 4096.";

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    let ok = false;

    if (viewMode === "create") {
      const result = await createConfig(formData);

      ok = !!result;
    } else if (viewMode === "edit" && editingConfig) {
      ok = await updateConfig(editingConfig.id, formData);
    }

    setSubmitting(false);

    if (ok) {
      setSuccessId("form");
      setTimeout(() => {
        setSuccessId(null);
        backToList();
      }, 800);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);

      return;
    }
    setDeletingId(id);
    setConfirmDeleteId(null);
    await deleteConfig(id);
    setDeletingId(null);
  };

  const handleActivate = async (id: string) => {
    setActivatingId(id);
    await setActiveConfig(id);
    setActivatingId(null);
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 animate-scaleIn max-h-[90vh] flex flex-col">
          <div className="p-6 pb-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {viewMode !== "list" && (
                  <button
                    aria-label="Voltar"
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all"
                    onClick={backToList}
                  >
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 18l-6-6 6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                    {viewMode === "list"
                      ? "Configurações de IA"
                      : viewMode === "create"
                        ? "Nova Configuração"
                        : "Editar Configuração"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {viewMode === "list"
                      ? "Gerencie seus provedores de IA"
                      : "Preencha os dados do provedor"}
                  </p>
                </div>
              </div>
              <button
                aria-label="Fechar"
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                onClick={onClose}
              >
                <X className="text-gray-500" size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {hookError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{hookError}</p>
              </div>
            )}

            {viewMode === "list" && (
              <div className="space-y-3">
                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-4">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Suas API Keys são armazenadas com segurança no Supabase e
                    nunca são compartilhadas. A configuração{" "}
                    <span className="font-semibold">ativa</span> é carregada
                    automaticamente.
                  </p>
                </div>

                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {!loading && configs.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-gray-500 text-sm mb-1">
                      Nenhuma configuração ainda
                    </p>
                    <p className="text-gray-400 text-xs">
                      Crie sua primeira configuração de IA
                    </p>
                  </div>
                )}

                {!loading &&
                  configs.map((config) => (
                    <div
                      key={config.id}
                      className={`relative rounded-xl border-2 p-4 transition-all ${
                        config.is_active
                          ? "border-purple-400 bg-purple-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      {config.is_active && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          <Check size={11} />
                          Ativa
                        </span>
                      )}

                      <div className="flex items-start justify-between gap-3 pr-16">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {config.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {
                              AI_PROVIDERS.find(
                                (p) => p.value === config.provider,
                              )?.label
                            }{" "}
                            · {config.model}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Temp: {config.temperature} · Max tokens:{" "}
                            {config.max_tokens}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        {!config.is_active && (
                          <button
                            className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                            disabled={activatingId === config.id}
                            onClick={() => handleActivate(config.id)}
                          >
                            {activatingId === config.id ? (
                              <span className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Star size={12} />
                            )}
                            Usar esta
                          </button>
                        )}

                        <button
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-all"
                          onClick={() => openEdit(config)}
                        >
                          <Pencil size={12} />
                          Editar
                        </button>

                        <button
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ml-auto ${
                            confirmDeleteId === config.id
                              ? "text-white bg-red-500 hover:bg-red-600"
                              : "text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100"
                          }`}
                          disabled={deletingId === config.id}
                          onClick={() => handleDelete(config.id)}
                        >
                          {deletingId === config.id ? (
                            <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                          {confirmDeleteId === config.id
                            ? "Confirmar exclusão"
                            : "Excluir"}
                        </button>
                      </div>
                    </div>
                  ))}

                {!loading && (
                  <button
                    className="w-full border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 rounded-xl py-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-purple-600 transition-all mt-2"
                    onClick={openCreate}
                  >
                    <Plus size={16} />
                    Nova configuração
                  </button>
                )}
              </div>
            )}

            {(viewMode === "create" || viewMode === "edit") && (
              <div className="space-y-4">
                {/* Nome */}
                <Input
                  isRequired
                  classNames={{ input: "text-sm", label: "text-sm" }}
                  description="Um nome para identificar esta configuração"
                  errorMessage={formErrors.name}
                  isInvalid={!!formErrors.name}
                  label="Nome da Configuração"
                  placeholder="Ex: Meu GPT-4 de produção"
                  value={formData.name}
                  variant="bordered"
                  onChange={(e) => setField("name", e.target.value)}
                />

                <Select
                  classNames={{ label: "text-sm", trigger: "text-sm" }}
                  label="Provedor de IA"
                  placeholder="Selecione um provedor"
                  selectedKeys={[formData.provider]}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as AIProvider;

                    handleProviderChange(selected);
                  }}
                >
                  {AI_PROVIDERS.map((provider) => (
                    <SelectItem
                      key={provider.value}
                      description={provider.description}
                    >
                      {provider.label}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  classNames={{ input: "text-sm", label: "text-sm" }}
                  description={
                    isOllama
                      ? "Opcional para Ollama local"
                      : "Sua chave de API do provedor selecionado"
                  }
                  errorMessage={formErrors.apiKey}
                  isInvalid={!!formErrors.apiKey}
                  isRequired={!isOllama}
                  label="API Key"
                  placeholder={
                    isOllama ? "Opcional para Ollama local" : "sk-..."
                  }
                  type="password"
                  value={formData.apiKey}
                  variant="bordered"
                  onChange={(e) => setField("apiKey", e.target.value)}
                />

                <Select
                  classNames={{ label: "text-sm", trigger: "text-sm" }}
                  label="Modelo"
                  placeholder="Selecione um modelo"
                  selectedKeys={formData.model ? [formData.model] : []}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;

                    setField("model", selected);
                  }}
                >
                  {DEFAULT_MODELS[formData.provider].map((model) => (
                    <SelectItem key={model}>{model}</SelectItem>
                  ))}
                </Select>

                {formData.provider === "custom" && (
                  <Input
                    classNames={{ input: "text-sm", label: "text-sm" }}
                    description="Nome do modelo na sua API customizada"
                    label="Modelo Personalizado"
                    placeholder="llama3.1:8b"
                    value={formData.model || ""}
                    variant="bordered"
                    onChange={(e) => setField("model", e.target.value)}
                  />
                )}

                {formData.provider === "custom" && (
                  <Input
                    isRequired
                    classNames={{ input: "text-sm", label: "text-sm" }}
                    description="URL base da sua API (ex: http://localhost:11434 para Ollama)"
                    errorMessage={formErrors.baseURL}
                    isInvalid={!!formErrors.baseURL}
                    label="Base URL"
                    placeholder="http://localhost:11434"
                    value={formData.baseURL || ""}
                    variant="bordered"
                    onChange={(e) => {
                      setField("baseURL", e.target.value);
                    }}
                  />
                )}

                <Input
                  classNames={{ input: "text-sm", label: "text-sm" }}
                  description="Controla a criatividade (0 = determinístico, 2 = muito criativo)"
                  errorMessage={formErrors.temperature}
                  isInvalid={!!formErrors.temperature}
                  label="Temperatura"
                  max="2"
                  min="0"
                  step="0.1"
                  type="number"
                  value={String(formData.temperature ?? 0.9)}
                  variant="bordered"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);

                    setField("temperature", isNaN(value) ? 0.9 : value);
                  }}
                />

                <Input
                  classNames={{ input: "text-sm", label: "text-sm" }}
                  description="Número máximo de tokens na resposta"
                  errorMessage={formErrors.maxTokens}
                  isInvalid={!!formErrors.maxTokens}
                  label="Max Tokens"
                  max="4096"
                  min="1"
                  type="number"
                  value={String(formData.maxTokens ?? 2048)}
                  variant="bordered"
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);

                    setField("maxTokens", isNaN(value) ? 2048 : value);
                  }}
                />
              </div>
            )}
          </div>

          {(viewMode === "create" || viewMode === "edit") && (
            <div className="flex gap-3 p-6 pt-4 border-t border-gray-100 flex-shrink-0">
              <Button
                className={`flex-1 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  successId === "form"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                }`}
                disabled={submitting}
                icon={Save}
                variant="custom"
                onClick={handleSubmit}
              >
                {successId === "form"
                  ? "Salvo!"
                  : submitting
                    ? "Salvando..."
                    : viewMode === "create"
                      ? "Criar Configuração"
                      : "Salvar Alterações"}
              </Button>
              <Button
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium"
                variant="custom"
                onClick={backToList}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}