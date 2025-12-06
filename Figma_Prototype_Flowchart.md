# Figma_Prototype_Flowchart.md

## Overview
This document provides design specifications for the Flowchart Registration module UI in VOB, including the settings editor, process flow tab, and control dashboard.

---
## 1. Pages / Frames

### 1.1 Settings → Fluxograma Processual (Editor)
- **Frame Size**: 1920 × 1080 (desktop)
- **Layout**: Left sidebar (flowchart list) + Main editor area

### 1.2 Process Detail → Fluxo Processual Tab
- **Frame Size**: 1920 × 1080 (desktop)
- **Layout**: Timeline/stepper component showing current position in flow

### 1.3 Controladoria Dashboard
- **Frame Size**: 1920 × 1080 (desktop)
- **Layout**: Grid of widgets (cards) with charts and statistics

---
## 2. Settings Editor Layout

### 2.1 Left Sidebar (Flowchart List)
- Width: 300 px
- Background: `#F5F7FA`
- **Header**: "Fluxogramas" + "+ Novo" button (primary color)
- **List Items**:
  - Flowchart name
  - Type badge (e.g., "Padrão", "Trabalhista")
  - Active/Inactive indicator (green dot / gray dot)
  - Click to select and edit

### 2.2 Main Editor Area
- **Top Bar**:
  - Flowchart name (editable inline)
  - Description (editable inline)
  - Type dropdown
  - Active/Inactive toggle
  - "Salvar" button (primary)
  
- **Flow Step List**:
  - Vertical timeline/stepper visualization
  - Each step displays:
    - Order number (1, 2, 3…)
    - Step name
    - Internal deadline badge (e.g., "3 dias")
    - Responsible role badge
    - Mandatory/Optional indicator
    - Edit icon, delete icon
    - Drag handle for reordering
  
- **Add Step Button**: "+ Adicionar Etapa" at the bottom

### 2.3 Step Edit Modal
- **Fields**:
  - Nome da etapa (text input)
  - Descrição (textarea)
  - Prazo interno (number input + "dias" suffix)
  - Responsável padrão (dropdown: Advogado, Controladoria, Assistente)
  - Status automático (optional text input)
  - Obrigatória (checkbox)
  - Dependências (multi-select dropdown of other steps)
  - Checklist interno (list editor: add/remove checklist items)
  - Gatilhos (optional: notification settings)
  
- **Buttons**: "Cancelar" (secondary), "Salvar" (primary)

---
## 3. Process Flow Tab Layout

### 3.1 Timeline/Stepper Component
- Horizontal stepper showing all flow steps
- Current step highlighted (primary color)
- Completed steps: checkmark icon, green color
- Future steps: gray color, dashed connector
- Click on a step to view details

### 3.2 Current Step Detail Card
- **Title**: Current step name
- **Fields**:
  - Descrição da etapa
  - Responsável atual (user avatar + name)
  - Prazo interno: "Vence em X dias" (countdown)
  - Checklist (checkboxes for sub-tasks)
  
- **Actions**:
  - "Mover para a próxima etapa" (primary button)
  - "Voltar etapa" (secondary button, optional)

### 3.3 Flow History Table
- Columns: Data/Hora, De, Para, Usuário, Observações
- Sortable by date
- Click row to view notes

---
## 4. Controladoria Dashboard Layout

### 4.1 Filters Bar
- Dropdowns: Fluxograma, Responsável, Data (range picker)
- "Aplicar Filtros" button

### 4.2 Widget Grid (2 × 2)

#### Widget 1: Processes by Step (Bar Chart)
- Title: "Processos por Etapa"
- Horizontal bar chart showing count per step
- Color-coded by overdue status (red = overdue, blue = on track)

#### Widget 2: Summary Cards
- Card 1: Total Processes in Flow
- Card 2: Overdue Steps (red background)
- Card 3: Completed This Month (green background)
- Card 4: Avg. Time per Step (days)

#### Widget 3: Kanban View (Optional)
- Columns = flow steps
- Cards = processes
- Drag-and-drop to move processes

#### Widget 4: Recent Activity Feed
- List of recent step transitions
- Click to view process detail

---
## 5. Color Palette (Branding)
| Role | Hex |
|------|-----|
| Primary | #0A3D62 |
| Secondary | #1E8449 |
| Accent | #F1C40F |
| Background | #F5F7FA |
| Text (primary) | #212529 |
| Text (secondary) | #6C757D |
| Success | #28A745 |
| Warning | #FFC107 |
| Danger | #DC3545 |

---
## 6. Typography
- **Font Family**: *Inter* (Google Fonts), weights 400, 500, 600
- **Headings**: 24 px, weight 600
- **Body**: 16 px, weight 400
- **Labels**: 14 px, weight 500

---
## 7. Components to Create
- **FlowchartList** (sidebar list item)
- **StepCard** (draggable step item in editor)
- **StepEditModal** (modal form)
- **FlowStepper** (horizontal timeline)
- **DashboardWidget** (card container)
- **BarChart** (Chart.js or Recharts)
- **KanbanColumn** (optional)

---
## 8. Interaction Notes
- **Drag-and-drop**: Use Figma's interactive component variants to show drag state
- **Hover**: Buttons and step cards change opacity (0.9)
- **Focus**: Input fields show primary color outline
- **Loading**: Show skeleton screens during data fetch
- **Validation**: Inline error messages below invalid fields

---
## 9. Export Settings
- Export frames as PDF for stakeholder review
- Export individual icons and components as SVG
- Use auto-layout for responsive behavior

---
*Document version 1.0 – 2025‑11‑24*
