Preciso arquitetar um plano para uma aplicação em next compilada para tauri, que utiliza o plugin tauri sql para
armazenar informação, tenho o seguinte cenario:
Preciso preencher um documento repetidas vezes, com informações alternadas, desejo conectar a uma api de i.a futuramente
para preencher os campos de maneira automatica, mas também desejo verificar manualmente, o documento em questão que
penso em preencher esta em anexo, atualmente estou filtrando por {{ CAMPO }} ou por campos sequenciais como {{
CAMPO_N }}, mas preciso de uma forma de estruturar melhor, desejo que pelo software eu consiga editar mais o arquivo,
incluindo novas linhas a coluna e integrando a solução de i.a dentro do software junto com a alteração manual
13:27

Vou analisar seu código e o documento para criar um plano arquitetural robusto. Deixe-me primeiro examinar o documento
anexado.
Concluído

Perfeito! Agora entendo a estrutura. Vou criar um plano arquitetural completo para sua aplicação. Deixe-me criar um
documento detalhado:
Concluído

Agora vou criar exemplos de implementação práticos para você começar:
Concluído

Agora vou criar um exemplo prático de como usar tudo isso:
Concluído

Criei um plano arquitetural completo para sua aplicação! Aqui está o que você tem agora:
📦 Arquivos Criados

    ARQUITETURA_SISTEMA.md - Documento completo com:
        Visão geral e requisitos
        Diagrama de arquitetura
        Modelo de dados atualizado
        Tipos TypeScript
        Implementação de novos recursos (TableStructureParser, TableManipulator, AIService)
        Componentes UI (TableEditor, AIAssistantPanel)
        Fluxos de trabalho
        Roadmap de implementação em 5 fases
    database_schema.sql - Schema SQL completo com:
        Tabelas atualizadas e novas
        Índices para performance
        Views úteis
        Triggers automáticos
        Preferências padrão
        Sistema de cache de IA
    utils_tableStructureParser.ts - Parser completo que:
        Extrai estruturas de tabelas do DOCX
        Detecta campos sequenciais automaticamente
        Identifica tabelas dinâmicas
        Mapeia colunas para campos
        Infere tipos de campos (text, date, number, select)
    GUIA_IMPLEMENTACAO.md - Passo a passo prático com:
        Setup inicial
        Código de exemplo de cada fase
        Componentes prontos para uso
        Checklist de implementação
        Troubleshooting

🎯 Principais Melhorias Arquiteturais

1. Edição Estrutural de Tabelas

   Adicionar/remover linhas dinamicamente
   Preview em tempo real
   Preservação de formatação DOCX

2. Integração IA Inteligente

   Sugestões contextuais por campo
   Cache de sugestões para performance
   Suporte múltiplos providers (OpenAI, Anthropic, custom)
   Sistema de confiança (0-1) por sugestão

3. Workflow Híbrido (Manual + IA)

   IA sugere → Usuário revisa → Edição manual → Geração
   Histórico de edições
   Validação de campos

4. Estrutura de Dados Robusta

   Versionamento de templates
   Metadados de tabelas
   Status de validação
   Métricas de uso

🚀 Próximos Passos Recomendados

    Comece pela Fase 1: Implementar as novas estruturas de dados e migrar o banco
    Teste o Parser: Use o documento anexado para testar a extração de estruturas
    Escolha o Provider de IA: OpenAI (GPT-4) ou Anthropic (Claude) dependendo de suas necessidades
    Prototipe a UI: Comece com o TableEditor para validar a UX

Tudo está documentado e pronto para implementação! Alguma dúvida específica sobre alguma parte?
Arquitetura sistema
Documento · MD
Database schema
Código · SQL
Utils tablestructureparser
TS
Guia implementacao
Documento · MD

Claude é uma IA e pode cometer erros. Por favor, verifique as respostas.
Arquitetura sistema · MD
Arquitetura do Sistema de Geração de Documentos Pedagógicos
📋 Visão Geral

Sistema Next.js + Tauri para geração automatizada e manual de documentos pedagógicos (DOCX), com suporte a IA para
preenchimento inteligente, edição de estruturas tabulares e gestão de templates.
🎯 Requisitos Funcionais

1. Gestão de Templates

   ✅ Upload e armazenamento de templates DOCX
   ✅ Extração automática de campos {{ CAMPO }} e {{ CAMPO_N }}
   🆕 Editor visual de templates (adicionar/remover linhas em tabelas)
   🆕 Mapeamento de estruturas complexas (tabelas dinâmicas)

2. Preenchimento de Documentos

   ✅ Preenchimento manual de campos
   ✅ Suporte a campos sequenciais
   🆕 Integração com IA (preenchimento automático)
   🆕 Validação e revisão manual pós-IA
   🆕 Edição de linhas de tabela (adicionar/remover)

3. IA e Automação

   🆕 Análise de contexto do documento
   🆕 Sugestões inteligentes de preenchimento
   🆕 Extração de dados de fontes externas
   🆕 Validação de consistência

🏗️ Arquitetura Proposta

┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│ │ Template │ │ Document │ │ AI Assistant │ │
│ │ Manager │ │ Editor │ │ Panel │ │
│ └──────────────┘ └──────────────┘ └──────────────────┘ │
│ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Table Editor Component (Novo)               │ │
│ │ - Adicionar/Remover linhas │ │
│ │ - Preview em tempo real │ │
│ │ - Mapeamento de campos por linha │ │
│ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ CAMADA DE SERVIÇOS │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│ │ Template │ │ Document │ │ AI Service │ │
│ │ Service │ │ Generator │ │ │ │
│ └──────────────┘ └──────────────┘ └──────────────────┘ │
│ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Table Structure Service (Novo)                │ │
│ │ - Parser de tabelas DOCX │ │
│ │ - Manipulação de estrutura XML │ │
│ │ - Injeção/remoção de linhas │ │
│ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ PERSISTÊNCIA (Tauri SQL)                  │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│ │ Templates │ │ Documents │ │ Table │ │
│ │ │ │ │ │ Structures │ │
│ └──────────────┘ └──────────────┘ └──────────────────┘ │
│ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ AI Cache & Preferences │ │
│ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ INTEGRAÇÕES EXTERNAS │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│ │ OpenAI API │ │ Anthropic │ │ Custom LLM │ │
│ │  (GPT-4)     │ │  (Claude)    │ │ Endpoint │ │
│ └──────────────┘ └──────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘

📊 Modelo de Dados Atualizado

1. Templates (Existente + Melhorias)
   sql

CREATE TABLE document_templates (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
file_name TEXT NOT NULL,
file_size INTEGER,
file_content TEXT, -- Base64
fields TEXT, -- JSON: TemplateField[]

    -- NOVOS CAMPOS
    structure TEXT, -- JSON: estrutura das tabelas
    table_metadata TEXT, -- JSON: metadados de tabelas dinâmicas
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

);

2. Table Structures (NOVA)
   typescript

interface TableStructure {
tableIndex: number; // Índice da tabela no documento
rows: number; // Número inicial de linhas
columns: number; // Número de colunas
isDynamic: boolean; // Tabela permite adicionar linhas
headerRows: number; // Quantas linhas são cabeçalho

// Mapeamento de colunas para campos
columnMapping: {
columnIndex: number;
fieldName: string;
fieldType: 'text' | 'date' | 'number' | 'select';
isSequential: boolean; // Se repete por linha
}[];

// Template de linha (para clonar ao adicionar)
rowTemplate: string; // XML da linha template
}

3. Generated Documents (Existente + Melhorias)
   sql

CREATE TABLE generated_documents (
id INTEGER PRIMARY KEY AUTOINCREMENT,
template_id INTEGER NOT NULL,
name TEXT NOT NULL,
file_name TEXT NOT NULL,
file_content TEXT, -- Base64
filled_fields TEXT, -- JSON

    -- NOVOS CAMPOS
    ai_suggestions TEXT, -- JSON: sugestões da IA
    validation_status TEXT, -- 'draft' | 'ai_filled' | 'reviewed' | 'approved'
    table_data TEXT, -- JSON: dados estruturados das tabelas
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES document_templates(id)

);

4. AI Cache (NOVA)
   sql

CREATE TABLE ai_cache (
id INTEGER PRIMARY KEY AUTOINCREMENT,
template_id INTEGER,
field_name TEXT NOT NULL,
context_hash TEXT NOT NULL, -- Hash do contexto usado
suggestion TEXT,
confidence REAL, -- 0-1
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (template_id) REFERENCES document_templates(id)
);

CREATE INDEX idx_ai_cache_context ON ai_cache(context_hash);

5. User Preferences (NOVA)
   sql

CREATE TABLE user_preferences (
id INTEGER PRIMARY KEY AUTOINCREMENT,
key TEXT UNIQUE NOT NULL,
value TEXT, -- JSON
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Armazenar: API keys, modelo preferido, templates de prompts, etc.

🔧 Tipos TypeScript Atualizados
typescript

// types/documentGeneration.ts

export interface TemplateField {
name: string;
type: 'text' | 'date' | 'number' | 'select' | 'sequential';
defaultValue: string;
sequentialIndices?: number[]; // Para campos {{ CAMPO_N }}

// NOVOS
tableIndex?: number; // Se está em uma tabela
columnIndex?: number; // Coluna da tabela
isInTable?: boolean;
validationRules?: ValidationRule[];
aiHints?: string[]; // Dicas para a IA
}

export interface ValidationRule {
type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
value?: any;
message: string;
}

export interface TableStructure {
tableIndex: number;
rows: number;
columns: number;
isDynamic: boolean;
headerRows: number;
columnMapping: ColumnMapping[];
rowTemplate: string;
}

export interface ColumnMapping {
columnIndex: number;
fieldName: string;
fieldType: 'text' | 'date' | 'number' | 'select';
isSequential: boolean;
placeholder?: string;
}

export interface DocumentTemplate {
id: number;
name: string;
fileName: string;
fileSize: number;
fileContent: string | null;
fields: TemplateField[];

// NOVOS
structure: TableStructure[];
tableMetadata?: Record<string, any>;

createdAt: string;
updatedAt: string;
}

export interface AIFieldSuggestion {
fieldName: string;
suggestedValue: string;
confidence: number; // 0-1
reasoning: string;
sources?: string[]; // URLs ou referências
}

export interface GeneratedDocument {
id: number;
templateId: number;
name: string;
fileName: string;
fileContent: string | null;
filledFields: Record<string, string>;

// NOVOS
aiSuggestions?: AIFieldSuggestion[];
validationStatus: 'draft' | 'ai_filled' | 'reviewed' | 'approved';
tableData?: TableRowData[];

createdAt: string;
}

export interface TableRowData {
tableIndex: number;
rowIndex: number;
fields: Record<string, string>;
isManuallyAdded?: boolean;
}

🛠️ Implementação dos Novos Recursos

1. Table Structure Parser
   typescript

// utils/tableStructureParser.ts

import JSZip from 'jszip';
import { parseString } from 'xml2js';

export async function extractTableStructures(
blob: Blob
): Promise<TableStructure[]> {
const arrayBuffer = await blob.arrayBuffer();
const zip = await JSZip.loadAsync(arrayBuffer);

const documentXml = await zip.file('word/document.xml')?.async('string');
if (!documentXml) throw new Error('document.xml não encontrado');

const structures: TableStructure[] = [];

// Parse XML
const xmlDoc = await parseXmlString(documentXml);
const tables = findTables(xmlDoc);

tables.forEach((table, index) => {
const rows = table.rows || [];
const firstRow = rows[0];
const columns = firstRow?.cells?.length || 0;

    // Detectar se é tabela dinâmica (procurar por campos sequenciais)
    const isDynamic = hasSequentialFields(table);
    
    // Extrair template da primeira linha de dados
    const headerRows = detectHeaderRows(table);
    const rowTemplate = extractRowTemplate(rows[headerRows]);
    
    // Mapear colunas para campos
    const columnMapping = extractColumnMapping(table, headerRows);
    
    structures.push({
      tableIndex: index,
      rows: rows.length,
      columns,
      isDynamic,
      headerRows,
      columnMapping,
      rowTemplate
    });

});

return structures;
}

function hasSequentialFields(table: any): boolean {
const text = tableToString(table);
return /\{\{\s*\w+_\d+\s*\}\}/.test(text);
}

function detectHeaderRows(table: any): number {
// Heurística: linhas sem campos {{ }} são cabeçalho
let headerCount = 0;
for (const row of table.rows) {
const rowText = rowToString(row);
if (/\{\{/.test(rowText)) break;
headerCount++;
}
return headerCount || 1;
}

function extractColumnMapping(
table: any,
headerRows: number
): ColumnMapping[] {
const mappings: ColumnMapping[] = [];
const firstDataRow = table.rows[headerRows];

if (!firstDataRow) return mappings;

firstDataRow.cells.forEach((cell: any, index: number) => {
const text = cellToString(cell);
const fieldMatch = text.match(/\{\{\s*(\w+)(?:_\d+)?\s*\}\}/);

    if (fieldMatch) {
      mappings.push({
        columnIndex: index,
        fieldName: fieldMatch[1],
        fieldType: 'text',
        isSequential: /_\d+/.test(text)
      });
    }

});

return mappings;
}

// Helpers para conversão XML
async function parseXmlString(xml: string): Promise<any> {
return new Promise((resolve, reject) => {
parseString(xml, (err, result) => {
if (err) reject(err);
else resolve(result);
});
});
}

function findTables(xmlDoc: any): any[] {
// Navegar pela estrutura XML para encontrar <w:tbl>
const body = xmlDoc['w:document']?.[0]?.['w:body']?.[0];
return body?.['w:tbl'] || [];
}

function extractRowTemplate(row: any): string {
// Serializar a estrutura XML da linha como template
return JSON.stringify(row);
}

function tableToString(table: any): string {
return JSON.stringify(table);
}

function rowToString(row: any): string {
return JSON.stringify(row);
}

function cellToString(cell: any): string {
return JSON.stringify(cell);
}

2. Table Manipulator
   typescript

// utils/tableManipulator.ts

import JSZip from 'jszip';

export async function addTableRow(
blob: Blob,
tableIndex: number,
rowIndex: number,
structure: TableStructure
): Promise<Blob> {
const arrayBuffer = await blob.arrayBuffer();
const zip = await JSZip.loadAsync(arrayBuffer);

let documentXml = await zip.file('word/document.xml')?.async('string');
if (!documentXml) throw new Error('document.xml não encontrado');

// Parse e manipular XML
const xmlDoc = await parseXmlString(documentXml);
const tables = findTables(xmlDoc);
const targetTable = tables[tableIndex];

if (!targetTable) throw new Error(`Tabela ${tableIndex} não encontrada`);

// Clonar template da linha
const templateRow = JSON.parse(structure.rowTemplate);
const newRow = cloneRow(templateRow);

// Inserir nova linha
targetTable.rows.splice(rowIndex, 0, newRow);

// Serializar de volta
const updatedXml = serializeXml(xmlDoc);
zip.file('word/document.xml', updatedXml);

return await zip.generateAsync({ type: 'blob' });
}

export async function removeTableRow(
blob: Blob,
tableIndex: number,
rowIndex: number
): Promise<Blob> {
const arrayBuffer = await blob.arrayBuffer();
const zip = await JSZip.loadAsync(arrayBuffer);

let documentXml = await zip.file('word/document.xml')?.async('string');
if (!documentXml) throw new Error('document.xml não encontrado');

const xmlDoc = await parseXmlString(documentXml);
const tables = findTables(xmlDoc);
const targetTable = tables[tableIndex];

if (!targetTable) throw new Error(`Tabela ${tableIndex} não encontrada`);

// Remover linha (não remover cabeçalho)
if (rowIndex >= targetTable.headerRows) {
targetTable.rows.splice(rowIndex, 1);
}

const updatedXml = serializeXml(xmlDoc);
zip.file('word/document.xml', updatedXml);

return await zip.generateAsync({ type: 'blob' });
}

function cloneRow(row: any): any {
return JSON.parse(JSON.stringify(row));
}

function serializeXml(xmlDoc: any): string {
// Converter de volta para string XML
// Implementar com xml2js ou similar
return '';
}

3. AI Service Integration
   typescript

// services/aiService.ts

export interface AIServiceConfig {
provider: 'openai' | 'anthropic' | 'custom';
apiKey: string;
model: string;
baseUrl?: string;
}

export class AIDocumentService {
private config: AIServiceConfig;

constructor(config: AIServiceConfig) {
this.config = config;
}

async suggestFieldValues(
template: DocumentTemplate,
context: string,
existingFields?: Record<string, string>
): Promise<AIFieldSuggestion[]> {
const prompt = this.buildPrompt(template, context, existingFields);

    const response = await this.callAI(prompt);
    
    return this.parseAIResponse(response, template.fields);

}

private buildPrompt(
template: DocumentTemplate,
context: string,
existingFields?: Record<string, string>
): string {
const fieldsDescription = template.fields
.map(f => {
const hints = f.aiHints?.join(', ') || 'nenhuma dica';
return `- ${f.name} (${f.type}): ${hints}`;
})
.join('\n');

    const existingData = existingFields
      ? `\n\nCampos já preenchidos:\n${JSON.stringify(existingFields, null, 2)}`
      : '';
    
    return `

Você é um assistente especializado em preencher documentos pedagógicos.

CONTEXTO DO DOCUMENTO:
${context}

CAMPOS A PREENCHER:
${fieldsDescription}
${existingData}

INSTRUÇÕES:

1. Analise o contexto fornecido
2. Sugira valores apropriados para cada campo
3. Para campos sequenciais (ex: ATIVIDADE_1, ATIVIDADE_2), sugira múltiplos valores
4. Retorne APENAS um JSON válido no formato:
   {
   "suggestions": [
   {
   "fieldName": "NOME_DO_CAMPO",
   "suggestedValue": "valor sugerido",
   "confidence": 0.95,
   "reasoning": "explicação breve"
   }
   ]
   }

IMPORTANTE:

- Seja específico e relevante ao contexto educacional
- Para campos de data, use formato DD/MM/AAAA
- Para habilidades BNCC, use códigos oficiais
- Mantenha tom formal e técnico apropriado
  `.trim();
  }

  private async callAI(prompt: string): Promise<string> {
  switch (this.config.provider) {
  case 'openai':
  return await this.callOpenAI(prompt);
  case 'anthropic':
  return await this.callAnthropic(prompt);
  case 'custom':
  return await this.callCustom(prompt);
  default:
  throw new Error('Provider não suportado');
  }
  }

  private async callOpenAI(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${this.config.apiKey}`
  },
  body: JSON.stringify({
  model: this.config.model || 'gpt-4',
  messages: [
  { role: 'system', content: 'Você é um assistente especializado em documentos pedagógicos.' },
  { role: 'user', content: prompt }
  ],
  temperature: 0.7,
  response_format: { type: 'json_object' }
  })
  });

  const data = await response.json();
  return data.choices[0].message.content;
  }

  private async callAnthropic(prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  'x-api-key': this.config.apiKey,
  'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
  model: this.config.model || 'claude-3-sonnet-20240229',
  max_tokens: 4096,
  messages: [
  { role: 'user', content: prompt }
  ]
  })
  });

  const data = await response.json();
  return data.content[0].text;
  }

  private async callCustom(prompt: string): Promise<string> {
  if (!this.config.baseUrl) {
  throw new Error('baseUrl necessário para custom provider');
  }

  const response = await fetch(`${this.config.baseUrl}/generate`, {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${this.config.apiKey}`
  },
  body: JSON.stringify({ prompt })
  });

  const data = await response.json();
  return data.response || data.text || '';
  }

  private parseAIResponse(
  response: string,
  fields: TemplateField[]
  ): AIFieldSuggestion[] {
  try {
  const parsed = JSON.parse(response);
  return parsed.suggestions || [];
  } catch (error) {
  console.error('Erro ao parsear resposta da IA:', error);
  return [];
  }
  }

  async validateFields(
  fields: Record<string, string>,
  template: DocumentTemplate
  ): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  template.fields.forEach(field => {
  const value = fields[field.name];

      if (field.validationRules) {
        field.validationRules.forEach(rule => {
          if (!this.validateRule(value, rule)) {
            errors.push(rule.message);
          }
        });
      }
  });

  return { valid: errors.length === 0, errors };
  }

  private validateRule(value: string, rule: ValidationRule): boolean {
  switch (rule.type) {
  case 'required':
  return !!value && value.trim().length > 0;
  case 'minLength':
  return value.length >= (rule.value || 0);
  case 'maxLength':
  return value.length <= (rule.value || Infinity);
  case 'pattern':
  return new RegExp(rule.value).test(value);
  default:
  return true;
  }
  }
  }

4. Updated Hook com IA
   typescript

// hooks/useDocumentTemplates.ts (atualizado)

import { AIDocumentService, AIServiceConfig } from '@/services/aiService';

export const useDocumentTemplates = () => {
// ... código existente ...

const [aiService, setAiService] = useState<AIDocumentService | null>(null);
const [aiSuggestions, setAiSuggestions] = useState<AIFieldSuggestion[]>([]);

const configureAI = (config: AIServiceConfig) => {
setAiService(new AIDocumentService(config));
};

const generateAISuggestions = async (
templateId: number,
context: string,
existingFields?: Record<string, string>
): Promise<AIFieldSuggestion[]> => {
if (!aiService) {
throw new Error('AI Service não configurado');
}

    const template = templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template não encontrado');
    }
    
    try {
      const suggestions = await aiService.suggestFieldValues(
        template,
        context,
        existingFields
      );
      
      setAiSuggestions(suggestions);
      
      // Cachear sugestões
      await cacheAISuggestions(templateId, context, suggestions);
      
      return suggestions;
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error);
      throw error;
    }

};

const applyAISuggestion = (
fieldName: string,
suggestion: AIFieldSuggestion
) => {
// Aplicar sugestão ao formulário
// Isso seria integrado com o estado do formulário
};

const addTableRow = async (
templateId: number,
tableIndex: number,
rowIndex: number
): Promise<DocumentTemplate> => {
try {
const template = templates.find(t => t.id === templateId);
if (!template || !template.fileContent) {
throw new Error('Template não encontrado');
}

      const structure = template.structure[tableIndex];
      if (!structure) {
        throw new Error('Estrutura de tabela não encontrada');
      }
      
      // Converter base64 para blob
      const binaryString = atob(template.fileContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      // Adicionar linha
      const updatedBlob = await addTableRowToDocx(blob, tableIndex, rowIndex, structure);
      
      // Converter de volta para base64
      const arrayBuffer = await updatedBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let base64String = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        base64String += String.fromCharCode.apply(null, Array.from(chunk));
      }
      base64String = btoa(base64String);
      
      // Atualizar template no banco
      const updatedTemplate = {
        ...template,
        fileContent: base64String
      };
      
      // Salvar no banco e atualizar estado
      // await updateDocumentTemplate(templateId, updatedTemplate);
      await loadTemplates();
      
      return updatedTemplate;
    } catch (error) {
      console.error('Erro ao adicionar linha:', error);
      throw error;
    }

};

return {
// ... retornos existentes ...

    // Novos retornos
    aiService,
    aiSuggestions,
    configureAI,
    generateAISuggestions,
    applyAISuggestion,
    addTableRow

};
};

🎨 Componentes UI Sugeridos

1. TableEditor Component
   typescript

// components/TableEditor.tsx

'use client';

import { useState } from 'react';
import { DocumentTemplate, TableStructure } from '@/types/documentGeneration';

interface TableEditorProps {
template: DocumentTemplate;
tableIndex: number;
onAddRow: (rowIndex: number) => void;
onRemoveRow: (rowIndex: number) => void;
}

export function TableEditor({
template,
tableIndex,
onAddRow,
onRemoveRow
}: TableEditorProps) {
const structure = template.structure[tableIndex];
const [rows, setRows] = useState<number>(structure.rows);

if (!structure) return null;

return (
<div className="border rounded-lg p-4">
<div className="flex justify-between items-center mb-4">
<h3 className="font-semibold">
Tabela {tableIndex + 1} ({structure.columns} colunas)
</h3>
<button
onClick={() => onAddRow(rows)}
className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
>
+ Adicionar Linha
</button>
</div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border">
          <thead>
            <tr>
              {structure.columnMapping.map((col, idx) => (
                <th key={idx} className="border p-2 bg-gray-100">
                  {col.fieldName}
                </th>
              ))}
              <th className="border p-2 bg-gray-100">Ações</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows - structure.headerRows }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {structure.columnMapping.map((col, colIdx) => (
                  <td key={colIdx} className="border p-2">
                    <input
                      type="text"
                      placeholder={`${col.fieldName}${col.isSequential ? `_${rowIdx + 1}` : ''}`}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                ))}
                <td className="border p-2">
                  <button
                    onClick={() => {
                      onRemoveRow(rowIdx + structure.headerRows);
                      setRows(rows - 1);
                    }}
                    className="px-2 py-1 text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

);
}

2. AI Assistant Panel
   typescript

// components/AIAssistantPanel.tsx

'use client';

import { useState } from 'react';
import { AIFieldSuggestion } from '@/types/documentGeneration';

interface AIAssistantPanelProps {
suggestions: AIFieldSuggestion[];
onApplySuggestion: (fieldName: string, suggestion: AIFieldSuggestion) => void;
onRegenerate: () => void;
}

export function AIAssistantPanel({
suggestions,
onApplySuggestion,
onRegenerate
}: AIAssistantPanelProps) {
const [expandedField, setExpandedField] = useState<string | null>(null);

return (
<div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-blue-50">
<div className="flex justify-between items-center mb-4">
<h3 className="font-semibold text-lg">🤖 Assistente IA</h3>
<button
onClick={onRegenerate}
className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
>
Regenerar
</button>
</div>

      {suggestions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Nenhuma sugestão disponível
        </p>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {suggestion.fieldName}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        suggestion.confidence > 0.8
                          ? 'bg-green-100 text-green-700'
                          : suggestion.confidence > 0.5
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {Math.round(suggestion.confidence * 100)}% confiança
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">
                    {suggestion.suggestedValue}
                  </p>
                  
                  {expandedField === suggestion.fieldName && (
                    <p className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                      💡 {suggestion.reasoning}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-1 ml-2">
                  <button
                    onClick={() => onApplySuggestion(suggestion.fieldName, suggestion)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                  >
                    Aplicar
                  </button>
                  <button
                    onClick={() =>
                      setExpandedField(
                        expandedField === suggestion.fieldName
                          ? null
                          : suggestion.fieldName
                      )
                    }
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs"
                  >
                    {expandedField === suggestion.fieldName ? '▲' : '▼'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

);
}

📝 Fluxo de Trabalho Proposto
Fluxo 1: Upload de Template com Análise Estrutural

1. Usuário faz upload do DOCX
   ↓
2. Sistema extrai:
    - Campos {{ CAMPO }}
    - Campos sequenciais {{ CAMPO_N }}
    - Estrutura de tabelas
    - Metadados (linhas, colunas, cabeçalhos)
      ↓
3. Sistema armazena:
    - Arquivo em Base64
    - Campos detectados
    - Estruturas de tabelas
      ↓
4. Usuário vê preview interativo com:
    - Lista de campos
    - Visualização de tabelas
    - Opção de editar estrutura

Fluxo 2: Geração com IA

1. Usuário seleciona template
   ↓
2. Usuário fornece contexto (texto livre ou campos base)
   ↓
3. Sistema chama IA com:
    - Estrutura do documento
    - Contexto fornecido
    - Campos já preenchidos (se houver)
      ↓
4. IA retorna sugestões
   ↓
5. Usuário revisa sugestões em painel lateral:
    - Aceita individual
    - Aceita todos
    - Rejeita
    - Edita manualmente
      ↓
6. Usuário preenche campos restantes manualmente
   ↓
7. Sistema gera documento final

Fluxo 3: Edição de Tabelas

1. Usuário abre editor de template
   ↓
2. Sistema mostra tabelas detectadas
   ↓
3. Usuário seleciona tabela dinâmica
   ↓
4. Usuário adiciona/remove linhas
   ↓
5. Sistema atualiza:
    - XML do documento
    - Campos sequenciais
    - Preview
      ↓
6. Usuário salva alterações
   ↓
7. Template atualizado no banco

🚀 Roadmap de Implementação
Fase 1: Fundação (Semanas 1-2)

    Criar novas tabelas no banco de dados
    Implementar TableStructureParser
    Atualizar tipos TypeScript
    Migrar dados existentes

Fase 2: Editor de Tabelas (Semanas 3-4)

    Implementar TableManipulator
    Criar componente TableEditor
    Integrar com hook useDocumentTemplates
    Testes de adicionar/remover linhas

Fase 3: Integração IA (Semanas 5-6)

    Implementar AIDocumentService
    Criar componente AIAssistantPanel
    Implementar sistema de cache
    Interface de configuração da IA

Fase 4: Melhorias UX (Semanas 7-8)

    Preview em tempo real
    Validação de campos
    Histórico de versões
    Exportação em lote

Fase 5: Otimizações (Semana 9+)

    Performance (lazy loading, virtualização)
    Testes automatizados
    Documentação
    Deploy e distribuição

🔒 Considerações de Segurança

1. API Keys

   Armazenar em user_preferences criptografadas
   Nunca expor no frontend
   Usar Tauri secure storage

2. Validação

   Sanitizar inputs antes de processar XML
   Validar estrutura de documentos
   Limitar tamanho de uploads

3. IA

   Rate limiting para chamadas de API
   Timeout em requisições
   Fallback para modo manual

📊 Métricas de Sucesso

    Tempo médio de preenchimento: reduzir em 70%
    Taxa de aceitação de sugestões IA: > 60%
    Precisão das sugestões: > 80%
    Satisfação do usuário: > 4.5/5

🎓 Exemplo de Uso
typescript

// Exemplo de uso completo

const MyDocumentPage = () => {
const {
templates,
configureAI,
generateAISuggestions,
generateDocument,
addTableRow
} = useDocumentTemplates();

// 1. Configurar IA
useEffect(() => {
configureAI({
provider: 'openai',
apiKey: 'sk-...',
model: 'gpt-4'
});
}, []);

// 2. Gerar sugestões
const handleGenerateSuggestions = async () => {
const context = `
      Documento: Planejamento Pedagógico 1º Trimestre 2026
      Escola: EEEF Professor Ernesto Carneiro Santiago
      Ano: 1º Ano Ensino Fundamental
      Componente: Língua Portuguesa
    `;

    await generateAISuggestions(templateId, context);

};

// 3. Adicionar linha à tabela
const handleAddRow = async () => {
await addTableRow(templateId, 1, 5); // Tabela 1, após linha 5
};

// 4. Gerar documento
const handleGenerate = async () => {
await generateDocument(templateId, fieldValues, "Planejamento_1Tri_2026");
};

return (
<div className="grid grid-cols-3 gap-4">
<div className="col-span-2">
<TableEditor />
<FieldsForm />
</div>
<div>
<AIAssistantPanel />
</div>
</div>
);
};

📚 Recursos Adicionais
Bibliotecas Necessárias
json

{
"dependencies": {
"jszip": "^3.10.1",
"mammoth": "^1.6.0",
"xml2js": "^0.6.2",
"docx": "^8.5.0",
"file-saver": "^2.0.5"
},
"devDependencies": {
"@types/jszip": "^3.4.1",
"@types/xml2js": "^0.4.14"
}
}

Documentação de Referência

    Office Open XML Spec
    JSZip Docs
    OpenAI API
    Anthropic API

🎯 Próximos Passos Imediatos

    Definir prioridades - Qual funcionalidade implementar primeiro?
    Escolher provider de IA - OpenAI, Anthropic ou custom?
    Prototipar UI - Criar wireframes dos novos componentes
    Setup do ambiente - Instalar dependências e configurar Tauri

Dúvidas ou precisa de ajuda com alguma parte específica?

    Falha ao baixar arquivos