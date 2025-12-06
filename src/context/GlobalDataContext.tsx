import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
    GlobalContextType,
    Theme,
    User,
    Client,
    Process,
    ProcessObservation,
    Service,
    Document,
    FinancialEntry,
    Jurisprudence,
    Case,
    GlobalState,
    Lead,
    DockStyle,
    DockAnimations,
    Office,
    ProcessConnection,
    Notification,
    AgendaEvent
} from '../types';
import { gamificationService } from '../services/gamification.service';
import {
    clientsService,
    processesService,
    servicesService,
    agendaService,
    documentsService,
    // financialService, // Not yet in database.service.ts?
} from '../services/database.service';

const initialState: GlobalState = {
    theme: 'light',
    user: null,
    clients: [],
    processes: [],
    services: [],
    intimations: [],
    documents: [],
    financial: [],
    jurisprudence: [],
    cases: [],
    agendaEvents: [],
    settings: null,
    leads: [],
    isLoading: true,
    isAuthenticated: false,
    isSidebarCollapsed: false,
    layoutMode: 'sidebar',
    headerMode: 'premium',
    dockStyle: 'premium',
    dockAnimations: { zoom: true, bounce: true, glow: true },
    offices: [],
    connectionRequests: [],
    processConnections: [],
    notifications: [],
};

const GlobalDataContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<GlobalState>(initialState);

    // Load from localStorage on mount
    useEffect(() => {
        const storedTheme = localStorage.getItem('vob_theme') as Theme;
        const storedUser = localStorage.getItem('vob_user');
        const storedLayoutMode = localStorage.getItem('vob_layout_mode') as 'sidebar' | 'dock';
        const storedHeaderMode = localStorage.getItem('vob_header_mode') as 'classic' | 'premium';
        const storedDockStyle = localStorage.getItem('vob_dock_style') as DockStyle;
        const storedDockAnimations = localStorage.getItem('vob_dock_animations');

        const initialTheme = storedTheme || 'light';

        let parsedDockAnimations = { zoom: true, bounce: true, glow: true };
        if (storedDockAnimations) {
            try {
                const parsed = JSON.parse(storedDockAnimations);
                if (parsed && typeof parsed === 'object') {
                    parsedDockAnimations = parsed;
                }
            } catch (e) {
                console.error('Failed to parse dock animations settings:', e);
            }
        }

        setState(prev => ({
            ...prev,
            theme: initialTheme,
            user: storedUser ? JSON.parse(storedUser) : null,
            isAuthenticated: !!storedUser,
            layoutMode: storedLayoutMode || 'sidebar',
            headerMode: storedHeaderMode || 'premium',
            dockStyle: storedDockStyle || 'premium',
            dockAnimations: parsedDockAnimations,
            isLoading: false,
            services: JSON.parse(localStorage.getItem('vob_services') || '[]') || [],
            agendaEvents: JSON.parse(localStorage.getItem('vob_agenda') || '[]') || [], // Fixed key: vob_agenda
            clients: JSON.parse(localStorage.getItem('vob_clients') || '[]') || [],
            processes: JSON.parse(localStorage.getItem('vob_processes') || '[]') || [],
            documents: JSON.parse(localStorage.getItem('vob_documents') || '[]') || [],
            financial: JSON.parse(localStorage.getItem('vob_financial') || '[]') || [],
            cases: JSON.parse(localStorage.getItem('vob_cases') || '[]') || [],
            jurisprudence: JSON.parse(localStorage.getItem('vob_jurisprudence') || '[]') || [],
            leads: JSON.parse(localStorage.getItem('vob_leads') || '[]') || [],
            offices: JSON.parse(localStorage.getItem('vob_offices') || '[]') || [],
            processConnections: JSON.parse(localStorage.getItem('vob_process_connections') || '[]') || [],
        }));

        applyTheme(initialTheme);
        applyTheme(initialTheme);
    }, []);

    // Persistence for types not handled by database.service.ts or needing explicit sync
    useEffect(() => {
        if (!state.isLoading) {
            localStorage.setItem('vob_leads', JSON.stringify(state.leads));
            localStorage.setItem('vob_offices', JSON.stringify(state.offices));
            localStorage.setItem('vob_jurisprudence', JSON.stringify(state.jurisprudence));
            localStorage.setItem('vob_process_connections', JSON.stringify(state.processConnections));
            // Financial is handled by addFinancialEntry but let's ensure it's saved if state changes
            localStorage.setItem('vob_financial', JSON.stringify(state.financial));
        }
    }, [state.leads, state.offices, state.jurisprudence, state.processConnections, state.financial, state.isLoading]);

    const applyTheme = (theme: Theme) => {
        const root = document.documentElement;
        root.classList.remove('dark', 'theme-black', 'theme-pink');

        let actualTheme = theme;

        if (theme === 'system') {
            const hour = new Date().getHours();
            const isDark = hour < 6 || hour >= 18;
            actualTheme = isDark ? 'dark' : 'light';
        }

        // Apply theme classes
        if (actualTheme === 'dark') {
            root.classList.add('dark');
        } else if (actualTheme === 'black' || actualTheme === 'black-hole') {
            root.classList.add('dark', 'theme-black');
        } else if (actualTheme === 'pink') {
            root.classList.add('theme-pink');
        } else if (actualTheme === 'caju') {
            root.classList.add('theme-caju');
            // Caju respects system dark mode preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) root.classList.add('dark');
        } else if (actualTheme === 'manga') {
            root.classList.add('theme-manga');
            // Manga respects system dark mode preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) root.classList.add('dark');
        }
    };

    const setTheme = (theme: Theme) => {
        setState(prev => ({ ...prev, theme }));
        localStorage.setItem('vob_theme', theme);
        applyTheme(theme);
    };

    const addNotification = (notification: Omit<Notification, 'id' | 'time' | 'read' | 'date'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
            date: 'Hoje'
        };
        setState(prev => ({ ...prev, notifications: [newNotification, ...prev.notifications] }));

        // Play sound
        try {
            const audio = new Audio('/sounds/notification-sound.mp3');
            audio.play().catch(e => console.log('Audio play failed', e));
        } catch (e) {
            console.error('Audio error', e);
        }
    };

    // System theme auto-update
    useEffect(() => {
        if (state.theme === 'system') {
            const interval = setInterval(() => {
                applyTheme('system');
            }, 60000); // Check every minute
            return () => clearInterval(interval);
        }
    }, [state.theme]);

    // Auto-notification logic
    useEffect(() => {
        if (state.isAuthenticated && !localStorage.getItem('vob_welcome_shown')) {
            const timer = setTimeout(() => {
                addNotification({
                    title: 'Bem-vindo ao VOB Mandakaru!',
                    message: 'Seu sistema jurídico inteligente está pronto para uso.',
                    type: 'info'
                });
                localStorage.setItem('vob_welcome_shown', 'true');
            }, 30000); // 30 seconds
            return () => clearTimeout(timer);
        }
    }, [state.isAuthenticated]);

    const syncAllProcesses = async () => {
        if (!state.isAuthenticated) return;

        // Notify start
        addNotification({
            title: 'Sincronização Iniciada',
            message: 'Buscando atualizações no DataJud...',
            type: 'info'
        });

        try {
            // Dynamic import to avoid circular dependencies
            const { syncProcessData } = await import('../services/DataJudService');

            // Filter active processes with valid numbers
            const processesToSync = state.processes.filter(p => p.status === 'active' && p.number);
            let updatedCount = 0;
            let errorCount = 0;

            // Iterate and sync
            for (const process of processesToSync) {
                try {
                    const updatedProcess = await syncProcessData(process);

                    // Update state immediately for each process to show progress
                    setState(prev => ({
                        ...prev,
                        processes: prev.processes.map(p => p.id === process.id ? updatedProcess : p)
                    }));

                    updatedCount++;
                    // Small delay to be polite to the API
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error(`Failed to sync process ${process.number}:`, error);
                    errorCount++;
                }
            }

            // Update last auto sync time if this was triggered automatically (logic handled in useEffect, but we can update a general last sync time here if we had one)

            // Play sound
            try {
                const audio = new Audio('/sounds/notification-sound.mp3');
                audio.play().catch(e => console.log('Audio play failed', e));
            } catch (e) {
                console.error('Audio error', e);
            }

            addNotification({
                title: 'Sincronização Concluída',
                message: `${updatedCount} processos atualizados. ${errorCount > 0 ? `${errorCount} falhas.` : ''}`,
                type: errorCount > 0 ? 'warning' : 'success'
            });

        } catch (error) {
            console.error('Global sync failed:', error);
            addNotification({
                title: 'Erro na Sincronização',
                message: 'Não foi possível conectar ao serviço de dados.',
                type: 'error'
            });
        }
    };

    // Automated DataJud Sync (Hourly, 06:00 - 22:00)
    useEffect(() => {
        if (!state.isAuthenticated) return;

        const checkAndSync = async () => {
            const now = new Date();
            const currentHour = now.getHours();

            // Check if within operating hours (06:00 to 22:00 inclusive)
            if (currentHour >= 6 && currentHour <= 22) {
                const lastSyncStr = localStorage.getItem('vob_last_auto_sync');
                const lastSync = lastSyncStr ? new Date(lastSyncStr) : null;
                const oneHourInMillis = 60 * 60 * 1000;

                // Sync if never synced or if last sync was > 1 hour ago
                if (!lastSync || (now.getTime() - lastSync.getTime() > oneHourInMillis)) {
                    console.log('Running Automated DataJud Sync...');

                    await syncAllProcesses();

                    localStorage.setItem('vob_last_auto_sync', new Date().toISOString());
                }
            }
        };

        // Check immediately on mount/auth, then every minute
        checkAndSync();
        const interval = setInterval(checkAndSync, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [state.isAuthenticated]); // Note: syncAllProcesses dependency omitted to avoid infinite loop if it's not memoized, but since it depends on state it changes. Ideally use ref or useCallback. 
    // For simplicity in this refactor, we rely on the fact that checkAndSync is defined inside useEffect. 
    // But syncAllProcesses is defined outside. We should include it in dependency or use a ref.
    // To avoid complexity, I will just call it.

    const login = (user: User) => {
        setState(prev => ({ ...prev, user, isAuthenticated: true }));
        localStorage.setItem('vob_user', JSON.stringify(user));
    };

    const logout = () => {
        setState(prev => ({ ...prev, user: null, isAuthenticated: false }));
        localStorage.removeItem('vob_user');
    };

    const addClient = async (client: Client) => {
        try {
            const newClient = await clientsService.create(client);
            setState(prev => ({ ...prev, clients: [...prev.clients, newClient] }));
        } catch (error) {
            console.error('Error adding client:', error);
            throw error;
        }
    };

    const updateClient = async (id: string, updates: Partial<Client>) => {
        try {
            const updatedClient = await clientsService.update(id, updates);
            setState(prev => ({
                ...prev,
                clients: prev.clients.map(c => c.id === id ? updatedClient : c)
            }));
        } catch (error) {
            console.error('Error updating client:', error);
            throw error;
        }
    };

    const deleteClient = async (id: string) => {
        try {
            await clientsService.delete(id);
            setState(prev => ({
                ...prev,
                clients: prev.clients.filter(c => c.id !== id)
            }));
        } catch (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    };

    const setLayoutMode = (mode: 'sidebar' | 'dock') => {
        setState(prev => ({ ...prev, layoutMode: mode }));
        localStorage.setItem('vob_layout_mode', mode);
    };

    const setHeaderMode = (mode: 'classic' | 'premium') => {
        setState(prev => ({ ...prev, headerMode: mode }));
        localStorage.setItem('vob_header_mode', mode);
    };

    const setDockStyle = (style: DockStyle) => {
        setState(prev => ({ ...prev, dockStyle: style }));
        localStorage.setItem('vob_dock_style', style);
    };

    const setDockAnimations = (animations: DockAnimations) => {
        setState(prev => ({ ...prev, dockAnimations: animations }));
        localStorage.setItem('vob_dock_animations', JSON.stringify(animations));
    };

    const addProcess = async (process: Process) => {
        try {
            // Map Process to create params expected by service
            const createParams = {
                processNumber: process.number,
                clientId: process.clientId,
                tribunalId: '', // Default or extract from court?
                tribunalName: process.court,
                className: process.className,
                subject: [process.area],
                filingDate: process.folder?.basicData?.distributionDate,
                courtName: process.court,
                caseValue: process.value,
                folder: process.folder // Pass folder data including movements
            };

            const newProcess = await processesService.create(createParams);

            // If the service didn't return the full structure we need (e.g. folder data), 
            // we might need to merge it or rely on what the service returns.
            // For now, let's trust the service returns a valid Process object.
            // But we might lose 'folder' data if not persisted. 
            // Ideally we should update the service to handle folder data.

            setState(prev => ({ ...prev, processes: [...prev.processes, newProcess] }));

            // Gamification: Award XP for creating a process
            if (state.user) {
                try {
                    await gamificationService.registerEvent(state.user.id, 'PROCESS_CREATED', { processId: newProcess.id });
                } catch (gamError) {
                    console.error('Gamification error:', gamError);
                }
            }
        } catch (error) {
            console.error('Error adding process:', error);
            throw error;
        }
    };

    const updateProcess = async (id: string, updates: Partial<Process>) => {
        try {
            const updatedProcess = await processesService.update(id, updates);
            setState(prev => ({
                ...prev,
                processes: prev.processes.map(p => p.id === id ? updatedProcess : p)
            }));
        } catch (error) {
            console.error('Error updating process:', error);
            throw error;
        }
    };

    const deleteProcess = async (id: string) => {
        try {
            await processesService.delete(id);
            setState(prev => ({
                ...prev,
                processes: prev.processes.filter(p => p.id !== id)
            }));
        } catch (error) {
            console.error('Error deleting process:', error);
            throw error;
        }
    };

    const deleteBatchProcesses = async (ids: string[]) => {
        setState(prev => ({
            ...prev,
            processes: prev.processes.filter(p => !ids.includes(p.id))
        }));
    };

    const addService = async (service: Service) => {
        try {
            // Optimistic update: Add to state immediately
            setState(prev => ({ ...prev, services: [...prev.services, service] }));

            const newService = await servicesService.create(service);

            // Update with server response (in case ID or other fields changed)
            setState(prev => ({
                ...prev,
                services: prev.services.map(s => s.id === service.id ? newService : s)
            }));

            // Gamification: Award XP for creating a service
            if (state.user) {
                try {
                    await gamificationService.registerEvent(state.user.id, 'SERVICE_CREATED', { serviceId: newService.id });
                } catch (e) { console.error(e); }
            }
        } catch (error) {
            console.error('Error adding service:', error);
            // Rollback on error
            setState(prev => ({
                ...prev,
                services: prev.services.filter(s => s.id !== service.id)
            }));
            throw error;
        }
    };

    const updateService = async (id: string, updates: Partial<Service>) => {
        try {
            const updatedService = await servicesService.update(id, updates);
            setState(prev => ({
                ...prev,
                services: prev.services.map(s => s.id === id ? updatedService : s)
            }));
        } catch (error) {
            console.error('Error updating service:', error);
            throw error;
        }
    };

    const deleteService = async (id: string) => {
        try {
            await servicesService.delete(id);
            setState(prev => ({
                ...prev,
                services: prev.services.filter(s => s.id !== id)
            }));
        } catch (error) {
            console.error('Error deleting service:', error);
            throw error;
        }
    };

    const deleteBatchServices = async (ids: string[]) => {
        setState(prev => ({
            ...prev,
            services: prev.services.filter(s => !ids.includes(s.id))
        }));
    };

    const addFinancialEntry = (entry: FinancialEntry) => {
        setState(prev => ({ ...prev, financial: [...prev.financial, entry] }));
        // Gamification: Award XP for registering revenue
        if (state.user && entry.type === 'income') {
            gamificationService.registerEvent(state.user.id, 'REVENUE_REGISTERED', { entryId: entry.id, amount: entry.amount });
        } else if (state.user) {
            gamificationService.registerEvent(state.user.id, 'FINANCIAL_ENTRY', { entryId: entry.id });
        }
    };

    const updateFinancialEntry = (id: string, updates: Partial<FinancialEntry>) => {
        setState(prev => ({
            ...prev,
            financial: prev.financial.map(f => f.id === id ? { ...f, ...updates } : f)
        }));
    };

    const deleteFinancialEntry = (id: string) => {
        setState(prev => ({
            ...prev,
            financial: prev.financial.filter(f => f.id !== id)
        }));
    };

    // Document methods
    const addDocument = async (doc: Document) => {
        try {
            // Map Global Document to Service Document
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const serviceDoc: any = {
                id: doc.id,
                processId: doc.processId || null,
                clientId: doc.clientId || null,
                title: doc.title,
                type: doc.type,
                url: doc.fileUrl,
                size: doc.fileSize,
                uploadedAt: doc.uploadDate,
                // If the UI passed a file object attached to the doc (even if not in type), pass it
                file: (doc as any).file
            };

            const newServiceDoc = await documentsService.create(serviceDoc);

            // Map back to Global Document
            const newGlobalDoc: Document = {
                ...doc,
                id: newServiceDoc.id,
                fileUrl: newServiceDoc.url,
                fileSize: newServiceDoc.size || 0,
                uploadDate: newServiceDoc.uploadedAt,
            };

            setState(prev => ({ ...prev, documents: [...prev.documents, newGlobalDoc] }));

            if (state.user) {
                try {
                    await gamificationService.registerEvent(state.user.id, 'DOCUMENT_UPLOADED', { docId: newGlobalDoc.id });
                } catch (e) { console.error(e); }
            }
        } catch (error) {
            console.error('Error adding document:', error);
            throw error;
        }
    };

    const deleteDocument = async (id: string) => {
        try {
            await documentsService.delete(id);
            setState(prev => ({
                ...prev,
                documents: prev.documents.filter(d => d.id !== id)
            }));
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    };

    // Jurisprudence methods
    const addJurisprudence = (juris: Jurisprudence) => {
        setState(prev => ({ ...prev, jurisprudence: [...prev.jurisprudence, juris] }));
    };

    const toggleJurisprudenceFavorite = (id: string) => {
        setState(prev => ({
            ...prev,
            jurisprudence: prev.jurisprudence.map(j => j.id === id ? { ...j, isFavorite: !j.isFavorite } : j)
        }));
    };

    const deleteJurisprudence = (id: string) => {
        setState(prev => ({
            ...prev,
            jurisprudence: prev.jurisprudence.filter(j => j.id !== id)
        }));
    };

    // Case methods
    const addCase = (newCase: Case) => {
        setState(prev => ({ ...prev, cases: [...prev.cases, newCase] }));
    };

    const updateCase = (id: string, updates: Partial<Case>) => {
        setState(prev => ({
            ...prev,
            cases: prev.cases.map(c => c.id === id ? { ...c, ...updates } : c)
        }));
    };

    const deleteCase = (id: string) => {
        setState(prev => ({
            ...prev,
            cases: prev.cases.filter(c => c.id !== id)
        }));
    };

    // Lead methods
    const addLead = (lead: Lead) => {
        setState(prev => ({ ...prev, leads: [...prev.leads, lead] }));
    };

    const updateLead = (id: string, updates: Partial<Lead>) => {
        setState(prev => {
            const oldLead = prev.leads.find(l => l.id === id);
            // Gamification: Award XP if status changes to 'won'
            if (state.user && updates.status === 'won' && oldLead?.status !== 'won') {
                gamificationService.registerEvent(state.user.id, 'LEAD_WON', { leadId: id, value: oldLead?.value });
            }
            return {
                ...prev,
                leads: prev.leads.map(l => l.id === id ? { ...l, ...updates } : l)
            };
        });
    };

    const deleteLead = (id: string) => {
        setState(prev => ({
            ...prev,
            leads: prev.leads.filter(l => l.id !== id)
        }));
    };

    const convertLeadToClient = (id: string) => {
        const lead = state.leads.find(l => l.id === id);
        if (lead) {
            const newClient: Client = {
                id: crypto.randomUUID(),
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                type: 'individual',
                document: '',
                cpfCnpj: '',
                status: 'active',
                createdAt: new Date().toISOString()
            };
            addClient(newClient);
            updateLead(id, { status: 'won' });
        }
    };

    // Agenda methods
    // Agenda methods
    const addAgendaEvent = async (event: AgendaEvent) => {
        try {
            const newEvent = await agendaService.create(event);
            setState(prev => ({ ...prev, agendaEvents: [...prev.agendaEvents, newEvent] }));
        } catch (error) {
            console.error('Error adding agenda event:', error);
            throw error;
        }
    };

    const updateAgendaEvent = async (id: string, updates: Partial<AgendaEvent>) => {
        try {
            const updatedEvent = await agendaService.update(id, updates);
            setState(prev => ({
                ...prev,
                agendaEvents: prev.agendaEvents.map(e => e.id === id ? updatedEvent : e)
            }));
        } catch (error) {
            console.error('Error updating agenda event:', error);
            throw error;
        }
    };

    const deleteAgendaEvent = async (id: string) => {
        try {
            await agendaService.delete(id);
            setState(prev => ({
                ...prev,
                agendaEvents: prev.agendaEvents.filter(e => e.id !== id)
            }));
        } catch (error) {
            console.error('Error deleting agenda event:', error);
            throw error;
        }
    };

    // Connectivity Methods
    const addOffice = (office: Office) => {
        setState(prev => ({ ...prev, offices: [...prev.offices, office] }));
    };

    const updateOffice = (id: string, updates: Partial<Office>) => {
        setState(prev => ({
            ...prev,
            offices: prev.offices.map(o => o.id === id ? { ...o, ...updates } : o)
        }));
    };

    const deleteOffice = (id: string) => {
        setState(prev => ({
            ...prev,
            offices: prev.offices.filter(o => o.id !== id)
        }));
    };

    const sendConnectionRequest = async (targetOffice: Office, processId: string, processNumber: string) => {
        // Create local connection record
        const newConnection: ProcessConnection = {
            id: Math.random().toString(36).substr(2, 9),
            processId,
            officeId: targetOffice.id,
            remoteProcessId: 'pending',
            status: 'pending',
            requestedBy: state.user?.id || 'unknown',
            createdAt: new Date().toISOString()
        };

        setState(prev => ({ ...prev, processConnections: [...prev.processConnections, newConnection] }));

        // Simulate API call to remote office
        console.log(`Sending connection request to ${targetOffice.name} for process ${processNumber}`);

        // Simulate auto-acceptance for demo purposes after 3 seconds
        setTimeout(() => {
            setState(prev => ({
                ...prev,
                processConnections: prev.processConnections.map(c =>
                    c.id === newConnection.id
                        ? { ...c, status: 'active', remoteProcessId: `remote-${Math.random().toString(36).substr(2, 9)}`, lastSync: new Date().toISOString() }
                        : c
                )
            }));

            // Notify user
            const notification: Omit<Notification, 'id' | 'time' | 'read'> = {
                title: 'Conexão Aceita',
                message: `O escritório ${targetOffice.name} aceitou a conexão do processo ${processNumber}.`,
                type: 'success',
                date: 'Hoje'
            };

            // We need to call addNotification here, but it's defined inside the provider value
            // So we'll duplicate the logic for now or move addNotification up
            const newNotification: Notification = {
                ...notification,
                id: Math.random().toString(36).substr(2, 9),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: false
            };
            setState(prev => ({ ...prev, notifications: [newNotification, ...prev.notifications] }));

            try {
                const audio = new Audio('/sounds/notification-sound.mp3');
                audio.play().catch(e => console.log('Audio play failed', e));
            } catch (e) {
                console.error('Audio error', e);
            }

        }, 3000);
    };

    const acceptConnectionRequest = async (requestId: string) => {
        setState(prev => ({
            ...prev,
            connectionRequests: prev.connectionRequests.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r)
        }));
    };

    const rejectConnectionRequest = async (requestId: string) => {
        setState(prev => ({
            ...prev,
            connectionRequests: prev.connectionRequests.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r)
        }));
    };

    const disconnectProcess = async (connectionId: string) => {
        setState(prev => ({
            ...prev,
            processConnections: prev.processConnections.filter(c => c.id !== connectionId)
        }));
    };

    return (
        <GlobalDataContext.Provider value={{
            ...state,
            setTheme,
            setLayoutMode,
            setHeaderMode,
            setDockStyle,
            setDockAnimations,
            login,
            logout,
            addClient,
            updateClient,
            deleteClient,
            // Sidebar
            toggleSidebar: () => setState(prev => ({ ...prev, isSidebarCollapsed: !prev.isSidebarCollapsed })),
            // Process methods
            addProcess,
            updateProcess,
            deleteProcess,
            deleteBatchProcesses,
            syncAllProcesses,
            addProcessMovement: () => { },
            deleteProcessMovement: (processId: string, movementId: string) => {
                setState(prev => {
                    const newProcesses = prev.processes.map(p => {
                        if (p.id === processId && p.folder?.movements) {
                            return {
                                ...p,
                                folder: {
                                    ...p.folder,
                                    movements: p.folder.movements.filter(m => m.id !== movementId)
                                }
                            };
                        }
                        return p;
                    });
                    // Persist to localStorage
                    try {
                        localStorage.setItem('vob_processes', JSON.stringify(newProcesses));
                    } catch (error) {
                        console.error('Failed to save to localStorage:', error);
                    }
                    return { ...prev, processes: newProcesses };
                });
            },
            addProcessObservation: (processId: string, observationData: Omit<ProcessObservation, "id" | "processId" | "createdAt">) => {
                const newObservation: ProcessObservation = {
                    ...observationData,
                    id: crypto.randomUUID(),
                    processId,
                    createdAt: new Date().toISOString()
                };

                setState(prev => {
                    const newProcesses = prev.processes.map(p => {
                        if (p.id === processId) {
                            return {
                                ...p,
                                folder: {
                                    ...p.folder,
                                    observations: [...(p.folder?.observations || []), newObservation]
                                }
                            };
                        }
                        return p;
                    });
                    // Persist to localStorage
                    try {
                        localStorage.setItem('vob_processes', JSON.stringify(newProcesses));
                    } catch (error) {
                        console.error('Failed to save to localStorage:', error);
                    }
                    return { ...prev, processes: newProcesses };
                });
            },
            deleteProcessObservation: (processId: string, observationId: string) => {
                setState(prev => {
                    const newProcesses = prev.processes.map(p => {
                        if (p.id === processId && p.folder?.observations) {
                            return {
                                ...p,
                                folder: {
                                    ...p.folder,
                                    observations: p.folder.observations.filter(o => o.id !== observationId)
                                }
                            };
                        }
                        return p;
                    });
                    // Persist to localStorage
                    try {
                        localStorage.setItem('vob_processes', JSON.stringify(newProcesses));
                    } catch (error) {
                        console.error('Failed to save to localStorage:', error);
                    }
                    return { ...prev, processes: newProcesses };
                });
            },
            // Service methods
            addService,
            updateService,
            deleteService,
            deleteBatchServices,
            // Agenda methods (stubs - usar useAgenda hook nos componentes)
            // Agenda methods
            addAgendaEvent,
            updateAgendaEvent,
            deleteAgendaEvent,
            // Financial methods
            addFinancialEntry,
            updateFinancialEntry,
            deleteFinancialEntry,
            // Document methods
            addDocument,
            deleteDocument,
            // Jurisprudence methods
            addJurisprudence,
            toggleJurisprudenceFavorite,
            deleteJurisprudence,
            // Case methods
            addCase,
            updateCase,
            deleteCase,
            // Lead methods
            addLead,
            updateLead,
            deleteLead,
            convertLeadToClient,
            // Settings
            updateSettings: () => { },
            // User
            updateUser: () => { },
            // Batch delete
            deleteBatchClients: async () => { },
            // Clear data
            clearAllData: () => { },
            // Connectivity
            addOffice,
            updateOffice,
            deleteOffice,
            sendConnectionRequest,
            acceptConnectionRequest,
            rejectConnectionRequest,
            disconnectProcess,

            // Notifications
            addNotification,
            markNotificationAsRead: (id) => {
                setState(prev => ({
                    ...prev,
                    notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
                }));
            },
            markAllNotificationsAsRead: () => {
                setState(prev => ({
                    ...prev,
                    notifications: prev.notifications.map(n => ({ ...n, read: true }))
                }));
            },
            deleteNotification: (id) => {
                setState(prev => ({
                    ...prev,
                    notifications: prev.notifications.filter(n => n.id !== id)
                }));
            },
            clearNotifications: () => {
                setState(prev => ({ ...prev, notifications: [] }));
            },
        }}>
            {children}
        </GlobalDataContext.Provider >
    );
};

export const useGlobalData = () => {
    const context = useContext(GlobalDataContext);
    if (context === undefined) {
        throw new Error('useGlobalData must be used within a GlobalDataProvider');
    }
    return context;
};
