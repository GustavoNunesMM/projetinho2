export type AIProvider = "openai" | "anthropic" | "deepseek" | "custom";

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string;
}