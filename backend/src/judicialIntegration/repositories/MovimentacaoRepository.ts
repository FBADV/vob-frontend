import { MovimentacaoProcessual } from '../models/MovimentacaoProcessual';
import { IRepository } from './IRepository';

class MovimentacaoRepository implements IRepository<MovimentacaoProcessual> {
    private data: Map<string, MovimentacaoProcessual> = new Map();

    async findById(id: string): Promise<MovimentacaoProcessual | null> {
        return this.data.get(id) || null;
    }

    async findByProcessoId(processoId: string): Promise<MovimentacaoProcessual[]> {
        return Array.from(this.data.values())
            .filter(m => m.processoId === processoId)
            .sort((a, b) => b.dataMovimentacao.getTime() - a.dataMovimentacao.getTime());
    }

    async findAll(): Promise<MovimentacaoProcessual[]> {
        return Array.from(this.data.values());
    }

    async create(entity: MovimentacaoProcessual): Promise<MovimentacaoProcessual> {
        this.data.set(entity.id, entity);
        return entity;
    }

    async update(id: string, entity: Partial<MovimentacaoProcessual>): Promise<MovimentacaoProcessual | null> {
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

export const movimentacaoRepository = new MovimentacaoRepository();
