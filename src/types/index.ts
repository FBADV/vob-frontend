export type Theme = 'light' | 'dark' | 'black' | 'black-hole' | 'pink' | 'system' | 'mandakaru' | 'caju' | 'manga';

export * from './chat.types';
export * from './connectivity.types';
import type { Office, ConnectionRequest, ProcessConnection } from './connectivity.types';

export type DockStyle = 'premium' | 'minimal' | 'futurist';

export interface DockAnimations {
    zoom: boolean;
    bounce: boolean;
    glow: boolean;
}

export type UserRole = 'admin' | 'controller' | 'associate' | 'collaborator' | 'intern';

export interface UserPermissions {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canViewReports: boolean;
    canManageUsers: boolean;
    canAccessFinancial: boolean;
    canManageSettings: boolean;
    canExportData: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
    admin: {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canViewReports: true,
        canManageUsers: true,
        canAccessFinancial: true,
        canManageSettings: true,
        canExportData: true
    },
    controller: {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canViewReports: true,
        canManageUsers: false,
        canAccessFinancial: true,
        canManageSettings: false,
        canExportData: true
    },
    associate: {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canViewReports: false,
        canManageUsers: false,
        canAccessFinancial: false,
        canManageSettings: false,
        canExportData: false
    },
    collaborator: {
        canCreate: false,
        canEdit: true,
        canDelete: false,
        canViewReports: false,
        canManageUsers: false,
        canAccessFinancial: false,
        canManageSettings: false,
        canExportData: false
    },
    intern: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canViewReports: false,
        canManageUsers: false,
        canAccessFinancial: false,
        canManageSettings: false,
        canExportData: false
    }
};

export const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Administrador Master',
    controller: 'Controlador',
    associate: 'Advogado Associado',
    collaborator: 'Colaborador',
    intern: 'Estagiário'
};

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: UserRole;
    phone?: string;
    oab?: string;
    cpf?: string;
    photoUrl?: string;
    uf?: string;
    permissions?: UserPermissions; // Computed from role
}

export interface Honorarios {
    tipo: 'contratuais' | 'exito' | 'sucumbencia' | 'proveito_economico';
    valorPactuado: number;
    condicoes: string;
    dataInicio?: string;
    dataFim?: string;
    observacoes?: string;
}

export interface Client {
    id: string;
    name: string;
    nickname?: string;
    type: 'individual' | 'company';
    document: string; // CPF/CNPJ (compatibilidade com código existente)
    cpfCnpj: string; // Alias para document (pode ser o mesmo valor)
    email: string;
    phone: string;
    address?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    birthDate?: string;
    occupation?: string;
    maritalStatus?: string;
    nationality?: string;
    rg?: string;
    sex?: 'male' | 'female' | 'other';
    socialName?: string; // Apelido ou Nome Social
    notes?: string;
    createdAt: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    photoUrl?: string;
    tags?: string[];
    status: 'active' | 'inactive' | 'potential';
    origin?: 'lead' | 'indication' | 'direct' | 'judicial' | 'other';
    originDetails?: string;
    companyName?: string; // Para PJ
    representativeId?: string; // ID do representante legal (PJ)
    stateRegistration?: string; // Inscrição Estadual (PJ)
    municipalRegistration?: string; // Inscrição Municipal (PJ)
    responsiblePerson?: string; // Responsável legal (PJ)
    responsibleCPF?: string; // CPF do responsável (PJ)
    honorarios?: Honorarios; // Honorários/Contrato
}

export interface ProcessEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'movement' | 'publication' | 'hearing' | 'deadline' | 'document';
}

export interface ProcessParty {
    id: string;
    name: string;
    role: 'author' | 'defendant' | 'lawyer' | 'judge' | 'third_party';
    type: 'individual' | 'company';
}

export interface ProcessDocument {
    id: string;
    title: string;
    type: string;
    url: string;
    date: string;
}

// Court type classification based on CNJ number
export type CourtType = 'state1' | 'state2' | 'labor' | 'federal1' | 'federal2' | 'stj' | 'stf' | 'unknown';

// Court color mapping
export const COURT_COLORS: Record<CourtType, { bg: string; text: string; border: string }> = {
    state1: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
    state2: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-700' },
    labor: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700' },
    federal1: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-300 dark:border-green-700' },
    federal2: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-300 dark:border-teal-700' },
    stj: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700' },
    stf: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-700' },
    unknown: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-300 dark:border-gray-600' }
};

export interface ProcessMovement {
    id: string;
    processId: string;
    date: string;
    type: 'publicacao' | 'audiencia' | 'peticao' | 'decisao' | 'despacho' | 'sentenca' | 'prazo' | 'tarefa' | 'atendimento' | 'outro' | 'datajud';
    title: string;
    description: string;
    documents?: string[]; // IDs de documentos anexados
    isUserCreated?: boolean; // Indica se foi criada manualmente pelo usuário
    createdAt: string;
    // Campos adicionais do DataJud
    codigo?: string; // Código CNJ da movimentação
    orgaoJulgador?: string; // Nome do órgão julgador
    rawData?: any; // Dados brutos da API para referência
}

export interface ProcessObservation {
    id: string;
    processId: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ProcessTimeline {
    id: string;
    processId: string;
    date: string;
    event: string;
    description: string;
    type: 'inicio' | 'movimentacao' | 'audiencia' | 'decisao' | 'encerramento';
}

export interface Process {
    id: string;
    number: string;
    title: string;
    clientId?: string; // Now optional - processes can exist without a client
    clientName?: string;
    area: string;
    className: string;
    court: string;
    courtType?: CourtType; // Type of court based on CNJ number
    value: number;
    status: 'active' | 'suspended' | 'archived' | 'finished' | 'inactive' | 'pending_analysis';
    createdAt: string;
    updatedAt: string;

    // Estrutura de pasta do processo
    folder: {
        basicData: {
            plaintiff: string; // Autor
            plaintiffs?: string[]; // Lista de Autores
            defendant: string; // Réu
            defendants?: string[]; // Lista de Réus
            judge: string; // Juiz
            prosecutor: string; // Promotor (se aplicável)
            courtSection: string; // Vara
            distributionDate: string;
        };
        movements: ProcessMovement[];
        timeline: ProcessTimeline[];
        observations: ProcessObservation[];
        documents: string[]; // IDs dos documentos
    };
    // DataJud Sync Fields
    dataJudId?: string;
    lastSyncAt?: string;
    phase?: 'knowledge' | 'execution' | 'appeal' | 'archived'; // Fase processual
    datamartStatus?: string; // Situação Datamart
    instance?: string; // Grau/Instância
    subject?: string; // Assunto Principal
    createdBy?: string;
    updatedBy?: string;
    orderIndex?: number; // For manual ordering

    // New DataJud Fields
    subjects?: string[]; // Lista de assuntos
    ibgeCode?: string; // Código IBGE do município
    degree?: string; // Grau de jurisdição (G1, G2, etc)
}

export interface Service {
    id: string;
    title: string;
    clientId?: string; // Optional if personServed is used
    clientName?: string;
    personServed?: string; // Nome da pessoa atendida (se não for cliente cadastrado ou para especificar)
    createdBy?: string;
    updatedBy?: string;
    date: string;
    time: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'canceled';
    description: string;
    types: string[]; // Multiple types allowed
    deadlines?: Array<{
        date: string;
        description: string;
        completed: boolean;
    }>;
    feeAgreement?: {
        closed: boolean;
        value?: number;
        notes?: string;
    };
    convertedToProcessId?: string; // ID of the process if converted
    processNumber?: string; // Process number if user already has it
    createdAt: string;
}

export interface Intimation {
    id: string;
    processNumber: string;
    court: string;
    content: string;
    date: string;
    deadline?: string;
    isRead: boolean;
    status: 'pending' | 'evaluated' | 'concluded'; // New status flow
    evaluationNote?: string;
    source: 'DJE' | 'DJO' | 'Push';
}

export interface Document {
    id: string;
    title: string;
    type: 'contract' | 'petition' | 'procuration' | 'certificate' | 'report' | 'other';
    category: string;
    clientId?: string;
    processId?: string;
    fileUrl: string;
    fileSize: number; // in bytes
    uploadDate: string;
    tags: string[];
    origin?: 'manual' | 'datajud';
    dataJudId?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface FinancialEntry {
    id: string;
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: number;
    date: string;
    dueDate?: string;
    status: 'paid' | 'pending' | 'overdue' | 'canceled';
    createdBy?: string;
    updatedBy?: string;
    clientId?: string;
    processId?: string;
    paymentMethod?: string;
    createdAt: string;
}

export interface Jurisprudence {
    id: string;
    tribunal: string;
    number: string;
    title: string;
    summary: string;
    fullText: string;
    date: string;
    area: string; // e.g., Cível, Penal, Trabalhista
    keywords: string[];
    relatedLaws: string[];
    isFavorite: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt: string;
}

export interface CaseNote {
    id: string;
    content: string;
    createdAt: string;
    createdBy: string;
}

export interface Case {
    id: string;
    number: string;
    title: string;
    clientId: string;
    clientName?: string;
    type: 'judicial' | 'administrative' | 'extrajudicial';
    status: 'active' | 'archived' | 'closed';
    subject: string;
    court?: string;
    openingDate: string;
    closingDate?: string;
    summary: string;
    notes: CaseNote[];
    documentIds: string[];
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface AgendaEvent {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    startTime: string;
    endTime?: string;
    type: 'hearing' | 'meeting' | 'deadline' | 'consultation' | 'diligence' | 'other';
    location?: string;
    clientId?: string;
    processId?: string;
    caseId?: string;
    serviceId?: string;
    reminderMinutes?: number; // minutes before event
    status: 'scheduled' | 'completed' | 'canceled';
    createdBy?: string;
    updatedBy?: string;
    createdAt: string;
}

export interface UserSettings {
    notifications: {
        email: boolean;
        browser: boolean;
        deadlineReminder: boolean;
        intimationAlert: boolean;
    };
    display: {
        theme: Theme;
        compactMode: boolean;
        defaultView: string;
    };
    integrations: {
        emailSync: boolean;
        calendarSync: boolean;
        googleClientId?: string;
        googleApiKey?: string;
        googleCalendarId?: string;
        whatsappTemplate?: string;
    };
    lawyerProfile?: {
        name: string;
        oab: string;
        uf: string;
    };
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    time: string;
    read: boolean;
    date?: string;
    link?: string;
}

export interface GlobalState {
    theme: Theme;
    user: User | null;
    clients: Client[];
    processes: Process[];
    services: Service[];
    intimations: Intimation[];
    documents: Document[];
    financial: FinancialEntry[];
    jurisprudence: Jurisprudence[];
    cases: Case[];
    agendaEvents: AgendaEvent[];
    settings: UserSettings | null;
    leads: Lead[];
    isLoading: boolean;
    isAuthenticated: boolean;
    isSidebarCollapsed: boolean;
    layoutMode: 'sidebar' | 'dock';
    headerMode: 'classic' | 'premium';
    dockStyle: DockStyle;
    dockAnimations: DockAnimations;
    offices: Office[];
    connectionRequests: ConnectionRequest[];
    processConnections: ProcessConnection[];
    notifications: Notification[];
}

export interface GlobalContextType extends GlobalState {
    setTheme: (theme: Theme) => void;
    setLayoutMode: (mode: 'sidebar' | 'dock') => void;
    setHeaderMode: (mode: 'classic' | 'premium') => void;
    setDockStyle: (style: DockStyle) => void;
    setDockAnimations: (animations: DockAnimations) => void;
    toggleSidebar: () => void;
    login: (user: User) => void;
    logout: () => void;
    // Process Methods
    addProcess: (process: Process) => Promise<void>;
    updateProcess: (id: string, updates: Partial<Process>) => void;
    deleteProcess: (id: string) => void;
    deleteBatchProcesses: (ids: string[]) => void;
    syncAllProcesses: () => Promise<void>;

    // Process Details Methods
    addProcessMovement: (processId: string, movement: Omit<ProcessMovement, 'id' | 'processId' | 'createdAt'>) => void;
    deleteProcessMovement: (processId: string, movementId: string) => void;
    addProcessObservation: (processId: string, observation: Omit<ProcessObservation, 'id' | 'processId' | 'createdAt'>) => void;
    deleteProcessObservation: (processId: string, observationId: string) => void;

    // Service Methods
    addService: (service: Service) => void;
    updateService: (id: string, updates: Partial<Service>) => void;
    deleteService: (id: string) => void;
    deleteBatchServices: (ids: string[]) => void;

    // CRM Methods
    addLead: (lead: Lead) => void;
    updateLead: (id: string, updates: Partial<Lead>) => void;
    deleteLead: (id: string) => void;
    convertLeadToClient: (id: string) => void;

    // Existing methods
    addClient: (client: Client) => void;
    updateClient: (id: string, updates: Partial<Client>) => void;
    deleteClient: (id: string) => void;
    deleteBatchClients: (ids: string[]) => void;
    addDocument: (document: Document) => void;
    deleteDocument: (id: string) => void;
    clearAllData: () => void;
    addFinancialEntry: (entry: FinancialEntry) => void;
    updateFinancialEntry: (id: string, updates: Partial<FinancialEntry>) => void;
    deleteFinancialEntry: (id: string) => void;
    addJurisprudence: (jur: Jurisprudence) => void;
    toggleJurisprudenceFavorite: (id: string) => void;
    deleteJurisprudence: (id: string) => void;
    addCase: (caseItem: Case) => void;
    updateCase: (id: string, caseItem: Partial<Case>) => void;
    deleteCase: (id: string) => void;
    addAgendaEvent: (event: AgendaEvent) => void;
    updateAgendaEvent: (id: string, event: Partial<AgendaEvent>) => void;
    deleteAgendaEvent: (id: string) => void;
    updateSettings: (settings: Partial<UserSettings>) => void;
    updateUser: (updates: Partial<User>) => void;
    // Connectivity Methods
    addOffice: (office: Office) => void;
    updateOffice: (id: string, updates: Partial<Office>) => void;
    deleteOffice: (id: string) => void;
    sendConnectionRequest: (targetOffice: Office, processId: string, processNumber: string) => Promise<void>;
    acceptConnectionRequest: (requestId: string) => Promise<void>;
    rejectConnectionRequest: (requestId: string) => Promise<void>;
    disconnectProcess: (connectionId: string) => Promise<void>;

    // Notification Methods
    addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
    markNotificationAsRead: (id: string) => void;
    markAllNotificationsAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearNotifications: () => void;
}

export * from './datajud';

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    source: 'indication' | 'website' | 'social_media' | 'google' | 'other';
    status: 'new' | 'contacted' | 'meeting' | 'proposal' | 'won' | 'lost';
    value?: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface CRMColumn {
    id: string;
    title: string;
    status: Lead['status'];
    color: string;
    description?: string;
}

export interface FinancialCategory {
    id: string;
    name: string;
    type: 'income' | 'expense';
    color: string;
}

export interface FinancialAccount {
    id: string;
    name: string;
    bank: string;
    type: 'checking' | 'savings' | 'investment' | 'cash';
    initialBalance: number;
}

export interface DocumentTemplate {
    id: string;
    name: string;
    type: 'contract' | 'petition' | 'procuration' | 'other';
    description: string;
    content: string;
    lastModified: string;
}
