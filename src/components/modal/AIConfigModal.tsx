"use client";

import { useEffect, useState } from "react";
import { Info, Save, Sparkles, X } from "lucide-react";
import { Input, Select, SelectItem } from "@heroui/react";

import Portal from "@/components/common/Portal";
import Button from "@/components/common/Button";
import { AIProvider, AIServiceConfig } from "@/services/aiService";

const STORAGE_KEY = "aiServiceConfig";

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AI_PROVIDERS: {
  value: AIProvider;
  label: string;
  description: string;
}[] = [
  {
    value: "openai",
    label: "OpenAI",
    description: "GPT-4, GPT-3.5, etc.",
  },
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
  custom: ["llama3.1:8b", "llama3.1:70b"],
};

const DEFAULT_CONFIG: AIServiceConfig = {
  provider: "openai",
  apiKey: "",
  model: "gpt-4",
  temperature: 0.9,
  maxTokens: 2048,
  baseURL: "",
};

export default function AIConfigModal({ isOpen, onClose }: AIConfigModalProps) {
  const [config, setConfig] = useState<AIServiceConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadConfig = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: AIServiceConfig = JSON.parse(stored);

        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } else {
        setConfig(DEFAULT_CONFIG);
      }
    } catch {
      setConfig(DEFAULT_CONFIG);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadConfig();
      setSaveSuccess(false);
      setErrors({});
    }
  }, [isOpen]);

  const handleProviderChange = (provider: AIProvider) => {
    const firstModel = DEFAULT_MODELS[provider]?.[0] ?? "";

    setConfig((prev) => ({
      ...prev,
      provider,
      model: firstModel,
      baseURL: "",
    }));
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const isOllama =
      config.provider === "custom" &&
      (config.baseURL?.includes("ollama") || config.baseURL?.includes("11434"));

    if (!isOllama && !config.apiKey?.trim()) {
      newErrors.apiKey = "API Key é obrigatória para este provedor.";
    }

    if (config.provider === "custom" && !config.baseURL?.trim()) {
      newErrors.baseURL = "Base URL é obrigatória para APIs customizadas.";
    }

    if (!config.temperature) {
      newErrors.temperature = "Temperatura não definida";

      return false;
    }

    if (config.temperature < 0 || config.temperature > 2) {
      newErrors.temperature = "A temperatura deve estar entre 0 e 2.";
    }

    if (!config.maxTokens) {
      newErrors.maxTokens = "MaxToken não definida";

      return false;
    }

    if (config.maxTokens < 1 || config.maxTokens > 4096) {
      newErrors.maxTokens = "Max Tokens deve estar entre 1 e 4096.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    try {
      setLoading(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 800);
    } catch {
      setErrors({
        general: "Erro ao salvar as configurações. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };

        delete next[field];

        return next;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 animate-scaleIn max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                    Configurações de IA
                  </h2>
                  <p className="text-xs text-gray-500">
                    Configure o modelo de IA para geração de documentos
                  </p>
                </div>
              </div>
              <button
                aria-label="Fechar"
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                onClick={onClose}
              >
                <X className="text-gray-500" size={18} />
              </button>
            </div>

            {/* Info banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  Configuração de API
                </p>
                <p className="text-xs text-blue-700">
                  Suas credenciais são armazenadas localmente no seu navegador e
                  nunca são compartilhadas. Certifique-se de usar uma API Key
                  válida para o provedor selecionado.
                </p>
              </div>
            </div>

            {/* General error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Provider */}
              <Select
                classNames={{
                  label: "text-sm",
                  trigger: "text-sm",
                }}
                label="Provedor de IA"
                placeholder="Selecione um provedor"
                selectedKeys={[config.provider]}
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

              {/* API Key */}
              <Input
                classNames={{
                  input: "text-sm",
                  label: "text-sm",
                }}
                description={
                  config.provider === "custom" &&
                  (config.baseURL?.includes("ollama") ||
                    config.baseURL?.includes("11434"))
                    ? "Opcional para Ollama local, obrigatório para outras APIs"
                    : "Sua chave de API do provedor selecionado"
                }
                errorMessage={errors.apiKey}
                isInvalid={!!errors.apiKey}
                isRequired={
                  config.provider !== "custom" ||
                  !(
                    config.baseURL?.includes("ollama") ||
                    config.baseURL?.includes("11434")
                  )
                }
                label="API Key"
                placeholder={
                  config.provider === "custom" &&
                  (config.baseURL?.includes("ollama") ||
                    config.baseURL?.includes("11434"))
                    ? "Opcional para Ollama local"
                    : "sk-..."
                }
                type="password"
                value={config.apiKey}
                variant="bordered"
                onChange={(e) => {
                  setConfig((prev) => ({ ...prev, apiKey: e.target.value }));
                  clearError("apiKey");
                }}
              />

              {/* Model select */}
              <Select
                classNames={{
                  label: "text-sm",
                  trigger: "text-sm",
                }}
                label="Modelo"
                placeholder="Selecione um modelo"
                selectedKeys={config.model ? [config.model] : []}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;

                  setConfig((prev) => ({ ...prev, model: selected }));
                }}
              >
                {DEFAULT_MODELS[config.provider].map((model) => (
                  <SelectItem key={model}>{model}</SelectItem>
                ))}
              </Select>

              {/* Custom model name */}
              {config.provider === "custom" && (
                <Input
                  classNames={{
                    input: "text-sm",
                    label: "text-sm",
                  }}
                  description="Nome do modelo na sua API customizada"
                  label="Modelo Personalizado"
                  placeholder="llama3.1:8b"
                  value={config.model || ""}
                  variant="bordered"
                  onChange={(e) => {
                    setConfig((prev) => ({ ...prev, model: e.target.value }));
                  }}
                />
              )}

              {/* Base URL (custom only) */}
              {config.provider === "custom" && (
                <Input
                  isRequired
                  classNames={{
                    input: "text-sm",
                    label: "text-sm",
                  }}
                  description="URL base da sua API (ex: http://localhost:11434 para Ollama ou https://api.exemplo.com para APIs compatíveis com OpenAI)"
                  errorMessage={errors.baseURL}
                  isInvalid={!!errors.baseURL}
                  label="Base URL"
                  placeholder="http://localhost:11434 (Ollama) ou https://api.exemplo.com"
                  value={config.baseURL || ""}
                  variant="bordered"
                  onChange={(e) => {
                    setConfig((prev) => ({ ...prev, baseURL: e.target.value }));
                    clearError("baseURL");
                  }}
                />
              )}

              {/* Temperature */}
              <Input
                classNames={{
                  input: "text-sm",
                  label: "text-sm",
                }}
                description="Controla a criatividade (0 = determinístico, 2 = muito criativo)"
                errorMessage={errors.temperature}
                isInvalid={!!errors.temperature}
                label="Temperatura"
                max="2"
                min="0"
                step="0.1"
                type="number"
                value={String(config.temperature ?? 0.9)}
                variant="bordered"
                onChange={(e) => {
                  const value = parseFloat(e.target.value);

                  setConfig((prev) => ({
                    ...prev,
                    temperature: isNaN(value) ? 0.9 : value,
                  }));
                  clearError("temperature");
                }}
              />

              {/* Max Tokens */}
              <Input
                classNames={{
                  input: "text-sm",
                  label: "text-sm",
                }}
                description="Número máximo de tokens na resposta"
                errorMessage={errors.maxTokens}
                isInvalid={!!errors.maxTokens}
                label="Max Tokens"
                max="4096"
                min="1"
                type="number"
                value={String(config.maxTokens ?? 2048)}
                variant="bordered"
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);

                  setConfig((prev) => ({
                    ...prev,
                    maxTokens: isNaN(value) ? 2048 : value,
                  }));
                  clearError("maxTokens");
                }}
              />
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
              <Button
                className={`flex-1 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  saveSuccess
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                }`}
                disabled={loading}
                icon={Save}
                variant="custom"
                onClick={handleSave}
              >
                {saveSuccess
                  ? "Salvo!"
                  : loading
                    ? "Salvando..."
                    : "Salvar Configurações"}
              </Button>
              <Button
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium"
                variant="custom"
                onClick={onClose}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}