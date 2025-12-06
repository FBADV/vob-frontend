# SRS_User_Roles.md

## 1. Introduction
This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the **User Roles & Permissions System** in Virtual Office Brazil (VOB).

## 2. Scope
- Seven distinct user roles with hierarchical permissions
- Role-Based Access Control (RBAC) implementation
- User management interface for administrators
- Client portal access management
- Granular permissions for all system modules
- Audit logging for permission changes

## 3. User Roles Definition

### 3.1 Administrador (Administrator)
**Description**: Highest-level user with full system control. Typically the law firm owner or managing partner.

**Capabilities**:
- Create, read, update, delete (CRUD) on all entities
- Access and modify all system configurations
- Manage user accounts (create, edit, disable)
- Define and edit flowcharts
- Full financial access
- View controladoria dashboard
- Enable/disable client portal access
- Assign permissions to other users

**Restrictions**: None

---
### 3.2 Advogado Associado (Senior Lawyer)
**Description**: High-level lawyer with broad access but limited administrative capabilities.

**Capabilities**:
- CRUD on all processes, clients, atendimentos, tasks, events
- View system configurations (read-only)
- View user list (read-only)
- View flowcharts (read-only)
- Partial financial access (view/edit, no delete)
- Partial view of controladoria dashboard
- View client portal settings (read-only)

**Restrictions**:
- Cannot modify system configurations
- Cannot create/delete users
- Cannot create/edit flowcharts
- Cannot manage client portal access
- Cannot delete financial records

---
### 3.3 Advogado Colaborador (Collaborating Lawyer)
**Description**: Lawyer with access restricted to assigned cases and clients.

**Capabilities**:
- CRUD on processes where assigned as responsible
- CRUD on clients where assigned
- Create atendimentos, tasks, events
- View flowcharts (read-only)
- Move flow steps (if permitted by admin)
- Upload/view documents for assigned cases

**Restrictions**:
- No access to system configurations
- No user management
- No flowchart editing
- No financial access
- No controladoria access
- Can only see assigned cases/clients

---
### 3.4 Colaborador (Non-Lawyer Assistant)
**Description**: Administrative or legal assistant supporting lawyers.

**Capabilities**:
- Create atendimentos
- Create tasks (own tasks only)
- View/create clients (basic access)
- Make financial entries (if explicitly enabled)
- Access processes (if explicitly enabled)
- View flowcharts (read-only)

**Restrictions**:
- Cannot create processes by default (requires admin permission)
- Cannot edit flowcharts
- Cannot manage users
- Cannot access sensitive configurations
- No controladoria access
- Financial access requires explicit permission

---
### 3.5 Estagiário (Intern)
**Description**: Law student or trainee with minimal, supervised access.

**Capabilities**:
- View assigned processes (read-only)
- View related clients (read-only)
- Create internal tasks
- Upload documents to assigned cases (if permitted)
- View assigned tasks

**Restrictions**:
- Cannot create processes
- Cannot edit processes
- Cannot access financial data
- Cannot edit flowcharts or configurations
- Cannot create or edit clients
- Cannot send external communications
- Extremely limited scope

---
### 3.6 Controlador (Controller)
**Description**: Specialized role for legal operations control and monitoring.

**Capabilities**:
- View all processes (read-only)
- View all clients, atendimentos, tasks, events
- Control flow step transitions (validate/reject)
- Full access to controladoria dashboard
- Create control reports
- Monitor internal deadlines
- View user list (read-only)
- View flowcharts and control step movements

**Restrictions**:
- Cannot edit system configurations
- Cannot create flowcharts (only control existing ones)
- Cannot create/manage users
- No financial access
- Cannot modify process data directly

---
### 3.7 Cliente (Client - External User)
**Description**: Law firm client with restricted portal access to view own cases.

**Authentication**:
- Login: CPF
- Password: User-defined

**Capabilities**:
- View own client profile
- View own processes
- View process current status
- View court information (vara, number, start date)
- View latest courtroom updates (movimentações)
- View complete imported court records
- View documents approved for client view

**Restrictions**:
- **100% read-only access**
- Cannot edit any data
- Cannot create processes, tasks, or atendimentos
- Cannot delete documents
- Cannot access other clients' data
- Cannot access internal firm operations
- Cannot send internal communications
- Cannot view dashboard or reports

---
## 4. Functional Requirements

### 4.1 User Management (Settings → Usuários)

#### 4.1.1 Create User
- **Who**: Administrator only
- **Fields**:
  - Nome completo
  - E-mail (login)
  - CPF
  - Telefone
  - Nível hierárquico (dropdown: roles 1-6)
  - Permissões especiais (optional checkboxes for granular permissions)
  - Status (Ativo/Inativo)
- **Process**:
  1. Admin fills form
  2. System validates CPF and e-mail uniqueness
  3. System generates temporary password (sent via email)
  4. User account created with selected role
  5. Audit log entry created

#### 4.1.2 Edit User
- **Who**: Administrator only
- **Actions**:
  - Change role
  - Toggle special permissions
  - Activate/deactivate account
  - Reset password
- **Restrictions**: Admin cannot delete own account

#### 4.1.3 View Users
- **Who**: Administrator, Advogado Associado (read-only), Controlador (read-only)
- **Display**: Table with filters (role, status, search)

#### 4.1.4 Delete/Deactivate User
- **Who**: Administrator only
- **Behavior**: Soft delete (mark as inactive, retain data for audit)

---
### 4.2 Client Portal Access (Settings → Acesso do Cliente)

#### 4.2.1 Enable Client Access
- **Who**: Administrator, Advogado Associado (if permitted)
- **Process**:
  1. Navigate to client record
  2. Click "Habilitar Acesso ao Portal"
  3. System generates credentials:
     - Login: Client CPF
     - Temporary password (sent via SMS or email)
  4. Client receives notification with access instructions
  5. Client forced to change password on first login

#### 4.2.2 Configure Client Permissions
- **Who**: Administrator
- **Options**:
  - Which processes are visible
  - Which documents are accessible
  - Enable/disable specific features (e.g., download documents)

#### 4.2.3 Revoke Client Access
- **Who**: Administrator
- **Process**:
  1. Click "Revogar Acesso"
  2. Confirm action
  3. Client account disabled immediately
  4. Audit log entry created

---
### 4.3 Permission Checks (Backend Logic)

#### 4.3.1 Middleware Structure
```
Request → Authentication → Role Check → Permission Check → Scope Check → Action
```

#### 4.3.2 Permission Types
- **View**: Read access
- **Create**: Insert new records
- **Update**: Modify existing records
- **Delete**: Remove records
- **Special**: Custom permissions (e.g., "move flow step", "approve expense")

#### 4.3.3 Scope Filtering
- **Global**: All records (Admin, Controlador for view)
- **Assigned**: Only records where user is responsible (Advogado Colaborador)
- **Own**: Only user's own records (Estagiário, Colaborador for tasks)
- **Client**: Only client's own data (Cliente)

---
### 4.4 Audit Logging

#### 4.4.1 Logged Events
- User creation/deletion
- Role changes
- Permission changes
- Client portal enable/disable
- Failed login attempts
- Unauthorized access attempts

#### 4.4.2 Audit Log Table
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  user_id UUID,
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

---
## 5. Non-Functional Requirements

### 5.1 Security
- Passwords hashed with bcrypt (min cost factor 12)
- Session timeout: 30 minutes of inactivity
- HTTPS only
- CSRF protection on all forms
- Rate limiting on login attempts (5 attempts per 15 min)
- Two-factor authentication (optional, for administrators)

### 5.2 Performance
- Permission check ≤ 50 ms
- User list load ≤ 1 second (for 100 users)
- Scope filtering applied at database level (indexed queries)

### 5.3 Usability
- Clear role descriptions in UI
- Permission tooltips explaining capabilities
- Visual indicators (icons, colors) for role levels
- Responsive design for mobile access (client portal)

### 5.4 Compliance
- LGPD compliance (Brazilian data protection law)
- Audit trail retention: 5 years
- User consent for data processing
- Right to data portability and deletion

---
## 6. Data Model

### 6.1 Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL,
  special_permissions JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  password_hash VARCHAR(255) NOT NULL,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_users_email ON users(email);
```

### 6.2 Client Portal Access Table
```sql
CREATE TABLE client_portal_access (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  enabled BOOLEAN DEFAULT FALSE,
  login VARCHAR(14) NOT NULL, -- CPF
  password_hash VARCHAR(255),
  visible_processes UUID[] DEFAULT '{}',
  accessible_documents UUID[] DEFAULT '{}',
  last_access TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id)
);
```

### 6.3 Permissions Table (for granular control)
```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  module VARCHAR(50) NOT NULL,
  can_view BOOLEAN DEFAULT FALSE,
  can_create BOOLEAN DEFAULT FALSE,
  can_update BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  scope VARCHAR(20) DEFAULT 'own', -- 'global', 'assigned', 'own'
  UNIQUE(role, module)
);
```

---
## 7. UI Specifications

### 7.1 Settings Menu Structure
```
Configurações
├── Geral
├── Usuários ← NEW
│   ├── Listar Usuários
│   ├── Adicionar Usuário
│   └── Permissões por Função
├── Acesso do Cliente ← NEW
│   ├── Configurar Portal
│   └── Clientes com Acesso
├── Fluxograma Processual
├── Integrações
├── Financeiro
└── Backup e Segurança
```

### 7.2 User List Page
- **Table Columns**: Nome, E-mail, Função, Status, Último Acesso, Ações
- **Filters**: Função, Status
- **Search**: By name or email
- **Actions**: Edit (pencil icon), Deactivate (toggle), Reset Password (key icon)

### 7.3 Add/Edit User Modal
- **Title**: "Adicionar Usuário" or "Editar Usuário"
- **Tabs**: Dados Básicos, Permissões, Histórico
- **Buttons**: Cancelar, Salvar

### 7.4 Client Portal Settings Page
- **Section 1**: Enable Portal (global toggle)
- **Section 2**: Default Permissions (checkboxes)
- **Section 3**: Client List (table with "Habilitar Acesso" button per row)

---
## 8. Acceptance Criteria
- All seven roles are implemented with correct permissions
- Administrators can create users and assign roles
- Permission checks block unauthorized actions
- Client portal access can be enabled/disabled per client
- Clients can log in and view only their own data
- Audit log records all permission-related changes
- UI clearly indicates user role and capabilities
- All pages enforce permission checks on both frontend and backend

---
*Document version 1.0 – 2025‑11‑24*
