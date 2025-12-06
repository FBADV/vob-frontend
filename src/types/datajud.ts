export type TribunalCategory =
    | 'superior'
    | 'federal'
    | 'estadual'
    | 'trabalho'
    | 'eleitoral'
    | 'militar';

export interface Tribunal {
    id: string;
    name: string;
    acronym: string;
    category: TribunalCategory;
    endpoint: string;
    region?: string;
}

export interface DataJudQuery {
    size?: number;
    query?: {
        match?: Record<string, any>;
        term?: Record<string, any>;
        range?: Record<string, any>;
        bool?: {
            must?: any[];
            should?: any[];
            must_not?: any[];
            minimum_should_match?: number;
        };
        match_all?: Record<string, never>;
    };
    sort?: Array<Record<string, 'asc' | 'desc'>>;
}

export interface DataJudMovement {
    dataHora: string;
    nome: string;
    complementosTabelados?: Array<{
        nome: string;
        valor: string;
    }>;
    complementosNacionais?: string[];
}

export interface DataJudProcess {
    numeroProcesso: string;
    classe?: {
        codigo: number;
        nome: string;
    };
    sistema?: {
        codigo: number;
        nome: string;
    };
    formato?: {
        codigo: number;
        nome: string;
    };
    tribunal?: string;
    dataHoraUltimaAtualizacao?: string;
    grau?: string;
    dataAjuizamento?: string;
    movimentos?: DataJudMovement[];
    assuntos?: Array<{
        codigo: number;
        nome: string;
    }>;
    orgaoJulgador?: {
        codigo: number;
        nome: string;
        codigoMunicipioIBGE?: string;
    };
    partes?: Array<{
        nome: string;
        polo: string;
        tipoPessoa?: string;
    }>;
    valorCausa?: number;
}

export interface DataJudResponse {
    took: number;
    timed_out: boolean;
    _shards: {
        total: number;
        successful: number;
        skipped: number;
        failed: number;
    };
    hits: {
        total: {
            value: number;
            relation: string;
        };
        max_score: number | null;
        hits: Array<{
            _index: string;
            _type?: string;
            _id: string;
            _score: number | null;
            _source: DataJudProcess;
        }>;
    };
}

export interface ProcessSearchParams {
    processNumber?: string;
    tribunals: string[];
    partyName?: string;
    subject?: string;
    startDate?: string;
    endDate?: string;
    class?: string;
    limit?: number;
}
