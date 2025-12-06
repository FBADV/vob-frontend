# 🔐 A1 Certificate - Manual Testing Checklist

**Version**: 1.0  
**Date**: 2025-11-30  
**Sprint**: 4 - Testing & Production

---

## 📋 Overview

Este checklist guia você através de todos os testes manuais necessários para validar a integração do Certificado Digital A1.

**Tempo estimado**: 1-2 horas  
**Pré-requisito**: Ter um certificado .pfx ou .p12 válido para testes

---

## ✅ 1. Upload de Certificado

### 1.1 Upload Básico
- [ ] Acessar Settings → Certificados Digitais
- [ ] Clicar em "Gerenciar Certificados"
- [ ] Fazer upload de arquivo .pfx válido
- [ ] Inserir senha correta
- [ ] Verificar validação bem-sucedida
- [ ] Confirmar mensagem de sucesso

### 1.2 Validação de Arquivo
- [ ] Tentar upload de .pdf (deve rejeitar)
- [ ] Tentar upload de .docx (deve rejeitar)
- [ ] Tentar upload de .txt (deve rejeitar)
- [ ] Verificar mensagens de erro apropriadas
- [ ] Confirmar que apenas .pfx/.p12 são aceitos

### 1.3 Validação de Senha
- [ ] Upload com senha incorreta
- [ ] Verificar erro "Senha inválida"
- [ ] Upload com senha vazia
- [ ] Verificar mensagem de erro apropriada
- [ ] Upload com senha correta (deve funcionar)

### 1.4 Drag & Drop
- [ ] Arrastar arquivo .pfx para área de upload
- [ ] Verificar highlight da área
- [ ] Soltar arquivo
- [ ] Verificar nome do arquivo aparece
- [ ] Prosseguir com upload normal

---

## ✅ 2. Visualização de Certificado

### 2.1 Certificate Card
- [ ] Verificar nome do titular exibido
- [ ] Verificar CPF/CNPJ exibido
- [ ] Verificar data de validade
- [ ] Verificar destaque se < 30 dias para vencer
- [ ] Verificar badge de status (válido/expirado)

### 2.2 Detalhes Técnicos
- [ ] Verificar emissor do certificado
- [ ] Verificar número de série
- [ ] Verificar algoritmo de assinatura
- [ ] Verificar uso da chave

---

## ✅ 3. Gestão de Certificado

### 3.1 Atualização
- [ ] Remover certificado existente
- [ ] Confirmar remoção
- [ ] Fazer upload de novo certificado
- [ ] Verificar substituição bem-sucedida

### 3.2 Múltiplos Certificados (limitação atual)
- [ ] Com certificado ativo, tentar upload de outro
- [ ] Verificar comportamento (sobrescrever ou erro)
- [ ] Documentar comportamento atual

---

## ✅ 4. Armazenamento Seguro

### 4.1 Verificar Criptografia (DB)
```sql
-- No Supabase SQL Editor
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
- [ ] Verificar `encrypted_data` não nulo
- [ ] Verificar `iv` não nulo (16 bytes)
- [ ] Verificar `auth_tag` não nulo (16 bytes)
- [ ] Confirmar dados estão criptografados

### 4.2 RLS (Row Level Security)
```sql
-- Tentar acessar certificados de outro usuário
SELECT * FROM certificates WHERE user_id != auth.uid();
```
- [ ] Query deve retornar vazio
- [ ] Confirmar RLS está ativo

---

## ✅ 5. Assinatura de Documentos

### 5.1 Assinar PDF
- [ ] Abrir processo com documentos
- [ ] Selecionar documento PDF
- [ ] Clicar em "Assinar com Certificado"
- [ ] Verificar assinatura aplicada
- [ ] Download do PDF assinado
- [ ] Validar assinatura (Adobe Reader)

### 5.2 Assinar XML
- [ ] Preparar documento XML de teste
- [ ] Assinar com certificado
- [ ] Verificar estrutura XML mantida
- [ ] Validar assinatura digital

### 5.3 Validação de Assinatura
- [ ] Abrir PDF assinado no Adobe Reader
- [ ] Verificar painel de assinaturas
- [ ] Confirmar certificado válido
- [ ] Verificar integridade do documento

---

## ✅ 6. Expiration Handling

### 6.1 Alertas de Expiração
- [ ] Verificar badge se certificado vence em < 30 dias
- [ ] Verificar cor de alerta (amarelo/vermelho)
- [ ] Verificar tooltip com data de expiração

### 6.2 Certificado Expirado
- [ ] (Se possível) Fazer upload de certificado expirado
- [ ] Verificar rejeição ou alerta
- [ ] Confirmar não pode assinar documentos

---

## ✅ 7. UI/UX

### 7.1 Loading States
- [ ] Verificar spinner durante upload
- [ ] Verificar loading durante validação
- [ ] Verificar feedback visual apropriado

### 7.2 Error Messages
- [ ] Mensagens de erro são claras
- [ ] Mensagens em português
- [ ] Botão de "tentar novamente" funciona

### 7.3 Responsividade
- [ ] Testar em desktop (1920x1080)
- [ ] Testar em tablet (768px)
- [ ] Testar em mobile (375px)
- [ ] Verificar modal responsivo

---

## ✅ 8. Security Audit

### 8.1 Password Handling
- [ ] Senha nunca aparece em logs do browser
- [ ] Senha nunca enviada sem criptografia
- [ ] Input type="password" (não visível)
- [ ] Senha não armazenada em localStorage

### 8.2 Certificate Data
- [ ] Dados do certificado nunca em console.log
- [ ] Private key nunca exposta
- [ ] Apenas dados públicos exibidos na UI

### 8.3 HTTPS
- [ ] (Produção) Verificar conexão HTTPS
- [ ] Certificado SSL válido
- [ ] Sem avisos de segurança

---

## ✅ 9. Integration Tests

### 9.1 Fluxo Completo
- [ ] Fazer login
- [ ] Upload de certificado
- [ ] Abrir processo
- [ ] Assinar documento
- [ ] Download documento assinado
- [ ] Validar assinatura
- [ ] Logout

### 9.2 Error Recovery
- [ ] Interromper upload (refresh página)
- [ ] Verificar estado consistente
- [ ] Tentar novamente

---

## ✅ 10. Performance

### 10.1 Upload Speed
- [ ] Upload de .pfx pequeno (< 5KB) - deve ser instantâneo
- [ ] Upload de .pfx grande (> 50KB) - deve ser < 5s
- [ ] Verificar sem travamentos

### 10.2 Parsing Speed
- [ ] Validação de certificado deve ser < 3s
- [ ] Extraction de dados deve ser < 2s

---

## 🐛 Known Issues

### ⚠️ Bug: Password Validation
**Status**: Postponed  
**Description**: Alguns certificados válidos têm senha rejeitada  
**Workaround**: Testar com node-forge alternativo ou pkijs  
**Priority**: Medium

---

## 📊 Test Results Template

```markdown
## Test Session: [DATE]
Tester: [NAME]
Environment: [Dev/Staging/Prod]

### Results Summary:
- ✅ Passed: X/Y tests
- ❌ Failed: Z tests
- ⚠️ Issues Found: N

### Failed Tests:
1. [Test Name] - [Reason for failure]
2. ...

### Issues Found:
1. [Description] - Severity: [Low/Medium/High]
2. ...

### Notes:
[Any additional observations]
```

---

## ✅ Success Criteria

Sprint 4 testing is complete when:
- [ ] All critical tests passing (95%+)
- [ ] No high-severity bugs
- [ ] Security audit passed
- [ ] Performance acceptable
- [ ] User documentation complete

---

**Ready to test!** 🚀  
**Questions?** Consulte o guia de troubleshooting.
