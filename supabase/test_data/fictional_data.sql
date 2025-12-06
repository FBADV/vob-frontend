-- ==========================================
-- VOB - Dados Fictícios para Testes
-- ==========================================
-- ATENÇÃO: Estes dados são APENAS para testes!
-- Para remover, execute: DELETE FROM clients WHERE cpf LIKE '999%' OR cnpj LIKE '99%';
--
-- Execute este script no Supabase SQL Editor
-- ==========================================

-- CLIENTES - PESSOAS FÍSICAS (10)
INSERT INTO clients (name, email, phone, cpf, type, address, city, state, zip_code, notes, status) VALUES
('Maria da Silva Santos', 'maria.santos@email.com', '(11) 98765-4321', '999.111.222-33', 'individual', 'Rua das Flores, 123, Apto 45', 'São Paulo', 'SP', '01234-567', 'Cliente VIP - Consultoria trabalhista', 'active'),
('João Pedro Oliveira', 'joao.oliveira@email.com', '(21) 99876-5432', '999.222.333-44', 'individual', 'Av. Atlântica, 456', 'Rio de Janeiro', 'RJ', '22041-001', 'Ação de indenização em andamento', 'active'),
('Ana Carolina Ferreira', 'ana.ferreira@email.com', '(11) 97654-3210', '999.333.444-55', 'individual', 'Rua Augusta, 789', 'São Paulo', 'SP', '01305-100', 'Divórcio consensual - processo tranquilo', 'active'),
('Carlos Eduardo Mendes', 'carlos.mendes@email.com', '(41) 96543-2109', '999.444.555-66', 'individual', 'Rua XV de Novembro, 321', 'Curitiba', 'PR', '80020-310', 'Inventário familiar', 'active'),
('Patricia Lima Costa', 'patricia.costa@email.com', '(31) 95432-1098', '999.555.666-77', 'individual', 'Av. Afonso Pena, 654', 'Belo Horizonte', 'MG', '30130-001', 'Ação trabalhista contra ex-empregador', 'active'),
('Roberto Alves Souza', 'roberto.souza@email.com', '(85) 94321-0987', '999.666.777-88', 'individual', 'Rua Major Facundo, 987', 'Fortaleza', 'CE', '60025-100', 'Consultoria imobiliária', 'active'),
('Juliana Martins Rocha', 'juliana.rocha@email.com', '(71) 93210-9876', '999.777.888-99', 'individual', 'Av. Sete de Setembro, 147', 'Salvador', 'BA', '40060-001', 'Planejamento sucessório', 'active'),
('Fernando Santos Lima', 'fernando.lima@email.com', '(61) 92109-8765', '999.888.999-00', 'individual', 'SQN 205 Bloco A, Apto 302', 'Brasília', 'DF', '70843-010', 'Ação de cobrança', 'active'),
('Camila Rodrigues Dias', 'camila.dias@email.com', '(51) 91098-7654', '999.999.000-11', 'individual', 'Rua dos Andradas, 258', 'Porto Alegre', 'RS', '90020-000', 'Revisão contratual', 'active'),
('Marcos Vinícius Pinto', 'marcos.pinto@email.com', '(48) 90987-6543', '999.000.111-22', 'individual', 'Av. Beira Mar Norte, 369', 'Florianópolis', 'SC', '88015-700', 'Defesa criminal - processo em andamento', 'active');

-- CLIENTES - PESSOAS JURÍDICAS (10)
INSERT INTO clients (name, email, phone, cnpj, type, address, city, state, zip_code, notes, status) VALUES
('Tech Solutions Ltda', 'contato@techsolutions.com.br', '(11) 3456-7890', '99.111.222/0001-33', 'corporate', 'Av. Paulista, 1000, Conj. 1501', 'São Paulo', 'SP', '01310-100', 'Empresa de TI - consultoria regulatória', 'active'),
('Construtora Alpha S/A', 'juridico@construtoralpha.com.br', '(21) 2345-6789', '99.222.333/0001-44', 'corporate', 'Rua do Ouvidor, 50, 8º andar', 'Rio de Janeiro', 'RJ', '20040-030', 'Grande cliente - múltiplos contratos', 'active'),
('Comércio Beta ME', 'contato@comerciobeta.com.br', '(11) 4567-8901', '99.333.444/0001-55', 'corporate', 'Rua 25 de Março, 234', 'São Paulo', 'SP', '01021-000', 'Varejo - questões trabalhistas', 'active'),
('Indústria Gamma Ltda', 'contato@industriagamma.com.br', '(41) 3678-9012', '99.444.555/0001-66', 'corporate', 'Rua da Indústria, 567, Galpão 3', 'Curitiba', 'PR', '81170-220', 'Indústria química - compliance ambiental', 'active'),
('Serviços Delta EIRELI', 'juridico@servicosdelta.com.br', '(31) 3789-0123', '99.555.666/0001-77', 'corporate', 'Av. do Contorno, 890', 'Belo Horizonte', 'MG', '30110-060', 'Prestação de serviços - litígios trabalhistas', 'active'),
('Logística Epsilon S/A', 'contato@logisticaepsilon.com.br', '(85) 3890-1234', '99.666.777/0001-88', 'corporate', 'Av. Washington Soares, 1234', 'Fortaleza', 'CE', '60811-341', 'Transportadora - questões regulatórias', 'active'),
('Alimentícia Zeta Ltda', 'contato@alimenticiazeta.com.br', '(71) 3901-2345', '99.777.888/0001-99', 'corporate', 'Av. Paralela, 456', 'Salvador', 'BA', '41730-020', 'Indústria alimentícia - ANVISA', 'active'),
('Consultoria Eta ME', 'contato@consultoriaeta.com.br', '(61) 4012-3456', '99.888.999/0001-00', 'corporate', 'SCS Quadra 02, Bloco C, Sala 201', 'Brasília', 'DF', '70302-907', 'Consultoria empresarial', 'active'),
('Varejo Theta Ltda', 'contato@varejotheta.com.br', '(51) 4123-4567', '99.999.000/0001-11', 'corporate', 'Rua dos Andradas, 1000', 'Porto Alegre', 'RS', '90020-001', 'Rede de lojas - contratos comerciais', 'active'),
('Inovação Iota S/A', 'contato@inovacaoiota.com.br', '(48) 4234-5678', '99.000.111/0001-22', 'corporate', 'Rodovia SC-401, km 5', 'Florianópolis', 'SC', '88032-000', 'Startup tech - propriedade intelectual', 'active');

-- CONTRATOS (20)
INSERT INTO financials (type, description, value, due_date, status, payment_date, payment_method, client_id, category) 
SELECT 
    'income',
    'Contrato de Honorários - ' || name,
    CASE 
        WHEN type = 'individual' THEN (RANDOM() * 10000 + 2000)::numeric(10,2)
        ELSE (RANDOM() * 50000 + 10000)::numeric(10,2)
    END,
    CURRENT_DATE + (RANDOM() * 365)::int,
    CASE WHEN RANDOM() < 0.7 THEN 'paid' ELSE 'pending' END,
    CASE WHEN RANDOM() < 0.7 THEN CURRENT_DATE - (RANDOM() * 30)::int ELSE NULL END,
    CASE 
        WHEN RANDOM() < 0.3 THEN 'pix'
        WHEN RANDOM() < 0.6 THEN 'transfer'
        ELSE 'credit_card'
    END,
    id,
    'honorarios'
FROM clients 
WHERE cpf LIKE '999%' OR cnpj LIKE '99%';

-- PAGAMENTOS ADICIONAIS (30 recebimentos)
INSERT INTO financials (type, description, value, due_date, status, payment_date, payment_method, client_id, category)
SELECT
    'income',
    'Pagamento ' || (ROW_NUMBER() OVER (PARTITION BY c.id)) || 'ª Parcela',
    (RANDOM() * 5000 + 500)::numeric(10,2),
    CURRENT_DATE + (RANDOM() * 180)::int,
    CASE WHEN RANDOM() < 0.8 THEN 'paid' ELSE 'pending' END,
    CASE WHEN RANDOM() < 0.8 THEN CURRENT_DATE - (RANDOM() * 60)::int ELSE NULL END,
    CASE 
        WHEN RANDOM() < 0.4 THEN 'pix'
        WHEN RANDOM() < 0.7 THEN 'transfer'
        ELSE 'boleto'
    END,
    c.id,
    'honorarios'
FROM clients c
CROSS JOIN generate_series(1, 2) -- 2 pagamentos por cliente
WHERE c.cpf LIKE '999%' OR c.cnpj LIKE '99%'
LIMIT 30;

-- DESPESAS (20)
INSERT INTO financials (type, description, value, due_date, status, payment_date, payment_method, category) VALUES
('expense', 'Aluguel Escritório - Janeiro 2025', 8500.00, '2025-01-10', 'paid', '2025-01-08', 'transfer', 'aluguel'),
('expense', 'Conta de Luz - Dezembro 2024', 450.00, '2024-12-15', 'paid', '2024-12-14', 'pix', 'utilidades'),
('expense', 'Internet Fibra - Dezembro 2024', 299.00, '2024-12-20', 'paid', '2024-12-18', 'pix', 'utilidades'),
('expense', 'Material de Escritório', 850.00, '2024-12-05', 'paid', '2024-12-05', 'credit_card', 'materiais'),
('expense', 'Software Jurídico - Anual', 3500.00, '2025-01-15', 'pending', NULL, NULL, 'software'),
('expense', 'Contador - Honorários Mensais', 1200.00, '2025-01-10', 'pending', NULL, NULL, 'servicos'),
('expense', 'Limpeza Escritório', 600.00, '2024-12-28', 'paid', '2024-12-28', 'pix', 'servicos'),
('expense', 'Custas Processuais', 750.00, '2024-12-12', 'paid', '2024-12-12', 'transfer', 'custas'),
('expense', 'Certidões e Documentos', 320.00, '2024-12-18', 'paid', '2024-12-18', 'pix', 'documentos'),
('expense', 'Água - Dezembro 2024', 180.00, '2024-12-22', 'paid', '2024-12-20', 'pix', 'utilidades'),
('expense', 'Seguro Escritório', 890.00, '2025-01-20', 'pending', NULL, NULL, 'seguros'),
('expense', 'Marketing Digital', 1500.00, '2024-12-30', 'paid', '2024-12-29', 'credit_card', 'marketing'),
('expense', 'Livros Jurídicos', 680.00, '2024-12-10', 'paid', '2024-12-10', 'credit_card', 'materiais'),
('expense', 'Assinatura Revistas Especializadas', 450.00, '2025-01-05', 'pending', NULL, NULL, 'assinaturas'),
('expense', 'Manutenção Equipamentos', 320.00, '2024-12-15', 'paid', '2024-12-15', 'pix', 'manutencao'),
('expense', 'Café e Copa', 280.00, '2024-12-20', 'paid', '2024-12-19', 'credit_card', 'copa'),
('expense', 'Combustível', 450.00, '2024-12-28', 'paid', '2024-12-27', 'credit_card', 'transporte'),
('expense', 'Estacionamento', 350.00, '2024-12-30', 'pending', NULL, NULL, 'transporte'),
('expense', 'Telefonia', 380.00, '2025-01-05', 'pending', NULL, NULL, 'utilidades'),
('expense', 'Impressora - Toner', 420.00, '2024-12-22', 'paid', '2024-12-22', 'credit_card', 'materiais');

-- ATENDIMENTOS/SERVIÇOS (10)
INSERT INTO services (type, description, status, date, duration, client_id, notes) 
SELECT
    CASE 
        WHEN RANDOM() < 0.3 THEN 'consulta'
        WHEN RANDOM() < 0.6 THEN 'audiencia'
        ELSE 'reuniao'
    END,
    CASE 
        WHEN RANDOM() < 0.3 THEN 'Consulta inicial sobre ' || name
        WHEN RANDOM() < 0.6 THEN 'Audiência de conciliação - ' || name
        ELSE 'Reunião de alinhamento - ' || name
    END,
    CASE 
        WHEN RANDOM() < 0.4 THEN 'completed'
        WHEN RANDOM() < 0.7 THEN 'scheduled'
        ELSE 'pending'
    END,
    CURRENT_DATE + ((RANDOM() * 60 - 30)::int), -- Entre -30 e +30 dias
    (30 + RANDOM() * 90)::int, -- 30 a 120 minutos
    id,
    CASE 
        WHEN RANDOM() < 0.5 THEN 'Cliente demonstrou interesse em prosseguir'
        ELSE 'Pendente documentação adicional'
    END
FROM clients 
WHERE cpf LIKE '999%' OR cnpj LIKE '99%'
LIMIT 10;

-- CRM - INTERAÇÕES (30 interações)
INSERT INTO services (type, description, status, date, duration, client_id, notes)
SELECT
    'contato',
    CASE 
        WHEN RANDOM() < 0.25 THEN 'Ligação telefônica'
        WHEN RANDOM() < 0.5 THEN 'E-mail enviado'
        WHEN RANDOM() < 0.75 THEN 'WhatsApp'
        ELSE 'Reunião online'
    END,
    'completed',
    CURRENT_DATE - (RANDOM() * 90)::int, -- Últimos 90 dias
    (10 + RANDOM() * 50)::int,
    c.id,
    CASE 
        WHEN RANDOM() < 0.3 THEN 'Cliente solicitou atualização do processo'
        WHEN RANDOM() < 0.6 THEN 'Esclarecimento de dúvidas'
        ELSE 'Agendamento de próxima reunião'
    END
FROM clients c
CROSS JOIN generate_series(1, 2) -- 2 interações por cliente
WHERE c.cpf LIKE '999%' OR c.cnpj LIKE '99%'
LIMIT 30;

-- ==========================================
-- RESUMO DOS DADOS CRIADOS:
-- ==========================================
-- ✅ 10 Pessoas Físicas
-- ✅ 10 Pessoas Jurídicas
-- ✅ 20 Contratos (honorários)
-- ✅ 30 Pagamentos (parcelas)
-- ✅ 20 Despesas (variadas)
-- ✅ 10 Atendimentos principais
-- ✅ 30 Interações CRM
-- ==========================================
-- Total: 130 registros de dados de teste
-- ==========================================

-- PARA REMOVER TODOS OS DADOS FICTÍCIOS:
-- DELETE FROM services WHERE client_id IN (SELECT id FROM clients WHERE cpf LIKE '999%' OR cnpj LIKE '99%');
-- DELETE FROM financials WHERE client_id IN (SELECT id FROM clients WHERE cpf LIKE '999%' OR cnpj LIKE '99%');
-- DELETE FROM financials WHERE description LIKE '%Dezembro 2024%' OR description LIKE '%Janeiro 2025%';
-- DELETE FROM clients WHERE cpf LIKE '999%' OR cnpj LIKE '99%';
