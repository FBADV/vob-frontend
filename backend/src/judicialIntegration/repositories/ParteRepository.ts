import { ParteProcessual } from '../models/ParteProcessual';
import { IRepository } from './IRepository';

class ParteRepository implements IRepository<ParteProcessual> {
    private data: Map<string, ParteProcessual> = new Map();

    async findById(id: string): Promise<ParteProcessual | null> {
        return this.data.get(id) || null;
    }

    async findByProcessoId(processoId: string): Promise<ParteProcessual[]> {
        return Array.from(this.data.values()).filter(p => p.processoId === processoId);
    }

    async findClientesByProcessoId(processoId: string): Promise<ParteProcessual[]> {
        return Array.from(this.data.values()).filter(
            p => p.processoId === processoId && p.isCliente
        );
    }

    async findAll(): Promise<ParteProcessual[]> {
        return Array.from(this.data.values());
    }

    async create(entity: ParteProcessual): Promise<ParteProcessual> {
        this.data.set(entity.id, entity);
        return entity;
    }

    async update(id: string, entity: Partial<ParteProcessual>): Promise<ParteProcessual | null> {
        const existente = this.data.get(id);
        if (!existente) {
            return null;
        }

        const atualizado = { ...existente, ...entity };
        this.data.set(id, atualizado);
        return atualizado;
    }

    async delete(id: string): Promise<boolean> {
        return this.data.delete(id);
    }
}

export const parteRepository = new ParteRepository();
