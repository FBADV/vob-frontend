# 🐛 DEBUG - Como Obter Logs dos Erros

## ⚠️ IMPORTANTE: Preciso dos Logs do Console!

Para diagnosticar os problemas, preciso que você me envie os logs detalhados que agora aparecem no Console do navegador.

---

## 📋 Passo a Passo:

### **1. Abra o Console do Navegador**
- Pressione **F12** (Windows/Linux) ou **Cmd+Option+I** (Mac)
- Clique na aba **"Console"**

### **2. Limpe o Console**
- Clique no ícone 🚫 (círculo com linha) para limpar mensagens antigas

---

## 🔐 Para o Certificado A1:

### **3. Tente Fazer Upload:**
1. Vá em **Settings > Integrations**
2. Clique em **"Adicionar Certificado A1"**
3. Selecione o arquivo .pfx ou .p12
4. Digite a senha
5. Clique em **"Validar Certificado"**

### **4. Copie os Logs:**
No Console, você verá várias linhas começando com:
```
[Certificate Debug] Starting PKCS#12 parsing...
[Certificate Debug] File size: 3524 bytes
[Certificate Debug] Password length: 8
[Certificate Debug] Binary string length: 3524
[Certificate Debug] Parsing ASN.1...
```

**→ Copie TODAS as linhas que começam com `[Certificate Debug]` e me envie!**

---

## 🔗 Para o Jus.br OAuth:

### **3. Tente Conectar:**
1. Vá em **Settings > Integrations**
2. Clique em **"Conectar com Jus.br"**
3. Faça login no portal do CNJ
4. Aguarde o redirecionamento

### **4. Copie os Logs:**
No Console, você verá:
```
[OAuth Debug] ============ START CALLBACK ============
[OAuth Debug] Current URL: http://localhost:5173/auth/jusbr/callback?code=...
[OAuth Debug] Search params: ?code=...&state=...
[OAuth Debug] Code: abc123...
[OAuth Debug] State: xyz789...
```

**→ Copie TODAS as linhas que começam com `[OAuth Debug]` e me envie!**

---

## ✅ O Que Fazer:

**Me envie em formato de texto:**
```
=== CERTIFICADO A1 ===
[Certificate Debug] Starting PKCS#12 parsing...
[Certificate Debug] File size: ...
... todos os logs ...

=== JUS.BR OAUTH ===
[OAuth Debug] ============ START CALLBACK ============
[OAuth Debug] Current URL: ...
... todos os logs ...
```

---

## ⚠️ Importante:
- **NÃO** me envie screenshots, preciso do **texto** dos logs!
- Copie **TUDO** que aparece com `[Certificate Debug]` ou `[OAuth Debug]`
- Se aparecer erro em vermelho, copie também!

---

**Sem esses logs, não consigo identificar o problema real! 🙏**
