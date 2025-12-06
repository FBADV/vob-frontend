# SRS_Flowchart.md

## 1. Introduction
This Software Requirements Specification (SRS) defines the functional and non‑functional requirements for the **Flowchart Registration Module** in Virtual Office Brazil (VOB).

## 2. Scope
- Administrative interface for creating, editing, and managing procedural flowcharts
- Visual editor for defining flow steps, dependencies, and conditional paths
- Integration with Cases/Processes module for flow execution
- Control dashboard for monitoring flow progress across all processes
- Permission-based access control

## 3. Functional Requirements

### 3.1 Location & Access
- **Module Path**: Settings → Fluxograma Processual
- **Permissions**: Only administrators or users with specific flowchart management permission can access

### 3.2 Flowchart Management (CRUD)

#### 3.2.1 Create Flowchart
- User can create a new flowchart with:
  - **Name** (e.g., "Fluxo Trabalhista", "Fluxo Administrativo")
  - **Description**
  - **Type**: Unique (default for all processes), By Legal Area, By Case Type, By Client
  - **Active/Inactive** status

#### 3.2.2 Flow Step Definition
Each step in a flowchart contains:
- **Step Name** (e.g., "Análise inicial", "Elaboração da peça")
- **Description**
- **Estimated Internal Deadline** (optional, in days)
- **Default Responsible** (role: lawyer, controller, assistant, etc.)
- **Automatic Status** (optional)
- **Dependencies** (which steps must be completed before this one)
- **Triggers/Automations** (optional: notifications, task creation)
- **Mandatory/Optional** flag
- **Internal Checklist** (sub-tasks belonging to this step)
- **Order** (sequence number)

#### 3.2.3 Visual Editor
- Drag-and-drop interface to reorder steps
- Add/remove steps
- Define conditional paths (e.g., "if case type = labor → flow X")
- Visual tree or timeline representation
- Connect dependencies between steps

#### 3.2.4 Edit & Delete
- Modify existing flowcharts and steps
- Delete flowcharts (only if not in use by active processes)
- Archive/deactivate flowcharts

### 3.3 Integration with Cases/Processes Module

#### 3.3.1 Process Creation
- When creating a new process, user selects which flowchart to apply
- If only one active flowchart exists, it's auto-applied
- System creates initial flow state: process starts at Step 1

#### 3.3.2 Flow Execution Tab
Within each process, add a new tab: **"Fluxo Processual"** displaying:
- Current step name and description
- Current responsible person
- Internal checklist for current step
- Internal deadline countdown
- **"Mover para a próxima etapa"** button
- **"Voltar etapa"** button (optional, configurable)
- Flow history log (who moved, when, from/to which step)

#### 3.3.3 Step Transitions
- User clicks "Mover para a próxima etapa"
- System validates dependencies are met
- System moves process to next step
- System logs transition (user, timestamp, from/to)
- System triggers notifications/automations if configured

#### 3.3.4 Final Step Handling
When process reaches the last step:
- System suggests internal closure
- Options: generate final report, archive, notify client
- Mark process as internally complete

### 3.4 Control Dashboard (Controladoria Module)

#### 3.4.1 Dashboard Location
- New menu item: **Controladoria** (if user has controller permission)
- Dashboard displays aggregate flow statistics

#### 3.4.2 Dashboard Widgets
- **Processes by Step**: count of processes in each step (bar chart or list)
- **Overdue Steps**: processes past their internal deadline
- **Completed Processes**: total count
- **Pending Validations**: steps requiring controller approval
- **Filters**: by responsible lawyer, by flowchart, by date range
- **Visualization Modes**: Kanban, Timeline, List
- **Alerts**: internal notifications for stuck processes

Example:
```
Análise Inicial: 12 processes
Elaboração de Peça: 7 processes
Revisão da Controladoria: 3 processes (1 overdue)
Concluídos: 15 processes
```

### 3.5 Notifications & Automations
- Notify responsible when process enters their step
- Alert when internal deadline is approaching
- Alert when step is overdue
- Trigger task creation for step checklist items

### 3.6 Reports
Generate management reports:
- Average time per step
- Bottlenecks (steps with longest average duration)
- Lawyer productivity (processes moved per period)
- Stuck processes (no movement in X days)

## 4. Non‑Functional Requirements

### 4.1 Performance
- Flowchart editor loads ≤ 1 second
- Step transitions commit ≤ 500 ms
- Dashboard refreshes ≤ 2 seconds

### 4.2 Usability
- Intuitive drag-and-drop interface
- Visual feedback for all actions
- Tooltips and help text
- Responsive design (desktop and tablet)

### 4.3 Security
- Role-based access control (RBAC)
- Audit log for all flowchart modifications
- Only authorized users can transition steps

### 4.4 Data Integrity
- Foreign key constraints between processes and flowcharts
- Cascade rules: if flowchart is deleted, warn about dependent processes
- Version control: track flowchart changes over time

## 5. Data Model Overview

### 5.1 Tables
- `flowcharts`: id, name, description, type, active, created_at, updated_at
- `flow_steps`: id, flowchart_id, name, description, order, deadline_days, responsible_role, mandatory, checklist_json, created_at
- `flow_dependencies`: id, step_id, depends_on_step_id
- `process_flow_state`: id, process_id, flowchart_id, current_step_id, started_at, completed_at
- `flow_history`: id, process_id, from_step_id, to_step_id, user_id, timestamp

### 5.2 Relationships
- `flow_steps.flowchart_id` → `flowcharts.id`
- `flow_dependencies.step_id` → `flow_steps.id`
- `process_flow_state.flowchart_id` → `flowcharts.id`
- `process_flow_state.current_step_id` → `flow_steps.id`

## 6. User Roles & Permissions

| Role | Create/Edit Flowchart | Move Step | View Dashboard |
|------|----------------------|-----------|----------------|
| Administrator | ✅ | ✅ | ✅ |
| Controller | ❌ | ✅ (validation only) | ✅ |
| Lawyer | ❌ | ✅ (own processes) | ❌ |
| Assistant | ❌ | ❌ | ❌ |

## 7. Acceptance Criteria
- Administrators can create flowcharts with multiple steps
- Visual editor allows drag-and-drop reordering
- Processes can be assigned a flowchart on creation
- Process detail page shows current flow step
- Users can advance processes through steps
- Control dashboard displays aggregate statistics
- Notifications are sent when steps change
- All actions are logged in flow_history

---
*Document version 1.0 – 2025‑11‑24*
