# Settings_Screen.md

## Settings Module – Complete Structure

This document describes the complete Settings screen layout and all submenus for the VOB system.

---
## 1. Settings Menu Location
- **Navigation**: Top bar or sidebar → "Configurações" (gear icon)
- **Access**: Administrators only (some submenus visible to other roles as read-only)

---
## 2. Layout Structure

### 2.1 Page Layout
- **Left Sidebar** (300 px width): Menu items with icons
- **Main Content Area**: Dynamic content based on selected menu item
- **Breadcrumbs**: "Configurações > [Current Section]"

---
## 3. Complete Menu Structure

```
⚙️ Configurações
│
├── 🏢 Geral
│   ├── Nome do Escritório
│   ├── Logo
│   ├── Endereço
│   ├── Telefone / E-mail
│   └── Informações de Contato
│
├── 👥 Usuários
│   ├── Listar Usuários
│   ├── Adicionar Usuário
│   ├── Permissões por Função
│   └── Histórico de Alterações
│
├── 🔑 Acesso do Cliente
│   ├── Configurar Portal
│   ├── Clientes com Acesso
│   └── Logs de Acesso
│
├── 📊 Fluxograma Processual
│   ├── Listar Fluxogramas
│   ├── Criar Novo Fluxograma
│   └── Etapas e Dependências
│
├── 🔗 Integrações
│   ├── PJe (Processo Judicial Eletrônico)
│   ├── E-SAJ
│   ├── Tribunais (APIs)
│   ├── Jurisprudência
│   ├── WhatsApp Business (opcional)
│   └── E-mail (SMTP/IMAP)
│
├── 💰 Financeiro
│   ├── Categorias de Despesas
│   ├── Categorias de Receitas
│   ├── Formas de Pagamento
│   ├── Contas Bancárias
│   └── Configurações de Impostos
│
├── 📄 Modelos de Documentos
│   ├── Petições
│   ├── Contratos
│   ├── Procurações
│   └── Cartas e Ofícios
│
├── 🔔 Notificações
│   ├── Notificações Internas
│   ├── E-mail Automático
│   ├── SMS (opcional)
│   └── Push Notifications
│
├── 🎨 Aparência
│   ├── Tema (Claro/Escuro)
│   ├── Cores Personalizadas
│   └── Layout do Dashboard
│
├── 🔐 Backup e Segurança
│   ├── Backup Automático
│   ├── Logs de Auditoria
│   ├── Política de Senhas
│   └── Autenticação de Dois Fatores (2FA)
│
├── 📦 Plano e Assinatura
│   ├── Plano Atual
│   ├── Upgrade/Downgrade
│   ├── Histórico de Pagamentos
│   └── Código de Ativação
│
└── ℹ️ Sobre
    ├── Versão do Sistema
    ├── Termos de Uso
    ├── Política de Privacidade
    └── Suporte
```

---
## 4. Detailed Section Descriptions

### 4.1 Geral (General Settings)
**Access**: Administrator only

**Fields**:
- Nome do Escritório (text input)
- Logo (image upload, max 2 MB, PNG/JPG)
- Endereço Completo (text area)
- Telefone Principal (phone input with mask)
- E-mail Institucional (email input)
- Site (URL input, optional)
- OAB do Escritório (text input)
- Horário de Funcionamento (time range picker)

**Actions**:
- "Salvar Alterações" (primary button)
- "Cancelar" (secondary button)

---
### 4.2 Usuários (User Management)
**Access**: Administrator (full), Advogado Associado & Controlador (read-only)

#### 4.2.1 Listar Usuários
- **Table Columns**: Avatar, Nome, E-mail, Função, Status, Último Acesso, Ações
- **Filters**: Função (dropdown), Status (Ativo/Inativo), Search bar
- **Actions**:
  - "✏️ Editar" (modal)
  - "🔑 Resetar Senha" (confirmation dialog)
  - "❌ Desativar" / "✅ Ativar" (toggle)
- **Top Right**: "+ Adicionar Usuário" button

#### 4.2.2 Adicionar/Editar Usuário Modal
**Tabs**:
1. **Dados Básicos**
   - Nome Completo
   - E-mail
   - CPF
   - Telefone
   - Avatar (upload)
   
2. **Permissões**
   - Nível Hierárquico (dropdown):
     - Administrador
     - Advogado Associado
     - Advogado Colaborador
     - Colaborador
     - Estagiário
     - Controlador
   - Permissões Especiais (checkboxes):
     - Pode criar processos (for Colaborador role)
     - Pode acessar financeiro (for Colaborador role)
     - Pode validar etapas de fluxo (for specific users)
   
3. **Histórico** (view only)
   - Data de Criação
   - Criado por
   - Última Alteração
   - Log de Alterações de Permissões

#### 4.2.3 Permissões por Função
- **Display**: Matrix table showing all roles and their permissions
- **Columns**: Módulo, Admin, Associado, Colaborador Adv, Colaborador, Estagiário, Controlador
- **Rows**: Each module with ✅/❌ indicators
- **Purpose**: Read-only reference for administrators

---
### 4.3 Acesso do Cliente (Client Portal Access)
**Access**: Administrator (full), Advogado Associado (partial)

#### 4.3.1 Configurar Portal
**Global Settings**:
- Portal Habilitado (toggle)
- URL do Portal (display only: `https://portal.vob.com.br`)
- Logo do Portal (image upload)
- Mensagem de Boas-Vindas (text area)

**Default Permissions** (applied to all clients):
- ☑ Visualizar Processos
- ☑ Visualizar Movimentações
- ☑ Baixar Documentos Liberados
- ☐ Enviar Mensagens ao Escritório (optional feature)

#### 4.3.2 Clientes com Acesso
**Table Columns**: Cliente, CPF, E-mail, Status do Acesso, Último Acesso, Ações

**Actions**:
- "🔓 Habilitar Acesso" (for inactive clients)
- "🔒 Revogar Acesso" (for active clients)
- "⚙️ Configurar Permissões" (opens modal to select which processes are visible)

**Habilitar Acesso Flow**:
1. Click "Habilitar Acesso"
2. Confirmation dialog appears:
   - "Deseja habilitar o acesso ao portal para [Cliente Nome]?"
   - "Login: CPF (***.456.789-**)"
   - "Uma senha temporária será enviada para o e-mail cadastrado."
3. Click "Confirmar"
4. System:
   - Generates temporary password
   - Sends email with instructions
   - Enables portal access
   - Shows success toast

#### 4.3.3 Logs de Acesso
**Table**: Data/Hora, Cliente, IP, Ação (Login/Logout/View Process)
**Filters**: Data range, Cliente
**Purpose**: Audit trail for client portal access

---
### 4.4 Fluxograma Processual (Flow Management)
**Access**: Administrator (full), Controlador (read-only)

(Already detailed in `Figma_Prototype_Flowchart.md` and `SRS_Flowchart.md`)

---
### 4.5 Integrações (Integrations)
**Access**: Administrator only

#### 4.5.1 PJe (Electronic Judicial Process)
- Habilitar Integração (toggle)
- Certificado Digital (file upload .pfx)
- Senha do Certificado (password input)
- Tribunal (dropdown: TRT, TRF, etc.)
- Testar Conexão (button)
- Última Sincronização (display)

#### 4.5.2 E-SAJ
- Similar structure to PJe

#### 4.5.3 Tribunais (APIs)
- List of integrated courts with toggle switches

#### 4.5.4 Jurisprudência
- API Key (text input)
- Provider (dropdown: JusBrasil, LexML, etc.)

#### 4.5.5 WhatsApp Business
- Phone Number (phone input)
- API Token (password input)
- Webhooks (URL display)

#### 4.5.6 E-mail
- SMTP Server (text input)
- SMTP Port (number input)
- Username (text input)
- Password (password input)
- IMAP Settings (expandable section)

---
### 4.6 Financeiro (Financial Settings)
**Access**: Administrator (full), Advogado Associado (partial)

#### 4.6.1 Categorias de Despesas
- Table: Nome, Descrição, Ações
- "+ Adicionar Categoria" button
- Edit/Delete actions

#### 4.6.2 Categorias de Receitas
- Same structure as Despesas

#### 4.6.3 Formas de Pagamento
- Checkboxes: Dinheiro, PIX, Boleto, Cartão de Crédito, Transferência, Cheque

#### 4.6.4 Contas Bancárias
- Table: Banco, Agência, Conta, Tipo, Ações
- "+ Adicionar Conta" button

#### 4.6.5 Configurações de Impostos
- Regime Tributário (dropdown: Simples Nacional, Lucro Presumido, etc.)
- Alíquota de ISS (percentage input)
- Outras configurações fiscais

---
### 4.7 Modelos de Documentos (Document Templates)
**Access**: Administrator (full), Advogado Associado (partial)

**Sections**:
- Petições
- Contratos
- Procurações
- Cartas e Ofícios

**For Each Section**:
- List of templates
- "+ Novo Modelo" button
- Rich text editor (with merge fields: `{{cliente_nome}}`, `{{processo_numero}}`, etc.)
- Preview button
- Save/Delete actions

---
### 4.8 Notificações (Notification Settings)
**Access**: Administrator (full), users can customize own notifications

#### 4.8.1 Notificações Internas
**For each event type** (table):
- Novo Processo Criado
- Prazo Próximo do Vencimento
- Movimentação Processual
- Nova Tarefa Atribuída
- Etapa de Fluxo Alterada

**Columns**: Evento, Notificar no Sistema, E-mail, SMS, Push

#### 4.8.2 Configurações por Usuário
- Each user can customize their own notification preferences

---
### 4.9 Aparência (Appearance)
**Access**: All users (personal preference)

**Options**:
- Tema (Claro/Escuro/Automático)
- Cor Principal (color picker, admin only)
- Layout do Dashboard (grid/list)
- Tamanho da Fonte (small/medium/large)

---
### 4.10 Backup e Segurança (Backup & Security)
**Access**: Administrator only

#### 4.10.1 Backup Automático
- Habilitar Backup (toggle)
- Frequência (dropdown: Diário, Semanal, Mensal)
- Hora de Execução (time picker)
- Último Backup (display: date/time)
- "🔄 Fazer Backup Agora" button
- "📥 Baixar Último Backup" button

#### 4.10.2 Logs de Auditoria
- Table: Data/Hora, Usuário, Ação, Módulo, Detalhes
- Export to CSV button

#### 4.10.3 Política de Senhas
- Exigir senha forte (toggle)
- Comprimento mínimo (number input, default 8)
- Expiração de senha (days input, 0 = never)

#### 4.10.4 Autenticação de Dois Fatores (2FA)
- Habilitar 2FA para Administradores (toggle)
- QR Code (display)
- Setup instructions

---
### 4.11 Plano e Assinatura (Plan & Subscription)
**Access**: Administrator only

**Display**:
- Plano Atual: VOB Alaska - Profissional
- Usuários Ativos: 12 / 15
- Processos: 345 / Ilimitado
- Armazenamento: 8.3 GB / 50 GB
- Válido até: 14/12/2025

**Actions**:
- "⬆️ Fazer Upgrade" button
- "📄 Ver Histórico de Pagamentos" link
- "🔑 Gerenciar Código de Ativação" button

**Código de Ativação**:
- Display current activation code
- Expiration date
- "Renovar Código" button (for plan renewals)

---
### 4.12 Sobre (About)
**Access**: All users

**Display**:
- Versão do Sistema: 1.0.0 (Alaska)
- Última Atualização: 24/11/2025
- Links:
  - Termos de Uso (opens modal)
  - Política de Privacidade (opens modal)
  - Central de Ajuda (external link)
  - Contatar Suporte (opens chat or email)

---
## 5. Visual Design Notes

### 5.1 Sidebar Menu
- **Selected Item**: Primary color background (#0A3D62), white text
- **Hover**: Light gray background (#F5F7FA)
- **Icons**: 20 px, consistent style (outline icons from Heroicons or similar)

### 5.2 Content Area
- **Maximum Width**: 1200 px (centered)
- **Section Headers**: 24 px, weight 600
- **Form Spacing**: 24 px between sections, 16 px between fields

### 5.3 Buttons
- **Primary**: Background #0A3D62, white text
- **Secondary**: Border #0A3D62, transparent background, primary text
- **Danger**: Background #DC3545 (for delete actions)

### 5.4 Tables
- **Header**: Background #F5F7FA, 14 px weight 600
- **Rows**: Alternate background (white / #FAFAFA)
- **Actions**: Icon buttons (edit, delete, toggle)

---
## 6. Responsive Behavior
- **Desktop** (≥1024 px): Sidebar visible, full layout
- **Tablet** (768–1023 px): Collapsible sidebar
- **Mobile** (< 768 px): Hamburger menu, stacked layout

---
*Document version 1.0 – 2025‑11‑24*
