/**
 * Interface base para clientes de tribunais.
 * 
 * Define contrato padrão que todos os clientes de tribunais devem implementar.
 * Permite adicionar novos tribunais sem modificar código existente (Open/Closed Principle).
 */

export interface ITribunalClient {
    /**
     * Código identificador do tribunal (ex: 'TJRN', 'TJSP', 'TRF5')
     */
    readonly codigoTribunal: string;

    /**
     * Nome completo do tribunal
     */
    readonly nomeTribunal: string;

    /**
     * URL base da API do tribunal
     */
    readonly baseUrl: string;

    /**
     * Busca processos associados a uma OAB.
     * 
     * @param oab - Número OAB no formato "OAB/UF NÚMERO"
     * @param advogadoId - ID do advogado (para usar certificado)
     * @param certPassword - Senha do certificado A1
     * @returns Lista de processos encontrados
     */
    buscarProcessosPorOAB(
        oab: string,
        advogadoId: string,
        certPassword: string
    ): Promise<ProcessoTribunal[]>;

    /**
     * Busca movimentações de um processo específico.
     * 
     * @param numeroProcesso - Número CNJ do processo
     * @param advogadoId - ID do advogado
     * @param certPassword - Senha do certificado
     */
    buscarMovimentacoes(
        numeroProcesso: string,
        advogadoId: string,
        certPassword: string
    ): Promise<MovimentacaoTribunal[]>;

    /**
     * Busca partes de um processo.
     */
    buscarPartes(
        numeroProcesso: string,
        advogadoId: string,
        certPassword: string
    ): Promise<ParteTribunal[]>;
}

/**
 * Estrutura de processo retornado pelo tribunal.
 */
export interface ProcessoTribunal {
    numeroProcesso: string;
    classe: string;
    assunto: string;
    valorCausa?: number;
    dataDistribuicao: Date;
    orgaoJulgador?: string;
    tribunal: string;
    grau: string;
}

/**
 * Estrutura de movimentação processual.
 */
export interface MovimentacaoTribunal {
    data: Date;
    tipo: string;
    descricao: string;
    complemento?: string;
}

/**
 * Estrutura de parte processual.
 */
export interface ParteTribunal {
    nome: string;
    tipoParte: string; // 'pessoa_fisica' | 'pessoa_juridica'
    polo: string; // 'ativo' | 'passivo'
    documento?: string; // CPF ou CNPJ
}

/**
 * Classe base abstrata para clientes de tribunais.
 * 
 * Fornece implementação comum e helpers para todos os tribunais.
 */
export abstract class TribunalBaseClient implements ITribunalClient {
    abstract readonly codigoTribunal: string;
    abstract readonly nomeTribunal: string;
    abstract readonly baseUrl: string;

    abstract buscarProcessosPorOAB(
        oab: string,
        advogadoId: string,
        certPassword: string
    ): Promise<ProcessoTribunal[]>;

    abstract buscarMovimentacoes(
        numeroProcesso: string,
        advogadoId: string,
        certPassword: string
    ): Promise<MovimentacaoTribunal[]>;

    abstract buscarPartes(
        numeroProcesso: string,
        advogadoId: string,
        certPassword: string
    ): Promise<ParteTribunal[]>;

    /**
     * Valida formato de número CNJ.
     * 
     * Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
     * Exemplo: 0800001-11.2024.8.20.0001
     */
    protected validarNumeroCNJ(numero: string): boolean {
        const regex = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
        return regex.test(numero);
    }

    /**
     * Extrai UF e número de OAB.
     * 
     * @param oab - "OAB/RN 12345" → { uf: 'RN', numero: '12345' }
     */
    protected parseOAB(oab: string): { uf: string; numero: string } | null {
        const regex = /^OAB\/([A-Z]{2})\s+(\d+)$/;
        const match = oab.match(regex);

        if (!match) {
            return null;
        }

        return {
            uf: match[1],
            numero: match[2]
        };
    }

    /**
     * Log padronizado para requisições.
     */
    protected log(mensagem: string, ...args: any[]): void {
        console.log(`[${this.codigoTribunal}]`, mensagem, ...args);
    }

    /**
     * Log de erro padronizado.
     */
    protected logErro(mensagem: string, error: any): void {
        console.error(`[${this.codigoTribunal}] ERRO:`, mensagem, error);
    }
}
