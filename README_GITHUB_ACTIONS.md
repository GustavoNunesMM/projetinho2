# Configuração do GitHub Actions para Auto-Update

## Secrets Necessários

Para que o sistema de auto-update funcione corretamente, você precisa configurar os seguintes secrets no seu repositório GitHub:

### 1. TAURI_SIGNING_PRIVATE_KEY

Esta é a chave privada usada para assinar os updates. Você já tem a chave pública configurada em `src-tauri/tauri.conf.json`.

**Para configurar:**
1. Vá em Settings > Secrets and variables > Actions no seu repositório GitHub
2. Clique em "New repository secret"
3. Nome: `TAURI_SIGNING_PRIVATE_KEY`
4. Valor: Cole o conteúdo completo do arquivo `~/myapp.key` (a chave privada que foi gerada)

### 2. TAURI_SIGNING_PRIVATE_KEY_PASSWORD

Esta é a senha da chave privada.

**Para configurar:**
1. No mesmo local de secrets
2. Clique em "New repository secret"
3. Nome: `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
4. Valor: A senha que você usou ao gerar a chave

### 3. GITHUB_TOKEN

Este secret já é fornecido automaticamente pelo GitHub Actions, não precisa configurar.

## Como Verificar se Está Funcionando

1. As secrets devem aparecer em Settings > Secrets and variables > Actions
2. Quando você criar uma release ou push uma tag `v*`, o workflow `.github/workflows/release.yml` será executado
3. O workflow compilará o app e criará os artifacts assinados para update automático

## Notas Importantes

- **NUNCA** commite a chave privada (`~/myapp.key`) no repositório
- As secrets configuradas no GitHub são criptografadas e seguras
- A chave pública em `tauri.conf.json` pode (e deve) ser commitada
- Se você perder a chave privada, precisará gerar um novo par de chaves e atualizar todos os usuários

## Localização das Chaves

As chaves foram geradas e estão em:
- Chave privada: `~/myapp.key`
- Chave pública: `~/myapp.key.pub` (já está no `tauri.conf.json`)

## Gerando Novas Chaves (se necessário)

Se você precisar gerar um novo par de chaves:

```bash
# No diretório do projeto
tauri signer generate -w ~/.tauri/myapp.key
```

Depois copie a chave pública para o `tauri.conf.json` e configure as secrets novamente no GitHub.
