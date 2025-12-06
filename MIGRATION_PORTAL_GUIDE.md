# Client Portal - Migration Execution Guide

## ⚠️ Supabase CLI não disponível

O comando `supabase db push` falhou porque o Supabase CLI não está instalado localmente.

**Solução**: Execute a migration manualmente via **Supabase Dashboard** (interface web).

---

## 📋 **Passo a Passo: Executar Migration via Dashboard**

### **1. Acesse o Supabase Dashboard**
1. Abra: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto **VOB Alaska**

### **2. Navegue para SQL Editor**
1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** (+ New query)

### **3. Cole a Migration**
1. Abra o arquivo: `supabase/migrations/008_create_client_portal.sql`
2. **COPIE TODO O CONTEÚDO** do arquivo
3. **COLE** no SQL Editor do Supabase

### **4. Execute a Migration**
1. Clique no botão **"Run"** (ou pressione Ctrl/Cmd + Enter)
2. Aguarde a execução (pode levar 5-10 segundos)
3. Verifique se aparece **"Success. No rows returned"**

### **5. Verifique as Tabelas Criadas**
1. No menu lateral, vá em **"Table Editor"**
2. Você deverá ver 3 novas tabelas:
   - ✅ `client_portal_access`
   - ✅ `client_messages`
   - ✅ `client_notifications`

---

## ✅ **Checklist de Verificação**

Após executar, verifique:

- [ ] Tabela `client_portal_access` existe
- [ ] Tabela `client_messages` existe
- [ ] Tabela `client_notifications` existe
- [ ] Indexes foram criados (verifique na aba "Indexes" de cada tabela)
- [ ] RLS está habilitado (coluna "RLS enabled" = ON)
- [ ] Policies foram criadas (aba "Policies" de cada tabela)

---

## 🔍 **Comandos SQL para Verificação**

Se quiser confirmar que tudo está OK, execute estes comandos no SQL Editor:

```sql
-- Verificar se tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'client_%'
ORDER BY table_name;

-- Verificar RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'client_%';

-- Contar policies criadas
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename LIKE 'client_%'
GROUP BY schemaname, tablename;

-- Verificar helper functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('generate_activation_code', 'can_client_login');
```

**Resultado esperado:**
- 3 tabelas (client_portal_access, client_messages, client_notifications)
- RLS = true para todas
- ~10 policies total
- 2 helper functions

---

## 🚨 **Se Houver Erros**

### **Erro: "relation already exists"**
- **Causa**: Tabela já existe
- **Solução**: Pode continuar normalmente, ou DROP e recriar:
  ```sql
  DROP TABLE IF EXISTS client_portal_access CASCADE;
  DROP TABLE IF EXISTS client_messages CASCADE;
  DROP TABLE IF EXISTS client_notifications CASCADE;
  -- Depois execute a migration novamente
  ```

### **Erro: "permission denied"**
- **Causa**: Usuário sem permissão
- **Solução**: Certifique-se de estar logado como admin do projeto

### **Erro: "syntax error"**
- **Causa**: Cópia incompleta do SQL
- **Solução**: Copie TODO o arquivo novamente, incluindo comentários

---

## ⏭️ **Próximos Passos**

Após executar a migration com sucesso:

1. ✅ Tabelas criadas
2. ✅ RLS configurado
3. ➡️ Continuar com implementação do frontend
4. ➡️ Testar ativação de portal
5. ➡️ Testar login de cliente

---

## 📞 **Suporte**

Se precisar de ajuda:
- Documentação Supabase: https://supabase.com/docs/guides/database
- SQL Editor: https://supabase.com/docs/guides/database/sql-editor

---

**Arquivo de Migration**: `/supabase/migrations/008_create_client_portal.sql`

**Quando estiver pronto**, me avise e continuamos com a implementação! 🚀
