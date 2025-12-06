import { supabase, isSupabaseConfigured } from '../lib/supabase';
import api from './api';
import type { Database } from '../types/database.types';

import type { Client, Process, Service, AgendaEvent, FinancialEntry, FinancialCategory, FinancialAccount, DocumentTemplate, User as UserType } from '../types';
import type { Flowchart, FlowStep, ProcessFlowState, FlowHistory } from '../types/flowchart.types';
import { storageService as fileStorageService } from './storage.service';

// Type aliases for better readability
type DbClient = Database['public']['Tables']['clients']['Row'];
type DbMovement = Database['public']['Tables']['movements']['Row'];

// ============================================================================
// LOCAL STORAGE FALLBACK
// ============================================================================

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

} as const;

function getFromLocalStorage<T>(key: string): T[] {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}



export function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function saveToLocalStorage<T>(key: string, data: T[]): void {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// ============================================================================
// CLIENTS SERVICE
// ============================================================================

export const clientsService = {
    async getAll(): Promise<Client[]> {
        if (!isSupabaseConfigured()) {
            return getFromLocalStorage<Client>(STORAGE_KEYS.clients);
        }

        const { data, error } = await supabase!
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return this.mapDbClientsToClients(data);
    },

    async getById(id: string): Promise<Client | null> {
        if (!isSupabaseConfigured()) {
            const clients = getFromLocalStorage<Client>(STORAGE_KEYS.clients);
            return clients.find(c => c.id === id) || null;
        }

        const { data, error } = await supabase!
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return this.mapDbClientToClient(data);
    },

    async create(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
        if (!isSupabaseConfigured()) {
            const clients = getFromLocalStorage<Client>(STORAGE_KEYS.clients);
            const newClient: Client = {
                ...client,
                id: generateUUID(),
                createdAt: new Date().toISOString(),
            };
            clients.push(newClient);
            saveToLocalStorage(STORAGE_KEYS.clients, clients);
            return newClient;
        }

        const { data, error } = await supabase!
            .from('clients')
            .insert([{
                name: client.name,
                email: client.email,
                phone: client.phone,
                document: client.document,
                client_type: client.type,
            }] as any)
            .select()
            .single();

        if (error) throw error;
        return this.mapDbClientToClient(data);
    },

    async update(id: string, updates: Partial<Client>): Promise<Client> {
        if (!isSupabaseConfigured()) {
            const clients = getFromLocalStorage<Client>(STORAGE_KEYS.clients);
            const index = clients.findIndex(c => c.id === id);
            if (index === -1) throw new Error('Client not found');

            clients[index] = { ...clients[index], ...updates };
            saveToLocalStorage(STORAGE_KEYS.clients, clients);
            return clients[index];
        }

        const { data, error } = await supabase!
            .from('clients')
            // @ts-ignore - Supabase typing issue when client can be null
            .update({
                name: updates.name,
                email: updates.email,
                phone: updates.phone,
            } as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapDbClientToClient(data);
    },

    async delete(id: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            const clients = getFromLocalStorage<Client>(STORAGE_KEYS.clients);
            const filtered = clients.filter(c => c.id !== id);
            saveToLocalStorage(STORAGE_KEYS.clients, filtered);
            return;
        }

        const { error } = await supabase!
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getProcesses(clientId: string): Promise<Process[]> {
        if (!isSupabaseConfigured()) {
            const processes = getFromLocalStorage<any>(STORAGE_KEYS.processes);
            return processes.filter((p: any) => p.clientId === clientId);
        }

        const { data, error } = await supabase!
            .from('processes')
            .select('*')
            .eq('client_id', clientId)
            .order('last_movement_date', { ascending: false, nullsFirst: false });

        if (error) throw error;
        return processesService.mapDbProcessesToProcesses(data);
    },

    // Helper function to map DB client to app client
    mapDbClientToClient(dbClient: DbClient): Client {
        return {
            id: dbClient.id,
            name: dbClient.name,
            email: dbClient.email || '',
            phone: dbClient.phone || '',
            document: dbClient.document,
            cpfCnpj: dbClient.document, // Added cpfCnpj
            status: 'active', // Added status
            type: dbClient.client_type || 'individual', // Ensured default for type
            createdAt: dbClient.created_at,
        } as Client;
    },

    mapDbClientsToClients(dbClients: DbClient[]): Client[] {
        return dbClients.map(this.mapDbClientToClient);
    },
};

// ============================================================================
// MOVEMENTS SERVICE
// ============================================================================

export const movementsService = {
    async getByProcessId(processId: string): Promise<DbMovement[]> {
        if (!isSupabaseConfigured()) {
            const movements = getFromLocalStorage<DbMovement>(STORAGE_KEYS.movements);
            return movements.filter(m => m.process_id === processId);
        }

        const { data, error } = await supabase!
            .from('movements')
            .select('*')
            .eq('process_id', processId)
            .order('movement_date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async create(movement: {
        processId: string;
        movementDate: string;
        description: string;
        movementType?: string;
    }): Promise<DbMovement> {
        if (!isSupabaseConfigured()) {
            const movements = getFromLocalStorage<DbMovement>(STORAGE_KEYS.movements);
            const newMovement: DbMovement = {
                id: generateUUID(),
                process_id: movement.processId,
                movement_date: movement.movementDate,
                movement_type: movement.movementType || null,
                description: movement.description,
                comments: null,
                shared_with_client: false,
                client_friendly_summary: null,
                created_at: new Date().toISOString(),
            };
            movements.push(newMovement);
            saveToLocalStorage(STORAGE_KEYS.movements, movements);
            return newMovement;
        }

        const { data, error } = await supabase!
            .from('movements')
            .insert([{
                process_id: movement.processId,
                movement_date: movement.movementDate,
                description: movement.description,
                movement_type: movement.movementType,
            }] as any)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async addComment(movementId: string, comment: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            const movements = getFromLocalStorage<DbMovement>(STORAGE_KEYS.movements);
            const movement = movements.find(m => m.id === movementId);
            if (movement) {
                movement.comments = [...(movement.comments || []), comment];
                saveToLocalStorage(STORAGE_KEYS.movements, movements);
            }
            return;
        }

        const { data: currentData } = await supabase!
            .from('movements')
            .select('comments')
            .eq('id', movementId)
            .single();

        const comments = [...((currentData as any)?.comments || []), comment];

        const { error } = await supabase!
            .from('movements')
            // @ts-ignore - Supabase typing issue when client can be null
            .update({ comments } as any)
            .eq('id', movementId);

        if (error) throw error;
    },

    async updateClientSummary(movementId: string, summary: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            const movements = getFromLocalStorage<DbMovement>(STORAGE_KEYS.movements);
            const movement = movements.find(m => m.id === movementId);
            if (movement) {
                movement.client_friendly_summary = summary;
                saveToLocalStorage(STORAGE_KEYS.movements, movements);
            }
            return;
        }

        const { error } = await supabase!
            .from('movements')
            // @ts-ignore - Supabase typing issue when client can be null
            .update({ client_friendly_summary: summary } as any)
            .eq('id', movementId);

        if (error) throw error;
    },
};

// ============================================================================
// PROCESSES SERVICE
// ============================================================================

export const processesService = {
    async getAll(): Promise<Process[]> {
        try {
            const { data } = await api.get('/processos');
            return this.mapDbProcessesToProcesses(data);
        } catch (error) {
            console.error('API call failed, falling back to local storage', error);
            // Fallback during transition or dev
            return getFromLocalStorage<Process>(STORAGE_KEYS.processes);
        }
    },

    async getById(id: string): Promise<Process | null> {
        try {
            const { data } = await api.get(`/processos/${id}`);
            return this.mapDbProcessToProcess(data);
        } catch (error) {
            const processes = getFromLocalStorage<Process>(STORAGE_KEYS.processes);
            return processes.find(p => p.id === id) || null;
        }
    },

    async create(process: {
        processNumber: string;
        clientId?: string;
        tribunalId: string;
        tribunalName: string;
        className?: string;
        subject?: string[];
        filingDate?: string;
        courtName?: string;
        caseValue?: number;
        folder?: any;
    }): Promise<Process> {
        try {
            const payload = {
                numero_cnj: process.processNumber,
                titulo: process.className || 'Processo',
                cliente_nome: 'Cliente', // TODO: Fetch client name
                valor_causa: String(process.caseValue || 0),
                advogado_oab: 'MG123456' // Mock/Default
            };
            const { data } = await api.post('/processos/cadastrar', payload);
            return this.mapDbProcessToProcess(data);
        } catch (error) {
            console.error('API create failed', error);
            throw error;
        }
    },

    async update(id: string, _updates: Partial<Process>): Promise<Process> {
        // Use the new update endpoint
        const { data: _data } = await api.post(`/processos/${id}/atualizar`); // This is the sync endpoint
        // If we want generic patch, we need another endpoint. 
        // For now, mapping 'update' to the sync trigger as requested implies logic shift.
        // Assuming standard update is not yet in API, keeping local or partial.
        return this.getById(id) as Promise<Process>;
    },

    async delete(_id: string): Promise<void> {
        // API doesn't have delete yet
        console.warn('Delete not implemented in API');
    },

    // Helper functions
    mapDbProcessToProcess(dbProcess: any): Process {
        return {
            id: String(dbProcess.id),
            number: dbProcess.numero_cnj,
            title: dbProcess.titulo || 'Processo Judicial',
            clientId: '', // Mapping pending
            clientName: dbProcess.cliente_nome || '',
            status: 'active',
            court: 'Tribunal',
            className: 'Classe',
            area: 'Cível',
            value: Number(dbProcess.valor_causa) || 0,
            folder: {
                basicData: {
                    plaintiff: '',
                    defendant: '',
                    judge: '',
                    prosecutor: '',
                    courtSection: '',
                    distributionDate: dbProcess.created_at
                },
                movements: dbProcess.andamentos ? dbProcess.andamentos.map((a: any) => ({
                    id: String(a.id),
                    date: a.data,
                    description: a.descricao,
                    type: 'Movimento'
                })) : [],
                timeline: [],
                observations: [],
                documents: []
            },
            createdAt: dbProcess.created_at,
            updatedAt: dbProcess.updated_at,
        };
    },

    mapDbProcessesToProcesses(dbProcesses: any[]): Process[] {
        return dbProcesses.map(this.mapDbProcessToProcess);
    },
};


// ============================================================================
// MOVEMENTS SERVICE
// ============================================================================



// ============================================================================
// DOCUMENTS SERVICE
// ============================================================================

type DbDocument = Database['public']['Tables']['documents']['Row'];

export interface Document {
    id: string;
    processId: string | null;
    clientId: string | null;
    title: string;
    type: string;
    url: string;
    size: number | null;
    uploadedAt: string;
    file?: File; // Optional file object for upload
}

export const documentsService = {
    async getByClientId(clientId: string): Promise<Document[]> {
        if (!isSupabaseConfigured()) {
            const documents = getFromLocalStorage<Document>(STORAGE_KEYS.documents);
            return documents.filter(d => d.clientId === clientId);
        }

        const { data, error } = await supabase!
            .from('documents')
            .select('*')
            .eq('client_id', clientId)
            .order('uploaded_at', { ascending: false });

        if (error) throw error;

        // Map and generate signed URLs for each document
        const docs = this.mapDbDocumentsToDocuments(data);
        return Promise.all(docs.map(async (doc) => {
            // If it looks like a storage path (not a full URL), get signed URL
            if (doc.url && !doc.url.startsWith('http')) {
                const signedUrl = await fileStorageService.getSignedUrl(doc.url);
                if (signedUrl) {
                    return { ...doc, url: signedUrl, storagePath: doc.url };
                }
            }
            return doc;
        }));
    },

    async getByProcessId(processId: string): Promise<Document[]> {
        if (!isSupabaseConfigured()) {
            const documents = getFromLocalStorage<Document>(STORAGE_KEYS.documents);
            return documents.filter(d => d.processId === processId);
        }

        const { data, error } = await supabase!
            .from('documents')
            .select('*')
            .eq('process_id', processId)
            .order('uploaded_at', { ascending: false });

        if (error) throw error;

        // Map and generate signed URLs for each document
        const docs = this.mapDbDocumentsToDocuments(data);
        return Promise.all(docs.map(async (doc) => {
            // If it looks like a storage path (not a full URL), get signed URL
            if (doc.url && !doc.url.startsWith('http')) {
                const signedUrl = await fileStorageService.getSignedUrl(doc.url);
                if (signedUrl) {
                    return { ...doc, url: signedUrl, storagePath: doc.url };
                }
            }
            return doc;
        }));
    },

    async create(document: Omit<Document, 'id' | 'uploadedAt'>): Promise<Document> {
        let fileUrl = document.url;

        // Handle File Upload if provided
        if (document.file && isSupabaseConfigured()) {
            try {
                const folder = document.processId ? `process_${document.processId}` : `client_${document.clientId}`;
                fileUrl = await fileStorageService.uploadFile(document.file, folder);
            } catch (error) {
                console.error('Upload failed:', error);
                throw new Error('Falha ao fazer upload do arquivo');
            }
        }

        if (!isSupabaseConfigured()) {
            const documents = getFromLocalStorage<Document>(STORAGE_KEYS.documents);
            const newDocument: Document = {
                ...document,
                id: generateUUID(),
                uploadedAt: new Date().toISOString(),
                url: fileUrl // Use the URL (or mock path)
            };
            documents.push(newDocument);
            saveToLocalStorage(STORAGE_KEYS.documents, documents);
            return newDocument;
        }

        const { data, error } = await supabase!
            .from('documents')
            .insert([{
                process_id: document.processId,
                client_id: document.clientId,
                title: document.title,
                document_type: document.type,
                file_url: fileUrl, // Store path or URL
                file_size: document.size,
            }])
            .select()
            .single();

        if (error) throw error;
        return this.mapDbDocumentToDocument(data);
    },

    async delete(id: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            const documents = getFromLocalStorage<Document>(STORAGE_KEYS.documents);
            const filtered = documents.filter(d => d.id !== id);
            saveToLocalStorage(STORAGE_KEYS.documents, filtered);
            return;
        }

        // First get the document to check for storage path
        const { data: doc } = await supabase!
            .from('documents')
            .select('file_url')
            .eq('id', id)
            .single();

        if (doc && doc.file_url && !doc.file_url.startsWith('http')) {
            // Try to delete from storage
            try {
                await fileStorageService.deleteFile(doc.file_url);
            } catch (e) {
                console.error('Failed to delete file from storage:', e);
                // Continue to delete record even if storage delete fails
            }
        }

        const { error } = await supabase!
            .from('documents')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Helper functions
    mapDbDocumentToDocument(dbDoc: DbDocument): Document {
        return {
            id: dbDoc.id,
            processId: dbDoc.process_id,
            clientId: dbDoc.client_id,
            title: dbDoc.title,
            type: dbDoc.document_type,
            url: dbDoc.file_url,
            size: dbDoc.file_size,
            uploadedAt: dbDoc.uploaded_at,
        };
    },

    mapDbDocumentsToDocuments(dbDocs: DbDocument[]): Document[] {
        return dbDocs.map(this.mapDbDocumentToDocument);
    },
};

// ============================================================================
// SERVICES SERVICE
// ============================================================================

type DbService = Database['public']['Tables']['services']['Row'];

export const servicesService = {
    async getAll(): Promise<Service[]> {
        if (!isSupabaseConfigured()) {
            return getFromLocalStorage<Service>(STORAGE_KEYS.services);
        }

        const { data, error } = await supabase!
            .from('services')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return this.mapDbServicesToServices(data);
    },

    async create(service: Service): Promise<Service> {
        if (!isSupabaseConfigured()) {
            const services = getFromLocalStorage<Service>(STORAGE_KEYS.services);
            const newService = {
                ...service,
                createdAt: new Date().toISOString(),
            };
            services.push(newService);
            saveToLocalStorage(STORAGE_KEYS.services, services);
            return newService;
        }

        const { data, error } = await supabase!
            .from('services')
            .insert([{
                title: service.title,
                client_id: service.clientId,
                client_name: service.clientName,
                service_type: service.types?.join(',') || 'Geral',
                status: service.status,
                description: service.description,
            }] as any)
            .select()
            .single();

        if (error) throw error;
        return this.mapDbServiceToService(data);
    },

    async update(id: string, updates: Partial<Service>): Promise<Service> {
        if (!isSupabaseConfigured()) {
            const services = getFromLocalStorage<Service>(STORAGE_KEYS.services);
            const index = services.findIndex(s => s.id === id);
            if (index === -1) throw new Error('Service not found');

            services[index] = { ...services[index], ...updates };
            saveToLocalStorage(STORAGE_KEYS.services, services);
            return services[index];
        }

        const { data, error } = await supabase!
            .from('services')
            // @ts-ignore
            .update({
                title: updates.title,
                client_id: updates.clientId,
                client_name: updates.clientName,
                service_type: updates.types?.join(','),
                status: updates.status,
                description: updates.description,
            } as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapDbServiceToService(data);
    },

    async delete(id: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            const services = getFromLocalStorage<Service>(STORAGE_KEYS.services);
            const filtered = services.filter(s => s.id !== id);
            saveToLocalStorage(STORAGE_KEYS.services, filtered);
            return;
        }

        const { error } = await supabase!
            .from('services')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Helper functions
    mapDbServiceToService(dbService: DbService): Service {
        return {
            id: dbService.id,
            title: dbService.title,
            clientId: dbService.client_id || undefined,
            clientName: dbService.client_name || undefined,
            date: dbService.created_at.split('T')[0],
            time: new Date(dbService.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: dbService.status as Service['status'],
            description: dbService.description || '',
            types: dbService.service_type ? dbService.service_type.split(',') : ['Geral'],
            createdAt: dbService.created_at,
        };
    },

    mapDbServicesToServices(dbServices: DbService[]): Service[] {
        return dbServices.map(this.mapDbServiceToService);
    },
};

// ============================================================================
// AGENDA SERVICE
// ============================================================================

type DbAgendaEvent = Database['public']['Tables']['agenda_events']['Row'];

export const agendaService = {
    async getAll(): Promise<AgendaEvent[]> {
        if (!isSupabaseConfigured()) {
            return getFromLocalStorage<AgendaEvent>(STORAGE_KEYS.agenda);
        }

        const { data, error } = await supabase!
            .from('agenda_events')
            .select('*')
            .order('start_date', { ascending: true });

        if (error) throw error;
        return this.mapDbEventsToEvents(data);
    },

    async create(event: AgendaEvent): Promise<AgendaEvent> {
        if (!isSupabaseConfigured()) {
            const events = getFromLocalStorage<AgendaEvent>(STORAGE_KEYS.agenda);
            const newEvent = {
                ...event,
                createdAt: new Date().toISOString(),
            };
            events.push(newEvent);
            saveToLocalStorage(STORAGE_KEYS.agenda, events);
            return newEvent;
        }

        const { data, error } = await supabase!
            .from('agenda_events')
            .insert([{
                title: event.title,
                description: event.description,
                event_type: event.type,
                start_date: event.startDate,
                start_time: event.startTime,
                end_time: event.endTime,
                location: event.location,
                client_id: event.clientId,
                process_id: event.processId,
                status: event.status,
                reminder_minutes: event.reminderMinutes,
            }] as any)
            .select()
            .single();

        if (error) throw error;
        return this.mapDbEventToEvent(data);
    },

    async update(id: string, updates: Partial<AgendaEvent>): Promise<AgendaEvent> {
        if (!isSupabaseConfigured()) {
            const events = getFromLocalStorage<AgendaEvent>(STORAGE_KEYS.agenda);
            const index = events.findIndex(e => e.id === id);
            if (index === -1) throw new Error('Event not found');

            events[index] = { ...events[index], ...updates };
            saveToLocalStorage(STORAGE_KEYS.agenda, events);
            return events[index];
        }

        const { data, error } = await supabase!
            .from('agenda_events')
            // @ts-ignore
            .update({
                title: updates.title,
                description: updates.description,
                event_type: updates.type,
                start_date: updates.startDate,
                start_time: updates.startTime,
                end_time: updates.endTime,
                location: updates.location,
                client_id: updates.clientId,
                process_id: updates.processId,
                status: updates.status,
                reminder_minutes: updates.reminderMinutes,
            } as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapDbEventToEvent(data);
    },

    async delete(id: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            const events = getFromLocalStorage<AgendaEvent>(STORAGE_KEYS.agenda);
            const filtered = events.filter(e => e.id !== id);
            saveToLocalStorage(STORAGE_KEYS.agenda, filtered);
            return;
        }

        const { error } = await supabase!
            .from('agenda_events')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Helper functions
    mapDbEventToEvent(dbEvent: DbAgendaEvent): AgendaEvent {
        return {
            id: dbEvent.id,
            title: dbEvent.title,
            description: dbEvent.description || '',
            type: dbEvent.event_type,
            startDate: dbEvent.start_date,
            startTime: dbEvent.start_time,
            endTime: dbEvent.end_time,
            location: dbEvent.location || undefined,
            clientId: dbEvent.client_id || undefined,
            processId: dbEvent.process_id || undefined,
            status: dbEvent.status,
            reminderMinutes: dbEvent.reminder_minutes || undefined,
            createdAt: dbEvent.created_at,
        };
    },

    mapDbEventsToEvents(dbEvents: DbAgendaEvent[]): AgendaEvent[] {
        return dbEvents.map(this.mapDbEventToEvent);
    },
};

// ============================================================================
// FINANCIAL SERVICE
// ============================================================================

type DbFinancialEntry = Database['public']['Tables']['financial_entries']['Row'];

export const financialService = {
    async getAll(): Promise<FinancialEntry[]> {
        if (!isSupabaseConfigured()) {
            return getFromLocalStorage<FinancialEntry>(STORAGE_KEYS.financial);
        }

        const { data, error } = await supabase!
            .from('financial_entries')
            .select('*')
            .order('entry_date', { ascending: false });

        if (error) throw error;
        return this.mapDbEntriesToEntries(data);
    },

    async create(entry: FinancialEntry): Promise<FinancialEntry> {
        if (!isSupabaseConfigured()) {
            const entries = getFromLocalStorage<FinancialEntry>(STORAGE_KEYS.financial);
            const newEntry = {
                ...entry,
                createdAt: new Date().toISOString(),
            };
            entries.push(newEntry);
            saveToLocalStorage(STORAGE_KEYS.financial, entries);
            return newEntry;
        }

        const { data, error } = await supabase!
            .from('financial_entries')
            .insert([{
                entry_type: entry.type,
                amount: entry.amount,
                category: entry.category,
                description: entry.description,
                payment_method: entry.paymentMethod,
                entry_date: entry.date,
                client_id: entry.clientId,
                process_id: entry.processId,
                status: entry.status || 'pending',
            }] as any)
            .select()
            .single();

        if (error) throw error;
        return this.mapDbEntryToEntry(data);
    },

    async update(id: string, updates: Partial<FinancialEntry>): Promise<FinancialEntry> {
        if (!isSupabaseConfigured()) {
            const entries = getFromLocalStorage<FinancialEntry>(STORAGE_KEYS.financial);
            const index = entries.findIndex(e => e.id === id);
            if (index === -1) throw new Error('Entry not found');

            entries[index] = { ...entries[index], ...updates };
            saveToLocalStorage(STORAGE_KEYS.financial, entries);
            return entries[index];
        }

        const { data, error } = await supabase!
            .from('financial_entries')
            // @ts-ignore
            .update({
                entry_type: updates.type,
                amount: updates.amount,
                category: updates.category,
                description: updates.description,
                payment_method: updates.paymentMethod,
                entry_date: updates.date,
                client_id: updates.clientId,
                process_id: updates.processId,
                status: updates.status,
            } as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapDbEntryToEntry(data);
    },

    async delete(id: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            const entries = getFromLocalStorage<FinancialEntry>(STORAGE_KEYS.financial);
            const filtered = entries.filter(e => e.id !== id);
            saveToLocalStorage(STORAGE_KEYS.financial, filtered);
            return;
        }

        const { error } = await supabase!
            .from('financial_entries')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Helper functions
    mapDbEntryToEntry(dbEntry: DbFinancialEntry): FinancialEntry {
        return {
            id: dbEntry.id,
            type: dbEntry.entry_type,
            amount: dbEntry.amount,
            category: dbEntry.category,
            description: dbEntry.description,
            paymentMethod: dbEntry.payment_method || undefined,
            date: dbEntry.entry_date,
            clientId: dbEntry.client_id || undefined,
            processId: dbEntry.process_id || undefined,
            status: dbEntry.status as FinancialEntry['status'],
            createdAt: dbEntry.created_at,
        };
    },

    mapDbEntriesToEntries(dbEntries: DbFinancialEntry[]): FinancialEntry[] {
        return dbEntries.map(this.mapDbEntryToEntry);
    },
};

// ============================================================================
// FINANCIAL CATEGORIES SERVICE (LocalStorage Only)
// ============================================================================

export const financialCategoriesService = {
    async getAll(): Promise<FinancialCategory[]> {
        return getFromLocalStorage<FinancialCategory>(STORAGE_KEYS.financial_categories);
    },

    async create(category: FinancialCategory): Promise<FinancialCategory> {
        const categories = getFromLocalStorage<FinancialCategory>(STORAGE_KEYS.financial_categories);
        const newCategory = { ...category, id: generateUUID() };
        categories.push(newCategory);
        saveToLocalStorage(STORAGE_KEYS.financial_categories, categories);
        return newCategory;
    },

    async update(id: string, updates: Partial<FinancialCategory>): Promise<FinancialCategory> {
        const categories = getFromLocalStorage<FinancialCategory>(STORAGE_KEYS.financial_categories);
        const index = categories.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Category not found');

        categories[index] = { ...categories[index], ...updates };
        saveToLocalStorage(STORAGE_KEYS.financial_categories, categories);
        return categories[index];
    },

    async delete(id: string): Promise<void> {
        const categories = getFromLocalStorage<FinancialCategory>(STORAGE_KEYS.financial_categories);
        const filtered = categories.filter(c => c.id !== id);
        saveToLocalStorage(STORAGE_KEYS.financial_categories, filtered);
    }
};

// ============================================================================
// FINANCIAL ACCOUNTS SERVICE (LocalStorage Only)
// ============================================================================

export const financialAccountsService = {
    async getAll(): Promise<FinancialAccount[]> {
        return getFromLocalStorage<FinancialAccount>(STORAGE_KEYS.financial_accounts);
    },

    async create(account: FinancialAccount): Promise<FinancialAccount> {
        const accounts = getFromLocalStorage<FinancialAccount>(STORAGE_KEYS.financial_accounts);
        const newAccount = { ...account, id: generateUUID() };
        accounts.push(newAccount);
        saveToLocalStorage(STORAGE_KEYS.financial_accounts, accounts);
        return newAccount;
    },

    async update(id: string, updates: Partial<FinancialAccount>): Promise<FinancialAccount> {
        const accounts = getFromLocalStorage<FinancialAccount>(STORAGE_KEYS.financial_accounts);
        const index = accounts.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Account not found');

        accounts[index] = { ...accounts[index], ...updates };
        saveToLocalStorage(STORAGE_KEYS.financial_accounts, accounts);
        return accounts[index];
    },

    async delete(id: string): Promise<void> {
        const accounts = getFromLocalStorage<FinancialAccount>(STORAGE_KEYS.financial_accounts);
        const filtered = accounts.filter(a => a.id !== id);
        saveToLocalStorage(STORAGE_KEYS.financial_accounts, filtered);
    }
};

// ============================================================================
// DOCUMENT TEMPLATES SERVICE (LocalStorage Only)
// ============================================================================

export const documentTemplatesService = {
    async getAll(): Promise<DocumentTemplate[]> {
        return getFromLocalStorage<DocumentTemplate>(STORAGE_KEYS.document_templates);
    },

    async create(template: DocumentTemplate): Promise<DocumentTemplate> {
        const templates = getFromLocalStorage<DocumentTemplate>(STORAGE_KEYS.document_templates);
        const newTemplate = {
            ...template,
            id: generateUUID(),
            lastModified: new Date().toISOString()
        };
        templates.push(newTemplate);
        saveToLocalStorage(STORAGE_KEYS.document_templates, templates);
        return newTemplate;
    },

    async update(id: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
        const templates = getFromLocalStorage<DocumentTemplate>(STORAGE_KEYS.document_templates);
        const index = templates.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Template not found');

        templates[index] = {
            ...templates[index],
            ...updates,
            lastModified: new Date().toISOString()
        };
        saveToLocalStorage(STORAGE_KEYS.document_templates, templates);
        return templates[index];
    },

    async delete(id: string): Promise<void> {
        const templates = getFromLocalStorage<DocumentTemplate>(STORAGE_KEYS.document_templates);
        const filtered = templates.filter(t => t.id !== id);
        saveToLocalStorage(STORAGE_KEYS.document_templates, filtered);
    }
};


// ============================================================================
// STORAGE SERVICE (for client photos)
// ============================================================================

export const storageService = {
    /**
     * Upload client photo to Supabase Storage
     * Falls back to base64 data URL if Supabase is not configured
     */
    async uploadClientPhoto(file: File, clientId: string): Promise<string> {
        // Validate file
        if (!file.type.startsWith('image/')) {
            throw new Error('O arquivo deve ser uma imagem');
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new Error('A imagem deve ter no máximo 5MB');
        }

        // If Supabase is not configured, convert to base64
        if (!isSupabaseConfigured()) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
                reader.readAsDataURL(file);
            });
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${clientId}-${Date.now()}.${fileExt}`;
        const filePath = `client-photos/${fileName}`;

        const { error: uploadError } = await supabase!.storage
            .from('clients')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase!.storage
            .from('clients')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    /**
     * Delete client photo from Supabase Storage
     */
    async deleteClientPhoto(clientId: string): Promise<void> {
        if (!isSupabaseConfigured()) {
            localStorage.removeItem(`client_photo_${clientId}`);
            return;
        }

        const { error } = await supabase!.storage
            .from('clients')
            .remove([`client-photos/${clientId}`]);

        if (error) throw error;
    },

    getClientPhotoUrl(clientId: string): string | null {
        if (!isSupabaseConfigured()) {
            return localStorage.getItem(`client_photo_${clientId}`);
        }
        return null; // Supabase URLs are stored in the client record
    }
};

// ============================================================================
// USER SERVICE
// ============================================================================

export const userService = {
    async getAll(): Promise<UserType[]> {
        // For now, always use LocalStorage as Supabase auth users are managed differently
        return getFromLocalStorage<UserType>('vob_users');
    },

    async create(user: UserType): Promise<UserType> {
        const users = getFromLocalStorage<UserType>('vob_users');
        const newUser = { ...user, id: generateUUID() };
        users.push(newUser);
        saveToLocalStorage('vob_users', users);
        return newUser;
    },

    async update(id: string, updates: Partial<UserType>): Promise<UserType> {
        const users = getFromLocalStorage<UserType>('vob_users');
        const index = users.findIndex(u => u.id === id);
        if (index === -1) throw new Error('User not found');

        users[index] = { ...users[index], ...updates };
        saveToLocalStorage('vob_users', users);
        return users[index];
    },

    async delete(id: string): Promise<void> {
        const users = getFromLocalStorage<UserType>('vob_users');
        const filtered = users.filter(u => u.id !== id);
        saveToLocalStorage('vob_users', filtered);
    }
};

// ============================================================================
// EXPORT ALL SERVICES
// ============================================================================

// ============================================================================
// FLOWCHART SERVICE
// ============================================================================

export const flowchartService = {
    async getAll(): Promise<Flowchart[]> {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase!.from('flowcharts').select('*');
            if (error) throw error;
            return data.map(f => ({
                ...f,
                createdAt: f.created_at,
                updatedAt: f.updated_at
            })) as Flowchart[];
        }
        return getFromLocalStorage<Flowchart>('vob_flowcharts');
    },

    async create(flowchart: Omit<Flowchart, 'id' | 'createdAt' | 'updatedAt'>): Promise<Flowchart> {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase!.from('flowcharts').insert({
                name: flowchart.name,
                description: flowchart.description,
                type: flowchart.type,
                active: flowchart.active
            }).select().single();

            if (error) throw error;
            return {
                ...data,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            } as Flowchart;
        }

        const flowcharts = getFromLocalStorage<Flowchart>('vob_flowcharts');
        const newFlowchart: Flowchart = {
            ...flowchart,
            id: generateUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        flowcharts.push(newFlowchart);
        saveToLocalStorage('vob_flowcharts', flowcharts);
        return newFlowchart;
    },

    async update(id: string, updates: Partial<Flowchart>): Promise<Flowchart> {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase!.from('flowcharts').update({
                ...updates,
                updated_at: new Date().toISOString()
            }).eq('id', id).select().single();

            if (error) throw error;
            return {
                ...data,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            } as Flowchart;
        }

        const flowcharts = getFromLocalStorage<Flowchart>('vob_flowcharts');
        const index = flowcharts.findIndex(f => f.id === id);
        if (index === -1) throw new Error('Flowchart not found');

        flowcharts[index] = { ...flowcharts[index], ...updates, updatedAt: new Date().toISOString() };
        saveToLocalStorage('vob_flowcharts', flowcharts);
        return flowcharts[index];
    },

    async delete(id: string): Promise<void> {
        if (isSupabaseConfigured()) {
            const { error } = await supabase!.from('flowcharts').delete().eq('id', id);
            if (error) throw error;
            return;
        }

        const flowcharts = getFromLocalStorage<Flowchart>('vob_flowcharts');
        const filtered = flowcharts.filter(f => f.id !== id);
        saveToLocalStorage('vob_flowcharts', filtered);

        // Also delete associated steps
        const steps = getFromLocalStorage<FlowStep>('vob_flow_steps');
        const filteredSteps = steps.filter(s => s.flowchartId !== id);
        saveToLocalStorage('vob_flow_steps', filteredSteps);
    },

    // Steps Management
    async getSteps(flowchartId: string): Promise<FlowStep[]> {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase!.from('flow_steps')
                .select('*')
                .eq('flowchart_id', flowchartId)
                .order('order');

            if (error) throw error;
            return data.map(s => ({
                id: s.id,
                flowchartId: s.flowchart_id,
                name: s.name,
                description: s.description || '',
                order: s.order,
                deadlineDays: s.deadline_days,
                responsibleRole: s.responsible_role as any,
                mandatory: s.is_mandatory,
                checklist: s.checklist || [],
                createdAt: s.created_at
            })) as FlowStep[];
        }

        const steps = getFromLocalStorage<FlowStep>('vob_flow_steps');
        return steps.filter(s => s.flowchartId === flowchartId).sort((a, b) => a.order - b.order);
    },

    async saveSteps(flowchartId: string, steps: FlowStep[]): Promise<void> {
        if (isSupabaseConfigured()) {
            // Transaction-like approach: delete all for flowchart and re-insert
            const { error: deleteError } = await supabase!.from('flow_steps').delete().eq('flowchart_id', flowchartId);
            if (deleteError) throw deleteError;

            if (steps.length > 0) {
                const toInsert = steps.map(s => ({
                    flowchart_id: flowchartId,
                    name: s.name,
                    description: s.description,
                    order: s.order,
                    deadline_days: s.deadlineDays,
                    responsible_role: s.responsibleRole,
                    is_mandatory: s.mandatory,
                    checklist: s.checklist
                }));
                const { error: insertError } = await supabase!.from('flow_steps').insert(toInsert);
                if (insertError) throw insertError;
            }
            return;
        }

        const allSteps = getFromLocalStorage<FlowStep>('vob_flow_steps');
        const otherSteps = allSteps.filter(s => s.flowchartId !== flowchartId);
        saveToLocalStorage('vob_flow_steps', [...otherSteps, ...steps]);
    }
};

// ============================================================================
// FLOW EXECUTION SERVICE
// ============================================================================

export const flowExecutionService = {
    async getState(processId: string): Promise<ProcessFlowState | null> {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase!.from('process_flow_states')
                .select('*')
                .eq('process_id', processId)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Row not found"
            if (!data) return null;

            return {
                id: data.id,
                processId: data.process_id,
                flowchartId: data.flowchart_id,
                currentStepId: data.current_step_id || '',
                status: data.status as any,
                startedAt: data.started_at
            };
        }

        const states = getFromLocalStorage<ProcessFlowState>('vob_process_flow_states');
        return states.find(s => s.processId === processId) || null;
    },

    async startFlow(processId: string, flowchartId: string): Promise<ProcessFlowState> {
        const steps = await flowchartService.getSteps(flowchartId);
        if (steps.length === 0) throw new Error('Flowchart has no steps');

        if (isSupabaseConfigured()) {
            const { data, error } = await supabase!.from('process_flow_states').insert({
                process_id: processId,
                flowchart_id: flowchartId,
                current_step_id: steps[0].id,
                status: 'active',
                started_at: new Date().toISOString()
            }).select().single();

            if (error) throw error;

            await this.logHistory({
                processId,
                toStepId: steps[0].id,
                userId: 'system',
                userName: 'Sistema',
                timestamp: new Date().toISOString(),
                comments: 'Fluxo iniciado'
            });

            return {
                id: data.id,
                processId: data.process_id,
                flowchartId: data.flowchart_id,
                currentStepId: data.current_step_id || '',
                status: data.status as any,
                startedAt: data.started_at
            };
        }

        const states = getFromLocalStorage<ProcessFlowState>('vob_process_flow_states');
        const newState: ProcessFlowState = {
            id: generateUUID(),
            processId,
            flowchartId,
            currentStepId: steps[0].id,
            startedAt: new Date().toISOString(),
            status: 'active'
        };
        states.push(newState);
        saveToLocalStorage('vob_process_flow_states', states);

        // Log history
        await this.logHistory({
            processId,
            toStepId: steps[0].id,
            userId: 'system', // TODO: Get current user
            userName: 'Sistema',
            timestamp: new Date().toISOString(),
            comments: 'Fluxo iniciado'
        });

        return newState;
    },

    async advanceStep(processId: string, nextStepId: string, userId: string, userName: string, comments?: string): Promise<void> {
        if (isSupabaseConfigured()) {
            // Get current state to know previous step
            const currentState = await this.getState(processId);
            if (!currentState) throw new Error('Process flow not started');
            const previousStepId = currentState.currentStepId;

            const { error } = await supabase!.from('process_flow_states')
                .update({
                    current_step_id: nextStepId,
                    status: 'active',
                    updated_at: new Date().toISOString()
                })
                .eq('process_id', processId);

            if (error) throw error;

            await this.logHistory({
                processId,
                fromStepId: previousStepId,
                toStepId: nextStepId,
                userId,
                userName,
                timestamp: new Date().toISOString(),
                comments
            });
            return;
        }

        const states = getFromLocalStorage<ProcessFlowState>('vob_process_flow_states');
        const index = states.findIndex(s => s.processId === processId);
        if (index === -1) throw new Error('Process flow not started');

        const currentState = states[index];
        const previousStepId = currentState.currentStepId;

        states[index] = {
            ...currentState,
            currentStepId: nextStepId,
            status: 'active' // Logic to check if it's the last step could be added here
        };
        saveToLocalStorage('vob_process_flow_states', states);

        await this.logHistory({
            processId,
            fromStepId: previousStepId,
            toStepId: nextStepId,
            userId,
            userName,
            timestamp: new Date().toISOString(),
            comments
        });
    },

    async returnStep(processId: string, previousStepId: string, userId: string, userName: string, comments?: string): Promise<void> {
        if (isSupabaseConfigured()) {
            const currentState = await this.getState(processId);
            if (!currentState) throw new Error('Process flow not started');
            const currentStepId = currentState.currentStepId;

            const { error } = await supabase!.from('process_flow_states')
                .update({
                    current_step_id: previousStepId,
                    status: 'active',
                    updated_at: new Date().toISOString()
                })
                .eq('process_id', processId);

            if (error) throw error;

            await this.logHistory({
                processId,
                fromStepId: currentStepId,
                toStepId: previousStepId,
                userId,
                userName,
                timestamp: new Date().toISOString(),
                comments: comments || 'Retorno de etapa'
            });
            return;
        }

        const states = getFromLocalStorage<ProcessFlowState>('vob_process_flow_states');
        const index = states.findIndex(s => s.processId === processId);
        if (index === -1) throw new Error('Process flow not started');

        const currentState = states[index];
        const currentStepId = currentState.currentStepId;

        states[index] = {
            ...currentState,
            currentStepId: previousStepId,
            status: 'active'
        };
        saveToLocalStorage('vob_process_flow_states', states);

        await this.logHistory({
            processId,
            fromStepId: currentStepId,
            toStepId: previousStepId,
            userId,
            userName,
            timestamp: new Date().toISOString(),
            comments: comments || 'Retorno de etapa'
        });
    },

    async getHistory(processId: string): Promise<FlowHistory[]> {
        if (isSupabaseConfigured()) {
            const { data, error } = await supabase!.from('flow_history')
                .select('*')
                .eq('process_id', processId)
                .order('timestamp', { ascending: false });

            if (error) throw error;
            return data.map(h => ({
                id: h.id,
                processId: h.process_id,
                fromStepId: h.from_step_id || undefined,
                toStepId: h.to_step_id || '',
                userId: h.user_id || '',
                userName: h.user_name || '',
                comments: h.comments || '',
                timestamp: h.timestamp
            })) as FlowHistory[];
        }

        const history = getFromLocalStorage<FlowHistory>('vob_flow_history');
        return history.filter(h => h.processId === processId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    async logHistory(entry: Omit<FlowHistory, 'id'>): Promise<void> {
        if (isSupabaseConfigured()) {
            const { error } = await supabase!.from('flow_history').insert({
                process_id: entry.processId,
                from_step_id: entry.fromStepId || null,
                to_step_id: entry.toStepId,
                user_id: entry.userId,
                user_name: entry.userName,
                comments: entry.comments || null,
                timestamp: entry.timestamp
            });
            if (error) throw error;
            return;
        }

        const history = getFromLocalStorage<FlowHistory>('vob_flow_history');
        history.push({ ...entry, id: generateUUID() });
        saveToLocalStorage('vob_flow_history', history);
    }
};

export const db = {
    clients: clientsService,
    processes: processesService,
    movements: movementsService,
    services: servicesService,
    agenda: agendaService,
    financial: financialService,
    financialCategories: financialCategoriesService,
    financialAccounts: financialAccountsService,
    documentTemplates: documentTemplatesService,
    users: userService,
    flowcharts: flowchartService,
    flowExecution: flowExecutionService,
    storage: storageService,
};
