/**
 * Interface representando processo judicial vinculado a advogado específico.
 * 
 * Processos importados via sincronização inicial recebem statusOnboarding
 * "aguardando_definicao_cliente" e transitam para "cliente_definido" após
 * seleção de partes-clientes, finalizando em "onboarding_concluido".
 */
export interface ProcessoAdvogado {
    /** UUID v4 - Chave primária */
    id: string;

    /** Número CNJ no formato NNNNNNN-DD.AAAA.J.TR.OOOO */
    numeroProcesso: string;

    /** OAB do advogado responsável */
    oabAdvogado: string;

    /** Chave estrangeira para Advogado */
    advogadoId: string;

    // ========== DADOS DO TRIBUNAL ==========

    /** Tribunal de origem (ex: "TJSP", "TJRN", "TRF3") */
    tribunal: string;

    /** Descrição completa do órgão julgador */
    orgaoJulgador: string;

    /** Fonte de dados original: "DataJud" | "PDPJ" | "PortalJusBr" | "Mock" */
    sistemaOrigem: string;

    // ========== DADOS PROCESSUAIS ==========

    /** Classe processual conforme Tabela CNJ */
    classe?: string;

    /** Assunto principal conforme Tabela CNJ */
    assuntoPrincipal?: string;

    /** Valor da causa em reais */
    valorCausa?: number;

    /** Data de distribuição do processo */
    dataDistribuicao?: Date;

    /** Nomes das partes no polo ativo */
    poloAtivo?: string[];

    /** Nomes das partes no polo passivo */
    poloPassivo?: string[];

    /** Situação processual atual */
    situacao?: string;

    /** Grau de jurisdição: "1º Grau" | "2º Grau" | "Tribunais Superiores" */
    grau?: string;

    // ========== STATUS DE ONBOARDING ==========

    /**
     * Status do fluxo de onboarding:
     * - aguardando_definicao_cliente: Processo importado, partes criadas, aguardando seleção
     * - cliente_definido: Advogado selecionou partes-clientes, clientes criados
     * - onboarding_concluido: Advogado validou e concluiu onboarding
     */
    statusOnboarding: 'aguardando_definicao_cliente' | 'cliente_definido' | 'onboarding_concluido';

    /** Lista de UUIDs dos clientes vinculados ao processo */
    clientesIds?: string[];

    // ========== AUDITORIA ==========

    /** Timestamp de criação do registro */
    createdAt: Date;

    /** Timestamp da última atualização */
    updatedAt: Date;

    /** Timestamp da última sincronização bem-sucedida */
    ultimaSincronizacao?: Date;
}
