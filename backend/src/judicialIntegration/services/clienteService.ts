import { v4 as uuidv4 } from 'uuid';
import { clienteRepository } from '../repositories/ClienteRepository';
import { Cliente } from '../models/Cliente';

/**
 * Serviço de gerenciamento de clientes.
 */
export class ClienteService {

    async listarClientes(advogadoId: string): Promise<Cliente[]> {
        return await clienteRepository.findByAdvogadoId(advogadoId);
    }

    async obterCliente(clienteId: string, advogadoId: string): Promise<Cliente | null> {
        const cliente = await clienteRepository.findById(clienteId);

        if (!cliente || cliente.advogadoId !== advogadoId) {
            return null;
        }

        return cliente;
    }

    /**
     * Atualiza dados do cliente (complementação após onboarding).
     * 
     * CAMPOS IMUTÁVEIS:
     * - id, advogadoId, origemCriacao, parteProcessualOrigemId, createdAt
     */
    async atualizarCliente(
        clienteId: string,
        advogadoId: string,
        dados: Partial<Cliente>
    ): Promise<Cliente | null> {
        const cliente = await clienteRepository.findById(clienteId);

        if (!cliente || cliente.advogadoId !== advogadoId) {
            throw new Error('Cliente não encontrado ou sem permissão');
        }

        // Filtrar campos imutáveis
        const { id, advogadoId: _, origemCriacao, parteProcessualOrigemId, createdAt, ...dadosEditaveis } = dados;

        return await clienteRepository.update(clienteId, {
            ...dadosEditaveis,
            updatedAt: new Date()
        });
    }

    /**
     * Cria cliente manualmente (fora do onboarding).
     */
    async criarCliente(
        advogadoId: string,
        dados: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Cliente> {
        return await clienteRepository.create({
            ...dados,
            id: uuidv4(),
            advogadoId,
            origemCriacao: 'cadastro_manual',
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
}

export const clienteService = new ClienteService();
