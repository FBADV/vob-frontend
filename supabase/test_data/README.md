# 📊 Guia de Dados Fictícios para Testes

**Objetivo**: Popular o sistema com dados realistas para validação completa de funcionalidades

---

## 📁 Arquivo SQL

**Localização**: `supabase/test_data/fictional_data.sql`

---

## 📊 Dados Incluídos

### **Clientes (20 total)**:
- ✅ 10 Pessoas Físicas (CPF: 999.xxx.xxx-xx)
- ✅ 10 Pessoas Jurídicas (CNPJ: 99.xxx.xxx/0001-xx)

### **Financeiro (70 registros)**:
- ✅ 20 Contratos de honorários
- ✅ 30 Pagamentos/parcelas
- ✅ 20 Despesas operacionais

### **Atendimentos (40 registros)**:
- ✅ 10 Atendimentos principais
- ✅ 30 Interações CRM (ligações, e-mails, reuniões)

**Total**: ~130 registros de teste

---

## 🚀 Como Executar

### **1. Acessar Supabase**
```
1. Abra https://supabase.com
2. Acesse seu projeto VOB
3. Vá para SQL Editor
```

### **2. Executar Script**
```
1. Clique em "New Query"
2. Cole o conteúdo de fictional_data.sql
3. Clique em "Run" ou Ctrl+Enter
```

### **3. Verificar Dados**
```sql
-- Verificar clientes criados
SELECT COUNT(*) FROM clients WHERE cpf LIKE '999%' OR cnpj LIKE '99%';
-- Resultado esperado: 20

-- Verificar pagamentos
SELECT COUNT(*) FROM financials WHERE type = 'income';
-- Resultado esperado: ~50

-- Verificar despesas
SELECT COUNT(*) FROM financials WHERE type = 'expense';
-- Resultado esperado: 20

-- Verificar atendimentos
SELECT COUNT(*) FROM services;
-- Resultado esperado: ~40
```

---

## 🗑️ Como Remover Dados Fictícios

Quando quiser limpar os dados de teste, execute:

```sql
-- Remover em ordem (respeita foreign keys)
DELETE FROM services WHERE client_id IN (
    SELECT id FROM clients WHERE cpf LIKE '999%' OR cnpj LIKE '99%'
);

DELETE FROM financials WHERE client_id IN (
    SELECT id FROM clients WHERE cpf LIKE '999%' OR cnpj LIKE '99%'
);

DELETE FROM financials WHERE 
    description LIKE '%Dezembro 2024%' 
    OR description LIKE '%Janeiro 2025%';

DELETE FROM clients WHERE cpf LIKE '999%' OR cnpj LIKE '99%';

-- Verificar limpeza
SELECT COUNT(*) FROM clients WHERE cpf LIKE '999%' OR cnpj LIKE '99%';
-- Deve retornar: 0
```

---

## 📋 Detalhes dos Dados

### **Pessoas Físicas**:
- Maria da Silva Santos (São Paulo/SP)
- João Pedro Oliveira (Rio de Janeiro/RJ)
- Ana Carolina Ferreira (São Paulo/SP)
- Carlos Eduardo Mendes (Curitiba/PR)
- Patricia Lima Costa (Belo Horizonte/MG)
- Roberto Alves Souza (Fortaleza/CE)
- Juliana Martins Rocha (Salvador/BA)
- Fernando Santos Lima (Brasília/DF)
- Camila Rodrigues Dias (Porto Alegre/RS)
- Marcos Vinícius Pinto (Florianópolis/SC)

### **Pessoas Jurídicas**:
- Tech Solutions Ltda (TI)
- Construtora Alpha S/A (Construção)
- Comércio Beta ME (Varejo)
- Indústria Gamma Ltda (Química)
- Serviços Delta EIRELI (Serviços)
- Logística Epsilon S/A (Transporte)
- Alimentícia Zeta Ltda (Alimentos)
- Consultoria Eta ME (Consultoria)
- Varejo Theta Ltda (Varejo)
- Inovação Iota S/A (Startup)

### **Financeiro**:
**Receitas**:
- Contratos de R$ 2.000 a R$ 60.000
- Status: 70% pagos, 30% pendentes
- Métodos: PIX, Transferência, Boleto, Cartão

**Despesas**:
- Aluguel, utilidades, software
- Material de escritório
- Serviços profissionais
- Marketing e assinaturas

### **Atendimentos**:
**Tipos**:
- Consultas iniciais
- Audiências
- Reuniões de alinhamento
- Contatos (telefone, e-mail, WhatsApp)

**Status**:
- 40% concluídos
- 30% agendados
- 30% pendentes

---

## ✅ Funcionalidades a Testar

Com estes dados, você pode testar:

### **Dashboard**:
- [ ] Cards de estatísticas
- [ ] Gráficos financeiros
- [ ] Processos por cliente
- [ ] Atividades recentes

### **Clientes**:
- [ ] Lista de clientes (PF e PJ)
- [ ] Filtros por tipo
- [ ] Busca por nome/CPF/CNPJ
- [ ] Perfil completo do cliente

### **Financeiro**:
- [ ] Receitas e despesas
- [ ] Gráficos de fluxo de caixa
- [ ] Filtros por período
- [ ] Exportação de relatórios

### **Atendimentos**:
- [ ] Lista de serviços
- [ ] Agenda
- [ ] Status de atendimentos
- [ ] Histórico de interações

### **Relatórios**:
- [ ] Receitas por cliente
- [ ] Despesas por categoria
- [ ] Atendimentos por período
- [ ] Performance financeira

---

## 🎯 Próximos Passos

1. ✅ Execute o script SQL
2. ✅ Verifique os dados no sistema
3. ✅ Teste todas as funcionalidades
4. ✅ Adicione processos reais conforme necessário
5. ✅ Quando terminar os testes, limpe os dados

---

## ⚠️ Importante

- ❌ **NÃO** incluir processos fictícios (conforme solicitado)
- ✅ Todos os CPF/CNPJ começam com 999/99 para fácil identificação
- ✅ Dados podem ser removidos facilmente com script de limpeza
- ✅ Emails são fictícios (@email.com)

---

**Dados prontos para teste!** 🚀
