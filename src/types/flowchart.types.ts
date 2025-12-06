export type FlowchartType = 'unique' | 'legal_area' | 'case_type' | 'client';

export interface Flowchart {
    id: string;
    name: string;
    description: string;
    type: FlowchartType;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface FlowStep {
    id: string;
    flowchartId: string;
    name: string;
    description: string;
    order: number;
    deadlineDays?: number;
    responsibleRole: 'lawyer' | 'controller' | 'assistant' | 'admin' | 'intern';
    mandatory: boolean;
    checklist: string[]; // JSON array of strings
    createdAt: string;
}

export interface FlowDependency {
    id: string;
    stepId: string;
    dependsOnStepId: string;
}

export interface ProcessFlowState {
    id: string;
    processId: string;
    flowchartId: string;
    currentStepId: string;
    startedAt: string;
    completedAt?: string;
    status: 'active' | 'completed' | 'stuck';
}

export interface FlowHistory {
    id: string;
    processId: string;
    fromStepId?: string;
    toStepId: string;
    userId: string;
    userName: string;
    timestamp: string;
    comments?: string;
}
