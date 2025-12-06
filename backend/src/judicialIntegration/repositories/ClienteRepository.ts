import { Cliente } from '../models/Cliente';
import { IRepository } from './IRepository';

class ClienteRepository implements IRepository<Cliente> {
    private data: Map<string, Cliente> = new Map();

    async findById(id: string): Promise<Cliente | null> {
        return this.data.get(id) || null;
    }

    async findByAdvogadoId(advogadoId: string): Promise<Cliente[]> {
        return Array.from(this.data.values()).filter(c => c.advogadoId === advogadoId);
    }

    async findByDocumento(documento: string, advogadoId: string): Promise<Cliente | null> {
        for (const cliente of this.data.values()) {
            if (cliente.advogadoId === advogadoId && cliente.documento === documento) {
                return cliente;
            }
        }
        return null;
    }

    async findAll(): Promise<Cliente[]> {
        return Array.from(this.data.values());
    }

    async create(entity: Cliente): Promise<Cliente> {
        this.data.set(entity.id, entity);
        return entity;
    }

    async update(id: string, entity: Partial<Cliente>): Promise<Cliente | null> {
        const existente = this.data.get(id);
        if (!existente) {
            return null;
        }

        const atualizado = { ...existente, ...entity, updatedAt: new Date() };
        this.data.set(id, atualizado);
        return atualizado;
    }

    async delete(id: string): Promise<boolean> {
        return this.data.delete(id);
    }
}

export const clienteRepository = new ClienteRepository();
