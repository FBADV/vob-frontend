import { TribunalBaseClient, ProcessoTribunal, MovimentacaoTribunal, ParteTribunal } from './TribunalBaseClient';
import fetch from 'node-fetch';

/**
 * Cliente DataJud - API Oficial do CNJ
 * 
 * VANTAGENS:
 * - ✅ Processos REAIS de todos os tribunais
 * - ✅ Não precisa certificado A1
 * - ✅ API pública e documentada
 * 
 * LIMITAÇÕES:
 * - ⚠️ Delay de indexação (até 24h)
 * - ⚠️ Rate limiting
 * 
 * USO RECOMENDADO:
 * - Onboarding inicial (descobrir processos)
 * - Fallback quando tribunal direto falhar
 * - Processos antigos (> 6 meses)
 */
export class DataJudTribunalClient extends TribunalBaseClient {
    readonly codigoTribunal = 'DATAJUD';
    readonly nomeTribunal = 'DataJud (CNJ - Todos os Tribunais)';
    readonly baseUrl = 'https://api-publica.datajud.cnj.jus.br';

    private apiKey: string;

    constructor(apiKey: string) {
        super();
        this.apiKey = apiKey;
    }

    /**
     * Busca processos por OAB no DataJud.
     * 
     * ESTRATÉGIA:
     * 1. Parsear OAB (número + UF)
     * 2. Detectar tribunal estadual pela UF
     * 3. Buscar no índice do tribunal
     * 4. Converter resposta DataJud para ProcessoTribunal
     */
    async buscarProcessosPorOAB(
        oab: string,
        _advogadoId: string,
        _certPassword: string // Não usado no DataJud
    ): Promise<ProcessoTribunal[]> {
        this.log(`Buscando processos para OAB: ${oab}`);

        const parsedOAB = this.parseOAB(oab);
        if (!parsedOAB) {
            throw new Error(`Formato de OAB inválido: ${oab}`);
        }

        try {
            // Mapear UF para código do tribunal
            const tribunalId = this.mapearUFParaTribunal(parsedOAB.uf);
            const endpoint = `${this.baseUrl}/api_publica_${tribunalId}/_search`;

            this.log(`Buscando no tribunal: ${tribunalId.toUpperCase()}`);

            // Query Elasticsearch para buscar por OAB do advogado
            const query = {
                query: {
                    bool: {
                        should: [
                            // Buscar em advogados.nome (pode conter OAB)
                            {
                                match: {
                                    'advogados.nome': `${parsedOAB.numero}`
                                }
                            },
                            // Buscar em advogados.numeroOAB se existir
                            {
                                match: {
                                    'advogados.numeroOAB': parsedOAB.numero
                                }
                            }
                        ],
                        minimum_should_match: 1
                    }
                },
                size: 100, // Limite de resultados
                sort: [
                    { 'dataHoraUltimaAtualizacao': { order: 'desc' } }
                ]
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `APIKey ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(query)
            });

            if (!response.ok) {
                throw new Error(`DataJud API error: ${response.status} ${response.statusText}`);
            }

            const data: any = await response.json();

            // Extrair hits (resultados)
            const hits = data.hits?.hits || [];
            this.log(`Encontrados ${hits.length} processos no DataJud`);

            // Converter para formato ProcessoTribunal
            return hits.map((hit: any) => this.parseDataJudHit(hit));

        } catch (error) {
            this.log(`Erro ao buscar no DataJud: ${(error as Error).message}`);
            throw error;
        }
    }

    /**
     * Busca movimentações de um processo no DataJud.
     */
    async buscarMovimentacoes(
        numeroProcesso: string,
        _advogadoId: string,
        _certPassword: string
    ): Promise<MovimentacaoTribunal[]> {
        this.log(`Buscando movimentações do processo: ${numeroProcesso}`);

        if (!this.validarNumeroCNJ(numeroProcesso)) {
            throw new Error(`Número de processo inválido: ${numeroProcesso}`);
        }

        try {
            // Detectar tribunal pelo número CNJ
            const codigoTR = this.extrairCodigoTribunal(numeroProcesso);
            if (!codigoTR) {
                throw new Error('Não foi possível detectar tribunal');
            }

            const tribunalId = this.mapearCodigoTRParaTribunal(codigoTR);
            const endpoint = `${this.baseUrl}/api_publica_${tribunalId}/_search`;

            // Buscar processo específico
            const query = {
                query: {
                    match: {
                        numeroProcesso: numeroProcesso.replace(/\D/g, '') // Apenas dígitos
                    }
                },
                size: 1
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `APIKey ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(query)
            });

            if (!response.ok) {
                throw new Error(`DataJud API error: ${response.status}`);
            }

            const data: any = await response.json();
            const hit = data.hits?.hits?.[0];

            if (!hit) {
                this.log('Processo não encontrado no DataJud');
                return [];
            }

            // Extrair movimentações do processo
            const source = hit._source;
            const movimentacoes = source.movimentos || [];

            return movimentacoes.map((mov: any) => ({
                data: new Date(mov.dataHora || mov.data || Date.now()),
                tipo: mov.tipo || 'Movimentação',
                descricao: mov.descricao || mov.nome || '',
                complemento: mov.complemento
            }));

        } catch (error) {
            this.log(`Erro ao buscar movimentações: ${(error as Error).message}`);
            return [];
        }
    }

    /**
     * Busca partes do processo no DataJud.
     */
    async buscarPartes(
        numeroProcesso: string,
        _advogadoId: string,
        _certPassword: string
    ): Promise<ParteTribunal[]> {
        this.log(`Buscando partes do processo: ${numeroProcesso}`);

        try {
            // Mesma lógica de buscarMovimentacoes para obter o processo
            const codigoTR = this.extrairCodigoTribunal(numeroProcesso);
            if (!codigoTR) return [];

            const tribunalId = this.mapearCodigoTRParaTribunal(codigoTR);
            const endpoint = `${this.baseUrl}/api_publica_${tribunalId}/_search`;

            const query = {
                query: {
                    match: {
                        numeroProcesso: numeroProcesso.replace(/\D/g, '')
                    }
                },
                size: 1
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `APIKey ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(query)
            });

            if (!response.ok) return [];

            const data: any = await response.json();
            const source = data.hits?.hits?.[0]?._source;

            if (!source) return [];

            // Extrair partes (autor, réu, etc)
            const partes: ParteTribunal[] = [];

            // Autores
            if (source.autores) {
                source.autores.forEach((autor: any) => {
                    partes.push({
                        nome: autor.nome || autor.pessoa?.nome || 'Não informado',
                        tipoParte: 'autor',
                        polo: 'ativo',
                        documento: autor.cpf || autor.cnpj || autor.pessoa?.cpf
                    });
                });
            }

            // Réus
            if (source.reus) {
                source.reus.forEach((reu: any) => {
                    partes.push({
                        nome: reu.nome || reu.pessoa?.nome || 'Não informado',
                        tipoParte: 'reu',
                        polo: 'passivo',
                        documento: reu.cpf || reu.cnpj || reu.pessoa?.cpf
                    });
                });
            }

            return partes;

        } catch (error) {
            this.log(`Erro ao buscar partes: ${(error as Error).message}`);
            return [];
        }
    }

    /**
     * Converte hit do DataJud para ProcessoTribunal.
     */
    private parseDataJudHit(hit: any): ProcessoTribunal {
        const source = hit._source;

        return {
            numeroProcesso: this.formatarNumeroCNJ(source.numeroProcesso),
            tribunal: source.tribunal || this.detectarTribunalPorCodigo(source.numeroProcesso),
            classe: source.classe?.nome || source.classe || 'Não informado',
            assunto: source.assunto?.nome || source.assunto || 'Não informado',
            valorCausa: source.valorCausa ? parseFloat(source.valorCausa) : undefined,
            dataDistribuicao: new Date(source.dataAjuizamento || source.dataHoraDistribuicao || Date.now()),
            orgaoJulgador: source.orgaoJulgador?.nome || source.orgaoJulgador || undefined,
            grau: source.grau || '1º Grau'
        };
    }

    /**
     * Mapeia UF para ID do tribunal no DataJud.
     */
    private mapearUFParaTribunal(uf: string): string {
        const mapa: Record<string, string> = {
            'AC': 'tjac', 'AL': 'tjal', 'AM': 'tjam', 'AP': 'tjap',
            'BA': 'tjba', 'CE': 'tjce', 'DF': 'tjdft', 'ES': 'tjes',
            'GO': 'tjgo', 'MA': 'tjma', 'MG': 'tjmg', 'MS': 'tjms',
            'MT': 'tjmt', 'PA': 'tjpa', 'PB': 'tjpb', 'PE': 'tjpe',
            'PI': 'tjpi', 'PR': 'tjpr', 'RJ': 'tjrj', 'RN': 'tjrn',
            'RO': 'tjro', 'RR': 'tjrr', 'RS': 'tjrs', 'SC': 'tjsc',
            'SE': 'tjse', 'SP': 'tjsp', 'TO': 'tjto'
        };

        return mapa[uf.toUpperCase()] || 'tjrn'; // Padrão TJRN
    }

    /**
     * Mapeia código TR (do CNJ) para ID tribunal.
     */
    private mapearCodigoTRParaTribunal(codigoTR: string): string {
        // Código TR está no número CNJ posição 14-15
        // Para tribunais estaduais (segmento 8), código TR corresponde à UF
        const mapa: Record<string, string> = {
            '01': 'tjac', '02': 'tjal', '04': 'tjam', '03': 'tjap',
            '05': 'tjba', '06': 'tjce', '07': 'tjdft', '08': 'tjes',
            '09': 'tjgo', '10': 'tjma', '13': 'tjmg', '12': 'tjms',
            '11': 'tjmt', '14': 'tjpa', '15': 'tjpb', '17': 'tjpe',
            '18': 'tjpi', '16': 'tjpr', '19': 'tjrj', '20': 'tjrn',
            '22': 'tjro', '23': 'tjrr', '21': 'tjrs', '24': 'tjsc',
            '25': 'tjse', '26': 'tjsp', '27': 'tjto'
        };

        return mapa[codigoTR] || 'tjrn';
    }

    /**
     * Formata número CNJ com pontuação.
     */
    private formatarNumeroCNJ(numero: string): string {
        // Remove não-dígitos
        const digitos = numero.replace(/\D/g, '');

        // Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
        if (digitos.length === 20) {
            return `${digitos.slice(0, 7)}-${digitos.slice(7, 9)}.${digitos.slice(9, 13)}.${digitos.slice(13, 14)}.${digitos.slice(14, 16)}.${digitos.slice(16)}`;
        }

        return numero;
    }

    /**
     * Extrai código TR do número CNJ.
     */
    private extrairCodigoTribunal(numeroCNJ: string): string | null {
        const match = numeroCNJ.match(/^\d{7}-?\d{2}\.?\d{4}\.?\d\.?(\d{2})\.\d{4}$/);
        return match ? match[1] : null;
    }

    /**
     * Detecta nome do tribunal pelo código no número CNJ.
     */
    private detectarTribunalPorCodigo(numeroProcesso: string): string {
        const codigo = this.extrairCodigoTribunal(numeroProcesso);
        if (!codigo) return 'Tribunal não identificado';

        const tribunalId = this.mapearCodigoTRParaTribunal(codigo);
        return tribunalId.toUpperCase();
    }
}
