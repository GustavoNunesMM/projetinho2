# Guia de Uso do TableEditor

## Como usar o TableEditor

O `TableEditor` é um componente que permite editar tabelas dinâmicas em documentos Word. Para que ele funcione corretamente, o arquivo Word precisa seguir alguns padrões.

## Padrões Necessários no Arquivo Word

### 1. Tabelas Dinâmicas

Uma tabela é considerada dinâmica quando:
- Possui campos sequenciais (com índices numéricos) nas células
- Exemplo: `{{ATIVIDADE_1}}`, `{{ATIVIDADE_2}}`, `{{ATIVIDADE_3}}`

### 2. Estrutura da Tabela

A tabela deve ter:
- **Linhas de cabeçalho**: Primeiras linhas que não contêm campos `{{ }}`
- **Linhas de dados**: Linhas que contêm campos sequenciais

### 3. Formato dos Campos

Os campos na tabela devem seguir o padrão:
```
{{NOME_CAMPO_1}}
{{NOME_CAMPO_2}}
{{NOME_CAMPO_3}}
```

Onde:
- `NOME_CAMPO` é o nome do campo
- O número após o underscore (`_1`, `_2`, etc.) indica a sequência

### 4. Exemplo de Tabela no Word

```
┌─────────────────┬──────────────────┬──────────────┐
│ Atividade       │ Descrição        │ Data         │
├─────────────────┼──────────────────┼──────────────┤
│ {{ATIVIDADE_1}} │ {{DESC_1}}       │ {{DATA_1}}   │
│ {{ATIVIDADE_2}} │ {{DESC_2}}       │ {{DATA_2}}   │
│ {{ATIVIDADE_3}} │ {{DESC_3}}       │ {{DATA_3}}   │
└─────────────────┴──────────────────┴──────────────┘
```

### 5. Detecção Automática

Quando você faz upload de um template Word:
1. O sistema analisa o arquivo
2. Detecta tabelas com campos sequenciais
3. Marca essas tabelas como `isDynamic: true`
4. Extrai o mapeamento de colunas para campos

## Como o TableEditor Funciona

### Adicionar Linha
- Clica no botão "Adicionar Linha"
- O sistema adiciona novos índices aos campos sequenciais
- Exemplo: Se você tem `ATIVIDADE_1`, `ATIVIDADE_2`, `ATIVIDADE_3`, ao adicionar uma linha, cria `ATIVIDADE_4`

### Remover Linha
- Clica no ícone de lixeira na linha desejada
- O sistema remove o índice correspondente dos campos sequenciais

### Editar Valores
- Os valores são editados diretamente na tabela
- Cada célula corresponde a um campo sequencial

## Requisitos Técnicos

Para que o TableEditor funcione, o template precisa ter:

1. **Estrutura de Tabela no Banco de Dados**:
   ```typescript
   structure: [
     {
       tableIndex: 0,
       rows: 4,
       columns: 3,
       headerRows: 1,
       isDynamic: true,
       columnMapping: [
         { fieldName: "ATIVIDADE", isSequential: true },
         { fieldName: "DESC", isSequential: true },
         { fieldName: "DATA", isSequential: true }
       ]
     }
   ]
   ```

2. **Campos Sequenciais no Template**:
   ```typescript
   fields: [
     {
       name: "ATIVIDADE",
       sequentialIndices: [1, 2, 3]
     },
     {
       name: "DESC",
       sequentialIndices: [1, 2, 3]
     },
     {
       name: "DATA",
       sequentialIndices: [1, 2, 3]
     }
   ]
   ```

## Limitações

- Apenas tabelas com `isDynamic: true` podem ser editadas
- Campos sequenciais devem seguir o padrão `{{CAMPO_N}}`
- A primeira linha de dados é usada como template para novas linhas

## Dicas

1. **Nomeie os campos claramente**: Use nomes descritivos como `ATIVIDADE`, `DESCRICAO`, `DATA`
2. **Mantenha consistência**: Todos os campos na mesma linha devem ter o mesmo índice
3. **Use cabeçalhos**: A primeira linha deve ser o cabeçalho da tabela (sem campos `{{ }}`)
