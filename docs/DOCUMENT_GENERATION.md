# Documentação: Sistema de Geração de Documentos

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Componentes](#componentes)
4. [Serviços](#serviços)
5. [Banco de Dados](#banco-de-dados)
6. [Integração com IA](#integração-com-ia)
7. [Fluxo de Funcionamento](#fluxo-de-funcionamento)
8. [Exemplos de Uso](#exemplos-de-uso)

---

## 🎯 Visão Geral

O sistema de geração de documentos permite criar documentos Word (.docx) a partir de templates predefinidos, preenchendo campos dinamicamente com valores fornecidos pelo usuário ou sugeridos por IA. O sistema suporta:

- **Upload de templates DOCX** com campos marcados
- **Preenchimento manual** de campos
- **Sugestões automáticas via IA** para preenchimento
- **Tabelas dinâmicas** com adição/remoção de linhas
- **Múltiplos provedores de IA** (OpenAI, Anthropic, Ollama, APIs customizadas)

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    DocumentGenerationTab                     │
│  (Componente Principal - Orquestra toda a funcionalidade)    │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ TemplateCard │ │DocumentGen   │ │GeneratedDoc  │
│              │ │Form         │ │Card          │
└──────────────┘ └──────┬───────┘ └──────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│AIAssistant   │ │TableEditor   │ │TemplateUpload│
│Panel         │ │              │ │Modal         │
└──────────────┘ └──────────────┘ └──────────────┘
                        │
                        ▼
                ┌──────────────────┐
                │ useDocumentTemplates│
                │    (Hook)        │
                └────────┬─────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                 │
        ▼                ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Database    │ │AIDocument    │ │Template      │
│  Functions   │ │Service       │ │Processor     │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🧩 Componentes

### 1. DocumentGenerationTab

**Localização:** `src/components/Tabs/documentGeneration/DocumentGenerationTab.tsx`

**Responsabilidades:**
- Gerenciar estado dos templates e documentos gerados
- Orquestrar upload, exclusão e geração de documentos
- Exibir lista de templates disponíveis
- Exibir lista de documentos gerados

**Principais Estados:**
```typescript
const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
```

**Principais Funções:**
- `handleUpload`: Processa upload de novo template
- `handleGenerate`: Gera documento a partir de template preenchido
- `handleDeleteTemplate`: Remove template do sistema
- `handleDownload`: Baixa documento gerado

---

### 2. DocumentGeneratorForm

**Localização:** `src/components/Tabs/documentGeneration/DocumentGeneratorForm.tsx`

**Responsabilidades:**
- Exibir formulário de preenchimento de campos
- Integrar painel de sugestões de IA
- Gerenciar edição de tabelas dinâmicas
- Coletar valores dos campos antes da geração

**Principais Funcionalidades:**

#### Campos Únicos
Campos que aparecem uma única vez no template são exibidos como inputs simples.

#### Campos Sequenciais (Tabelas)
Campos que aparecem múltiplas vezes (ex: `{{ATIVIDADE_1}}`, `{{ATIVIDADE_2}}`) são agrupados e permitem:
- Preenchimento em lote
- Aplicação de padrões (ex: "Trimestre {n}")
- Expansão individual para edição detalhada

#### Integração com IA
```typescript
const [aiContext, setAiContext] = useState(""); // Contexto fornecido pelo usuário
const [aiSuggestions, setAiSuggestions] = useState<AIFieldSuggestion[]>([]);
const [aiService, setAiService] = useState<AIDocumentService | null>(null);
```

**Fluxo de Sugestões de IA:**
1. Usuário fornece contexto no campo de texto
2. Clica em "Gerar Sugestões com IA"
3. Sistema chama `AIDocumentService.suggestFieldValues()`
4. Sugestões são exibidas no `AIAssistantPanel`
5. Usuário pode aplicar sugestões individualmente

#### Tabelas Dinâmicas
Quando o template possui tabelas dinâmicas (`isDynamic: true`):
- Exibe `TableEditor` para cada tabela
- Permite adicionar/remover linhas
- Sincroniza valores com campos sequenciais

---

### 3. AIAssistantPanel

**Localização:** `src/components/AIAssistantPanel.tsx`

**Responsabilidades:**
- Exibir sugestões geradas pela IA
- Mostrar nível de confiança de cada sugestão
- Permitir aplicação de sugestões aos campos
- Regenerar sugestões

**Estrutura de Sugestão:**
```typescript
interface AIFieldSuggestion {
  fieldName: string;
  suggestedValue: string;
  confidence: number; // 0-1
  reasoning: string;
  sources?: string[];
}
```

**Níveis de Confiança:**
- **Alta** (≥0.8): Verde
- **Média** (≥0.6): Amarelo
- **Baixa** (<0.6): Laranja

---

### 4. TableEditor

**Localização:** `src/components/TableEditor.tsx`

**Responsabilidades:**
- Exibir tabela dinâmica de forma visual
- Permitir edição de células
- Adicionar/remover linhas (se `isDynamic: true`)
- Sincronizar com campos sequenciais

**Estrutura da Tabela:**
```typescript
interface TableStructure {
  tableIndex: number;
  rows: number;
  columns: number;
  isDynamic: boolean;
  headerRows: number;
  columnMapping: ColumnMapping[];
  rowTemplate: string;
}
```

---

### 5. TemplateCard

**Localização:** `src/components/Tabs/documentGeneration/TemplateCard.tsx`

**Responsabilidades:**
- Exibir card de template na lista
- Mostrar informações: nome, arquivo, campos, tamanho
- Permitir seleção para preenchimento
- Permitir exclusão

---

### 6. TemplateUploadModal

**Localização:** `src/components/Tabs/documentGeneration/TemplateUploadModal.tsx`

**Responsabilidades:**
- Interface de upload de template DOCX
- Suporte a drag & drop
- Validação de arquivo (.docx)
- Processamento inicial do template

---

### 7. AIConfigModal

**Localização:** `src/components/modal/AIConfigModal.tsx`

**Responsabilidades:**
- Configurar provedor de IA (OpenAI, Anthropic, Custom)
- Configurar API Key
- Selecionar modelo
- Ajustar parâmetros (temperatura, max tokens)
- Configurar Base URL para APIs customizadas

**Acesso:** Menu do usuário no Header → "Configurações de IA"

**Armazenamento:** Configurações salvas em `localStorage` como `"aiServiceConfig"`

---

## ⚙️ Serviços

### 1. AIDocumentService

**Localização:** `src/services/aiService.ts`

**Responsabilidades:**
- Gerar sugestões de valores para campos do template
- Suportar múltiplos provedores de IA
- Validar campos
- Parsear respostas da IA

**Provedores Suportados:**

#### OpenAI
```typescript
endpoint: "https://api.openai.com/v1/chat/completions"
headers: {
  "Authorization": "Bearer {apiKey}"
}
body: {
  model: "gpt-4",
  messages: [...],
  temperature: 0.7,
  max_tokens: 2048
}
```

#### Anthropic
```typescript
endpoint: "https://api.anthropic.com/v1/messages"
headers: {
  "x-api-key": "{apiKey}",
  "anthropic-version": "2023-06-01"
}
body: {
  model: "claude-3-5-sonnet-20241022",
  messages: [...],
  max_tokens: 4096
}
```

#### Custom (Ollama)
```typescript
// Detecção automática se URL contém "ollama" ou "11434"
endpoint: "http://localhost:11434/api/chat"
body: {
  model: "llama3.1:8b",
  messages: [...],
  stream: false,
  options: {
    temperature: 0.7,
    num_predict: 2048
  }
}
```

#### Custom (OpenAI-compatible)
```typescript
endpoint: "{baseURL}/v1/chat/completions"
headers: {
  "Authorization": "Bearer {apiKey}" // Opcional
}
body: {
  model: "...",
  messages: [...],
  temperature: 0.7,
  max_tokens: 2048
}
```

**Método Principal:**
```typescript
async suggestFieldValues(
  template: DocumentTemplate,
  context: string,
  existingValues?: Record<string, string>
): Promise<AIFieldSuggestion[]>
```

**Processo:**
1. Constrói prompt com contexto e campos do template
2. Chama API do provedor selecionado
3. Parseia resposta JSON
4. Valida e filtra sugestões
5. Retorna array de `AIFieldSuggestion`

---

### 2. Template Processor

**Localização:** `src/utils/templateProcessor.ts`

**Responsabilidades:**
- Extrair campos do template DOCX
- Processar template com valores fornecidos
- Gerar documento final

**Funções Principais:**
- `extractFieldsFromDocx`: Extrai campos marcados (ex: `{{CAMPO}}`)
- `processDocxTemplate`: Substitui campos por valores e gera novo DOCX

---

## 💾 Banco de Dados

### Schema

#### Tabela: `document_templates`

```sql
CREATE TABLE IF NOT EXISTS document_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_content TEXT, -- Base64 encoded DOCX
  fields TEXT, -- JSON: TemplateField[]
  structure TEXT, -- JSON: TableStructure[]
  table_metadata TEXT, -- JSON: metadados adicionais
  version INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único
- `name`: Nome do template
- `file_name`: Nome do arquivo original
- `file_size`: Tamanho em bytes
- `file_content`: Conteúdo do arquivo em Base64
- `fields`: Array JSON de campos do template
- `structure`: Array JSON de estruturas de tabelas
- `table_metadata`: Metadados adicionais das tabelas
- `version`: Versão do template (controle de versão)

#### Tabela: `generated_documents`

```sql
CREATE TABLE IF NOT EXISTS generated_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_content TEXT, -- Base64 encoded DOCX
  filled_fields TEXT, -- JSON: Record<string, string>
  validation_status TEXT DEFAULT 'draft',
  table_data TEXT, -- JSON: TableRowData[]
  generation_method TEXT, -- 'manual' | 'ai' | 'hybrid'
  confidence_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES document_templates(id)
);
```

**Campos:**
- `id`: Identificador único
- `template_id`: Referência ao template usado
- `name`: Nome do documento gerado
- `file_name`: Nome do arquivo gerado
- `file_content`: Conteúdo do arquivo em Base64
- `filled_fields`: Campos preenchidos (JSON)
- `validation_status`: Status de validação
- `table_data`: Dados das tabelas (JSON)
- `generation_method`: Método de geração
- `confidence_score`: Score de confiança (se usado IA)

#### Tabela: `table_structures`

```sql
CREATE TABLE IF NOT EXISTS table_structures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL,
  table_index INTEGER NOT NULL,
  rows INTEGER NOT NULL,
  columns INTEGER NOT NULL,
  is_dynamic BOOLEAN DEFAULT 0,
  header_rows INTEGER DEFAULT 1,
  column_mapping TEXT, -- JSON: ColumnMapping[]
  row_template TEXT, -- XML template da linha
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES document_templates(id) ON DELETE CASCADE,
  UNIQUE(template_id, table_index)
);
```

### Funções do Banco de Dados

**Localização:** `src/database/database.ts`

#### Inserção de Template

```typescript
async function insertDocumentTemplate(
  template: {
    name: string;
    fileName: string;
    fileSize: number;
    fileContent: string; // Base64
    fields: string; // JSON string
  }
): Promise<DocumentTemplate>
```

**Processo:**
1. Converte `fields` para JSON string
2. Insere no banco de dados
3. Retorna template com ID gerado

#### Inserção de Documento Gerado

```typescript
async function insertGeneratedDocument(
  document: {
    templateId: number;
    name: string;
    fileName: string;
    fileContent: string; // Base64
    filledFields: string; // JSON string
  }
): Promise<GeneratedDocument>
```

**Processo:**
1. Serializa `filledFields` para JSON string
2. Insere no banco de dados
3. Retorna documento com ID gerado

---

## 🤖 Integração com IA

### Configuração

As configurações de IA são armazenadas em `localStorage` com a chave `"aiServiceConfig"`:

```typescript
interface AIServiceConfig {
  provider: "openai" | "anthropic" | "custom";
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string; // Para custom
}
```

### Fluxo de Geração de Sugestões

```
1. Usuário preenche contexto
   ↓
2. Clica em "Gerar Sugestões com IA"
   ↓
3. DocumentGeneratorForm.handleGenerateAISuggestions()
   ↓
4. AIDocumentService.suggestFieldValues()
   ↓
5. Constrói prompt com:
   - Contexto fornecido
   - Lista de campos do template
   - Valores já preenchidos (se houver)
   ↓
6. Chama API do provedor configurado
   ↓
7. Parseia resposta JSON
   ↓
8. Retorna array de AIFieldSuggestion
   ↓
9. Exibe no AIAssistantPanel
   ↓
10. Usuário aplica sugestões desejadas
```

### Prompt Template

O prompt enviado para a IA segue este formato:

```
Você é um assistente especializado em preencher documentos educacionais.

Analise o contexto abaixo e sugira valores apropriados para cada campo do template.

CONTEXTO:
{contexto fornecido pelo usuário}

CAMPOS DO TEMPLATE:
- campo1 (tipo: text): [dicas se houver]
- campo2 (tipo: date): [dicas se houver]
...

Valores já preenchidos:
- campo1: valor1
...

INSTRUÇÕES:
1. Para cada campo, sugira um valor apropriado baseado no contexto
2. Se não houver informação suficiente, sugira um valor placeholder razoável
3. Mantenha consistência entre os campos relacionados
4. Use formato brasileiro para datas (DD/MM/AAAA) e números

Responda APENAS com um JSON válido no seguinte formato:
{
  "suggestions": [
    {
      "fieldName": "nome_do_campo",
      "suggestedValue": "valor_sugerido",
      "confidence": 0.95,
      "reasoning": "explicação da sugestão"
    }
  ]
}
```

---

## 🔄 Fluxo de Funcionamento

### 1. Upload de Template

```
Usuário seleciona arquivo .docx
   ↓
TemplateUploadModal valida arquivo
   ↓
useDocumentTemplates.uploadTemplate()
   ↓
extractFieldsFromDocx() extrai campos
   ↓
Converte arquivo para Base64
   ↓
Insere no banco de dados
   ↓
Template aparece na lista
```

### 2. Preenchimento e Geração

```
Usuário clica em TemplateCard
   ↓
DocumentGeneratorForm é exibido
   ↓
Usuário pode:
  - Preencher campos manualmente
  - Usar IA para gerar sugestões
  - Editar tabelas dinâmicas
   ↓
Clica em "Gerar Documento"
   ↓
useDocumentTemplates.generateDocument()
   ↓
processDocxTemplate() substitui campos
   ↓
Gera novo arquivo DOCX
   ↓
Salva no banco de dados
   ↓
Faz download automático
   ↓
Documento aparece na lista de gerados
```

### 3. Geração com IA

```
Usuário fornece contexto
   ↓
Clica em "Gerar Sugestões com IA"
   ↓
Sistema carrega configuração de IA do localStorage
   ↓
Cria instância de AIDocumentService
   ↓
Chama suggestFieldValues()
   ↓
IA retorna sugestões
   ↓
AIAssistantPanel exibe sugestões
   ↓
Usuário aplica sugestões desejadas
   ↓
Campos são preenchidos automaticamente
```

---

## 📝 Exemplos de Uso

### Exemplo 1: Template Simples

**Template DOCX:**
```
Plano de Aula

Professor: {{PROFESSOR}}
Disciplina: {{DISCIPLINA}}
Data: {{DATA}}
```

**Preenchimento:**
```typescript
fieldValues = {
  PROFESSOR: "João Silva",
  DISCIPLINA: "Matemática",
  DATA: "15/03/2024"
}
```

**Resultado:** Documento gerado com campos substituídos.

### Exemplo 2: Template com Campos Sequenciais

**Template DOCX:**
```
Atividades:

1. {{ATIVIDADE_1}}
2. {{ATIVIDADE_2}}
3. {{ATIVIDADE_3}}
```

**Preenchimento:**
```typescript
fieldValues = {
  ATIVIDADE: ["Resolver equações", "Fazer exercícios", "Revisar conteúdo"]
}
```

**Processamento:**
- Sistema expande para: `ATIVIDADE_1`, `ATIVIDADE_2`, `ATIVIDADE_3`
- Substitui no documento

### Exemplo 3: Uso de IA

**Contexto fornecido:**
```
Plano de aula para 3º ano do ensino fundamental, 
tema: Meio Ambiente, duração: 2 horas
```

**Sugestões geradas:**
```json
{
  "suggestions": [
    {
      "fieldName": "OBJETIVO",
      "suggestedValue": "Conscientizar os alunos sobre a importância da preservação do meio ambiente",
      "confidence": 0.95,
      "reasoning": "Objetivo apropriado para o tema e série"
    },
    {
      "fieldName": "METODOLOGIA",
      "suggestedValue": "Aula expositiva dialogada, atividades práticas e roda de conversa",
      "confidence": 0.88,
      "reasoning": "Metodologia adequada para o público-alvo"
    }
  ]
}
```

### Exemplo 4: Tabela Dinâmica

**Template com tabela:**
```
| Atividade | Data | Status |
|-----------|------|--------|
| {{ATIV_1}} | {{DATA_1}} | {{STATUS_1}} |
| {{ATIV_2}} | {{DATA_2}} | {{STATUS_2}} |
```

**Estrutura detectada:**
```typescript
structure: [{
  tableIndex: 0,
  rows: 3,
  columns: 3,
  isDynamic: true,
  headerRows: 1,
  columnMapping: [
    { fieldName: "ATIV", isSequential: true },
    { fieldName: "DATA", isSequential: true },
    { fieldName: "STATUS", isSequential: true }
  ]
}]
```

**Uso:**
- Usuário pode adicionar/remover linhas via `TableEditor`
- Valores são sincronizados automaticamente com campos sequenciais

---

## 🔧 Configuração e Manutenção

### Configurar IA

1. Acessar: Menu do usuário → "Configurações de IA"
2. Selecionar provedor
3. Inserir credenciais
4. Ajustar parâmetros
5. Salvar

### Adicionar Novo Provedor de IA

1. Adicionar tipo em `AIServiceConfig.provider`
2. Implementar método `call{Provider}` em `AIDocumentService`
3. Adicionar opção no `AIConfigModal`
4. Atualizar `callAI()` para incluir novo caso

### Troubleshooting

**Problema:** Erro 404 ao usar Ollama
- **Solução:** Verificar se URL está correta (`http://localhost:11434` sem `/api`)
- Verificar se Ollama está rodando

**Problema:** Sugestões de IA não aparecem
- **Solução:** Verificar se configuração de IA está salva
- Verificar se API Key está correta
- Verificar console para erros de API

**Problema:** Campos não são substituídos
- **Solução:** Verificar formato dos campos no template (`{{CAMPO}}`)
- Verificar se nomes dos campos coincidem exatamente

---

## 📚 Referências

- **Tipos TypeScript:** `src/types/generate.ts`
- **Hook Principal:** `src/hooks/useDocumentTemplates.ts`
- **Serviço de IA:** `src/services/aiService.ts`
- **Processador de Templates:** `src/utils/templateProcessor.ts`
- **Banco de Dados:** `src/database/database.ts`

---

**Última atualização:** Dezembro 2024