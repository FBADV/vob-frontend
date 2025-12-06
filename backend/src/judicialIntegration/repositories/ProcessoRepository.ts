import { ProcessoAdvogado } from '../models/ProcessoAdvogado';
import { IRepository } from './IRepository';

/**
 * Repositório de Processos com armazenamento in-memory.
 */
class ProcessoRepository implements IRepository<ProcessoAdvogado> {
    private data: Map<string, ProcessoAdvogado> = new Map();

    async findById(id: string): Promise<ProcessoAdvogado | null> {
        return this.data.get(id) || null;
    }

    async findByAdvogadoId(advogadoId: string): Promise<ProcessoAdvogado[]> {
        return Array.from(this.data.values()).filter(p => p.advogadoId === advogadoId);
    }

    async findByNumeroProcesso(numero: string): Promise<ProcessoAdvogado | null> {
        for (const processo of this.data.values()) {
            if (processo.numeroProcesso === numero) {
                return processo;
            }
        }
        return null;
    }

    async findByStatusOnboarding(
        status: string,
        advogadoId: string
    ): Promise<ProcessoAdvogado[]> {
        return Array.from(this.data.values()).filter(
            p => p.advogadoId === advogadoId && p.statusOnboarding === status
        );
    }

    async findAll(): Promise<ProcessoAdvogado[]> {
        return Array.from(this.data.values());
    }

    async create(entity: ProcessoAdvogado): Promise<ProcessoAdvogado> {
        // Garantir unicidade de número CNJ
        const existente = await this.findByNumeroProcesso(entity.numeroProcesso);
        if (existente) {
            throw new Error(`Processo ${entity.numeroProcesso} já cadastrado`);
        }

        this.data.set(entity.id, entity);
        return entity;
    }

    async update(id: string, entity: Partial<ProcessoAdvogado>): Promise<ProcessoAdvogado | null> {
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

export const processoRepository = new ProcessoRepository();
