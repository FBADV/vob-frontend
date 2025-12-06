/**
 * Interface genérica de repositório definindo contrato padrão para operações de persistência.
 * 
 * Todos os repositórios concretos devem implementar esta interface para manter
 * consistência de API e facilitar migração futura para PostgreSQL.
 * 
 * @template T - Tipo da entidade gerenciada pelo repositório
 */
export interface IRepository<T> {
    /**
     * Busca entidade por chave primária.
     * @param id - UUID da entidade
     * @returns Entidade encontrada ou null
     */
    findById(id: string): Promise<T | null>;

    /**
     * Busca todas as entidades.
     * @returns Array com todas as entidades
     */
    findAll(): Promise<T[]>;

    /**
     * Cria nova entidade.
     * @param entity - Entidade a ser criada
     * @returns Entidade criada
     */
    create(entity: T): Promise<T>;

    /**
     * Atualiza entidade existente (atualização parcial).
     * @param id - UUID da entidade
     * @param entity - Campos a serem atualizados
     * @returns Entidade atualizada ou null se não encontrada
     */
    update(id: string, entity: Partial<T>): Promise<T | null>;

    /**
     * Remove entidade.
     * @param id - UUID da entidade
     * @returns true se removida, false se não encontrada
     */
    delete(id: string): Promise<boolean>;
}
