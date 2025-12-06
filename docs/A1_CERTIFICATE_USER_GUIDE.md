# 📘 Guia do Usuário - Certificado Digital A1

**Versão**: 1.0  
**Data**: 2025-11-30

---

## 🎯 O Que É um Certificado Digital A1?

Um **Certificado Digital A1** é uma identidade eletrônica que permite:
- ✅ Assinar documentos digitalmente
- ✅ Acessar sistemas governamentais (e-Proc, PJe)
- ✅ Garantir autenticidade e integridade de documentos
- ✅ Substituir assinaturas físicas

**Formato**: Arquivo .pfx ou .p12  
**Validade**: Geralmente 1 ano  
**Proteção**: Senha obrigatória

---

## 🚀 Como Fazer Upload do Certificado

### Passo 1: Acessar Configurações
1. Faça login no sistema VOB
2. Clique no ícone de **Configurações** (⚙️) no canto superior direito
3. Selecione a aba **"Certificados Digitais"**

### Passo 2: Fazer Upload
1. Clique em **"Gerenciar Certificados"** ou **"Upload de Certificado"**
2. Selecione seu arquivo .pfx ou .p12
   - Ou arraste e solte o arquivo na área indicada
3. Digite a **senha do certificado**
4. Clique em **"Validar e Salvar"**

### Passo 3: Confirmação
- ✅ Você verá uma mensagem de sucesso
- ✅ Seus dados do certificado aparecerão na tela
- ✅ O sistema está pronto para assinar documentos

---

## 🔐 Assinar Documentos

### Assinar um PDF:
1. Abra o processo desejado
2. Vá até a aba "Documentos"
3. Selecione o documento PDF
4. Clique em **"Assinar com Certificado"**
5. Aguarde o processamento (5-10 segundos)
6. Download do documento assinado

### Verificar Assinatura:
1. Abra o PDF no Adobe Acrobat Reader
2. Clique no painel de assinaturas (lado esquerdo)
3. Verifique o ícone ✓ verde
4. Clique para ver detalhes da assinatura

---

## ⚠️ Problemas Comuns

### "Senha Inválida"
**Causa**: Senha digitada incorretamente  
**Solução**:
- Verifique Caps Lock
- Confirme com quem emitiu o certificado
- Tente novamente com cuidado

### "Certificado Expirado"
**Causa**: Certificado passou da validade  
**Solução**:
- Renove o certificado com a Autoridade Certificadora
- Faça upload do novo certificado

### "Arquivo Inválido"
**Causa**: Formato de arquivo incorreto  
**Solução**:
- Use apenas arquivos .pfx ou .p12
- Verifique se o arquivo não está corrompido
- Baixe novamente da fonte original

### "Erro ao Assinar"
**Causa**: Certificado não carregado ou expirado  
**Solução**:
- Verifique se o certificado está ativo em Configurações
- Renove se estiver próximo do vencimento
- Tente fazer upload novamente

---

## 🛡️ Segurança

### O Que o Sistema Faz:
- ✅ **Criptografa** seu certificado com AES-256
- ✅ **Protege** sua senha (nunca armazenada)
- ✅ **Isola** seus dados (apenas você acessa)
- ✅ **Alerta** sobre certificados próximos do vencimento

### O Que Você Deve Fazer:
- 🔒 **Nunca compartilhe** sua senha
- 🔒 **Mantenha** o arquivo .pfx em local seguro
- 🔒 **Renove** antes de expirar
- 🔒 **Verifique** o cadeado HTTPS no navegador

---

## 📅 Renovação de Certificado

### Quando Renovar:
- ⚠️ **30 dias** antes do vencimento (sistema alerta)
- ⚠️ Se perdeu a senha
- ⚠️ Se arquivo foi comprometido

### Como Renovar:
1. Entre em contato com sua Autoridade Certificadora
2. Solicite renovação do certificado
3. Receba novo arquivo .pfx
4. Faça upload no sistema (sobrescreve o anterior)

---

## ❓ FAQ - Perguntas Frequentes

### **P: Posso ter mais de um certificado?**
R: Atualmente, apenas 1 certificado por usuário. Ao fazer upload de um novo, o anterior é substituído.

### **P: O certificado fica salvo no meu computador?**
R: Não. Ele fica criptografado no servidor, acessível apenas por você.

### **P: Perdi minha senha, o que faço?**
R: Você precisará solicitar um novo certificado com a Autoridade Certificadora.

### **P: Posso usar o mesmo certificado em múltiplos sistemas?**
R: Sim! O certificado A1 pode ser usado em vários sistemas.

### **P: Como sei se meu documento foi assinado corretamente?**
R: Abra o PDF no Adobe Reader e verifique o painel de assinaturas (ícone verde ✓).

---

## 📞 Suporte

**Problemas técnicos?**
- 📧 Email: suporte@vob.com.br
- 📱 WhatsApp: (XX) XXXXX-XXXX
- 🌐 Portal: https://suporte.vob.com.br

**Dúvidas sobre certificados?**
- Entre em contato com sua Autoridade Certificadora
- Exemplos: Serasa, Certisign, Valid, Soluti

---

## 📚 Recursos Adicionais

- [Vídeo Tutorial: Como Fazer Upload](#) - 3 min
- [Vídeo: Como Assinar Documentos](#) - 2 min
- [Lista de Autoridades Certificadoras](#)
- [Guia Completo e-Proc](#)

---

**Última atualização**: 2025-11-30  
**Versão do Sistema**: VOB Alaska v1.0
