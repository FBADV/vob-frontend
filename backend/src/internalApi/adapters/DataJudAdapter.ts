import {
    ProcessoNormalizado,
    SincronizarProcessoRequest
} from '../types/ProcessoNormalizado';

/**
 * Adapter para DataJud (API Oficial do CNJ)
 * 
 * Converte dados brutos do DataJud para Processo Normalizado
 */
export class DataJudAdapter {
    private apiKey: string;
    private baseUrl = 'https://api-publica.datajud.cnj.jus.br';

    constructor() {
        this.apiKey = process.env.DATAJUD_API_KEY || '';
    }

    /**
     * Busca processo no DataJud e normaliza
     */
    async buscar(request: SincronizarProcessoRequest): Promise<ProcessoNormalizado | null> {
        try {
            // Adaptar tipo de busca para DataJud
            let endpoint: string;

            if (request.tipo_busca === 'CNJ') {
                endpoint = `/processos/${request.chave}`;
            } else {
                // Para CPF/CNPJ/OAB, usar busca genérica
                endpoint = `/processos/busca?${request.tipo_busca.toLowerCase()}=${request.chave}`;
            }

            // Fazer requisição ao DataJud
            // TODO: Implementar chamada real à API
            const dadosBrutos = await this.consultarDataJud(endpoint);

            if (!dadosBrutos) {
                return null;
            }

            // Normalizar dados
            return this.normalizar(dadosBrutos);
        } catch (erro) {
            console.error('[DataJudAdapter] Erro ao buscar:', erro);
            return null;
        }
    }

    /**
     * Consulta API DataJud (mock por enquanto)
     */
    private async consultarDataJud(endpoint: string): Promise<any> {
        // Em produção: fazer fetch real
        // const response = await fetch(`${this.baseUrl}${endpoint}`, {
        //     headers: {
        //         'Authorization': `APIKey ${this.apiKey}`
        //     }
        // });
        // return await response.json();

        // Mock de retorno
        return {
            numeroProcesso: '0800001-11.2024.8.20.0001',
            tribunal: 'TJRN',
            orgaoJulgador: '2ª Vara Cível de Assu',
            classe: { nome: 'Ação de Cobrança' },
            assunto: { nome: 'Contratos bancários' },
            valorCausa: 12000.50,
            dataDistribuicao: '2023-01-10',
            grau: '1',
            movimentos: [
                {
                    dataHora: '2024-05-01T14:32:00Z',
                    descricao: 'Juntada de petição de manifestação'
                }
            ],
            partes: [
                {
                    nome: 'Fulano de Tal',
                    tipo: 'AUTOR',
                    polo: 'ativo',
                    cpf: '00000000000'
                }
            ]
        };
    }

    /**
     * Normaliza dados brutos do DataJud para ProcessoNormalizado
     */
    private normalizar(dadosBrutos: any): ProcessoNormalizado {
        return {
            id: this.gerarId(dadosBrutos.numeroProcesso),
            numero_cnj: this.formatarNumeroCNJ(dadosBrutos.numeroProcesso),
            numero_outro: null,
            sigla_tribunal: dadosBrutos.tribunal || 'DESCONHECIDO',
            orgao_julgador: dadosBrutos.orgaoJulgador || '',
            grau: parseInt(dadosBrutos.grau) || 1,
            classe: dadosBrutos.classe?.nome || dadosBrutos.classe || '',
            assunto_principal: dadosBrutos.assunto?.nome || dadosBrutos.assunto || '',
            valor_causa: parseFloat(dadosBrutos.valorCausa) || 0,
            data_distribuicao: dadosBrutos.dataDistribuicao || new Date().toISOString(),
            situacao: this.mapearSituacao(dadosBrutos.situacao),
            justica_gratuita: dadosBrutos.justicaGratuita || false,
            segredo_justica: dadosBrutos.sigilo || false,

            partes: (dadosBrutos.partes || []).map((p: any) => ({
                tipo: p.tipo || 'TERCEIRO',
                nome: p.nome || '',
                documento: p.cpf || p.cnpj,
                tipo_documento: p.cpf ? 'CPF' : p.cnpj ? 'CNPJ' : 'OUTRO',
                polo: p.polo?.toUpperCase() || 'TERCEIRO'
            })),

            movimentacoes: (dadosBrutos.movimentos || []).map((m: any, index: number) => ({
                id: `mov-${index}`,
                data: m.dataHora || m.data,
                descricao: m.descricao || m.nome,
                codigo_interno: m.codigo,
                orgao_responsavel: m.orgao,
                tem_prazo: false,
                prazo_final: null
            })),

            ultima_movimentacao: dadosBrutos.movimentos?.[0] ? {
                data: dadosBrutos.movimentos[0].dataHora,
                descricao: dadosBrutos.movimentos[0].descricao
            } : undefined,

            anexos: [],

            fonte: 'DATAJUD',
            data_ultima_sincronizacao: new Date().toISOString(),

            metadata: {
                vara: dadosBrutos.vara,
                comarca: dadosBrutos.comarca,
                sistema_origem: 'DataJud CNJ'
            }
        };
    }

    private gerarId(numeroCNJ: string): string {
        return `processo-${numeroCNJ.replace(/\D/g, '')}`;
    }

    private formatarNumeroCNJ(numero: string): string {
        const digitos = numero.replace(/\D/g, '');
        if (digitos.length === 20) {
            return `${digitos.slice(0, 7)}-${digitos.slice(7, 9)}.${digitos.slice(9, 13)}.${digitos.slice(13, 14)}.${digitos.slice(14, 16)}.${digitos.slice(16)}`;
        }
        return numero;
    }

    private mapearSituacao(situacao?: string): any {
        if (!situacao) return 'EM_ANDAMENTO';
        const upper = situacao.toUpperCase();
        if (upper.includes('ANDAMENTO')) return 'EM_ANDAMENTO';
        if (upper.includes('SUSPENSO')) return 'SUSPENSO';
        if (upper.includes('ARQUIVADO')) return 'ARQUIVADO';
        if (upper.includes('BAIXADO')) return 'BAIXADO';
        return 'EM_ANDAMENTO';
    }
}
