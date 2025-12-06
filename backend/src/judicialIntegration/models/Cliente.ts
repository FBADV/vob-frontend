/**
 * Interface representando cliente do advogado.
 * 
 * Pode ser criado via onboarding processual (a partir de ParteProcessual)
 * ou via cadastro manual pelo advogado.
 * 
 * Campos de contato e endereço são opcionais inicialmente, podendo ser
 * complementados posteriormente pelo advogado.
 */
export interface Cliente {
    /** UUID v4 - Chave primária */
    id: string;

    /** Chave estrangeira para Advogado (garantindo segregação de dados) */
    advogadoId: string;

    // ========== DADOS BÁSICOS ==========

    /** Nome completo do cliente */
    nome: string;

    /** CPF ou CNPJ sem formatação */
    documento?: string;

    /** Tipo de documento */
    tipoDocumento?: 'CPF' | 'CNPJ';

    // ========== CONTATO (a ser complementado) ==========

    /** Endereço de email */
    email?: string;

    /** Telefone fixo */
    telefone?: string;

    /** Telefone celular */
    celular?: string;

    // ========== ENDEREÇO (a ser complementado) ==========

    /** Logradouro completo */
    endereco?: string;

    /** Cidade */
    cidade?: string;

    /** Sigla da UF (ex: "RN", "SP") */
    estado?: string;

    /** CEP no formato NNNNN-NNN */
    cep?: string;

    // ========== METADATA ==========

    /**
     * Origem da criação do cliente:
     * - onboarding_processo: Criado automaticamente a partir de ParteProcessual
     * - cadastro_manual: Criado manualmente pelo advogado
     */
    origemCriacao: 'onboarding_processo' | 'cadastro_manual';

    /** UUID da ParteProcessual que originou este cliente (quando origemCriacao=onboarding_processo) */
    parteProcessualOrigemId?: string;

    // ========== AUDITORIA ==========

    /** Timestamp de criação do registro */
    createdAt: Date;

    /** Timestamp da última atualização */
    updatedAt: Date;
}
