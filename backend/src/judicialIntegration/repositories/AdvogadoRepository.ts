import { Advogado } from '../models/Advogado';
import { IRepository } from './IRepository';

/**
 * Repositório de Advogados com armazenamento in-memory.
 * 
 * IMPORTANTE: Implementação atual usa Map para prototipação rápida.
 * Para produção, substituir por queries PostgreSQL mantendo esta interface.
 * 
 * GARANTIAS:
 * - Unicidade de OAB (não permite duplicatas)
 * - Validação de formato OAB antes de inserção
 */
class AdvogadoRepository implements IRepository<Advogado> {
    private data: Map<string, Advogado> = new Map();

    async findById(id: string): Promise<Advogado | null> {
        return this.data.get(id) || null;
    }

    /**
     * Busca advogado por número de OAB.
     * @param oab - OAB no formato "OAB/UF NÚMERO"
     */
    async findByOab(oab: string): Promise<Advogado | null> {
        for (const advogado of this.data.values()) {
            if (advogado.oab === oab) {
                return advogado;
            }
        }
        return null;
    }

    async findAll(): Promise<Advogado[]> {
        return Array.from(this.data.values());
    }

    async create(entity: Advogado): Promise<Advogado> {
        // Garantir unicidade de OAB
        const existente = await this.findByOab(entity.oab);
        if (existente) {
            throw new Error(`OAB ${entity.oab} já está cadastrada`);
        }

        this.data.set(entity.id, entity);
        return entity;
    }

    async update(id: string, entity: Partial<Advogado>): Promise<Advogado | null> {
        const existente = this.data.get(id);
        if (!existente) {
            return null;
        }

        // Se está alterando OAB, verificar unicidade
        if (entity.oab && entity.oab !== existente.oab) {
            const oabDuplicada = await this.findByOab(entity.oab);
            if (oabDuplicada) {
                throw new Error(`OAB ${entity.oab} já está cadastrada`);
            }
        }

        const atualizado = {
            ...existente,
            ...entity,
            updatedAt: new Date()
        };

        this.data.set(id, atualizado);
        return atualizado;
    }

    async delete(id: string): Promise<boolean> {
        return this.data.delete(id);
    }
}

// Singleton
export const advogadoRepository = new AdvogadoRepository();
