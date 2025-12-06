# Guia Rápido: Iniciar Sistema Judicial

## 🚀 Como Rodar Backend + Frontend

### Terminal 1: Backend (Node.js)
```bash
cd backend
npm run dev
```

**Aguardar mensagem**:
```
============================================================
🚀 VOB Judicial Backend rodando na porta 3001
📍 Health check: http://localhost:3001/health
🔒 Ambiente: development
============================================================
```

### Terminal 2: Frontend (React)
```bash
npm run dev
```

**Acessar**: http://localhost:5173

---

## ✅ Checklist Antes de Testar

- [ ] Backend rodando em http://localhost:3001
- [ ] Frontend rodando em http://localhost:5173
- [ ] Arquivo `backend/.env` existe
- [ ] CRYPTO_KEY definida no .env (min 32 chars)

---

## 🧪 Testar Upload de Certificado

1. Abrir http://localhost:5173
2. Settings → **Integração Judicial**
3. Modo: **Configuração**
4. Definir OAB: `OAB/RN 12345`
5. Upload certificado .pfx
6. Digitar senha

**Se backend NÃO estiver rodando**: "Erro de conexão com servidor" ❌
**Se backend estiver rodando**: Upload funciona ✅

---

## 🔍 Troubleshooting

### Erro: "Erro de conexão com servidor"
✅ **Solução**: Iniciar backend em `backend/` com `npm run dev`

### Erro: "CRYPTO_KEY deve ter no mínimo 32 caracteres"
✅ **Solução**: Editar `backend/.env` e adicionar:
```
CRYPTO_KEY=minha_chave_super_segura_de_32_caracteres_minimo
```

### Porta 3001 já em uso
✅ **Solução**: Matar processo:
```bash
lsof -ti:3001 | xargs kill -9
```

---

## 📝 Fluxo de Teste Completo

```
1. Iniciar Backend     → Terminal 1
2. Iniciar Frontend    → Terminal 2
3. Abrir navegador     → localhost:5173
4. Settings            → Integração Judicial
5. Config OAB          → Salvar
6. Upload Certificado  → Arquivo + Senha
7. Ver sucesso         → ✅ Certificado uploadado
8. Modo Onboarding     → Sincronizar
9. Ver 3 processos     → Mock importado
10. Selecionar cliente → Criar automaticamente
```

**Tempo estimado**: 2-3 minutos

---

## 🎯 O Que Deve Funcionar

✅ Upload de certificado A1  
✅ Validação de formato OAB  
✅ Sincronização de 3 processos mock  
✅ Listagem de partes  
✅ Seleção e criação de clientes  
✅ Feedback visual em todas etapas  

---

**IMPORTANTE**: Mantenha ambos terminals rodando durante os testes!
