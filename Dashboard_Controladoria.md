# Dashboard_Controladoria.md

## Overview
This document describes the **Controladoria Dashboard** mockup for monitoring and controlling process flow progress across the entire law firm in VOB.

---
## 1. Purpose
The Controladoria (Controller) Dashboard provides a centralized view for:
- Tracking how many processes are in each flow step
- Identifying bottlenecks and overdue steps
- Monitoring lawyer productivity
- Validating step transitions
- Generating strategic reports

---
## 2. Access & Permissions
- **Location**: Main navigation → "Controladoria" (new menu item)
- **Who can access**: Users with `controller` or `admin` role
- **Default behavior**: Opens to the main dashboard view

---
## 3. Layout Structure

### 3.1 Top Bar (Filters)
- **Flowchart Selector**: Dropdown to filter by specific flowchart (or "All")
- **Responsible Lawyer**: Dropdown to filter by lawyer (or "All")
- **Date Range**: Date picker for custom range (default: last 30 days)
- **"Aplicar Filtros"** button (primary color)
- **"Exportar Relatório"** button (secondary, exports to PDF or Excel)

### 3.2 Summary Cards Row
Four cards displaying key metrics:

#### Card 1: Processos em Andamento
- **Icon**: ⚖️ (scales)
- **Value**: Total count of processes currently in flow
- **Subtitle**: "Processos ativos no fluxo"
- **Color**: Blue background

#### Card 2: Etapas Atrasadas
- **Icon**: ⏰ (alarm clock)
- **Value**: Count of processes past their internal deadline
- **Subtitle**: "Requerem atenção imediata"
- **Color**: Red/Warning background

#### Card 3: Concluídos (Período)
- **Icon**: ✅ (checkmark)
- **Value**: Processes completed in selected date range
- **Subtitle**: "Processos finalizados"
- **Color**: Green background

#### Card 4: Tempo Médio por Etapa
- **Icon**: ⏱️ (stopwatch)
- **Value**: Average days per step
- **Subtitle**: "Média do escritório"
- **Color**: Gray background

---
### 3.3 Main Content Area (Grid Layout)

#### Widget 1: Processos por Etapa (Bar Chart)
- **Title**: "Distribuição de Processos por Etapa"
- **Chart Type**: Horizontal bar chart
- **X-axis**: Count of processes
- **Y-axis**: Flow step names
- **Color Coding**:
  - Blue: On track
  - Red: Overdue
- **Interaction**: Click bar → view list of processes in that step
- **Library**: Recharts or Chart.js

#### Widget 2: Gargalos do Fluxo (Table)
- **Title**: "Etapas com Maior Tempo Médio"
- **Columns**: Etapa | Tempo Médio (dias) | Processos Atuais
- **Sorting**: Descending by average time
- **Purpose**: Identify bottlenecks

#### Widget 3: Produtividade por Advogado (Bar Chart)
- **Title**: "Processos Movimentados por Advogado"
- **Chart Type**: Vertical bar chart
- **X-axis**: Lawyer names
- **Y-axis**: Count of step transitions in period
- **Color**: Primary color
- **Interaction**: Click bar → view lawyer's active processes

#### Widget 4: Atividade Recente (Timeline)
- **Title**: "Movimentações Recentes"
- **Format**: Vertical timeline list
- **Each Entry**:
  - Timestamp
  - Process name/number
  - From step → To step
  - Responsible user
  - Icon (arrow or checkmark)
- **Limit**: Last 10 transitions
- **Interaction**: Click entry → open process detail

---
### 3.4 Optional: Kanban View Toggle
- **Toggle Button**: "Visualização Kanban" (switch from dashboard to kanban)
- **Kanban Layout**:
  - Columns = flow steps
  - Cards = processes (title, client, responsible)
  - Drag-and-drop to move processes (if controller has permission)
- **Use Case**: Visual flow management

---
## 4. Interactive Elements

### 4.1 Drill-Down Actions
- Click on any chart element → navigate to filtered process list
- Click on process in timeline → open process detail page
- Hover over bar → show tooltip with exact count

### 4.2 Real-Time Updates (Optional)
- Use WebSocket or polling to update dashboard every 30 seconds
- Show badge notification when new processes enter controller's validation queue

### 4.3 Export Functionality
- "Exportar Relatório" generates PDF with:
  - Summary cards snapshot
  - All charts as images
  - Detailed table of processes by step
  - Timestamp and filters applied

---
## 5. Color Palette (Consistent with VOB Branding)
| Element | Color |
|---------|-------|
| Primary (bars, buttons) | #0A3D62 |
| Success (completed) | #28A745 |
| Warning (at risk) | #FFC107 |
| Danger (overdue) | #DC3545 |
| Background | #F5F7FA |
| Card background | #FFFFFF |
| Text | #212529 |

---
## 6. Typography
- **Headers (card titles, widget titles)**: 18 px, weight 600, Inter
- **Metrics (large numbers)**: 32 px, weight 700, Inter
- **Subtitles**: 14 px, weight 400, gray (#6C757D)
- **Chart labels**: 12 px, weight 400

---
## 7. Responsive Behavior
- **Desktop (≥ 1920 px)**: 2 × 2 grid for widgets
- **Tablet (768–1919 px)**: 1 × 4 stacked widgets
- **Mobile**: Not primary target, but summary cards should stack vertically

---
## 8. Data Sources & Queries

### 8.1 Summary Card Queries
```sql
-- Processos em Andamento
SELECT COUNT(*) FROM process_flow_state WHERE is_completed = FALSE;

-- Etapas Atrasadas
SELECT COUNT(*) FROM process_flow_state pfs
JOIN flow_steps fs ON pfs.current_step_id = fs.id
WHERE pfs.is_completed = FALSE
AND (pfs.started_at + (fs.deadline_days || ' days')::INTERVAL) < NOW();

-- Concluídos
SELECT COUNT(*) FROM process_flow_state
WHERE is_completed = TRUE
AND completed_at >= :start_date AND completed_at <= :end_date;

-- Tempo Médio por Etapa
SELECT AVG(
  EXTRACT(EPOCH FROM (fh2.timestamp - fh1.timestamp)) / 86400
) AS avg_days
FROM flow_history fh1
JOIN flow_history fh2 ON fh1.process_id = fh2.process_id
  AND fh1.to_step_id = fh2.from_step_id;
```

### 8.2 Bar Chart Query (Processos por Etapa)
```sql
SELECT fs.name, COUNT(*) AS count
FROM process_flow_state pfs
JOIN flow_steps fs ON pfs.current_step_id = fs.id
WHERE pfs.is_completed = FALSE
GROUP BY fs.name
ORDER BY count DESC;
```

### 8.3 Timeline Query (Atividade Recente)
```sql
SELECT fh.*, p.name AS process_name, u.name AS user_name,
  fs_from.name AS from_step_name, fs_to.name AS to_step_name
FROM flow_history fh
JOIN processes p ON fh.process_id = p.id
JOIN auth.users u ON fh.user_id = u.id
LEFT JOIN flow_steps fs_from ON fh.from_step_id = fs_from.id
LEFT JOIN flow_steps fs_to ON fh.to_step_id = fs_to.id
ORDER BY fh.timestamp DESC
LIMIT 10;
```

---
## 9. Mockup Checklist for Figma
- [ ] Create 4 summary cards with icons and colors
- [ ] Design horizontal bar chart component
- [ ] Design table widget with sortable columns
- [ ] Design timeline list with icons
- [ ] Add filter bar at top
- [ ] Add export button
- [ ] Create kanban view alternative (optional)
- [ ] Add hover states for interactive elements
- [ ] Export as PDF and as SVG components

---
## 10. Implementation Notes
- Use **React Query** or **SWR** for data fetching with automatic refetch
- Implement **skeleton loaders** while charts are loading
- Use **Recharts** for bar charts (easier tooltip customization)
- Store filter state in URL query params for shareable links
- Add **permissions check** on backend: only controllers can access dashboard endpoint

---
*Document version 1.0 – 2025‑11‑24*
