/**
 * Types for Process Parties (multi-client support)
 * Allows multiple clients per process with detailed party information
 */

export type PartyRole = 'plaintiff' | 'defendant' | 'third_party';
export type PartyType = 'individual' | 'company';

export interface ProcessParty {
    id: string;
    processId: string;

    // Party information
    name: string;
    role: PartyRole;
    type: PartyType;
    document?: string;  // CPF/CNPJ

    // Client relationship
    isClient: boolean;
    clientId?: string;

    // Additional metadata
    lawyerOab?: string;
    lawyerName?: string;
    email?: string;
    phone?: string;
    address?: string;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export interface CreateProcessPartyInput {
    processId: string;
    name: string;
    role: PartyRole;
    type: PartyType;
    document?: string;
    isClient?: boolean;
    clientId?: string;
    lawyerOab?: string;
    lawyerName?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface UpdateProcessPartyInput {
    name?: string;
    document?: string;
    isClient?: boolean;
    clientId?: string;
    lawyerOab?: string;
    lawyerName?: string;
    email?: string;
    phone?: string;
    address?: string;
}

// Helper type for grouping parties by role
export interface GroupedProcessParties {
    plaintiffs: ProcessParty[];
    defendants: ProcessParty[];
    thirdParties: ProcessParty[];
}

// Helper type for client identification result
export interface PartyClientMatch {
    party: ProcessParty;
    matchedClient?: {
        id: string;
        name: string;
        similarity: number;
    };
    suggestedClients?: Array<{
        id: string;
        name: string;
        similarity: number;
    }>;
}
