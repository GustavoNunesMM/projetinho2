# Troubleshooting - Sistema de Update

## Problemas Corrigidos

### 1. Duplicação do Plugin Updater
**Problema**: O plugin `tauri-plugin-updater` estava declarado duas vezes em `Cargo.toml`.
**Solução**: Removida a declaração duplicada na seção `[target.'cfg(not(any(target_os = "android", target_os = "ios")))'.dependencies]`.

### 2. Arquivo main.rs Duplicado
**Problema**: Havia código duplicado entre `lib.rs` e `main.rs`.
**Solução**: Simplificado `main.rs` para apenas chamar `bancodequestoes_lib::run()`.

### 3. Configuração do Updater
**Problema**: Faltava a flag `active: true` na configuração do updater.
**Solução**: Adicionado `"active": true` em `tauri.conf.json`.

## Como Testar o Sistema de Update

### 1. Verificar Logs
Após iniciar o aplicativo, aguarde 5 segundos e verifique os logs em:
- Windows: `%APPDATA%\bancodequestoes\logs\app.log`
- macOS: `~/Library/Application Support/bancodequestoes/logs/app.log`
- Linux: `~/.local/share/bancodequestoes/logs/app.log`

Procure por:
- `"Nova atualização disponível"` - se houver update
- `"Aplicação está atualizada"` - se não houver update
- `"Erro ao verificar atualizações"` - se houver erro

### 2. Criar uma Release para Teste

1. **Aumentar a versão** em:
   - `src-tauri/tauri.conf.json` → `"version": "1.4.0"`
   - `src-tauri/Cargo.toml` → `version = "1.4.0"`
   - `package.json` → `"version": "1.4.0"`

2. **Criar e fazer push da tag**:
```bash
git add .
git commit -m "Bump version to 1.4.0"
git tag v1.4.0
git push origin main
git push origin v1.4.0
```

3. **Aguardar o GitHub Actions**:
   - Vá em Actions no GitHub
   - Aguarde o workflow "Release" concluir
   - Verifique se os artifacts foram gerados (`.msi`, `.msi.zip`, `.msi.zip.sig`)

4. **Verificar o arquivo latest.json**:
   - Acesse: `https://github.com/GustavoNunesMM/projetinho2/releases/latest/download/latest.json`
   - Deve conter informações sobre a versão mais recente

### 3. Testar o Update no Aplicativo

1. **Instale a versão antiga** (ex: 1.3.0)
2. **Abra o aplicativo**
3. **Aguarde 5 segundos** (tempo de espera configurado)
4. **Verifique se a notificação aparece** no canto inferior direito
5. **Clique em "Atualizar"**
6. **Aguarde o download** (acompanhe a barra de progresso)
7. **Aguarde a instalação** (o app será fechado e reaberto)
8. **Verifique a nova versão** em Ajuda > Sobre (se houver)

## Estrutura Esperada no Release

Quando o GitHub Actions cria uma release, deve gerar:

```
projetinho2-1.4.0-setup.msi          # Instalador Windows
projetinho2-1.4.0-setup.msi.zip      # Instalador compactado
projetinho2-1.4.0-setup.msi.zip.sig  # Assinatura para verificação
latest.json                           # Manifesto de atualização
```

### Exemplo de latest.json:
```json
{
  "version": "1.4.0",
  "date": "2024-01-20T10:30:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUldRd2VqNlBz...",
      "url": "https://github.com/GustavoNunesMM/projetinho2/releases/download/v1.4.0/projetinho2-1.4.0-setup.msi.zip"
    }
  }
}
```

## Problemas Comuns

### Update não aparece
**Possíveis causas**:
1. GitHub Release não foi criada corretamente
2. Arquivo `latest.json` não existe ou está inacessível
3. Versão atual >= versão do release
4. Secrets do GitHub não configuradas

**Solução**: Verificar logs em `app.log`

### Erro "Failed to check for updates"
**Possíveis causas**:
1. Endpoint incorreto em `tauri.conf.json`
2. Arquivo `latest.json` com formato inválido
3. Problemas de rede/firewall

**Solução**: Verificar se `latest.json` é acessível no navegador

### Erro "Signature verification failed"
**Possíveis causas**:
1. Chave pública em `tauri.conf.json` não corresponde à privada usada no GitHub
2. Arquivo foi modificado após assinatura

**Solução**: Gerar novo par de chaves e atualizar secrets

### Download não inicia
**Possíveis causas**:
1. URL do download incorreta
2. Arquivo muito grande e timeout
3. Problemas de permissão

**Solução**: Verificar logs e tentar download manual da URL

## Configurações Importantes

### tauri.conf.json
```json
{
  "plugins": {
    "updater": {
      "active": true,
      "pubkey": "sua-chave-publica-aqui",
      "endpoints": [
        "https://github.com/SEU-USUARIO/SEU-REPO/releases/latest/download/latest.json"
      ],
      "windows": {
        "installMode": "passive"
      }
    }
  }
}
```

### GitHub Secrets
Certifique-se de que estão configurados:
- `TAURI_SIGNING_PRIVATE_KEY` - conteúdo de `~/myapp.key`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` - senha da chave

## Comandos Úteis

### Verificar versão atual
```bash
tauri info
```

### Gerar novo par de chaves
```bash
tauri signer generate -w ~/.tauri/myapp.key
```

### Testar build localmente
```bash
pnpm tauri build
```

### Ver logs do Tauri
```bash
# Windows
type %APPDATA%\bancodequestoes\logs\app.log

# macOS/Linux
cat ~/Library/Application\ Support/bancodequestoes/logs/app.log
```

## Referências

- [Tauri Updater Plugin](https://v2.tauri.app/plugin/updater/)
- [GitHub Actions Tauri Action](https://github.com/tauri-apps/tauri-action)
- [Code Signing](https://v2.tauri.app/distribute/sign/)
