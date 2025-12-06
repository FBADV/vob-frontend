import { ITribunalClient } from './TribunalBaseClient';
import { TJRNClient } from './TJRNClient';
import { DataJudTribunalClient } from './DataJudTribunalClient';

/**
 * Factory para criar instâncias de clientes de tribunais.
 * 
 * PADRÃO: DataJud (processos reais, sem certificado)
 * ALTERNATIVAS: TJRN (mock), outros tribunais diretos
 */
export class TribunalClientFactory {

    private static readonly clients = new Map<string, ITribunalClient>([
        ['TJRN', new TJRNClient()],  // Mock - fallback
        ['DATAJUD', new DataJudTribunalClient(
            process.env.DATAJUD_API_KEY || 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='
        )]  // REAL - padrão
    ]);

    /**
     * Retorna cliente do tribunal especificado.
     * PADRÃO: DataJud (processos reais)
     * 
     * @param codigoTribunal - Código do tribunal (ex: 'TJRN', 'DATAJUD')
     * @returns Cliente do tribunal
     * @throws Error se tribunal não estiver implementado
     */
    static getClient(codigo: string = 'DATAJUD'): ITribunalClient {
        const client = this.clients.get(codigo.toUpperCase());

        if (!client) {
            console.warn(`[TribunalFactory] Tribunal ${codigo} não encontrado, usando DataJud`);
            return this.clients.get('DATAJUD')!;
        }

        return client;
    }

    /**
     * Lista todos os tribunais implementados.
     */
    static getTribunaisDisponiveis(): string[] {
        return Array.from(this.clients.keys());
    }

    /**
     * Detecta tribunal a partir do número CNJ do processo.
     * 
     * Formato CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
     * - J = Segmento (8 = Justiça Estadual)
     * - TR = Tribunal (20 = TJRN)
     * 
     * @param numeroProcesso - Número CNJ completo
     * @returns Código do tribunal ou null se não detectar
     */
    static detectarTribunalPorNumeroCNJ(numeroProcesso: string): string | null {
        const regex = /^\d{7}-\d{2}\.\d{4}\.(\d)\.(\d{2})\.\d{4}$/;
        const match = numeroProcesso.match(regex);

        if (!match) {
            return null;
        }

        // segmento = match[1]; // Justiça (8 = Estadual, 5 = Federal, etc)
        const codigoTR = match[2]; // Código do tribunal

        // Mapeamento de códigos TR para tribunais
        const mapa: Record<string, string> = {
            '20': 'TJRN', // Rio Grande do Norte
            '05': 'TJSP', // São Paulo
            // Adicionar outros conforme necessário
        };

        return mapa[codigoTR] || null;
    }
}
