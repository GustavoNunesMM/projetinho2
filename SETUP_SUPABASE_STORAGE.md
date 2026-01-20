# Configuração do Supabase Storage para Testes

## Criar o Bucket "tests"

Para que os arquivos de testes sejam salvos corretamente no Supabase, você precisa criar um bucket no Supabase Storage:

1. Acesse o Supabase Dashboard: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Storage** no menu lateral
4. Clique em **New bucket**
5. Configure:
   - **Name**: `tests`
   - **Public bucket**: ✅ Marque como público (para permitir acesso aos arquivos)
   - **File size limit**: Configure conforme necessário (ex: 50MB)
   - **Allowed MIME types**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document` ou deixe vazio para aceitar todos

## Configurar Políticas de Segurança (RLS)

Após criar o bucket, configure as políticas de segurança:

1. Vá em **Storage** > **Policies** > **tests**
2. Crie as seguintes políticas:

### Política de SELECT (Visualizar)
```sql
CREATE POLICY "Users can view their own test files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'tests' 
);
```

### Política de INSERT (Upload)
```sql
CREATE POLICY "Users can upload their own test files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tests' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Política de DELETE (Deletar)
```sql
CREATE POLICY "Users can delete their own test files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tests' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Verificar Configuração

Após configurar, teste fazendo upload de um teste. O arquivo deve ser salvo em:
- Caminho: `{user_id}/{timestamp}_{filename}.docx`
- URL pública: Disponível via `getPublicUrl()`

## Troubleshooting

### Erro: "Bucket not found"
- Verifique se o bucket `tests` foi criado
- Verifique se o nome está exatamente como `tests` (case-sensitive)

### Erro: "new row violates row-level security policy"
- Verifique se as políticas RLS foram criadas corretamente
- Verifique se o usuário está autenticado

### Arquivos não aparecem
- Verifique se o bucket está marcado como público
- Verifique as políticas de acesso
