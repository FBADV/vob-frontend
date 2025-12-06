import { v4 as uuidv4 } from 'uuid';
import { processoRepository } from '../repositories/ProcessoRepository';
import { parteRepository } from '../repositories/ParteRepository';
import { clienteRepository } from '../repositories/ClienteRepository';
import { Cliente } from '../models/Cliente';

/**
 * Serviço de onboarding de clientes a partir de partes processuais.
 * 
 * FLUXO:
 * 1. Advogado visualiza partes de processos pendentes
 * 2. Seleciona quais partes são seus clientes
 * 3. Sistema cria clientes automaticamente (verificando duplicatas)
 * 4. Vincula clientes ao processo
 * 5. Atualiza status de onboarding
 */
export class OnboardingService {

    /**
     * Obtém partes de processo pendente de onboarding.
     */
    async getPartesParaOnboarding(
        processoId: string,
        advogadoId: string
    ): Promise<{ processo: any; partes: any[] }> {
        const processo = await processoRepository.findById(processoId);

        if (!processo) {
            throw new Error('Processo não encontrado');
        }

        if (processo.advogadoId !== advogadoId) {
            throw new Error('Acesso negado: processo não pertence ao advogado');
        }

        if (processo.statusOnboarding !== 'aguardando_definicao_cliente') {
            throw new Error('Processo não está em estado de onboarding pendente');
        }

        const partes = await parteRepository.findByProcessoId(processoId);

        return {
            processo: {
                id: processo.id,
                numeroProcesso: processo.numeroProcesso,
                classe: processo.classe,
                statusOnboarding: processo.statusOnboarding
            },
            partes: partes.map(p => ({
                id: p.id,
                nomeParte: p.nomeParte,
                tipoParte: p.tipoParte,
                polo: p.polo,
                documento: p.documento,
                advogados: p.advogados,
                isCliente: p.isCliente
            }))
        };
    }

    /**
     * Define clientes a partir de partes selecionadas.
     * 
     * TRANSAÇÃO ATÔMICA:
     * - Verifica duplicidade de clientes por documento
     * - Cria novos clientes quando necessário
     * - Atualiza partes com flag isCliente
     * - Vincula clientes ao processo
     * - Atualiza status de onboarding
     */
    async definirClientes(
        processoId: string,
        partesIds: string[],
        advogadoId: string
    ): Promise<{
        clientesCriados: number;
        clientesVinculados: string[];
        processo: any;
    }> {
        const processo = await processoRepository.findById(processoId);
        if (!processo) {
            throw new Error('Processo não encontrado');
        }

        if (processo.advogadoId !== advogadoId) {
            throw new Error('Acesso negado');
        }

        const clientesIds: string[] = [];
        let clientesCriados = 0;

        for (const parteId of partesIds) {
            const parte = await parteRepository.findById(parteId);
            if (!parte || parte.processoId !== processoId) {
                continue;
            }

            let cliente: Cliente | null = null;

            // Verificar duplicidade por documento
            if (parte.documento) {
                cliente = await clienteRepository.findByDocumento(
                    parte.documento,
                    advogadoId
                );
            }

            // Criar cliente se não existir
            if (!cliente) {
                cliente = await clienteRepository.create({
                    id: uuidv4(),
                    advogadoId,
                    nome: parte.nomeParte,
                    documento: parte.documento,
                    tipoDocumento: parte.tipoDocumento,
                    endereco: parte.endereco,
                    origemCriacao: 'onboarding_processo',
                    parteProcessualOrigemId: parte.id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                clientesCriados++;
            }

            // Atualizar parte
            await parteRepository.update(parteId, {
                isCliente: true,
                clienteId: cliente.id
            });

            clientesIds.push(cliente.id);
        }

        // Atualizar processo
        const processoAtualizado = await processoRepository.update(processoId, {
            statusOnboarding: 'cliente_definido',
            clientesIds
        });

        return {
            clientesCriados,
            clientesVinculados: clientesIds,
            processo: processoAtualizado
        };
    }

    /**
     * Marca onboarding como concluído.
     */
    async concluirOnboarding(processoId: string, advogadoId: string): Promise<void> {
        const processo = await processoRepository.findById(processoId);

        if (!processo) {
            throw new Error('Processo não encontrado');
        }

        if (processo.advogadoId !== advogadoId) {
            throw new Error('Acesso negado');
        }

        if (processo.statusOnboarding !== 'cliente_definido') {
            throw new Error('Processo deve ter clientes definidos primeiro');
        }

        await processoRepository.update(processoId, {
            statusOnboarding: 'onboarding_concluido'
        });
    }
}

export const onboardingService = new OnboardingService();
