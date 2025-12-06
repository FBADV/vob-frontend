/**
 * Interface representando pessoa física ou jurídica participante de processo judicial.
 * 
 * Importado automaticamente durante sincronização inicial de processos.
 * O advogado seleciona quais partes são seus clientes via fluxo de onboarding.
 */
export interface ParteProcessual {
    /** UUID v4 - Chave primária */
    id: string;

    /** Chave estrangeira para ProcessoAdvogado */
    processoId: string;

    // ========== DADOS DA PARTE ==========

    /** Nome completo (pessoa física) ou razão social (pessoa jurídica) */
    nomeParte: string;

    /** Tipologia processual da parte */
    tipoParte: 'autor' | 'reu' | 'litisconsorte_ativo' | 'litisconsorte_passivo' |
    'terceiro_interessado' | 'assistente' | 'opoente' | 'outro';

    /** Polo processual */
    polo: 'ativo' | 'passivo' | 'terceiro';

    // ========== DOCUMENTAÇÃO ==========

    /** CPF (NNN.NNN.NNN-NN) ou CNPJ (NN.NNN.NNN/NNNN-NN) sem formatação */
    documento?: string;

    /** Tipo de documento */
    tipoDocumento?: 'CPF' | 'CNPJ';

    // ========== INFORMAÇÕES ADICIONAIS ==========

    /** Endereço completo da parte */
    endereco?: string;

    /** Nomes dos advogados representantes dessa parte */
    advogados?: string[];

    // ========== VINCULAÇÃO COM CLIENTE ==========

    /** Flag indicando se foi selecionada como cliente do advogado */
    isCliente: boolean;

    /** UUID do Cliente criado a partir desta parte (quando isCliente=true) */
    clienteId?: string;

    // ========== AUDITORIA ==========

    /** Timestamp de inserção do registro */
    createdAt: Date;
}
