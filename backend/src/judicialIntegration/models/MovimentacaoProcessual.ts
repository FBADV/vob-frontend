/**
 * Interface representando evento processual ocorrido em processo específico.
 * 
 * Movimentações são ordenadas por dataMovimentacao decrescente (mais recentes primeiro).
 */
export interface MovimentacaoProcessual {
    /** UUID v4 - Chave primária */
    id: string;

    /** Chave estrangeira para ProcessoAdvogado */
    processoId: string;

    /** Código da movimentação conforme Tabela CNJ */
    codigoMovimentacao?: string;

    /** Descrição textual completa da movimentação */
    descricaoMovimentacao: string;

    /** Data e hora da ocorrência da movimentação */
    dataMovimentacao: Date;

    /** Fonte de dados: "DataJud" | "PDPJ" | "PortalJusBr" | "Mock" */
    origemDados: 'DataJud' | 'PDPJ' | 'PortalJusBr' | 'Mock';

    /** Metadados adicionais em formato chave-valor */
    dadosComplementares?: Record<string, any>;

    /** Timestamp de inserção do registro */
    createdAt: Date;
}
