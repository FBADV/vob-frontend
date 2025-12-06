import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Client, Process, Service, AgendaEvent, FinancialEntry } from '../types';
import type { Flowchart, FlowStep, ProcessFlowState, FlowHistory } from '../types/flowchart.types';

// Storage keys (must match database.service.ts)
const STORAGE_KEYS = {
    clients: 'vob_clients',
    processes: 'vob_processes',
    movements: 'vob_movements',
    cases: 'vob_cases',
    documents: 'vob_documents',
    services: 'vob_services',
    agenda: 'vob_agenda',
    financial: 'vob_financial',
    financial_categories: 'vob_financial_categories',
    financial_accounts: 'vob_financial_accounts',
    document_templates: 'vob_document_templates',
    flowcharts: 'vob_flowcharts',
    flow_steps: 'vob_flow_steps',
    flow_states: 'vob_process_flow_states',
    flow_history: 'vob_flow_history'
} as const;

export const migrationService = {
    async migrateAll(onProgress: (status: string, progress: number) => void): Promise<void> {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase não está configurado. Verifique as variáveis de ambiente.');
        }

        try {
            // 1. Clients
            onProgress('Migrando Clientes...', 10);
            await this.migrateClients();

            // 2. Processes (depends on Clients)
            onProgress('Migrando Processos...', 30);
            await this.migrateProcesses();

            // 3. Movements (depends on Processes)
            onProgress('Migrando Movimentações...', 50);
            await this.migrateMovements();

            // 4. Financial (depends on Clients/Processes)
            onProgress('Migrando Financeiro...', 60);
            await this.migrateFinancial();

            // 5. Agenda (depends on Clients/Processes)
            onProgress('Migrando Agenda...', 70);
            await this.migrateAgenda();

            // 6. Services (depends on Clients)
            onProgress('Migrando Atendimentos...', 80);
            await this.migrateServices();

            // 7. Flowcharts & Related
            onProgress('Migrando Fluxogramas...', 90);
            await this.migrateFlowcharts();

            onProgress('Migração Concluída!', 100);
        } catch (error) {
            console.error('Migration failed:', error);
            throw error;
        }
    },

    async migrateClients(): Promise<void> {
        const localData = this.getFromLocalStorage<Client>(STORAGE_KEYS.clients);
        if (localData.length === 0) return;

        // Check for existing to avoid duplicates (naive check by ID)
        const { data: existing } = await supabase!.from('clients').select('id');
        const existingIds = new Set(existing?.map(c => c.id));

        const toInsert = localData.filter(c => !existingIds.has(c.id)).map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            whatsapp: c.phone, // Assuming phone is whatsapp for migration
            document: c.document,
            client_type: c.type,
            created_at: c.createdAt
        }));

        if (toInsert.length > 0) {
            const { error } = await supabase!.from('clients').insert(toInsert as any);
            if (error) throw error;
        }
    },

    async migrateProcesses(): Promise<void> {
        const localData = this.getFromLocalStorage<Process>(STORAGE_KEYS.processes);
        if (localData.length === 0) return;

        const { data: existing } = await supabase!.from('processes').select('id');
        const existingIds = new Set(existing?.map(p => p.id));

        const toInsert = localData.filter(p => !existingIds.has(p.id)).map(p => ({
            id: p.id,
            process_number: p.number,
            client_id: p.clientId || null, // Handle optional client
            tribunal_id: crypto.randomUUID(), // Generate a new ID as we don't have it locally
            tribunal_name: p.court,
            class_name: p.className,
            subject: [p.area], // Simple mapping
            case_value: p.value,
            status: p.status,
            created_at: p.createdAt,
            updated_at: p.updatedAt
        }));

        if (toInsert.length > 0) {
            const { error } = await supabase!.from('processes').insert(toInsert as any);
            if (error) throw error;
        }
    },

    async migrateMovements(): Promise<void> {
        const localData = this.getFromLocalStorage<any>(STORAGE_KEYS.movements);
        if (localData.length === 0) return;

        const { data: existing } = await supabase!.from('movements').select('id');
        const existingIds = new Set(existing?.map(m => m.id));

        const toInsert = localData.filter((m: any) => !existingIds.has(m.id)).map((m: any) => ({
            id: m.id,
            process_id: m.process_id,
            movement_date: m.movement_date,
            description: m.description,
            movement_type: m.movement_type,
            comments: m.comments,
            client_friendly_summary: m.client_friendly_summary,
            created_at: m.created_at
        }));

        if (toInsert.length > 0) {
            const { error } = await supabase!.from('movements').insert(toInsert as any);
            if (error) throw error;
        }
    },

    async migrateFinancial(): Promise<void> {
        const localData = this.getFromLocalStorage<FinancialEntry>(STORAGE_KEYS.financial);
        if (localData.length === 0) return;

        const { data: existing } = await supabase!.from('financial_entries').select('id');
        const existingIds = new Set(existing?.map(e => e.id));

        const toInsert = localData.filter(e => !existingIds.has(e.id)).map(e => ({
            id: e.id,
            entry_type: e.type,
            amount: e.amount,
            category: e.category,
            description: e.description,
            payment_method: e.paymentMethod,
            entry_date: e.date,
            client_id: e.clientId || null,
            process_id: e.processId || null,
            status: e.status,
            invoice_number: null, // Default to null
            created_at: e.createdAt
        }));

        if (toInsert.length > 0) {
            const { error } = await supabase!.from('financial_entries').insert(toInsert as any);
            if (error) throw error;
        }
    },

    async migrateAgenda(): Promise<void> {
        const localData = this.getFromLocalStorage<AgendaEvent>(STORAGE_KEYS.agenda);
        if (localData.length === 0) return;

        const { data: existing } = await supabase!.from('agenda_events').select('id');
        const existingIds = new Set(existing?.map(e => e.id));

        const toInsert = localData.filter(e => !existingIds.has(e.id)).map(e => ({
            id: e.id,
            title: e.title,
            description: e.description,
            event_type: e.type,
            start_date: e.startDate,
            start_time: e.startTime,
            end_time: e.endTime,
            location: e.location,
            client_id: e.clientId || null,
            process_id: e.processId || null,
            status: e.status,
            reminder_minutes: e.reminderMinutes,
            created_at: e.createdAt
        }));

        if (toInsert.length > 0) {
            const { error } = await supabase!.from('agenda_events').insert(toInsert as any);
            if (error) throw error;
        }
    },

    async migrateServices(): Promise<void> {
        const localData = this.getFromLocalStorage<Service>(STORAGE_KEYS.services);
        if (localData.length === 0) return;

        const { data: existing } = await supabase!.from('services').select('id');
        const existingIds = new Set(existing?.map(s => s.id));

        const toInsert = localData.filter(s => !existingIds.has(s.id)).map(s => ({
            id: s.id,
            title: s.title,
            client_id: s.clientId || null,
            client_name: s.clientName,
            service_type: s.types?.join(','),
            status: s.status,
            description: s.description,
            created_at: s.createdAt
        }));

        if (toInsert.length > 0) {
            const { error } = await supabase!.from('services').insert(toInsert as any);
            if (error) throw error;
        }
    },

    async migrateFlowcharts(): Promise<void> {
        // 1. Flowcharts
        const localFlowcharts = this.getFromLocalStorage<Flowchart>(STORAGE_KEYS.flowcharts);
        if (localFlowcharts.length > 0) {
            const { data: existing } = await supabase!.from('flowcharts').select('id');
            const existingIds = new Set(existing?.map(f => f.id));

            const toInsert = localFlowcharts.filter(f => !existingIds.has(f.id)).map(f => ({
                id: f.id,
                name: f.name,
                description: f.description,
                type: f.type,
                active: f.active,
                created_at: f.createdAt,
                updated_at: f.updatedAt
            }));

            if (toInsert.length > 0) {
                const { error } = await supabase!.from('flowcharts').insert(toInsert as any);
                if (error) throw error;
            }
        }

        // 2. Flow Steps
        const localSteps = this.getFromLocalStorage<FlowStep>(STORAGE_KEYS.flow_steps);
        if (localSteps.length > 0) {
            const { data: existing } = await supabase!.from('flow_steps').select('id');
            const existingIds = new Set(existing?.map(s => s.id));

            const toInsert = localSteps.filter(s => !existingIds.has(s.id)).map(s => ({
                id: s.id,
                flowchart_id: s.flowchartId,
                name: s.name,
                description: s.description,
                order: s.order,
                deadline_days: s.deadlineDays,
                responsible_role: s.responsibleRole,
                is_mandatory: s.mandatory,
                checklist: s.checklist,
                created_at: new Date().toISOString() // Steps might not have createdAt locally
            }));

            if (toInsert.length > 0) {
                const { error } = await supabase!.from('flow_steps').insert(toInsert as any);
                if (error) throw error;
            }
        }

        // 3. Process Flow States
        const localStates = this.getFromLocalStorage<ProcessFlowState>(STORAGE_KEYS.flow_states);
        if (localStates.length > 0) {
            const { data: existing } = await supabase!.from('process_flow_states').select('id');
            const existingIds = new Set(existing?.map(s => s.id));

            const toInsert = localStates.filter(s => !existingIds.has(s.id)).map(s => ({
                id: s.id,
                process_id: s.processId,
                flowchart_id: s.flowchartId,
                current_step_id: s.currentStepId,
                status: s.status,
                started_at: s.startedAt,
                updated_at: new Date().toISOString()
            }));

            if (toInsert.length > 0) {
                const { error } = await supabase!.from('process_flow_states').insert(toInsert as any);
                if (error) throw error;
            }
        }

        // 4. Flow History
        const localHistory = this.getFromLocalStorage<FlowHistory>(STORAGE_KEYS.flow_history);
        if (localHistory.length > 0) {
            const { data: existing } = await supabase!.from('flow_history').select('id');
            const existingIds = new Set(existing?.map(h => h.id));

            const toInsert = localHistory.filter(h => !existingIds.has(h.id)).map(h => ({
                id: h.id,
                process_id: h.processId,
                from_step_id: h.fromStepId || null,
                to_step_id: h.toStepId,
                user_id: h.userId,
                user_name: h.userName,
                comments: h.comments,
                timestamp: h.timestamp
            }));

            if (toInsert.length > 0) {
                const { error } = await supabase!.from('flow_history').insert(toInsert as any);
                if (error) throw error;
            }
        }
    },

    getFromLocalStorage<T>(key: string): T[] {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }
};
