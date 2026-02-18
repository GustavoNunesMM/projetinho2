import { DocumentTemplate, TemplateField } from "@/types/generate.ts";
import { AIFieldSuggestion } from "@/types/document.ts";
import { AIServiceConfig } from "@/types/aiTypes.ts";

export class AIDocumentService {
  config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 2048,
      ...config,
    };
  }

  async suggestFieldValues(
    template: DocumentTemplate,
    context: string,
    existingValues?: Record<string, string>,
  ): Promise<AIFieldSuggestion[]> {
    const prompt = this.buildPrompt(template.fields, context, existingValues);

    try {
      const response = await this.callAI(prompt);

      return this.parseAIResponse(response, template.fields);
    } catch (error) {
      console.error("Erro ao gerar sugestões da IA:", error);
      throw new Error(`Falha ao gerar sugestões: ${(error as Error).message}`);
    }
  }

  async validateFieldValue(
    field: TemplateField,
    value: string,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!field.validationRules || field.validationRules.length === 0) {
      return { valid: true, errors: [] };
    }

    for (const rule of field.validationRules) {
      switch (rule.type) {
        case "required":
          if (!value || value.trim() === "") {
            errors.push(rule.message || "Campo obrigatório");
          }
          break;
        case "minLength":
          if (value.length < (Number(rule.value) || 0)) {
            errors.push(rule.message || `Mínimo de ${rule.value} caracteres`);
          }
          break;
        case "maxLength":
          if (value.length > (Number(rule.value) || Infinity)) {
            errors.push(rule.message || `Máximo de ${rule.value} caracteres`);
          }
          break;
        case "pattern":
          if (rule.value && !new RegExp(String(rule.value)).test(value)) {
            errors.push(rule.message || "Formato inválido");
          }
          break;
        case "custom":
          break;
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private buildPrompt(
    fields: TemplateField[],
    context: string,
    existingValues?: Record<string, string>,
  ): string {
    const now = new Date();
    const anoAtual = now.getFullYear();
    const mesAtual = now.getMonth() + 1;
    const trimestreAtual = Math.ceil(mesAtual / 3);
    const dataAtual = now.toLocaleDateString("pt-BR");

    const fieldsList = fields
      .map((f) => {
        let desc = `- ${f.name} (tipo: ${f.type})`;

        if (f.description) desc += `: ${f.description}`;
        if (f.sequentialIndices && f.sequentialIndices.length > 0) {
          desc += ` [SEQUENCIAL: ${f.sequentialIndices.length} ocorrências]`;
        }
        if (f.aiHints && f.aiHints.length > 0) {
          desc += ` [Dicas: ${f.aiHints.join(", ")}]`;
        }

        return desc;
      })
      .join("\n");

    const existingValuesText =
      existingValues && Object.keys(existingValues).length > 0
        ? "\n\nValores já preenchidos pelo usuário:\n" +
          Object.entries(existingValues)
            .filter(([_, v]) => v && !v.includes("{{"))
            .map(([k, v]) => `- ${k}: ${v}`)
            .join("\n")
        : "";

    return `Você é um assistente especializado em preencher documentos educacionais brasileiros.

DATA ATUAL: ${dataAtual}
ANO ATUAL: ${anoAtual}
TRIMESTRE ATUAL: ${trimestreAtual}° trimestre

CONTEXTO FORNECIDO:
${context}

CAMPOS A PREENCHER:
${fieldsList}${existingValuesText}

INSTRUÇÕES IMPORTANTES:
1. Preencha cada campo com VALORES CONCRETOS E REAIS (números, textos, datas)
2. NUNCA use placeholders como {{variavel}} - sempre use valores literais
3. Para campos de data/ano/trimestre, use as informações da DATA ATUAL acima
4. Use formato brasileiro: datas DD/MM/AAAA, números com vírgula decimal
5. Se não houver informação suficiente, use valores padrão razoáveis baseados no contexto educacional brasileiro
6. Mantenha consistência entre campos relacionados

CAMPOS SEQUENCIAIS (múltiplas ocorrências):
- Para campos marcados como [SEQUENCIAL], você pode sugerir:
  a) Um ÚNICO valor que será aplicado a todas as ocorrências (ex: "2026" para ANO)
  b) Um ARRAY de valores específicos para cada ocorrência (ex: ["1º Trimestre", "2º Trimestre", "3º Trimestre"])
  c) Uma STRING separada por vírgulas (ex: "Item 1, Item 2, Item 3")
- Escolha a opção mais apropriada baseado no contexto

Responda APENAS com um JSON válido (sem \`\`\`json ou markdown):
{
  "suggestions": [
    {
      "fieldName": "nome_do_campo",
      "suggestedValue": "valor_concreto_aqui_OU_array_para_sequenciais",
      "confidence": 0.95,
      "reasoning": "explicação da sugestão"
    }
  ]
}`;
  }

  private async callAI(prompt: string): Promise<string> {
    const { provider, apiKey, model, temperature, maxTokens, baseURL } =
      this.config;

    if (provider === "openai") {
      return this.callOpenAI(
        prompt,
        apiKey,
        model || "gpt-4",
        temperature!,
        maxTokens!,
        baseURL,
      );
    } else if (provider === "anthropic") {
      return this.callAnthropic(
        prompt,
        apiKey,
        model || "claude-3-5-sonnet-20241022",
        temperature!,
        maxTokens!,
      );
    } else if (provider === "deepseek") {
      return this.callDeepSeek(
        prompt,
        apiKey,
        model || "deepseek-chat",
        temperature!,
        maxTokens!,
      );
    } else if (provider === "custom") {
      if (!baseURL)
        throw new Error("baseURL é obrigatório para provider 'custom'");

      return this.callCustom(
        prompt,
        baseURL,
        model || "llama3.1:8b",
        temperature!,
        maxTokens!,
      );
    }

    throw new Error(`Provider não suportado: ${provider}`);
  }

  private async callOpenAI(
    prompt: string,
    apiKey: string,
    model: string,
    temperature: number,
    maxTokens: number,
    baseURL?: string,
  ): Promise<string> {
    const url = baseURL || "https://api.openai.com/v1/chat/completions";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      throw new Error(`OpenAI API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return data.choices[0]?.message?.content || "";
  }

  private async callAnthropic(
    prompt: string,
    apiKey: string,
    model: string,
    temperature: number,
    maxTokens: number,
  ): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      throw new Error(`Anthropic API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return data.content[0]?.text || "";
  }

  private async callDeepSeek(
    prompt: string,
    apiKey: string,
    model: string,
    temperature: number,
    maxTokens: number,
  ): Promise<string> {
    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(`DeepSeek API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return data.choices[0]?.message?.content || "";
  }

  private async callCustom(
    prompt: string,
    baseURL: string,
    model: string,
    temperature: number,
    maxTokens: number,
  ): Promise<string> {
    const isOllama = baseURL.includes("ollama") || baseURL.includes("11434");

    if (isOllama) {
      const endpoint = `${baseURL.replace(/\/$/, "")}/api/generate`;
      const systemPrompt = `Você é um assistente especializado em documentos educacionais brasileiros.
REGRAS CRÍTICAS:
- SEMPRE retorne valores concretos e literais
- NUNCA use placeholders como {{variavel}}
- Para campos sequenciais, você pode retornar arrays ou valores únicos
- Sempre use números, textos e datas reais`;

      const requestBody = {
        model,
        prompt: `${systemPrompt}\n\n${prompt}`,
        stream: false,
        temperature: 0.3,
        top_p: 0.9,
        options: {
          num_predict: maxTokens,
          top_k: 40,
          repeat_penalty: 1.1,
        },
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`Ollama API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      return data.response || "";
    }

    const endpoint = `${baseURL.replace(/\/$/, "")}/v1/chat/completions`;
    const requestBody = {
      model,
      messages: [{ role: "user", content: prompt }],
      temperature,
      max_tokens: maxTokens,
      stream: false,
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey
          ? { Authorization: `Bearer ${this.config.apiKey}` }
          : {}),
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`Custom API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return data.choices?.[0]?.message?.content || "";
  }

  private parseAIResponse(
    response: string,
    fields: TemplateField[],
  ): AIFieldSuggestion[] {
    try {
      let cleanResponse = response.trim();

      cleanResponse = cleanResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");

      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("Resposta não contém JSON válido");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const suggestions: AIFieldSuggestion[] = parsed.suggestions || [];

      return suggestions
        .filter((s: any) => {
          return (
            s.fieldName &&
            s.suggestedValue !== undefined &&
            fields.some((f) => f.name === s.fieldName)
          );
        })
        .map((s: any) => {
          const field = fields.find((f) => f.name === s.fieldName);
          let value = s.suggestedValue;

          if (
            typeof value === "string" &&
            (value.includes("{{") || value.includes("}}"))
          ) {
            console.warn(
              `⚠️ Campo "${s.fieldName}" retornou placeholder: ${value}`,
            );
            const match = value.match(/\{\{([^}]+)\}\}/);

            if (match) {
              const placeholder = match[1];

              if (placeholder.includes("ano")) {
                value = new Date().getFullYear().toString();
              } else if (placeholder.includes("trimestre")) {
                const mes = new Date().getMonth() + 1;

                value = Math.ceil(mes / 3).toString();
              } else {
                value = "";
              }
            }
          }

          if (field?.sequentialIndices && field.sequentialIndices.length > 0) {
            let sequentialValues: string[] = [];

            if (Array.isArray(value)) {
              sequentialValues = value.map(String);
            } else if (typeof value === "string" && value.includes(",")) {
              sequentialValues = value.split(",").map((v) => v.trim());
            } else {
              const count = field.sequentialIndices.length;

              sequentialValues = Array(count).fill(String(value));
            }

            const sortedIndices = [...field.sequentialIndices].sort(
              (a, b) => a - b,
            );

            while (sequentialValues.length < sortedIndices.length) {
              sequentialValues.push("");
            }

            return {
              fieldName: s.fieldName,
              suggestedValue: sequentialValues,
              confidence: Math.max(0, Math.min(1, s.confidence || 0.5)),
              reasoning: s.reasoning || "Sugestão automática",
              sources: s.sources || [],
              isSequential: true,
            };
          }

          return {
            fieldName: s.fieldName,
            suggestedValue: String(value),
            confidence: Math.max(0, Math.min(1, s.confidence || 0.5)),
            reasoning: s.reasoning || "Sugestão automática",
            sources: s.sources || [],
            isSequential: false,
          };
        });
    } catch (error) {
      console.error("Erro ao parsear resposta da IA:", error);
      console.error("Resposta recebida:", response);

      const now = new Date();

      return fields.map((field) => {
        let defaultValue: string | string[] = field.defaultValue || "";

        if (field.name.toUpperCase().includes("ANO")) {
          defaultValue = now.getFullYear().toString();
        } else if (field.name.toUpperCase().includes("TRIMESTRE")) {
          const mes = now.getMonth() + 1;

          defaultValue = Math.ceil(mes / 3).toString();
        }

        if (field.sequentialIndices && field.sequentialIndices.length > 0) {
          const count = field.sequentialIndices.length;

          defaultValue = Array(count).fill(defaultValue);
        }

        return {
          fieldName: field.name,
          suggestedValue: defaultValue,
          confidence: 0.3,
          reasoning: "Erro ao processar resposta da IA. Usando valor padrão.",
          sources: [],
          isSequential: field.sequentialIndices
            ? field.sequentialIndices.length > 0
            : false,
        };
      });
    }
  }
}