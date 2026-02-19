export type AIProvider = "openai" | "anthropic" | "deepseek" | "custom";

export interface AIConfigRecord {
  id: string;
  user_id: string;
  name: string;
  provider: AIProvider;
  api_key: string;
  model: string;
  temperature: number;
  max_tokens: number;
  base_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  baseURL: string;
}

export interface AIConfigFormData {
  name: string;
  provider: AIProvider;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  baseURL: string;
}