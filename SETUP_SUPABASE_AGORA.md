# 🚀 Setup Supabase - FAÇA AGORA (30 minutos)

**Objetivo:** Conectar o VOB Alaska ao banco de dados real

---

## ✅ PASSO 1: Criar Projeto Supabase (5 min)

### 1.1 Acessar Supabase
1. Abra: https://supabase.com
2. Clique em **"Start your project"**
3. Faça login (pode usar GitHub para ser mais rápido)

### 1.2 Criar Novo Projeto
1. No dashboard, clique em **"New Project"**
2. Preencha:
   ```
   Name: VOB Alaska
   Database Password: [ESCOLHA UMA SENHA FORTE E ANOTE!]
   Region: South America (São Paulo)
   Pricing Plan: Free
   ```
3. Clique em **"Create new project"**
4. ⏳ Aguarde ~2 minutos (vai aparecer um loading)

---

## ✅ PASSO 2: Executar Schema SQL (5 min)

### 2.1 Abrir SQL Editor
1. No menu lateral esquerdo, clique em **"SQL Editor"** (ícone de âncora)
2. Clique em **"New Query"**

### 2.2 Copiar e Executar Schema
1. Abra o arquivo: `supabase/schema.sql` (está no seu projeto)
2. **Copie TODO o conteúdo** (Cmd+A → Cmd+C)
3. **Cole no SQL Editor** do Supabase (Cmd+V)
4. Clique em **"Run"** (ou Cmd+Enter)
5. ✅ Aguarde aparecer: **"Success. No rows returned"**

### 2.3 Verificar Tabelas Criadas
1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver 7 tabelas:
   - ✅ clients
   - ✅ processes
   - ✅ movements
   - ✅ cases
   - ✅ documents
   - ✅ notifications
   - ✅ user_settings

---

## ✅ PASSO 3: Obter CredenciaisAPI (2 min)

### 3.1 Acessar Settings
1. No menu lateral, clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"API"**

### 3.2 Copiar Credenciais
Você vai precisar de 2 informações:

**1. Project URL:**
```
URL: https://xxxxxxxxxx.supabase.co
```
👆 Copie isso (está em "Project URL")

**2. Anon Key:**
```
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc...
```
👆 Copie isso (está em "Project API keys" → "anon public")

⚠️ **IMPORTANTE:** Mantenha essas informações abertas, você vai usar já já!

---

## ✅ PASSO 4: Configurar Storage para Fotos (3 min)

### 4.1 Criar Bucket
1. No menu lateral, clique em **"Storage"**
2. Clique em **"Create a new bucket"**
3. Preencha:
   ```
   Name: client-photos
   Public bucket: ✅ SIM (marque o checkbox)
   ```
4. Clique em **"Create bucket"**

### 4.2 Configurar Políticas de Acesso
1. Volte para **"SQL Editor"**
2. Clique em **"New Query"**
3. Cole este código:
   ```sql
   -- Permitir visualização pública de fotos
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'client-photos');
   
   -- Permitir upload apenas para usuários autenticados
   CREATE POLICY "Authenticated users can upload" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'client-photos' AND 
     auth.role() = 'authenticated'
   );
   ```
4. Clique em **"Run"**
5. ✅ Deve aparecer: "Success"

---

## ✅ PASSO 5: Configurar Arquivo .env (5 min)

### 5.1 Criar Arquivo .env
1. Abra o terminal na pasta do projeto
2. Execute:
   ```bash
   cp .env.example .env
   ```

### 5.2 Editar .env
1. Abra o arquivo `.env` que foi criado
2. Preencha com as credenciais que você copiou:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_DATAJUD_API_KEY=cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==
   ```

3. **Salve o arquivo** (Cmd+S)

### 5.3 Verificar .gitignore
1. Abra o arquivo `.gitignore`
2. Certifique-se que tem a linha:
   ```
   .env
   ```
3. Se não tiver, adicione e salve

---

## ✅ PASSO 6: Testar Conexão (2 min)

### 6.1 Reiniciar Servidor
No terminal onde o `npm run dev` está rodando:
1. Pressione **Ctrl+C** para parar
2. Digite:
   ```bash
   npm run dev
   ```
3. Aguarde o servidor reiniciar

### 6.2 Verificar Console
1. Abra o navegador: http://localhost:5173
2. Abra o console (F12 ou Cmd+Option+J)
3. Procure por mensagens de Supabase

**✅ SUCESSO se aparecer:**
```
✅ Supabase connected successfully
```

**❌ ERRO se aparecer:**
```
⚠️ Supabase credentials not found
```
→ Volte para o Passo 5 e verifique o .env

---

## ✅ PASSO 7: Testar CRUD Básico (5 min)

### 7.1 Abrir Console do Navegador
1. Com o site aberto (localhost:5173)
2. Abra o console (F12)
3. Cole este código:

```javascript
// Testar criação de cliente
const { data: client, error } = await window.supabase
  .from('clients')
  .insert({
    name: 'Cliente Teste',
    document: '12345678900',
    email: 'teste@example.com',
    phone: '11999999999',
    client_type: 'fisica',
    is_client: true
  })
  .select()
  .single();

console.log('Cliente criado:', client);
console.log('Erro:', error);
```

### 7.2 Verificar Resultado

**✅ SUCESSO:**
```javascript
Cliente criado: {
  id: "uuid-aqui",
  name: "Cliente Teste",
  ...
}
Erro: null
```

**✅ Verificar no Supabase:**
1. Volte para o Supabase
2. Vá em **"Table Editor"** → **"clients"**
3. Você deve ver o cliente "Cliente Teste" lá!

---

## 🎉 PRONTO!

Se todos os passos acima funcionaram, o Supabase está **100% configurado**!

---

## ❓ Problemas Comuns

### "Supabase credentials not found"
**Solução:**
1. Verifique se criou o arquivo `.env`
2. Verifique se as URLs estão corretas
3. Reinicie o servidor (`npm run dev`)

### "Failed to fetch"
**Solução:**
1. Verifique se o Supabase está online
2. Verifique a URL do projeto
3. Tente fazer logout e login no Supabase

### "Permission denied"
**Solução:**
1. Verifique se executou o schema.sql completamente
2. Verifique as políticas RLS no SQL Editor

---

## 📞 Próximo Passo

Depois que tudo funcionar, me avise com:
**"Supabase configurado!"**

E eu vou:
1. Integrar o GlobalDataContext com o banco real
2. Atualizar todos os módulos para usar dados reais
3. Testar CRUD em todos os módulos

**Tempo estimado:** ~30 minutos para você configurar
**Depois:** ~2 horas para eu integrar tudo

---

Pode começar! Qualquer dúvida, me chame! 🚀
