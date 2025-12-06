# Implementation_Flowchart.md

## Overview
This guide provides architecture and implementation details for the **Flowchart Registration Module** in VOB across React (Vite), Node.js (backend API), and Flutter Web.

---
## 1. Architecture Overview

### 1.1 System Components
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React UI  │ ───► │  Node API   │ ───► │  Supabase   │
│   (Vite)    │ ◄─── │  (Express)  │ ◄─── │  (Postgres) │
└─────────────┘      └─────────────┘      └─────────────┘
      │                                           │
      └───────────────────────────────────────────┘
               Direct Supabase Client (optional)
```

### 1.2 Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js 18+ + Express + TypeScript
- **Database**: PostgreSQL (via Supabase)
- **State Management**: React Context + React Query
- **Drag-and-Drop**: `@dnd-kit/core`
- **Charts**: Recharts or Chart.js
- **Forms**: React Hook Form + Zod validation

---
## 2. Frontend Implementation (React + Vite)

### 2.1 Project Structure
```
src/
├── components/
│   ├── flowchart/
│   │   ├── FlowchartList.tsx
│   │   ├── FlowchartEditor.tsx
│   │   ├── StepCard.tsx
│   │   ├── StepEditModal.tsx
│   │   └── FlowStepper.tsx
│   ├── controladoria/
│   │   ├── Dashboard.tsx
│   │   ├── ProcessesByStepChart.tsx
│   │   ├── SummaryCards.tsx
│   │   └── KanbanView.tsx (optional)
│   └── shared/
│       ├── DragDropContext.tsx
│       └── ConfirmDialog.tsx
├── pages/
│   ├── Settings/
│   │   └── FlowchartSettings.tsx
│   ├── ProcessDetail/
│   │   └── FlowTab.tsx
│   └── Controladoria/
│       └── ControlDashboard.tsx
├── services/
│   ├── flowchart.service.ts
│   ├── processFlow.service.ts
│   └── supabase.ts
├── hooks/
│   ├── useFlowcharts.ts
│   ├── useProcessFlowState.ts
│   └── useFlowHistory.ts
└── types/
    └── flowchart.types.ts
```

### 2.2 Core Types (flowchart.types.ts)
```typescript
export interface Flowchart {
  id: string;
  name: string;
  description?: string;
  type: 'unique' | 'by_legal_area' | 'by_case_type' | 'by_client';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlowStep {
  id: string;
  flowchart_id: string;
  name: string;
  description?: string;
  step_order: number;
  deadline_days?: number;
  responsible_role?: string;
  automatic_status?: string;
  mandatory: boolean;
  checklist_json: ChecklistItem[];
  triggers_json: Trigger[];
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Trigger {
  type: 'notification' | 'task_creation';
  config: Record<string, any>;
}

export interface ProcessFlowState {
  id: string;
  process_id: string;
  flowchart_id: string;
  current_step_id: string;
  started_at: string;
  completed_at?: string;
  is_completed: boolean;
}

export interface FlowHistory {
  id: string;
  process_id: string;
  from_step_id?: string;
  to_step_id?: string;
  user_id: string;
  notes?: string;
  timestamp: string;
}
```

### 2.3 Service Layer (flowchart.service.ts)
```typescript
import { supabase } from './supabase';
import { Flowchart, FlowStep } from '../types/flowchart.types';

export const flowchartService = {
  // Get all flowcharts
  async getFlowcharts(): Promise<Flowchart[]> {
    const { data, error } = await supabase
      .from('flowcharts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Get flowchart by ID with steps
  async getFlowchartWithSteps(id: string) {
    const { data: flowchart, error: fcError } = await supabase
      .from('flowcharts')
      .select('*')
      .eq('id', id)
      .single();
    if (fcError) throw fcError;

    const { data: steps, error: stepsError } = await supabase
      .from('flow_steps')
      .select('*')
      .eq('flowchart_id', id)
      .order('step_order', { ascending: true });
    if (stepsError) throw stepsError;

    return { ...flowchart, steps };
  },

  // Create flowchart
  async createFlowchart(flowchart: Omit<Flowchart, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('flowcharts')
      .insert(flowchart)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update flowchart
  async updateFlowchart(id: string, updates: Partial<Flowchart>) {
    const { data, error } = await supabase
      .from('flowcharts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete flowchart
  async deleteFlowchart(id: string) {
    const { error } = await supabase
      .from('flowcharts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Create step
  async createStep(step: Omit<FlowStep, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('flow_steps')
      .insert(step)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update step
  async updateStep(id: string, updates: Partial<FlowStep>) {
    const { data, error } = await supabase
      .from('flow_steps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete step
  async deleteStep(id: string) {
    const { error } = await supabase
      .from('flow_steps')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Reorder steps
  async reorderSteps(flowchartId: string, stepIds: string[]) {
    const updates = stepIds.map((id, index) => ({
      id,
      step_order: index + 1,
    }));
    
    for (const update of updates) {
      await this.updateStep(update.id, { step_order: update.step_order });
    }
  },
};
```

### 2.4 Process Flow Service (processFlow.service.ts)
```typescript
import { supabase } from './supabase';
import { ProcessFlowState, FlowHistory } from '../types/flowchart.types';

export const processFlowService = {
  // Get flow state for process
  async getProcessFlowState(processId: string): Promise<ProcessFlowState | null> {
    const { data, error } = await supabase
      .from('process_flow_state')
      .select('*, current_step:flow_steps(*), flowchart:flowcharts(*)')
      .eq('process_id', processId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Initialize flow for process
  async initializeProcessFlow(processId: string, flowchartId: string) {
    // Get first step
    const { data: firstStep } = await supabase
      .from('flow_steps')
      .select('id')
      .eq('flowchart_id', flowchartId)
      .order('step_order', { ascending: true })
      .limit(1)
      .single();

    const { data, error } = await supabase
      .from('process_flow_state')
      .insert({
        process_id: processId,
        flowchart_id: flowchartId,
        current_step_id: firstStep?.id,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Move to next step
  async moveToNextStep(processId: string, userId: string, notes?: string) {
    const state = await this.getProcessFlowState(processId);
    if (!state || state.is_completed) throw new Error('Invalid state');

    // Get current and next steps
    const { data: currentStep } = await supabase
      .from('flow_steps')
      .select('*')
      .eq('id', state.current_step_id)
      .single();

    const { data: nextStep } = await supabase
      .from('flow_steps')
      .select('*')
      .eq('flowchart_id', state.flowchart_id)
      .eq('step_order', currentStep.step_order + 1)
      .single();

    // If no next step, mark as completed
    if (!nextStep) {
      await supabase
        .from('process_flow_state')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', state.id);
      
      // Log history
      await this.logFlowHistory(processId, state.current_step_id, null, userId, notes);
      return null;
    }

    // Update state
    await supabase
      .from('process_flow_state')
      .update({ current_step_id: nextStep.id })
      .eq('id', state.id);

    // Log history
    await this.logFlowHistory(processId, state.current_step_id, nextStep.id, userId, notes);

    return nextStep;
  },

  // Move to previous step
  async moveToPreviousStep(processId: string, userId: string, notes?: string) {
    const state = await this.getProcessFlowState(processId);
    if (!state) throw new Error('Invalid state');

    const { data: currentStep } = await supabase
      .from('flow_steps')
      .select('*')
      .eq('id', state.current_step_id)
      .single();

    const { data: prevStep } = await supabase
      .from('flow_steps')
      .select('*')
      .eq('flowchart_id', state.flowchart_id)
      .eq('step_order', currentStep.step_order - 1)
      .single();

    if (!prevStep) throw new Error('No previous step');

    await supabase
      .from('process_flow_state')
      .update({ current_step_id: prevStep.id })
      .eq('id', state.id);

    await this.logFlowHistory(processId, state.current_step_id, prevStep.id, userId, notes);

    return prevStep;
  },

  // Log flow history
  async logFlowHistory(
    processId: string,
    fromStepId: string | null,
    toStepId: string | null,
    userId: string,
    notes?: string
  ) {
    const { data, error } = await supabase
      .from('flow_history')
      .insert({
        process_id: processId,
        from_step_id: fromStepId,
        to_step_id: toStepId,
        user_id: userId,
        notes,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Get flow history
  async getFlowHistory(processId: string): Promise<FlowHistory[]> {
    const { data, error } = await supabase
      .from('flow_history')
      .select('*, from_step:flow_steps!from_step_id(*), to_step:flow_steps!to_step_id(*), user:auth.users(*)')
      .eq('process_id', processId)
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data;
  },
};
```

### 2.5 React Hook Example (useFlowcharts.ts)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flowchartService } from '../services/flowchart.service';

export const useFlowcharts = () => {
  return useQuery({
    queryKey: ['flowcharts'],
    queryFn: flowchartService.getFlowcharts,
  });
};

export const useCreateFlowchart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: flowchartService.createFlowchart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowcharts'] });
    },
  });
};

export const useUpdateFlowchart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      flowchartService.updateFlowchart(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowcharts'] });
    },
  });
};
```

### 2.6 Component Example (FlowchartEditor.tsx)
```tsx
import React, { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StepCard } from './StepCard';
import { StepEditModal } from './StepEditModal';
import { useFlowchartWithSteps } from '../../hooks/useFlowcharts';

export const FlowchartEditor: React.FC<{ flowchartId: string }> = ({ flowchartId }) => {
  const { data: flowchart, isLoading } = useFlowchartWithSteps(flowchartId);
  const [editingStep, setEditingStep] = useState(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const oldIndex = flowchart.steps.findIndex((s) => s.id === active.id);
    const newIndex = flowchart.steps.findIndex((s) => s.id === over.id);
    
    const newSteps = arrayMove(flowchart.steps, oldIndex, newIndex);
    const stepIds = newSteps.map((s) => s.id);
    
    flowchartService.reorderSteps(flowchartId, stepIds);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flowchart-editor">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={flowchart.steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {flowchart.steps.map((step) => (
            <StepCard key={step.id} step={step} onEdit={() => setEditingStep(step)} />
          ))}
        </SortableContext>
      </DndContext>
      <button onClick={() => setEditingStep({})}>+ Adicionar Etapa</button>
      {editingStep && <StepEditModal step={editingStep} onClose={() => setEditingStep(null)} />}
    </div>
  );
};
```

---
## 3. Backend Implementation (Node.js + Express)

### 3.1 API Routes
```typescript
// routes/flowchart.routes.ts
import { Router } from 'express';
import { flowchartController } from '../controllers/flowchart.controller';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = Router();

router.use(auth); // All routes require authentication

router.get('/flowcharts', flowchartController.getAll);
router.get('/flowcharts/:id', flowchartController.getById);
router.post('/flowcharts', checkRole(['admin']), flowchartController.create);
router.put('/flowcharts/:id', checkRole(['admin']), flowchartController.update);
router.delete('/flowcharts/:id', checkRole(['admin']), flowchartController.delete);

router.post('/flowcharts/:id/steps', checkRole(['admin']), flowchartController.createStep);
router.put('/flowcharts/:flowchartId/steps/:stepId', checkRole(['admin']), flowchartController.updateStep);
router.delete('/flowcharts/:flowchartId/steps/:stepId', checkRole(['admin']), flowchartController.deleteStep);

export default router;
```

### 3.2 Controller Example
```typescript
// controllers/flowchart.controller.ts
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const flowchartController = {
  async getAll(req: Request, res: Response) {
    try {
      const { data, error } = await supabase.from('flowcharts').select('*');
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('flowcharts')
        .insert(req.body)
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ... other methods
};
```

---
## 4. Flutter Web Implementation

### 4.1 Models
```dart
class Flowchart {
  final String id;
  final String name;
  final String? description;
  final String type;
  final bool active;

  Flowchart({
    required this.id,
    required this.name,
    this.description,
    required this.type,
    required this.active,
  });

  factory Flowchart.fromJson(Map<String, dynamic> json) => Flowchart(
    id: json['id'],
    name: json['name'],
    description: json['description'],
    type: json['type'],
    active: json['active'],
  );
}
```

### 4.2 Service
```dart
class FlowchartService {
  final SupabaseClient _supabase;

  FlowchartService(this._supabase);

  Future<List<Flowchart>> getFlowcharts() async {
    final response = await _supabase.from('flowcharts').select();
    return (response as List).map((e) => Flowchart.fromJson(e)).toList();
  }

  // ... other methods
}
```

---
## 5. Testing & Verification

### 5.1 Unit Tests
- Test flowchart CRUD operations
- Test step reordering logic
- Test flow state transitions

### 5.2 Integration Tests
- Test complete flow from creation to process completion
- Test permission-based access
- Test cascade delete behavior

### 5.3 E2E Tests (Cypress)
- Create flowchart via UI
- Add/edit/delete steps
- Move process through flow
- View control dashboard

---
*Document version 1.0 – 2025‑11‑24*
