import { TribunalBaseClient, ProcessoTribunal, MovimentacaoTribunal, ParteTribunal } from './TribunalBaseClient';

/**
 * Cliente para Tribunal de Justiça do Rio Grande do Norte (TJRN).
 * 
 * IMPORTANTE: Esta é uma implementação EXEMPLO/MOCK.
 * URLs e endpoints são fictícios para demonstração da arquitetura.
 * 
 * Para produção:
 * 1. Obter documentação oficial da API do TJRN
 * 2. Atualizar baseUrl com URL real
 * 3. Implementar parsing real de respostas XML/JSON
 * 4. Adicionar autenticação específica se necessário
 */
export class TJRNClient extends TribunalBaseClient {
    readonly codigoTribunal = 'TJRN';
    readonly nomeTribunal = 'Tribunal de Justiça do Rio Grande do Norte';
    readonly baseUrl = 'https://api.tjrn.jus.br'; // MOCK - URL fictícia

    /**
     * Busca processos por OAB no TJRN.
     * 
     * MOCK: Retorna processos simulados.
     * TODO: Implementar chamada real à API do TJRN.
     */
    async buscarProcessosPorOAB(
        oab: string,
        _advogadoId: string,
        _certPassword: string
    ): Promise<ProcessoTribunal[]> {
        this.log(`Buscando processos para OAB: ${oab}`);

        // Validar formato OAB
        const parsedOAB = this.parseOAB(oab);
        if (!parsedOAB) {
            throw new Error(`Formato de OAB inválido: ${oab}`);
        }

        try {
            // MOCK: Em produção, fazer requisição real usando mtlsClient
            // import { mtlsClient } from '../services/mtlsClient';
            // const response = await mtlsClient.requisicaoAutenticada(
            //     advogadoId,
            //     certPassword,
            //     `${this.baseUrl}/processos/consulta`,
            //     {
            //         method: 'POST',
            //         body: {
            //             oab: parsedOAB.numero,
            //             uf: parsedOAB.uf
            //         }
            //     }
            // );

            // MOCK: Retornar processos simulados
            this.log('MOCK: Retornando 3 processos simulados');

            return [
                {
                    numeroProcesso: '0800001-11.2024.8.20.0001',
                    classe: 'Ação de Cobrança',
                    assunto: 'Rescisão Contratual',
                    valorCausa: 50000,
                    dataDistribuicao: new Date('2024-01-15'),
                    orgaoJulgador: '1ª Vara Cível de Natal',
                    tribunal: this.codigoTribunal,
                    grau: '1º Grau'
                },
                {
                    numeroProcesso: '0800002-22.2024.8.20.0001',
                    classe: 'Ação de Despejo',
                    assunto: 'Locação de Imóvel Urbano',
                    valorCausa: 30000,
                    dataDistribuicao: new Date('2024-02-20'),
                    orgaoJulgador: '2ª Vara Cível de Natal',
                    tribunal: this.codigoTribunal,
                    grau: '1º Grau'
                },
                {
                    numeroProcesso: '0800003-33.2024.8.20.0002',
                    classe: 'Ação de Indenização',
                    assunto: 'Dano Material',
                    valorCausa: 75000,
                    dataDistribuicao: new Date('2024-03-10'),
                    orgaoJulgador: '1ª Vara Cível de Mossoró',
                    tribunal: this.codigoTribunal,
                    grau: '1º Grau'
                }
            ];

        } catch (error) {
            this.logErro('Erro ao buscar processos', error);
            throw error;
        }
    }

    /**
     * Busca movimentações de um processo.
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

        // MOCK: Retornar movimentações simuladas
        return [
            {
                data: new Date('2024-01-15'),
                tipo: 'Distribuição',
                descricao: 'Processo distribuído'
            },
            {
                data: new Date('2024-02-01'),
                tipo: 'Despacho',
                descricao: 'Determino a citação da parte ré',
                complemento: 'Prazo: 15 dias'
            },
            {
                data: new Date('2024-03-05'),
                tipo: 'Juntada',
                descricao: 'Juntada de contestação'
            }
        ];
    }

    /**
     * Busca partes do processo.
     */
    async buscarPartes(
        numeroProcesso: string,
        _advogadoId: string,
        _certPassword: string
    ): Promise<ParteTribunal[]> {
        this.log(`Buscando partes do processo: ${numeroProcesso}`);

        if (!this.validarNumeroCNJ(numeroProcesso)) {
            throw new Error(`Número de processo inválido: ${numeroProcesso}`);
        }

        // MOCK: Retornar partes simuladas
        return [
            {
                nome: 'João da Silva',
                tipoParte: 'pessoa_fisica',
                polo: 'ativo',
                documento: '123.456.789-00'
            },
            {
                nome: 'Maria dos Santos',
                tipoParte: 'pessoa_fisica',
                polo: 'passivo',
                documento: '987.654.321-00'
            },
            {
                nome: 'Empresa XYZ Ltda',
                tipoParte: 'pessoa_juridica',
                polo: 'passivo',
                documento: '12.345.678/0001-90'
            }
        ];
    }
}

// Singleton instance
export const tjrnClient = new TJRNClient();
