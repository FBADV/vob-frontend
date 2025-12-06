import { advogadoRepository } from '../repositories/AdvogadoRepository';

/**
 * Serviço de gerenciamento de OAB (Ordem dos Advogados do Brasil).
 * 
 * RESPONSABILIDADES:
 * - Validação de formato OAB
 * - Atualização de OAB do advogado
 * - Garantia de unicidade
 */
export class OabService {
    private readonly OAB_REGEX = /^OAB\/[A-Z]{2}\s\d+$/;

    /**
     * Valida formato de OAB.
     * 
     * @param oab - OAB no formato "OAB/UF NÚMERO" (ex: "OAB/RN 12345")
     * @returns Objeto com flag de validade e mensagem de erro
     */
    validarOab(oab: string): { valido: boolean; erro?: string } {
        if (!this.OAB_REGEX.test(oab)) {
            return {
                valido: false,
                erro: 'Formato de OAB inválido. Use: OAB/UF NÚMERO (ex: OAB/RN 12345)'
            };
        }

        return { valido: true };
    }

    /**
     * Atualiza OAB do advogado.
     * 
     * @throws Error se formato inválido ou OAB já cadastrada para outro advogado
     */
    async atualizarOab(advogadoId: string, oab: string): Promise<any> {
        // Validar formato
        const validacao = this.validarOab(oab);
        if (!validacao.valido) {
            throw new Error(validacao.erro);
        }

        // Verificar duplicidade
        const oabDuplicada = await advogadoRepository.findByOab(oab);
        if (oabDuplicada && oabDuplicada.id !== advogadoId) {
            throw new Error(`OAB ${oab} já está cadastrada para outro advogado`);
        }

        // Atualizar
        const atualizado = await advogadoRepository.update(advogadoId, { oab });
        if (!atualizado) {
            throw new Error('Advogado não encontrado');
        }

        return atualizado;
    }
}

// Singleton
export const oabService = new OabService();
