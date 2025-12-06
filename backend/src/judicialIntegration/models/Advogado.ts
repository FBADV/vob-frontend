/**
 * Interface representando profissional advogado cadastrado no sistema.
 * 
 * A OAB deve ser única no sistema e seguir formato "OAB/UF NÚMERO".
 * O certificado A1 é armazenado criptografado em filesystem.
 */
export interface Advogado {
    /** UUID v4 - Chave primária */
    id: string;

    /** Nome completo do advogado conforme registro profissional */
    nome: string;

    /** Número de inscrição OAB no formato "OAB/UF NÚMERO" (ex: "OAB/RN 12345") */
    oab: string;

    /** Caminho absoluto para arquivo criptografado contendo certificado A1 */
    certificadoPath?: string;

    /** Data de expiração do certificado A1 */
    certificadoValidoAte?: Date;

    /** Timestamp de criação do registro */
    createdAt: Date;

    /** Timestamp da última atualização */
    updatedAt: Date;
}
