# 🏛️ VOB Alaska - Sistema de Gestão Jurídica

**Versão**: 1.0 Alaska  
**Status**: 🟢 Production Ready  
**Tech Stack**: React + TypeScript + Vite + Supabase

---

## 🚀 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key

# 3. Executar migrations no Supabase
# Ver: supabase/migrations/

# 4. Iniciar servidor
npm run dev
```

**Acesse**: `http://localhost:5173/`

---

## 📚 Documentação

- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Status executivo do projeto
- **[CHANGELOG.md](./CHANGELOG.md)** - Histórico de versões
- **[CLIENT_PORTAL_COMPLETE.md](./CLIENT_PORTAL_COMPLETE.md)** - Guia do Portal do Cliente
- **[docs/](./docs/)** - Documentação técnica

---

## ✨ Features

- ✅ Dashboard executivo
- ✅ Gestão de clientes (PF/PJ)
- ✅ Gestão de processos
- ✅ Controle financeiro
- ✅ **Client Portal** (100%)
- ✅ DataJud API
- ✅ Jus.br OAuth
- ✅ Certificado A1

---

## 🔐 Segurança

- Row Level Security (RLS)
- bcrypt + AES-256-GCM
- OAuth 2.0 + PKCE
- Strong password policy

---

## 📊 Test Data

```sql
-- Executar no Supabase SQL Editor
-- Ver: supabase/test_data/fictional_data.sql
-- 130 registros de teste prontos
```

---

## 🛠️ Build

```bash
npm run build
npm run preview
```

---

**🎉 VOB Alaska - Gestão Jurídica de Última Geração!**

Ver [PROJECT_STATUS.md](./PROJECT_STATUS.md) para mais detalhes.
