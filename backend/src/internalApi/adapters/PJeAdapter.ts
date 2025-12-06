import {
    ProcessoNormalizado,
    SincronizarProcessoRequest
} from '../types/ProcessoNormalizado';

/**
 * Adapter para PJe (Processo Judicial Eletrônico)
 * 
 * Converte dados do PJe para Processo Normalizado
 * Requer certificado A1 para autenticação mTLS
 */
export class PJeAdapter {
    /**
     * Busca processo no PJe e normaliza
     */
    async buscar(request: SincronizarProcessoRequest): Promise<ProcessoNormalizado | null> {
        try {
            // TODO: Implementar quando certificado A1 estiver disponível
            // - Consultar PJe com mTLS
            // - Normalizar resposta

            console.log('[PJeAdapter] PJe ainda não implementado - certificado A1 necessário');
            return null;
        } catch (erro) {
            console.error('[PJeAdapter] Erro ao buscar:', erro);
            return null;
        }
    }
}
