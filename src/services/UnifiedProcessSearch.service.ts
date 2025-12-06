import { jusBrAPIService } from './jusbr-api.service';
import { searchByProcessNumber as searchDataJud } from './DataJudService';
import { jusBrOAuthService } from './jusbr-oauth.service';

export interface ProcessSearchResult {
    encontrado: boolean;
    fonte: 'pje' | 'datajud' | 'nenhuma';
    dados: any;
    mensagem?: string;
}

/**
 * Serviço Unificado de Busca de Processos
 * 
 * Estratégia Híbrida:
 * - PJe (Tempo Real) para processos recentes (< 2 anos)
 * - DataJud (Indexado) como fallback e para processos antigos
 * 
 * Garante acesso a dados sempre atualizados, eliminando delay de indexação
 */
export class UnifiedProcessSearchService {

    /**
     * Busca processo de forma inteligente
     * Prioriza PJe para processos recentes, DataJud como fallback
     */
    async searchProcess(processNumber: string): Promise<ProcessSearchResult> {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 BUSCA UNIFICADA DE PROCESSO');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 Número:', processNumber);

        const anoProcesso = this.extrairAnoProcesso(processNumber);
        const anoAtual = new Date().getFullYear();
        const isRecente = anoProcesso >= anoAtual - 1; // Processos de 2 anos ou menos

        console.log('📅 Ano do Processo:', anoProcesso);
        console.log('🆕 Processo Recente?', isRecente ? 'SIM' : 'NÃO');

        // ESTRATÉGIA 1: PJe (Tempo Real) - Para processos recentes
        if (isRecente) {
            console.log('');
            console.log('🎯 TENTATIVA 1: PJe/JusBrasil (Tempo Real)');
            console.log('   └─ Prioridade para processo recente');

            try {
                const pjeResult = await this.searchInPJe(processNumber);
                if (pjeResult.encontrado) {
                    console.log('   ✅ ENCONTRADO no PJe!');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    return pjeResult;
                }
                console.log('   ⚠️ Não encontrado no PJe');
            } catch (error) {
                const errorMsg = (error as Error).message;
                console.log('   ❌ Erro no PJe:', errorMsg);

                // Se não está autenticado, retorna logo para avisar
                if (errorMsg.includes('authenticated') || errorMsg.includes('autenticado')) {
                    console.log('   ℹ️ PJe não autenticado - sugerindo login');
                }
            }
        }

        // ESTRATÉGIA 2: DataJud (Indexado) - Para todos os processos
        console.log('');
        console.log('🎯 TENTATIVA 2: DataJud (Indexado)');
        try {
            const datajudResult = await this.searchInDataJud(processNumber);
            if (datajudResult.encontrado) {
                console.log('   ✅ ENCONTRADO no DataJud!');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                return datajudResult;
            }
            console.log('   ⚠️ Não encontrado no DataJud');
        } catch (error) {
            console.log('   ❌ Erro no DataJud:', (error as Error).message);
        }

        // ESTRATÉGIA 3: Entrada Manual
        console.log('');
        console.log('❌ Processo não encontrado em nenhuma fonte');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return {
            encontrado: false,
            fonte: 'nenhuma',
            dados: null,
            mensagem: this.getMensagemPersonalizada(processNumber, isRecente)
        };
    }

    /**
     * Busca no PJe (Dados em Tempo Real)
     */
    private async searchInPJe(processNumber: string): Promise<ProcessSearchResult> {
        // Verifica se está autenticado
        const authState = await jusBrOAuthService.getAuthState();
        const isAuthenticated = authState.isAuthenticated;

        if (!isAuthenticated) {
            throw new Error('PJe não autenticado');
        }

        try {
            const processDetails = await jusBrAPIService.getProcessDetails(processNumber);
            const movements = await jusBrAPIService.getProcessMovements(processNumber);
            const parties = await jusBrAPIService.getProcessParties(processNumber);

            return {
                encontrado: true,
                fonte: 'pje',
                dados: {
                    ...processDetails,
                    movimentacoes: movements,
                    partes: parties,
                    _metadata: {
                        fonte: 'PJe',
                        tempoReal: true,
                        dataConsulta: new Date().toISOString()
                    }
                }
            };
        } catch (error) {
            const errorMsg = (error as Error).message;
            if (errorMsg.includes('404') || errorMsg.includes('not found')) {
                return { encontrado: false, fonte: 'pje', dados: null };
            }
            throw error;
        }
    }

    /**
     * Busca no DataJud (Dados Indexados)
     */
    private async searchInDataJud(processNumber: string): Promise<ProcessSearchResult> {
        const result = await searchDataJud(processNumber);

        if (!result) {
            return { encontrado: false, fonte: 'datajud', dados: null };
        }

        const processData = result.data.hits.hits[0]?._source;

        return {
            encontrado: true,
            fonte: 'datajud',
            dados: {
                ...processData,
                _metadata: {
                    fonte: 'DataJud',
                    tribunal: result.tribunal.name,
                    dataConsulta: new Date().toISOString()
                }
            }
        };
    }

    /**
     * Extrai ano do processo CNJ
     */
    private extrairAnoProcesso(numero: string): number {
        const cleanNum = numero.replace(/[^\d]/g, '');
        if (cleanNum.length !== 20) return 0;
        return parseInt(cleanNum.substring(9, 13));
    }

    /**
     * Mensagem personalizada baseada no contexto
     */
    private getMensagemPersonalizada(_numero: string, isRecente: boolean): string {
        if (isRecente) {
            return 'Processo recente não encontrado. ' +
                'Para acessar dados em tempo real, conecte-se ao PJe nas configurações. ' +
                'Ou preencha os dados manualmente.';
        }
        return 'Processo não encontrado nas bases de dados disponíveis. ' +
            'Verifique o número ou preencha manualmente.';
    }
}

export const unifiedProcessSearchService = new UnifiedProcessSearchService();
