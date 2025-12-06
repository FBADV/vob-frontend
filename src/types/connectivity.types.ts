export interface Office {
    id: string;
    name: string;
    apiUrl: string; // URL da API do escritório parceiro
    apiKey: string; // Chave de autenticação
    status: 'active' | 'inactive';
}

export interface ProcessConnection {
    id: string;
    processId: string; // ID do processo no escritório local
    officeId: string; // ID do escritório parceiro
    remoteProcessId: string; // ID do processo no escritório parceiro
    status: 'pending' | 'active' | 'rejected' | 'disconnected';
    requestedBy: string; // User ID
    acceptedBy?: string; // User ID
    createdAt: string;
    lastSync?: string;
}

export interface ConnectionRequest {
    id: string;
    fromOfficeId: string;
    fromOfficeName: string;
    fromProcessId: string;
    processNumber: string; // Número do processo (CNJ)
    message?: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

export interface SyncEvent {
    type: 'movement' | 'manual_movement';
    processId: string;
    data: any;
    timestamp: string;
    source: 'local' | 'remote';
}
