# 🤖 Prompts de Teste para IA Assistente

**Objetivo**: Prompts prontos para delegar testes técnicos a outra IA  
**Uso**: Copie e cole o prompt desejado quando precisar testar  
**Data**: 2025-11-30

---

## 📋 ÍNDICE DE TESTES

1. [A1 Certificate - Teste Completo](#test-1-a1-certificate)
2. [Jus.br OAuth - Debug](#test-2-jusbr-oauth)
3. [Service Modal - Verificação](#test-3-service-modal)
4. [Client Portal - End-to-End](#test-4-client-portal)
5. [Database RLS - Segurança](#test-5-database-rls)
6. [Temas Caju/Manga - Validação](#test-6-themes-validation)

---

## TEST 1: A1 Certificate

```
# PROMPT PARA IA ASSISTENTE

Preciso que você teste a integração do Certificado Digital A1 no sistema VOB Alaska.

## CONTEXTO:
- Sistema: VOB Alaska (React + TypeScript + Supabase)
- Localização: /Users/fred/Library/CloudStorage/OneDrive-Pessoal/Virtual Office Brazil - VOB (Versão Alaska)
- Servidor rodando: npm run dev (http://localhost:5173)

## ARQUIVOS RELEVANTES:
- `src/services/certificate.service.ts`
- `src/services/certificateStorage.service.ts`
- `src/components/CertificateUploadModal.tsx`
- `src/components/CertificateCard.tsx`
- `docs/A1_CERTIFICATE_TESTING.md` (checklist completo)

## TAREFA:
Execute o checklist manual de testes conforme documentado em `A1_CERTIFICATE_TESTING.md`.

## PASSOS ESPECÍFICOS:

### 1. TESTE DE UPLOAD:
- Navegue até Settings → Certificados Digitais
- Tente fazer upload de um arquivo .pfx de teste
- Verifique se a validação rejeita arquivos .pdf/.docx
- Teste drag-and-drop
- **Se não tiver certificado real, use um mock ou simulate o comportamento**

### 2. TESTE DE ARMAZENAMENTO:
- Abra o Supabase Dashboard
- Execute esta query SQL:
```sql
SELECT 
    id,
    LENGTH(encrypted_data) as encrypted_length,
    LENGTH(iv) as iv_length,
    LENGTH(auth_tag) as auth_tag_length,
    created_at
FROM certificates
WHERE user_id = auth.uid()
LIMIT 1;
```
- Verifique se encrypted_data, iv e auth_tag não são nulos

### 3. TESTE DE UI:
- Verifique se certificado aparece no CertificateCard
- Valide exibição de dados (nome, CPF, validade)
- Teste botão de remoção

### 4. RELATÓRIO:
Documente:
- ✅ Testes que passaram
- ❌ Testes que falharam (com print screens)
- ⚠️ Bugs encontrados
- 📝 Observações

## OUTPUT ESPERADO:
Um relatório em markdown com:
- Sumário executivo
- Detalhes de cada teste
- Screenshots de erros (se houver)
- Recomendações de correção
```

---

## TEST 2: Jus.br OAuth

```
# PROMPT PARA IA ASSISTENTE

Debug e teste da integração OAuth Jus.br no VOB Alaska.

## CONTEXTO:
Sistema tem bug conhecido: "Invalid OAuth Parameters" em alguns casos.

## ARQUIVOS RELEVANTES:
- `src/services/jusbr-oauth.service.ts`
- `src/pages/JusBrCallback.tsx`
- `src/components/JusBrCard.tsx`
- `DEPLOYMENT_JUSBR.md`

## TAREFA:
1. Analisar o fluxo OAuth PKCE implementado
2. Identificar possíveis causas do erro "Invalid OAuth Parameters"
3. Testar o callback route

## PASSOS ESPECÍFICOS:

### 1. ANÁLISE ESTÁTICA:
- Revise `jusbr-oauth.service.ts`:
  - Verifique geração de code_verifier (random 128 chars)
  - Verifique geração de code_challenge (SHA-256 base64url)
  - Valide redirect_uri configuration
  - Confirme state parameter generation

### 2. TESTE DE CALLBACK:
- Navegue até Settings → Integrações → Jus.br
- Clique em "Conectar Jus.br"
- Observe o redirect para CNJ
- **Simule um callback** ou analise o que acontece no retorno

### 3. VERIFICAÇÃO DE LOGS:
- Abra DevTools Console
- Procure por erros relacionados a OAuth
- Capture qualquer stack trace

### 4. VALIDAÇÃO DE URLs:
- Verifique se redirect_uri está correto:
  - Deve ser: `http://localhost:5173/auth/jusbr/callback` (dev)
  - Ou: `https://SEU_DOMINIO/auth/jusbr/callback` (prod)
- Confirme que rota está registrada em App.tsx

## DEBUG QUERIES:
Execute no console do browser:
```javascript
// Verificar localStorage
console.log('OAuth State:', localStorage.getItem('oauth_state'));
console.log('Code Verifier:', localStorage.getItem('code_verifier'));
```

## OUTPUT ESPERADO:
Relatório com:
- Causa raiz do erro
- Linha de código problemática
- Solução proposta (código)
- Testes de validação
```

---

## TEST 3: Service Modal

```
# PROMPT PARA IA ASSISTENTE

Verificar por que o Service Modal (atendimento) não está funcionando corretamente.

## CONTEXTO:
Usuário reportou que botão "Atendimento" não abre modal ou não funciona completamente.

## ARQUIVOS RELEVANTES:
- `src/components/GlobalModals.tsx`
- `src/components/ServiceFormModal.tsx`
- `src/components/Header.tsx` (botão "Atendimento")
- `src/pages/Services.tsx`
- `src/context/ModalContext.tsx`

## TAREFA:
Diagnosticar e corrigir problema do Service Modal.

## PASSOS:

### 1. VERIFICAR REGISTRO:
- Abra `GlobalModals.tsx`
- Confirme que ServiceFormModal está registrado:
```tsx
{isServiceModalOpen && (
    <ServiceFormModal
        isOpen={isServiceModalOpen}
        onClose={() => closeModal('service')}
        // ...
    />
)}
```

### 2. VERIFICAR CONTEXT:
- Abra `ModalContext.tsx`
- Confirme que 'service' está no tipo ModalType
- Verifique se openModal('service') está funcionando

### 3. TESTE MANUAL:
- Navegue até http://localhost:5173
- Clique no botão "+" no header
- Clique em "Atendimento"
- **Documente o que acontece**:
  - Modal abre?
  - Há erros no console?
  - Formulário aparece?

### 4. TESTE DE SALVAMENTO:
Se modal abrir:
- Preencha formulário
- Clique em "Salvar"
- Verifique se salva no Supabase

## OUTPUT ESPERADO:
- Diagnóstico do problema
- Código da correção (se aplicável)
- Confirmação de que modal funciona end-to-end
```

---

## TEST 4: Client Portal

```
# PROMPT PARA IA ASSISTENTE

Teste end-to-end completo do Client Portal.

## CONTEXTO:
Client Portal foi implementado em 5 fases. Preciso validar todo o fluxo.

## ARQUIVOS RELEVANTES:
- `src/pages/PortalLogin.tsx`
- `src/pages/PortalDashboard.tsx`
- `src/pages/PortalDocuments.tsx`
- `src/pages/PortalMessages.tsx`
- `src/services/clientPortal.service.ts`
- `src/services/portalData.service.ts`

## TAREFA:
Testar fluxo completo de:
1. Admin ativa cliente
2. Cliente faz login
3. Cliente navega pelo portal
4. Cliente acessa documentos
5. Cliente envia mensagem

## PASSOS DETALHADOS:

### 1. ATIVAÇÃO (Admin):
- Login como admin
- Ir em Clientes
- Abrir perfil de um cliente
- Clicar em "Habilitar Acesso ao Portal"
- Gerar credenciais
- **Copiar CPF e senha temporária**

### 2. LOGIN (Cliente):
- Abrir nova aba anônima
- Navegar para http://localhost:5173/portal/login
- Login com CPF (sem formatação)
- Usar senha temporária
- **Deve pedir troca de senha obrigatória**
- Trocar senha

### 3. DASHBOARD:
- Verificar se processos aparecem
- Verificar estatísticas
- Clicar em "Documentos"

### 4. DOCUMENTOS:
- Listar documentos
- Tentar download (se houver)
- Voltar ao dashboard

### 5. MENSAGENS:
- Clicar em "Mensagens"
- Testar Inbox
- Testar "Compose"
- Enviar mensagem ao escritório
- Verificar se salva

### 6. SEGURANÇA:
- Tentar acessar processos de outro cliente (deve bloquear)
- Verificar RLS no Supabase

## OUTPUT ESPERADO:
Relatório completo com:
- Screenshots de cada etapa
- Problemas encontrados
- Performance (tempo de carregamento)
- Sugestões de UX
```

---

## TEST 5: Database RLS

```
# PROMPT PARA IA ASSISTENTE

Auditar Row Level Security (RLS) no Supabase.

## CONTEXTO:
Sistema usa RLS para isolar dados por cliente/usuário. Preciso validar segurança.

## ACESSO:
- Supabase Dashboard: [URL_DO_SUPABASE]
- SQL Editor

## TAREFA:
Validar políticas RLS em todas as tabelas críticas.

## QUERIES DE TESTE:

### 1. Verificar RLS Ativo:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'clients', 'processes', 'certificates',
    'client_portal_access', 'client_messages',
    'process_parties'
);
```
**Esperado**: rowsecurity = true para todas

### 2. Listar Políticas:
```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
**Documente** todas as políticas

### 3. Teste de Isolamento (clients):
```sql
-- Como user_id X, tentar acessar dados de user_id Y
SET LOCAL role authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-id-1"}';

SELECT * FROM clients WHERE user_id != 'user-id-1';
```
**Esperado**: Query retorna vazio

### 4. Teste Portal Access:
```sql
-- Cliente só vê próprio acesso
SELECT * FROM client_portal_access
WHERE client_id = 'client-id-diferente';
```
**Esperado**: Vazio ou erro de permissão

### 5. Teste Certificados:
```sql
-- Usuario só vê próprios certificados
SELECT * FROM certificates
WHERE user_id != auth.uid();
```
**Esperado**: Vazio

## OUTPUT ESPERADO:
- Tabela com status RLS de cada tabela
- Lista de todas as políticas
- Resultados dos testes de isolamento
- ⚠️ Vulnerabilidades encontradas (se houver)
```

---

## TEST 6: Themes Validation

```
# PROMPT PARA IA ASSISTENTE

Validar implementação dos temas Caju e Manga.

## CONTEXTO:
Foram implementados 2 novos temas de sistema (não dock styles):
- Caju (Apple-inspired)
- Manga (Android Material)

## ARQUIVOS RELEVANTES:
- `src/types/index.ts` (Theme type)
- `src/context/GlobalDataContext.tsx` (applyTheme)
- `src/index.css` (CSS variables)
- `src/components/settings/SettingsPreferences.tsx`

## TAREFA:
Verificar se temas aplicam corretamente em TODO o sistema.

## CHECKLIST:

### 1. VERIFICAR TIPO:
```typescript
// Em types/index.ts deve ter:
export type Theme = 'light' | 'dark' | 'system' | 'caju' | 'manga';
```

### 2. VERIFICAR CSS VARIABLES:
- Abrir `index.css`
- Procurar por `.theme-caju` e `.theme-manga`
- Confirmar variáveis:
  - --accent-primary
  - --accent-secondary
  - --bg-primary, --bg-secondary
  - --text-primary, --text-secondary

### 3. TESTE VISUAL:
- Navegar para Settings → Aparência
- Selecionar tema "Caju"
- **Verificar**:
  - Cores mudaram?
  - Ícones mudaram?
  - Botões têm novo estilo?
  - Cards têm novo visual?

- Selecionar tema "Manga"
- **Verificar o mesmo**

### 4. TESTE DE PERSISTÊNCIA:
- Selecionar tema Caju
- Dar refresh (F5)
- Confirmar que tema permanece

### 5. COMPONENTES A TESTAR:
- Dashboard (cards, gráficos)
- Tabelas (clients, processes)
- Modais (qualquer modal)
- Buttons (primary, secondary)
- Inputs (forms)

## OUTPUT ESPERADO:
- Screenshots dos temas aplicados
- Lista de componentes afetados
- Problemas visuais encontrados
- Recomendações de ajustes
```

---

## 📝 COMO USAR ESTES PROMPTS

### **Passo 1**: Copiar o prompt
Copie o bloco de código completo do teste que deseja executar.

### **Passo 2**: Colar na IA Assistente
Cole o prompt em uma IA que tenha acesso ao código (ex: GitHub Copilot, Cursor, etc.).

### **Passo 3**: Executar
A IA irá executar os testes conforme especificado.

### **Passo 4**: Revisar Output
Analise o relatório gerado pela IA e tome ações necessárias.

---

## 🎯 PRIORIDADE DE TESTES

**URGENTE** (fazer agora):
1. TEST 3: Service Modal
2. TEST 6: Themes Validation

**IMPORTANTE** (fazer esta semana):
3. TEST 1: A1 Certificate
4. TEST 4: Client Portal

**SEGURANÇA** (fazer antes de produção):
5. TEST 5: Database RLS

**DEBUG** (se tiver problemas):
6. TEST 2: Jus.br OAuth

---

## 💡 DICAS

1. **Screenshots**: Peça à IA para capturar screenshots dos erros
2. **Logs**: Peça para incluir console logs completos
3. **Código**: Peça soluções em código, não apenas descrição
4. **Reprodução**: Peça passos exatos para reproduzir problemas

---

**Estes prompts estão prontos para uso!** 🚀  
**Copie, cole e teste!**
