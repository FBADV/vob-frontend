# Permissions_Diagram.md

## User Roles & Permissions Hierarchy – VOB

This document provides visual diagrams and comprehensive permission matrices for the VOB user roles system.

---
## 1. Role Hierarchy

```mermaid
graph TD
    A["👑 Administrador<br/>(Owner)"]
    B["👨‍💼 Advogado Associado<br/>(Senior Lawyer)"]
    C["👨‍⚖️ Advogado Colaborador<br/>(Lawyer)"]
    D["📋 Colaborador<br/>(Assistant)"]
    E["📚 Estagiário<br/>(Intern)"]
    F["🔍 Controlador<br/>(Controller)"]
    G["👤 Cliente<br/>(Client - External)"]
    
    A --> B
    A --> F
    B --> C
    C --> D
    D --> E
    
    style A fill:#dc3545,stroke:#a71d2a,color:#fff
    style B fill:#0a3d62,stroke:#062638,color:#fff
    style C fill:#1e8449,stroke:#145a32,color:#fff
    style D fill:#f1c40f,stroke:#c29d0b,color:#333
    style E fill:#95a5a6,stroke:#7f8c8d,color:#fff
    style F fill:#e67e22,stroke:#ca6f1e,color:#fff
    style G fill:#3498db,stroke:#2874a6,color:#fff
```

---
## 2. Permission Modules

```mermaid
graph LR
    subgraph "Core Modules"
        P[Processos]
        C[Clientes]
        A[Atendimentos]
        T[Tarefas]
        AG[Agendamentos]
        D[Documentos]
    end
    
    subgraph "Administrative"
        S[Configurações]
        U[Usuários]
        FL[Fluxograma]
        F[Financeiro]
    end
    
    subgraph "Control"
        CT[Controladoria]
        R[Relatórios]
    end
    
    subgraph "External"
        CL[Portal do Cliente]
    end
```

---
## 3. Detailed Permission Matrix

### 3.1 Administrador (Admin)
| Module | Create | Read | Update | Delete | Special |
|--------|--------|------|--------|--------|---------|
| Processos | ✅ | ✅ | ✅ | ✅ | All processes |
| Clientes | ✅ | ✅ | ✅ | ✅ | All clients |
| Atendimentos | ✅ | ✅ | ✅ | ✅ | All records |
| Tarefas | ✅ | ✅ | ✅ | ✅ | All tasks |
| Agendamentos | ✅ | ✅ | ✅ | ✅ | All events |
| Documentos | ✅ | ✅ | ✅ | ✅ | All docs |
| Configurações | ✅ | ✅ | ✅ | ✅ | Full access |
| Usuários | ✅ | ✅ | ✅ | ✅ | Create/disable |
| Fluxograma | ✅ | ✅ | ✅ | ✅ | Create/edit flows |
| Financeiro | ✅ | ✅ | ✅ | ✅ | Full control |
| Controladoria | ❌ | ✅ | ❌ | ❌ | View only |
| Portal Cliente | ✅ | ✅ | ✅ | ✅ | Enable/disable |

### 3.2 Advogado Associado (Senior Lawyer)
| Module | Create | Read | Update | Delete | Special |
|--------|--------|------|--------|--------|---------|
| Processos | ✅ | ✅ | ✅ | ✅ | All processes |
| Clientes | ✅ | ✅ | ✅ | ✅ | All clients |
| Atendimentos | ✅ | ✅ | ✅ | ✅ | All records |
| Tarefas | ✅ | ✅ | ✅ | ✅ | All tasks |
| Agendamentos | ✅ | ✅ | ✅ | ✅ | All events |
| Documentos | ✅ | ✅ | ✅ | ✅ | All docs |
| Configurações | ❌ | ✅ | ❌ | ❌ | View only |
| Usuários | ❌ | ✅ | ❌ | ❌ | View only |
| Fluxograma | ❌ | ✅ | ❌ | ❌ | View only |
| Financeiro | ✅ | ✅ | ✅ | ❌ | Restricted |
| Controladoria | ❌ | ✅ | ❌ | ❌ | Partial view |
| Portal Cliente | ❌ | ✅ | ❌ | ❌ | View only |

### 3.3 Advogado Colaborador (Lawyer)
| Module | Create | Read | Update | Delete | Special |
|--------|--------|------|--------|--------|---------|
| Processos | ✅ | ✅* | ✅* | ❌ | Own processes only |
| Clientes | ✅ | ✅* | ✅* | ❌ | Own clients only |
| Atendimentos | ✅ | ✅ | ✅ | ❌ | Own records |
| Tarefas | ✅ | ✅ | ✅ | ✅ | Own tasks |
| Agendamentos | ✅ | ✅ | ✅ | ✅ | Own events |
| Documentos | ✅ | ✅* | ✅* | ❌ | Related docs only |
| Configurações | ❌ | ❌ | ❌ | ❌ | No access |
| Usuários | ❌ | ❌ | ❌ | ❌ | No access |
| Fluxograma | ❌ | ✅ | ❌ | ❌ | View only |
| Financeiro | ❌ | ❌ | ❌ | ❌ | No access |
| Controladoria | ❌ | ❌ | ❌ | ❌ | No access |
| Portal Cliente | ❌ | ❌ | ❌ | ❌ | No access |

*Only for items where user is assigned

### 3.4 Colaborador (Assistant)
| Module | Create | Read | Update | Delete | Special |
|--------|--------|------|--------|--------|---------|
| Processos | ⚠️ | ✅* | ✅* | ❌ | If enabled by admin |
| Clientes | ✅ | ✅ | ✅ | ❌ | Basic access |
| Atendimentos | ✅ | ✅ | ✅ | ❌ | All records |
| Tarefas | ✅ | ✅ | ✅ | ✅ | Own tasks |
| Agendamentos | ✅ | ✅ | ✅ | ❌ | Basic access |
| Documentos | ✅ | ✅* | ✅* | ❌ | Related only |
| Configurações | ❌ | ❌ | ❌ | ❌ | No access |
| Usuários | ❌ | ❌ | ❌ | ❌ | No access |
| Fluxograma | ❌ | ✅ | ❌ | ❌ | View only |
| Financeiro | ⚠️ | ⚠️ | ⚠️ | ❌ | If enabled by admin |
| Controladoria | ❌ | ❌ | ❌ | ❌ | No access |
| Portal Cliente | ❌ | ❌ | ❌ | ❌ | No access |

⚠️ = Requires explicit admin permission

### 3.5 Estagiário (Intern)
| Module | Create | Read | Update | Delete | Special |
|--------|--------|------|--------|--------|---------|
| Processos | ❌ | ✅* | ❌ | ❌ | Assigned only, read-only |
| Clientes | ❌ | ✅* | ❌ | ❌ | Related only, read-only |
| Atendimentos | ⚠️ | ✅* | ❌ | ❌ | Basic, if enabled |
| Tarefas | ✅ | ✅* | ✅* | ❌ | Own tasks only |
| Agendamentos | ❌ | ✅* | ❌ | ❌ | View only |
| Documentos | ✅* | ✅* | ❌ | ❌ | Upload to assigned cases |
| Configurações | ❌ | ❌ | ❌ | ❌ | No access |
| Usuários | ❌ | ❌ | ❌ | ❌ | No access |
| Fluxograma | ❌ | ❌ | ❌ | ❌ | No access |
| Financeiro | ❌ | ❌ | ❌ | ❌ | No access |
| Controladoria | ❌ | ❌ | ❌ | ❌ | No access |
| Portal Cliente | ❌ | ❌ | ❌ | ❌ | No access |

*Extremely limited scope

### 3.6 Controlador (Controller)
| Module | Create | Read | Update | Delete | Special |
|--------|--------|------|--------|--------|---------|
| Processos | ❌ | ✅ | ❌ | ❌ | View all, no edit |
| Clientes | ❌ | ✅ | ❌ | ❌ | View all |
| Atendimentos | ❌ | ✅ | ❌ | ❌ | View all |
| Tarefas | ✅ | ✅ | ✅ | ❌ | Control tasks |
| Agendamentos | ❌ | ✅ | ❌ | ❌ | View all |
| Documentos | ❌ | ✅ | ❌ | ❌ | View all |
| Configurações | ❌ | ❌ | ❌ | ❌ | No access |
| Usuários | ❌ | ✅ | ❌ | ❌ | View only |
| Fluxograma | ❌ | ✅ | ✅ | ❌ | Control flow steps |
| Financeiro | ❌ | ❌ | ❌ | ❌ | No access |
| Controladoria | ✅ | ✅ | ✅ | ❌ | Full dashboard access |
| Portal Cliente | ❌ | ❌ | ❌ | ❌ | No access |

### 3.7 Cliente (Client - External)
| Module | Create | Read | Update | Delete | Special |
|--------|--------|------|--------|--------|---------|
| Processos | ❌ | ✅* | ❌ | ❌ | Own cases only |
| Clientes | ❌ | ✅* | ❌ | ❌ | Own data only |
| Atendimentos | ❌ | ✅* | ❌ | ❌ | Own records only |
| Tarefas | ❌ | ❌ | ❌ | ❌ | No access |
| Agendamentos | ❌ | ❌ | ❌ | ❌ | No access |
| Documentos | ❌ | ✅* | ❌ | ❌ | Approved docs only |
| Configurações | ❌ | ❌ | ❌ | ❌ | No access |
| Usuários | ❌ | ❌ | ❌ | ❌ | No access |
| Fluxograma | ❌ | ❌ | ❌ | ❌ | No access |
| Financeiro | ❌ | ❌ | ❌ | ❌ | No access |
| Controladoria | ❌ | ❌ | ❌ | ❌ | No access |
| Portal Cliente | ❌ | ✅ | ❌ | ❌ | Own portal only |

**100% read-only access to own data**

---
## 4. Access Control Flow

```mermaid
flowchart TD
    Start([User Login]) --> Auth{Authenticated?}
    Auth -->|No| Reject[Access Denied]
    Auth -->|Yes| RoleCheck{Check Role}
    
    RoleCheck -->|Admin| AdminAccess[Full Access]
    RoleCheck -->|Associado| AssociadoAccess[Senior Access]
    RoleCheck -->|Colaborador Adv| LawyerAccess[Lawyer Access]
    RoleCheck -->|Colaborador| AssistantAccess[Assistant Access]
    RoleCheck -->|Estagiário| InternAccess[Intern Access]
    RoleCheck -->|Controlador| ControllerAccess[Controller Access]
    RoleCheck -->|Cliente| ClientAccess[Client Portal]
    
    AdminAccess --> Action{Action Type}
    AssociadoAccess --> Action
    LawyerAccess --> Action
    AssistantAccess --> Action
    InternAccess --> Action
    ControllerAccess --> Action
    ClientAccess --> ReadOnly[Read-Only Access]
    
    Action -->|View| PermCheck1{Has View<br/>Permission?}
    Action -->|Create| PermCheck2{Has Create<br/>Permission?}
    Action -->|Edit| PermCheck3{Has Update<br/>Permission?}
    Action -->|Delete| PermCheck4{Has Delete<br/>Permission?}
    
    PermCheck1 -->|Yes| ScopeCheck1{Within Scope?}
    PermCheck2 -->|Yes| ScopeCheck2{Within Scope?}
    PermCheck3 -->|Yes| ScopeCheck3{Within Scope?}
    PermCheck4 -->|Yes| ScopeCheck4{Within Scope?}
    
    PermCheck1 -->|No| Deny[Access Denied]
    PermCheck2 -->|No| Deny
    PermCheck3 -->|No| Deny
    PermCheck4 -->|No| Deny
    
    ScopeCheck1 -->|Yes| Allow[Action Allowed]
    ScopeCheck2 -->|Yes| Allow
    ScopeCheck3 -->|Yes| Allow
    ScopeCheck4 -->|Yes| Allow
    
    ScopeCheck1 -->|No| Deny
    ScopeCheck2 -->|No| Deny
    ScopeCheck3 -->|No| Deny
    ScopeCheck4 -->|No| Deny
    
    ReadOnly --> Allow
```

---
## 5. Summary Table: Quick Reference

| Role | Level | Config Access | User Mgmt | Flowchart | Finance | Controladoria | Client Portal |
|------|-------|---------------|-----------|-----------|---------|---------------|---------------|
| Administrador | 🔴 Highest | ✅ Full | ✅ Full | ✅ Create/Edit | ✅ Full | 👁️ View | ✅ Manage |
| Advogado Associado | 🟠 High | 👁️ View | 👁️ View | 👁️ View | ⚠️ Partial | 👁️ Partial | 👁️ View |
| Advogado Colaborador | 🟡 Medium | ❌ None | ❌ None | 👁️ View | ❌ None | ❌ None | ❌ None |
| Colaborador | 🟢 Low-Med | ❌ None | ❌ None | 👁️ View | ⚠️ Optional | ❌ None | ❌ None |
| Estagiário | 🔵 Low | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None |
| Controlador | 🟣 Special | ❌ None | 👁️ View | ✅ Control | ❌ None | ✅ Full | ❌ None |
| Cliente | ⚪ External | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | 👁️ Own Only |

**Legend:**
- ✅ Full Access
- 👁️ View Only
- ⚠️ Conditional/Partial
- ❌ No Access

---
*Document version 1.0 – 2025‑11‑24*
