import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * CAMADA JUDIT - API Simplificada de Processos
 * 
 * 3 endpoints principais que escondem toda complexidade de múltiplas fontes
 */

// ===========================
// TYPES
// ===========================

type TipoBusca = 'CPF' | 'CNPJ' | 'OAB' | 'CNJ';
type ModoConsulta = 'ASSINCRONO' | 'SINCRONO';
type StatusRequest = 'EM_PROCESSAMENTO' | 'CONCLUIDA' | 'ERRO';
type Situacao = 'EM_ANDAMENTO' | 'SUSPENSO' | 'ARQUIVADO' | 'BAIXADO' | 'TRANSITADO_JULGADO';
type TipoParte = 'AUTOR' | 'REU' | 'AGRAVANTE' | 'AGRAVADO' | 'TERCEIRO';
type Polo = 'ATIVO' | 'PASSIVO' | 'TERCEIRO';
type TipoDocumento = 'CPF' | 'CNPJ' | 'OAB' | 'OUTRO';
type FonteDados = 'TRIBUNAL_DIRETO' | 'DATAJUD' | 'PJE_ROBO' | 'MANUAL';
type FrequenciaTracking = 'DIARIA' | '12_EM_12H' | 'A_CADA_6H' | 'PERSONALIZADA';

interface ConsultaProcessualRequest {
    tipo_busca: TipoBusca;
    chave: string;
    escopo_tribunais?: string[];
    modo?: ModoConsulta;
}

interface ConsultaProcessualResponse {
    request_id: string;
    status: StatusRequest;
}

interface PartePro cessual {
    tipo: TipoParte;
    polo: Polo;
    nome: string;
    documento ?: string;
    tipo_documento ?: TipoDocumento;
}

interface MovimentacaoProcessual {
    data: string;
    descricao: string;
    codigo_interno?: string;
    orgao_responsavel?: string;
    tem_prazo: boolean;
    prazo_final?: string | null;
}

interface DocumentoProcessual {
    id: string;
    tipo: string;
    data_juntada: string;
    descricao: string;
    download_url?: string;
}

interface ProcessoCompleto {
    numero_cnj: string;
    tribunal: string;
    orgao_julgador: string;
    grau: number;
    classe: string;
    assunto_principal: string;
    valor_causa: number;
    situacao: Situacao;
    data_distribuicao: string;
    partes: ParteProcessual[];
    movimentacoes: MovimentacaoProcessual[];
    documentos: DocumentoProcessual[];
    fonte: FonteDados;
    data_atualizacao: string;
}

interface ProcessoResumo {
    numero_cnj: string;
    tribunal: string;
    resumo: {
        classe: string;
        assunto_principal: string;
        situacao: Situacao;
        ultima_movimentacao_data?: string;
        ultima_movimentacao_descricao?: string;
    };
}

interface ConsultaProcessualStatusResponse {
    request_id: string;
    status: StatusRequest;
    tipo_busca: TipoBusca;
    chave: string;
    processos?: ProcessoResumo[];
    erro?: string;
}

interface TrackingRequest {
    numero_cnj: string;
    frequencia: FrequenciaTracking;
    palavras_relevantes?: string[];
    callback_url: string;
}

interface TrackingResponse {
    tracking_id: string;
    status: 'ATIVO' | 'PAUSADO' | 'CANCELADO';
}

// ===========================
// IN-MEMORY STORAGE (substituir por DB em produção)
// ===========================

const requestsCache = new Map<string, ConsultaProcessualStatusResponse>();
const processosCache = new Map<string, ProcessoCompleto>();
const trackingsCache = new Map<string, TrackingRequest & { id: string }>();

// ===========================
// ROUTER
// ===========================

const router = Router();

/**
 * 1️⃣ POST /api/consulta-processual
 * 
 * Busca processos de forma assíncrona (estilo Judit "requests")
 * Aceita CPF, CNPJ, OAB ou número CNJ
 */
router.post('/consulta-processual', async (req: Request, res: Response) => {
    try {
        const body: ConsultaProcessualRequest = req.body;

        // Validação
        if (!body.tipo_busca || !body.chave) {
            return res.status(400).json({
                erro: 'Campos obrigatórios: tipo_busca, chave'
            });
        }

        const request_id = uuidv4();

        // Criar request inicial
        const requestStatus: ConsultaProcessualStatusResponse = {
            request_id,
            status: 'EM_PROCESSAMENTO',
            tipo_busca: body.tipo_busca,
            chave: body.chave
        };

        requestsCache.set(request_id, requestStatus);

        // Executar busca assíncrona (em produção usar fila)
        executarBuscaAssincrona(request_id, body).catch(err => {
            console.error(`[Consulta] Erro na busca ${request_id}:`, err);
            requestStatus.status = 'ERRO';
            requestStatus.erro = err.message;
        });

        const response: ConsultaProcessualResponse = {
            request_id,
            status: 'EM_PROCESSAMENTO'
        };

        return res.status(202).json(response); // 202 Accepted
    } catch (erro) {
        console.error('[API] Erro na consulta processual:', erro);
        return res.status(500).json({
            erro: 'Erro interno',
            detalhes: (erro as Error).message
        });
    }
});

/**
 * 1️⃣.1 GET /api/consulta-processual/:request_id
 * 
 * Consulta status de uma busca assíncrona
 */
router.get('/consulta-processual/:request_id', async (req: Request, res: Response) => {
    try {
        const { request_id } = req.params;

        const requestStatus = requestsCache.get(request_id);

        if (!requestStatus) {
            return res.status(404).json({
                erro: 'Request não encontrada'
            });
        }

        return res.json(requestStatus);
    } catch (erro) {
        console.error('[API] Erro ao consultar status:', erro);
        return res.status(500).json({
            erro: 'Erro interno',
            detalhes: (erro as Error).message
        });
    }
});

/**
 * 2️⃣ GET /api/processos/:numero_cnj
 * 
 * Retorna processo completo normalizado (estilo Judit "lawsuit")
 * Sempre no mesmo formato, independente da fonte
 */
router.get('/processos/:numero_cnj', async (req: Request, res: Response) => {
    try {
        const { numero_cnj } = req.params;

        // Validar formato CNJ
        if (!validarNumeroCNJ(numero_cnj)) {
            return res.status(400).json({
                erro: 'Número CNJ inválido',
                formato_esperado: '0000000-00.0000.0.00.0000'
            });
        }

        // Buscar processo (cache  ou consultar fontes)
        let processo = processosCache.get(numero_cnj);

        if (!processo) {
            // Consultar fontes (DataJud, tribunais, etc)
            processo = await consultarProcessoCompleto(numero_cnj);

            if (processo) {
                processosCache.set(numero_cnj, processo);
            }
        }

        if (!processo) {
            return res.status(404).json({
                erro: 'Processo não encontrado',
                sugestao: 'Use POST /api/consulta-processual para buscar primeiro'
            });
        }

        return res.json(processo);
    } catch (erro) {
        console.error('[API] Erro ao obter processo:', erro);
        return res.status(500).json({
            erro: 'Erro interno',
            detalhes: (erro as Error).message
        });
    }
});

/**
 * 3️⃣ POST /api/tracking
 * 
 * Monitora processo em tempo quase real (estilo Judit "tracking")
 * Notifica via webhook quando houver novidades
 */
router.post('/tracking', async (req: Request, res: Response) => {
    try {
        const body: TrackingRequest = req.body;

        // Validação
        if (!body.numero_cnj || !body.frequencia || !body.callback_url) {
            return res.status(400).json({
                erro: 'Campos obrigatórios: numero_cnj, frequencia, callback_url'
            });
        }

        const tracking_id = uuidv4();

        trackingsCache.set(tracking_id, {
            id: tracking_id,
            ...body
        });

        // Agendar monitoramento (em produção usar cron/job scheduler)
        agendarMonitoramento(tracking_id, body);

        const response: TrackingResponse = {
            tracking_id,
            status: 'ATIVO'
        };

        return res.status(201).json(response);
    } catch (erro) {
        console.error('[API] Erro ao criar tracking:', erro);
        return res.status(500).json({
            erro: 'Erro interno',
            detalhes: (erro as Error).message
        });
    }
});

/**
 * 3️⃣.1 GET /api/tracking/:tracking_id
 * 
 * Consulta status de um tracking
 */
router.get('/tracking/:tracking_id', async (req: Request, res: Response) => {
    try {
        const { tracking_id } = req.params;

        const tracking = trackingsCache.get(tracking_id);

        if (!tracking) {
            return res.status(404).json({
                erro: 'Tracking não encontrado'
            });
        }

        return res.json({
            tracking_id: tracking.id,
            numero_cnj: tracking.numero_cnj,
            frequencia: tracking.frequencia,
            status: 'ATIVO',
            palavras_relevantes: tracking.palavras_relevantes
        });
    } catch (erro) {
        console.error('[API] Erro ao consultar tracking:', erro);
        return res.status(500).json({
            erro: 'Erro interno',
            detalhes: (erro as Error).message
        });
    }
});

/**
 * 3️⃣.2 DELETE /api/tracking/:tracking_id
 * 
 * Cancela um tracking
 */
router.delete('/tracking/:tracking_id', async (req: Request, res: Response) => {
    try {
        const { tracking_id } = req.params;

        const tracking = trackingsCache.get(tracking_id);

        if (!tracking) {
            return res.status(404).json({
                erro: 'Tracking não encontrado'
            });
        }

        trackingsCache.delete(tracking_id);

        return res.json({
            tracking_id,
            status: 'CANCELADO'
        });
    } catch (erro) {
        console.error('[API] Erro ao cancelar tracking:', erro);
        return res.status(500).json({
            erro: 'Erro interno',
            detalhes: (erro as Error).message
        });
    }
});

// ===========================
// WORKERS (lógica assíncrona)
// ===========================

/**
 * Executa busca assíncrona em múltiplas fontes
 */
async function executarBuscaAssincrona(
    request_id: string,
    params: ConsultaProcessualRequest
): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay

    const requestStatus = requestsCache.get(request_id);
    if (!requestStatus) return;

    try {
        // Buscar em múltiplas fontes (DataJud, tribunais, etc)
        const processos = await buscarProcessosEmFontes(params);

        requestStatus.status = 'CONCLUIDA';
        requestStatus.processos = processos;

        requestsCache.set(request_id, requestStatus);
    } catch (erro) {
        requestStatus.status = 'ERRO';
        requestStatus.erro = (erro as Error).message;
        requestsCache.set(request_id, requestStatus);
    }
}

/**
 * Busca em múltiplas fontes e normaliza
 */
async function buscarProcessosEmFontes(
    params: ConsultaProcessualRequest
): Promise<ProcessoResumo[]> {
    // TODO: Integrar com adapters reais (DataJud, PJe, etc)
    // Mock por enquanto
    return [
        {
            numero_cnj: '0800001-11.2024.8.20.0001',
            tribunal: 'TJRN',
            resumo: {
                classe: 'Ação de Cobrança',
                assunto_principal: 'Contratos bancários',
                situacao: 'EM_ANDAMENTO',
                ultima_movimentacao_data: '2024-05-01T14:32:00Z',
                ultima_movimentacao_descricao: 'Juntada de petição'
            }
        }
    ];
}

/**
 * Consulta processo completo em fontes
 */
async function consultarProcessoCompleto(numero_cnj: string): Promise<ProcessoCompleto | null> {
    // TODO: Integrar com adapters reais
    // Mock por enquanto
    return {
        numero_cnj,
        tribunal: 'TJRN',
        orgao_julgador: '2ª Vara Cível de Assu',
        grau: 1,
        classe: 'Ação de Cobrança',
        assunto_principal: 'Contratos bancários',
        valor_causa: 12000.5,
        situacao: 'EM_ANDAMENTO',
        data_distribuicao: '2023-01-10',
        partes: [
            {
                tipo: 'AUTOR',
                polo: 'ATIVO',
                nome: 'Fulano de Tal',
                documento: '00000000000',
                tipo_documento: 'CPF'
            }
        ],
        movimentacoes: [
            {
                data: '2024-05-01T14:32:00Z',
                descricao: 'Juntada de petição de manifestação',
                codigo_interno: 'JUNTADA_PETICAO',
                orgao_responsavel: '2ª Vara Cível de Assu',
                tem_prazo: false,
                prazo_final: null
            }
        ],
        documentos: [],
        fonte: 'DATAJUD',
        data_atualizacao: new Date().toISOString()
    };
}

/**
 * Agenda monitoramento periódico
 */
function agendarMonitoramento(tracking_id: string, params: TrackingRequest): void {
    // TODO: Implementar job scheduler real (cron, BullMQ, etc)
    console.log(`[Tracking] Agendado monitoramento ${tracking_id} - Frequência: ${params.frequencia}`);
}

/**
 * Valida número CNJ
 */
function validarNumeroCNJ(numero: string): boolean {
    const regex = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
    return regex.test(numero);
}

export default router;
