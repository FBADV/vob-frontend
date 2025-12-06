/**
 * Types for Jus.br (CNJ) and PJe API Integration
 * OAuth 2.0 + OpenID Connect authentication with certificate A1
 */

// OAuth Tokens
export interface OAuthTokens {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    expiresIn: number;
    tokenType: string;
    scope: string;
    obtainedAt: number; // timestamp
}

export interface OAuthConfig {
    clientId: string;
    redirectUri: string;
    scope: string;
    authorizationEndpoint: string;
    tokenEndpoint: string;
    userinfoEndpoint: string;
}

// PJe Process Data
export interface PJeProcess {
    numero: string;
    classe: string;
    assunto: string;
    tribunal: string;
    vara?: string;
    comarca?: string;
    valor?: number;
    dataDistribuicao?: string;
    dataAjuizamento?: string;
    status?: string;
    segredoJustica?: boolean;
}

// PJe Party (Parte do Processo)
export interface PJeParty {
    nome: string;
    documento?: string; // CPF/CNPJ
    tipo: 'FISICA' | 'JURIDICA';
    polo: 'ATIVO' | 'PASSIVO' | 'TERCEIRO';
    advogados?: PJeLawyer[];
    email?: string;
    telefone?: string;
    endereco?: string;
}

export interface PJeLawyer {
    nome: string;
    oab: string;
    uf: string;
    email?: string;
}

// PJe Movement (Movimentação)
export interface PJeMovement {
    data: string;
    tipo: string;
    descricao: string;
    complemento?: string;
    documentos?: PJeDocument[];
}

export interface PJeDocument {
    id: string;
    nome: string;
    tipo: string;
    dataPublicacao?: string;
    disponivel: boolean;
    sigilo: boolean;
}

// Complete PJe Process Details
export interface PJeProcessDetails extends PJeProcess {
    partes: PJeParty[];
    movimentacoes: PJeMovement[];
    documentos: PJeDocument[];
}

// API Response wrappers
export interface PJeAPIResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

export interface PJeProcessListResponse {
    processos: PJeProcess[];
    total: number;
    pagina: number;
    totalPaginas: number;
}

// Service configuration
export interface JusBrServiceConfig {
    ssoBaseUrl: string;
    apiBaseUrl: string;
    clientId: string;
    redirectUri: string;
    certificateRequired: boolean;
}

// Authentication state
export interface JusBrAuthState {
    isAuthenticated: boolean;
    tokens?: OAuthTokens;
    userInfo?: {
        sub: string;
        name?: string;
        email?: string;
        cpf?: string;
    };
    expiresAt?: number;
    isSimulated?: boolean;
}

// Search filters
export interface PJeSearchFilters {
    oab?: string;
    uf?: string;
    tribunal?: string;
    dataInicio?: string;
    dataFim?: string;
    classe?: string;
    comarca?: string;
    pagina?: number;
    tamanhoPagina?: number;
}
