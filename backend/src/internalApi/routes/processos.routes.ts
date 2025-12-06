import { Router, Request, Response } from 'express';
import {
    SincronizarProcessoRequest,
    SincronizarProcessoResponse,
    ObterProcessoResponse,
    ListarProcessosClienteResponse,
    CadastrarMonitoramentoRequest,
    CadastrarMonitoramentoResponse,
    ListarMonitoramentosPendentesResponse,
    JobStatus
} from '../types/ProcessoNormalizado';
import { ProcessoService } from '../services/ProcessoService';
import { MonitoramentoService } from '../services/MonitoramentoService';

const router = Router();
const processoService = new ProcessoService();
const monitoramentoService = new MonitoramentoService();

/**
 * POST /internal/processos/sincronizar
 * 
 * Sincroniza processo por identificador (CNJ, CPF, CNPJ, OAB)
 * Enfileira job assíncrono para buscar em DataJud/Tribunal
 */
router.post('/sincronizar', async (req: Request, res: Response) => {
    try {
        const body: SincronizarProcessoRequest = req.body;

        // Validação básica
        if (!body.tipo_busca || !body.chave) {
            return res.status(400).json({
                erro: 'Campos obrigatórios: tipo_busca, chave'
            });
        }

        // Enfileirar job
        const resultado: SincronizarProcessoResponse = await processoService.sincronizar(body);

        return res.status(202).json(resultado); // 202 Accepted (async)
    } catch (erro) {
        console.error('[API] Erro ao sincronizar processo:', erro);
        return res.status(500).json({
            erro: 'Erro interno ao sincronizar processo',
            detalhes: (erro as Error).message
        });
    }
});

/**
 * GET /internal/processos/:numero_cnj
 * 
 * Obtém processo normalizado por número CNJ
 */
router.get('/:numero_cnj', async (req: Request, res: Response) => {
    try {
        const { numero_cnj } = req.params;

        // Validar formato CNJ
        if (!validarNumeroCNJ(numero_cnj)) {
            return res.status(400).json({
                erro: 'Número CNJ inválido. Formato: 0000000-00.0000.0.00.0000'
            });
        }

        const processo = await processoService.obterPorNumeroCNJ(numero_cnj);

        if (!processo) {
            return res.status(404).json({
                erro: 'Processo não encontrado',
                sugestao: 'Use POST /internal/processos/sincronizar para buscar'
            });
        }

        const response: ObterProcessoResponse = { processo };
        return res.json(response);
    } catch (erro) {
        console.error('[API] Erro ao obter processo:', erro);
        return res.status(500).json({
            erro: 'Erro interno ao obter processo',
            detalhes: (erro as Error).message
        });
    }
});

/**
 * GET /internal/clientes/:id_cliente/processos
 * 
 * Lista processos de um cliente (paginado)
 */
router.get('/clientes/:id_cliente/processos', async (req: Request, res: Response) => {
    try {
        const { id_cliente } = req.params;
        const pagina = parseInt(req.query.pagina as string) || 1;
        const tamanho = parseInt(req.query.tamanho as string) || 50;

        const resultado: ListarProcessosClienteResponse = await processoService.listarPorCliente(
            id_cliente,
            pagina,
            tamanho
        );

        return res.json(resultado);
    } catch (erro) {
        console.error('[API] Erro ao listar processos do cliente:', erro);
        return res.status(500).json({
            erro: 'Erro interno ao listar processos',
            detalhes: (erro as Error).message
        });
    }
});

/**
 * POST /internal/monitoramentos
 * 
 * Cadastra monitoramento automático de processo
 */
router.post('/monitoramentos', async (req: Request, res: Response) => {
    try {
        const body: CadastrarMonitoramentoRequest = req.body;

        // Validação
        if (!body.numero_cnj || !body.id_cliente || !body.frequencia) {
            return res.status(400).json({
                erro: 'Campos obrigatórios: numero_cnj, id_cliente, frequencia'
            });
        }

        const resultado: CadastrarMonitoramentoResponse = await monitoramentoService.cadastrar(body);

        return res.status(201).json(resultado);
    } catch (erro) {
        console.error('[API] Erro ao cadastrar monitoramento:', erro);
        return res.status(500).json({
            erro: 'Erro interno ao cadastrar monitoramento',
            detalhes: (erro as Error).message
        });
    }
});

/**
 * GET /internal/monitoramentos/pendentes
 * 
 * Lista monitoramentos que precisam ser reconsultados agora
 * (Para Antigravity ou cron executar)
 */
router.get('/monitoramentos/pendentes', async (req: Request, res: Response) => {
    try {
        const limite = parseInt(req.query.limite as string) || 1000;

        const resultado: ListarMonitoramentosPendentesResponse =
            await monitoramentoService.listarPendentes(limite);

        return res.json(resultado);
    } catch (erro) {
        console.error('[API] Erro ao listar monitoramentos pendentes:', erro);
        return res.status(500).json({
            erro: 'Erro interno ao listar monitoramentos',
            detalhes: (erro as Error).message
        });
    }
});

/**
 * GET /internal/jobs/:job_id
 * 
 * Consulta status de um job de sincronização
 */
router.get('/jobs/:job_id', async (req: Request, res: Response) => {
    try {
        const { job_id } = req.params;

        const status: JobStatus | null = await processoService.obterStatusJob(job_id);

        if (!status) {
            return res.status(404).json({
                erro: 'Job não encontrado'
            });
        }

        return res.json(status);
    } catch (erro) {
        console.error('[API] Erro ao obter status do job:', erro);
        return res.status(500).json({
            erro: 'Erro interno ao obter status',
            detalhes: (erro as Error).message
        });
    }
});

/**
 * Helper: Validar número CNJ
 */
function validarNumeroCNJ(numero: string): boolean {
    const regex = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
    return regex.test(numero);
}

export default router;
