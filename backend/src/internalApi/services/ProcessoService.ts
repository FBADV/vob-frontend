import { v4 as uuidv4 } from 'uuid';
import {
    ProcessoNormalizado,
    SincronizarProcessoRequest,
    SincronizarProcessoResponse,
    ListarProcessosClienteResponse,
    ProcessoResumido,
    JobStatus
} from '../types/ProcessoNormalizado';
import { DataJudAdapter } from '../adapters/DataJudAdapter';
import { PJeAdapter } from '../adapters/PJeAdapter';

/**
 * Serviço de Processos Normalizados
 * 
 * Gerencia sincronização, armazenamento e consulta de processos
 */
export class ProcessoService {
    private dataJudAdapter: DataJudAdapter;
    private pjeAdapter: PJeAdapter;

    // Em produção: substituir por banco de dados real (Supabase, PostgreSQL, etc)
    private processosCache: Map<string, ProcessoNormalizado> = new Map();
    private jobsCache: Map<string, JobStatus> = new Map();

    constructor() {
        this.dataJudAdapter = new DataJudAdapter();
        this.pjeAdapter = new PJeAdapter();
    }

    /**
     * Sincroniza processo por identificador
     * Retorna job_id para acompanhamento assíncrono
     */
    async sincronizar(request: SincronizarProcessoRequest): Promise<SincronizarProcessoResponse> {
        const job_id = uuidv4();

        // Criar job
        const job: JobStatus = {
            job_id,
            status: 'ENFILEIRADO',
            iniciado_em: new Date().toISOString()
        };

        this.jobsCache.set(job_id, job);

        // Executar assíncronamente (em produção usar fila real como Bull/BullMQ)
        this.executarSincronizacao(job_id, request).catch(err => {
            console.error(`[ProcessoService] Erro no job ${job_id}:`, err);
            this.atualizarJob(job_id, {
                status: 'ERRO',
                erro: err.message,
                concluido_em: new Date().toISOString()
            });
        });

        return {
            job_id,
            status: 'ENFILEIRADO'
        };
    }

    /**
     * Executa sincronização (worker assíncrono)
     */
    private async executarSincronizacao(job_id: string, request: SincronizarProcessoRequest): Promise<void> {
        this.atualizarJob(job_id, { status: 'PROCESSANDO', progresso: 10 });

        let processoNormalizado: ProcessoNormalizado | null = null;

        try {
            // Tentar DataJud primeiro (mais abrangente)
            this.atualizarJob(job_id, { progresso: 30 });
            processoNormalizado = await this.dataJudAdapter.buscar(request);

            // Se não encontrar, tentar PJe (se disponível certificado)
            if (!processoNormalizado) {
                this.atualizarJob(job_id, { progresso: 50 });
                processoNormalizado = await this.pjeAdapter.buscar(request);
            }

            if (processoNormalizado) {
                // Salvar processo normalizado
                this.processosCache.set(processoNormalizado.numero_cnj, processoNormalizado);

                this.atualizarJob(job_id, {
                    status: 'CONCLUIDO',
                    progresso: 100,
                    concluido_em: new Date().toISOString(),
                    resultado: {
                        processos_encontrados: 1,
                        processos_atualizados: 0,
                        processos_novos: 1
                    }
                });
            } else {
                throw new Error('Processo não encontrado em nenhuma fonte');
            }
        } catch (erro) {
            throw erro;
        }
    }

    /**
     * Obtém processo normalizado por número CNJ
     */
    async obterPorNumeroCNJ(numero_cnj: string): Promise<ProcessoNormalizado | null> {
        // Em produção: consultar banco de dados
        return this.processosCache.get(numero_cnj) || null;
    }

    /**
     * Lista processos de um cliente (paginado)
     */
    async listarPorCliente(
        id_cliente: string,
        pagina: number,
        tamanho: number
    ): Promise<ListarProcessosClienteResponse> {
        // Em produção: consultar banco com filtro por id_cliente e partes
        const todosProcessos = Array.from(this.processosCache.values());

        // Filtrar processos onde cliente é parte
        const processosCliente = todosProcessos.filter(p =>
            p.partes.some(parte =>
                parte.documento === id_cliente ||
                parte.nome.includes(id_cliente)
            )
        );

        const total = processosCliente.length;
        const inicio = (pagina - 1) * tamanho;
        const fim = inicio + tamanho;

        const itens: ProcessoResumido[] = processosCliente.slice(inicio, fim).map(p => ({
            numero_cnj: p.numero_cnj,
            sigla_tribunal: p.sigla_tribunal,
            orgao_julgador: p.orgao_julgador,
            classe: p.classe,
            assunto_principal: p.assunto_principal,
            situacao: p.situacao,
            data_distribuicao: p.data_distribuicao,
            ultima_movimentacao_data: p.ultima_movimentacao?.data,
            ultima_movimentacao_descricao: p.ultima_movimentacao?.descricao,
            valor_causa: p.valor_causa
        }));

        return {
            pagina,
            tamanho,
            total,
            itens
        };
    }

    /**
     * Obtém status de um job
     */
    async obterStatusJob(job_id: string): Promise<JobStatus | null> {
        return this.jobsCache.get(job_id) || null;
    }

    /**
     * Atualiza status de um job
     */
    private atualizarJob(job_id: string, updates: Partial<JobStatus>): void {
        const job = this.jobsCache.get(job_id);
        if (job) {
            this.jobsCache.set(job_id, { ...job, ...updates });
        }
    }
}
