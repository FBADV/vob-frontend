# 📋 Changelog - VOB Alaska

**Última atualização**: 2025-11-30

---

## [1.0.0] - 2025-11-30

### ✨ Novas Features

#### **Client Portal - Fase 5 Completa** 🎉
- ✅ **PortalDocuments.tsx** - Visualização de documentos dos processos
- ✅ **PortalMessages.tsx** - Sistema de mensagens (inbox/sent/compose)
- ✅ **portalData.service.ts** - Métodos para documents & messages
- ✅ **Quick Navigation** - Botões rápidos no dashboard
- ✅ **Routes** - `/portal/documents` e `/portal/messages`

**Total Client Portal**: 100% completo (todas as 5 fases)

#### **Test Data System** 📊
- ✅ Script SQL com 130 registros fictícios
- ✅ 20 clientes (10 PF + 10 PJ)
- ✅ 70 registros financeiros
- ✅ 40 atendimentos/CRM
- ✅ Fácil remoção via script

#### **A1 Certificate - Documentation** 🔐
- ✅ Manual testing checklist (60+ tests)
- ✅ User guide completo
- ✅ Troubleshooting guide
- ✅ Security audit checklist

---

## [0.9.5] - 2025-11-29

### ✨ Features

#### **Client Portal - Fases 1-4**
- ✅ Database schema com RLS
- ✅ Authentication service (bcrypt)
- ✅ Admin activation UI
- ✅ Client login com password strength
- ✅ Dashboard funcional com processos

#### **A1 Certificate - Sprints 1-3**
- ✅ PKCS#12 parsing
- ✅ AES-256 encryption
- ✅ Document signing (PDF/XML)
- ✅ Settings UI integration

---

## [0.9.0] - 2025-11-25

### ✨ Features

#### **Jus.br Integration**
- ✅ OAuth 2.0 com PKCE
- ✅ PJe API service
- ✅ Process sync
- ✅ Settings integration

#### **Multi-Client Processes**
- ✅ Database migration
- ✅ ProcessPartiesService
- ✅ UI components
- ✅ Fuzzy matching

---

## [0.8.0] - 2025-11-24

### ✨ Features

#### **Process Automation**
- ✅ Client field mandatory
- ✅ Auto-populate from DataJud
- ✅ Fuzzy client matching
- ✅ Quick client creation

#### **UI/UX Improvements**
- ✅ Dashboard redesign
- ✅ Processes table modernization
- ✅ Clients page redesign
- ✅ Services page modernization

---

## [0.7.0] - 2025-11-21

### ✨ Features

#### **Supabase Integration**
- ✅ Async CRUD hooks
- ✅ Data migration panel
- ✅ Services module integration
- ✅ Agenda module integration
- ✅ Financial module integration

#### **Login System**
- ✅ Splash screen "Alaska"
- ✅ Forgot password flow
- ✅ First access activation

---

## [0.6.0] - 2025-11-20

### ✨ Features

#### **DataJud API**
- ✅ Process search
- ✅ Auto-sync (hourly)
- ✅ Manual sync button
- ✅ Process details fetch

---

## 🐛 Known Issues

### Active Bugs (Postponed)
- ⚠️ **Jus.br OAuth**: Invalid parameters em alguns casos
- ⚠️ **A1 Certificate**: Senhas válidas às vezes rejeitadas

### Limitations
- Single certificate per user (A1)
- No e-Proc API yet
- No PJe API yet

---

## 🔮 Upcoming Features

### Planned (Short-term)
- [ ] e-Proc API integration
- [ ] PJe API integration
- [ ] Advanced reports
- [ ] Notification system

### Planned (Long-term)
- [ ] Mobile app (React Native)
- [ ] Document templates
- [ ] Automated workflows
- [ ] Multi-office support

---

## 📊 Statistics

### Version 1.0.0
- **Total Lines**: ~25,000+
- **Components**: 50+
- **Pages**: 15+
- **Services**: 10+
- **Migrations**: 8
- **Test Data**: 130 records

---

## 🔧 Breaking Changes

### Version 1.0.0
- Client portal tables added (requires migration 008)
- New routes: `/portal/documents`, `/portal/messages`

### Version 0.9.5
- Multi-client support (requires migration 006)
- New table: `process_parties`

### Version 0.9.0
- Jus.br integration (requires migration 007)
- New API keys needed

---

## 📝 Migration Guide

### To 1.0.0
```sql
-- Execute migration 008
-- Executar: supabase/migrations/008_create_client_portal.sql
```

### To 0.9.5
```sql
-- Execute migration 006
-- Executar: supabase/migrations/006_add_multi_client_support.sql
```

---

## 🙏 Contributors

- VOB Development Team
- Powered by Supabase, React, TypeScript

---

**📅 Release Schedule**: Rolling releases  
**🐛 Bug Reports**: GitHub Issues  
**📧 Support**: suporte@vob.com.br
