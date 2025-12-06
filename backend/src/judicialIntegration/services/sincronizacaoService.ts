import { v4 as uuidv4 } from 'uuid';
import { advogadoRepository } from '../repositories/AdvogadoRepository';
import { processoRepository } from '../repositories/ProcessoRepository';
import { parteRepository } from '../repositories/ParteRepository';
import { TribunalClientFactory } from '../tribunais/TribunalClientFactory';
import { ProcessoTribunal } from '../tribunais/TribunalBaseClient';

/**
 * Serviço de sincronização de processos com tribunais.
 * 
 * EVOLUÇÃO:
 * - ✅ Versão 1: Mocks hardcoded
 * - ✅ Versão 2: Integração com TribunalClient real
 * - 🔄 Versão 3: Persistência Supabase (preparação)
 */
export class SincronizacaoService {

    /**
     * Sincroniza processos do advogado por OAB usando TribunalClient REAL.
     * 
     * FLUXO:
     * 1. Validar advogado e OAB
     * 2. Detectar tribunal ou usar padrão
     * 3. Buscar processos REAIS via TribunalClient
     * 4. Para cada processo: criar/atualizar + criar partes
     * 5. TODO: Salvar no Supabase
     * 6. Retornar contadores
     */
    async sincronizarProcessosPorAdvogado(
        advogadoId: string,
        certPassword: string,
        codigoTribunal?: string
    ): Promise<{
        processosNovos: number;
        processosAtualizados: number;
        partesImportadas: number;
        tribunal: string;
    }> {
        const advogado = await advogadoRepository.findById(advogadoId);
        if (!advogado || !advogado.oab) {
            throw new Error('Advogado ou OAB não encontrada');
        }

        if (!advogado.certificadoPath) {
            throw new Error('Certificado A1 não configurado. Faça upload do certificado antes de sincronizar.');
        }

        // Usar tribunal especificado ou padrão (TJRN)
        const tribunalCodigo = codigoTribunal || 'TJRN';
        const tribunalClient = TribunalClientFactory.getClient(tribunalCodigo);

        console.log(`[Sincronização] Buscando processos para OAB: ${advogado.oab} no ${tribunalClient.nomeTribunal}`);

        // Buscar processos REAIS do tribunal
        const processosTribunal = await tribunalClient.buscarProcessosPorOAB(
            advogado.oab,
            advogadoId,
            certPassword
        );

        console.log(`[Sincronização] Encontrados ${processosTribunal.length} processos no tribunal`);

        let processosNovos = 0;
        let processosAtualizados = 0;
        let partesImportadas = 0;

        for (const processoTrib of processosTribunal) {
            try {
                // Verificar se processo já existe
                const existente = await processoRepository.findByNumeroProcesso(processoTrib.numeroProcesso);

                if (!existente) {
                    // Novo processo
                    const novoProcesso = await this.criarNovoProcesso(
                        processoTrib,
                        advogadoId,
                        advogado.oab
                    );

                    processosNovos++;

                    // Buscar e importar partes
                    const partesImported = await this.importarPartes(
                        processoTrib.numeroProcesso,
                        novoProcesso.id,
                        advogadoId,
                        certPassword,
                        tribunalClient
                    );

                    partesImportadas += partesImported;

                    // TODO: Salvar no Supabase
                    // await this.salvarProcessoNoSupabase(novoProcesso);

                } else {
                    // Atualizar processo existente
                    await processoRepository.update(existente.id, {
                        tribunal: processoTrib.tribunal,
                        orgaoJulgador: processoTrib.orgaoJulgador,
                        classe: processoTrib.classe,
                        assuntoPrincipal: processoTrib.assunto,
                        valorCausa: processoTrib.valorCausa,
                        grau: processoTrib.grau,
                        ultimaSincronizacao: new Date()
                    });

                    processosAtualizados++;
                }

            } catch (error) {
                console.error(`[Sincronização] Erro ao processar ${processoTrib.numeroProcesso}:`, error);
                // Continuar com próximo processo
            }
        }

        console.log(
            `[Sincronização] Concluída: ${processosNovos} novos, ` +
            `${processosAtualizados} atualizados, ${partesImportadas} partes`
        );

        return {
            processosNovos,
            processosAtualizados,
            partesImportadas,
            tribunal: tribunalClient.nomeTribunal
        };
    }

    /**
     * Cria novo processo no repositório.
     */
    private async criarNovoProcesso(
        processoTrib: ProcessoTribunal,
        advogadoId: string,
        oab: string
    ) {
        return await processoRepository.create({
            id: uuidv4(),
            numeroProcesso: processoTrib.numeroProcesso,
            advogadoId,
            oabAdvogado: oab,
            tribunal: processoTrib.tribunal,
            orgaoJulgador: processoTrib.orgaoJulgador || 'Não informado',
            sistemaOrigem: 'TribunalSync', // Indica que veio de sincronização real
            classe: processoTrib.classe,
            assuntoPrincipal: processoTrib.assunto,
            valorCausa: processoTrib.valorCausa,
            dataDistribuicao: processoTrib.dataDistribuicao,
            situacao: 'Em andamento', // Padrão
            grau: processoTrib.grau,
            statusOnboarding: 'aguardando_definicao_cliente', // FLAG CRÍTICA para onboarding
            createdAt: new Date(),
            updatedAt: new Date(),
            ultimaSincronizacao: new Date()
        });
    }

    /**
     * Importa partes do processo.
     */
    private async importarPartes(
        numeroProcesso: string,
        processoId: string,
        advogadoId: string,
        certPassword: string,
        tribunalClient: any
    ): Promise<number> {
        try {
            const partes = await tribunalClient.buscarPartes(
                numeroProcesso,
                advogadoId,
                certPassword
            );

            let count = 0;

            for (const parte of partes) {
                await parteRepository.create({
                    id: uuidv4(),
                    processoId,
                    nomeParte: parte.nome,
                    tipoParte: parte.tipoParte as any,
                    polo: parte.polo as any,
                    documento: parte.documento,
                    tipoDocumento: this.detectarTipoDocumento(parte.documento),
                    endereco: undefined,
                    advogados: undefined,
                    isCliente: false, // Aguardando seleção no onboarding
                    createdAt: new Date()
                });

                count++;
            }

            return count;

        } catch (error) {
            console.error(`[Sincronização] Erro ao importar partes de ${numeroProcesso}:`, error);
            return 0;
        }
    }

    /**
     * Detecta tipo de documento (CPF ou CNPJ).
     */
    private detectarTipoDocumento(documento?: string): 'CPF' | 'CNPJ' | undefined {
        if (!documento) return undefined;

        const limpo = documento.replace(/\D/g, '');

        if (limpo.length === 11) return 'CPF';
        if (limpo.length === 14) return 'CNPJ';

        return undefined;
    }
}

export const sincronizacaoService = new SincronizacaoService();
