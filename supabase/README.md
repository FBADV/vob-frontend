# Configuração do Supabase para VOB Alaska

## 🚀 Setup Inicial

### 1. Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma conta (pode usar GitHub)

### 2. Criar Novo Projeto

1. No dashboard, clique em "New Project"
2. Preencha:
   - **Name**: VOB Alaska
   - **Database Password**: Escolha uma senha forte (anote!)
   - **Region**: South America (São Paulo) - mais próximo do Brasil
   - **Pricing Plan**: Free (suficiente para começar)
3. Aguarde ~2 minutos para o projeto ser criado

### 3. Executar o Schema SQL

1. No menu lateral, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `supabase/schema.sql`
4. Cole no editor
5. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
6. Aguarde confirmação: "Success. No rows returned"

### 4. Obter as Credenciais

1. No menu lateral, vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL** (exemplo: `https://xxxxxxxxxxx.supabase.co`)
   - **anon/public** key (começa com `eyJ...`)

### 5. Configurar Variáveis de Ambiente

1. Na raiz do projeto, crie o arquivo `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o `.env` e preencha:
   ```env
   VITE_SUPABASE_URL=https://seuprojetoid.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_DATAJUD_API_KEY=cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==
   VITE_DATAJUD_BASE_URL=https://api-publica.datajud.cnj.jus.br
   ```

3. **IMPORTANTE**: Adicione `.env` ao `.gitignore`:
   ```bash
   echo ".env" >> .gitignore
   ```

### 6. Configurar Autenticação (Opcional)

Por padrão, o sistema usa autenticação simples. Para produção:

1. Em **Authentication** → **Providers**
2. Habilite:
   - Email (já vem habilitado)
   - Google (opcional)
   - GitHub (opcional)

3. Configure **Email Templates** em **Authentication** → **Email Templates**

### 7. Configurar Storage para Fotos

1. Vá em **Storage**
2. Crie um bucket chamado `client-photos`:
   - Nome: `client-photos`
   - Public: ✅ Sim (para fotos serem acessíveis)
3. Configure políticas de acesso:
   ```sql
   -- No SQL Editor, execute:
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'client-photos');
   
   CREATE POLICY "Authenticated users can upload" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'client-photos' AND 
     auth.role() = 'authenticated'
   );
   ```

### 8. Testar a Conexão

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Abra o console do navegador (F12)
3. Deve aparecer: "✅ Supabase connected successfully"
4. Se aparecer warning de credenciais, verifique o `.env`

## 📊 Estrutura do Banco

O schema cria as seguintes tabelas:

- **clients**: Cadastro de clientes
- **processes**: Processos judiciais
- **movements**: Movimentações processuais
- **cases**: Atendimentos e casos
- **documents**: Documentos anexados
- **notifications**: Notificações
- **user_settings**: Preferências do usuário

## 🔐 Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. Políticas padrão:
- Usuários autenticados podem acessar todos os dados
- Cada usuário só vê suas próprias notificações e configurações

### Para Multi-Tenant (Múltiplos Escritórios)

Se no futuro precisar isolar dados por escritório:

```sql
-- Adicionar coluna de tenant_id em todas as tabelas
ALTER TABLE clients ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Atualizar políticas RLS
CREATE POLICY "Users see only their tenant data" ON clients
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );
```

## 🛠️ Ferramentas Úteis

### Supabase CLI (Opcional)

Para gerenciar o projeto via linha de comando:

```bash
# Instalar CLI
npm install -g supabase

# Fazer login
supabase login

# Linkar projeto
supabase link --project-ref seu-projeto-id

# Gerar tipos TypeScript automaticamente
supabase gen types typescript --local > src/types/database.types.ts
```

### Extension Recomendadas

No Supabase, habilite:
- **uuid-ossp**: Para gerar UUIDs (já habilitado no schema)
- **pg_trgm**: Para buscas fuzzy (opcional)

## 📈 Monitoramento

### Verificar Uso

1. **Database** → **Usage**
   - Armazenamento usado
   - Queries por dia
   - Conexões ativas

2. **Configurar Alertas**:
   - Settings → Alerts
   - Configure email quando atingir 80% do limite

## 🔄 Backup Automático

O Supabase faz backup automático diário. Para produção:

1. **Settings** → **Database**
2. Configure **Point-in-Time Recovery** (PITR)
3. Retenção recomendada: 7 dias

## ❓ Troubleshooting

### Erro"tenant": "None"
- O projeto wasn't linked correctly
- Re-execute o schema.sql

### Erro de CORS
- Adicione seu domínio em **Settings** → **API** → **URL Configuration**

### Queries Lentas
- Verifique os indexes em **Database** → **Indexes**
- Analise queries em **Logs** → **Query Performance**

### Limite de Conexões
- Free tier: 60 conexões simultâneas
- Se atingir o limite, considere connection pooling

## 📞 Suporte

- [Documentação Oficial](https://supabase.com/docs)
- [Discord da Comunidade](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**Próximo Passo**: Após configurar o Supabase, volte para o desenvolvimento e teste a integração!
