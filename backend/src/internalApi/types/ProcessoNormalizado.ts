/**
 * Tipos e Interfaces para API Interna de Processos Normalizada
 * 
 * Compatível com Judit, DataJud, PJe e outros tribunais
 */

/**
 * Tipo de documento
 */
export type TipoDocumento = 'CPF' | 'CNPJ' | 'OAB' | 'OUTRO';

/**
 * Tipo de parte processual
 */
export type TipoParte =
    | 'AUTOR'
    | 'REU'
    | 'AGRAVANTE'
    | 'AGRAVADO'
    | 'RECORRENTE'
    | 'RECORRIDO'
    | 'EXECUTADO'
    | 'EXEQUENTE'
    | 'IMPETRANTE'
    | 'IMPETRADO'
    | 'TERCEIRO';

/**
 * Polo da parte
 */
export type Polo = 'ATIVO' | 'PASSIVO' | 'TERCEIRO';

/**
 * Situação do processo
 */
export type SituacaoProcesso =
    | 'EM_ANDAMENTO'
    | 'SUSPENSO'
    | 'ARQUIVADO'
    | 'BAIXADO'
    | 'TRANSITADO_JULGADO'
    | 'DIGITALIZADO';

/**
 * Fonte de dados
 */
export type FonteDados = 'DATAJUD' | 'PJE_ROBO' | 'TRIBUNAL_DIRETO' | 'MANUAL' | 'OUTRO';

/**
 * Tipo de busca
 */
export type TipoBusca = 'CNJ' | 'CPF' | 'CNPJ' | 'OAB' | 'OUTRO';

/**
 * Frequência de monitoramento
 */
export type FrequenciaMonitoramento = 'DIARIA' | 'SEMANAL' | 'MENSAL' | 'PERSONALIZADA';

/**
 * Tipo de anexo/documento
 */
export type TipoAnexo =
    | 'SENTENCA'
    | 'DESPACHO'
    | 'DECISAO'
    | 'PETICAO'
    | 'CERTIDAO'
    | 'INTIMACAO'
    | 'ATA_AUDIENCIA'
    | 'OUTRO';

/**
 * Parte do processo
 */
export interface ParteProcessual {
    tipo: TipoParte;
    nome: string;
    documento?: string;
    tipo_documento?: TipoDocumento;
    polo: Polo;
    advogados?: string[]; // Nome dos advogados
}

/**
 * Movimentação processual
 */
export interface MovimentacaoProcessual {
    id: string;
    data: string; // ISO 8601
    descricao: string;
    codigo_interno?: string;
    orgao_responsavel?: string;
    tem_prazo: boolean;
    prazo_final?: string | null; // ISO 8601
    complemento?: string;
}

/**
 * Última movimentação (resumida)
 */
export interface UltimaMovimentacao {
    data: string;
    descricao: string;
    codigo_interno?: string;
}

/**
 * Anexo/Documento do processo
 */
export interface AnexoProcessual {
    id: string;
    tipo: TipoAnexo;
    data_juntada: string;
    nome_arquivo: string;
    url_interna_download?: string;
    tamanho_bytes?: number;
    hash?: string;
}

/**
 * Processo Normalizado - Objeto Principal
 */
export interface ProcessoNormalizado {
    id: string; // UUID interno
    numero_cnj: string;
    numero_outro?: string | null;
    sigla_tribunal: string; // TJRN, TJSP, TRF5, etc
    orgao_julgador: string;
    grau: 1 | 2 | 3; // Grau de jurisdição
    classe: string;
    assunto_principal: string;
    valor_causa: number;
    data_distribuicao: string;
    situacao: SituacaoProcesso;
    justica_gratuita: boolean;
    segredo_justica: boolean;

    partes: ParteProcessual[];
    movimentacoes: MovimentacaoProcessual[];
    ultima_movimentacao?: UltimaMovimentacao;
    anexos: AnexoProcessual[];

    fonte: FonteDados;
    data_ultima_sincronizacao: string; // ISO 8601

    // Metadata
    metadata?: {
        vara?: string;
        comarca?: string;
        secao_judiciaria?: string;
        sistema_origem?: string;
        url_tribunal?: string;
    };
}

/**
 * Request: Sincronizar processo
 */
export interface SincronizarProcessoRequest {
    tipo_busca: TipoBusca;
    chave: string;
    forcar_reprocessamento?: boolean;
    tribunal?: string; // Opcional para otimizar busca
}

/**
 * Response: Sincronizar processo (async)
 */
export interface SincronizarProcessoResponse {
    job_id: string;
    status: 'ENFILEIRADO' | 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO';
    mensagem?: string;
}

/**
 * Response: Obter processo normalizado
 */
export interface ObterProcessoResponse {
    processo: ProcessoNormalizado;
}

/**
 * Item resumido de processo (para listagens)
 */
export interface ProcessoResumido {
    numero_cnj: string;
    sigla_tribunal: string;
    orgao_julgador: string;
    classe: string;
    assunto_principal: string;
    situacao: SituacaoProcesso;
    data_distribuicao: string;
    ultima_movimentacao_data?: string;
    ultima_movimentacao_descricao?: string;
    valor_causa: number;
}

/**
 * Response: Listar processos de cliente (paginado)
 */
export interface ListarProcessosClienteResponse {
    pagina: number;
    tamanho: number;
    total: number;
    itens: ProcessoResumido[];
}

/**
 * Request: Cadastrar monitoramento
 */
export interface CadastrarMonitoramentoRequest {
    numero_cnj: string;
    id_cliente: string;
    frequencia: FrequenciaMonitoramento;
    ativo: boolean;
    palavras_relevantes?: string[]; // Filtro semântico opcional
    notificar_email?: boolean;
    notificar_whatsapp?: boolean;
}

/**
 * Response: Cadastrar monitoramento
 */
export interface CadastrarMonitoramentoResponse {
    monitoramento_id: string;
    status: 'CRIADO' | 'ATUALIZADO';
}

/**
 * Monitoramento pendente
 */
export interface MonitoramentoPendente {
    monitoramento_id: string;
    numero_cnj: string;
    id_cliente: string;
    ultima_consulta?: string;
}

/**
 * Response: Listar monitoramentos pendentes
 */
export interface ListarMonitoramentosPendentesResponse {
    itens: MonitoramentoPendente[];
    total: number;
}

/**
 * Status de um job de sincronização
 */
export interface JobStatus {
    job_id: string;
    status: 'ENFILEIRADO' | 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO';
    progresso?: number; // 0-100
    iniciado_em?: string;
    concluido_em?: string;
    erro?: string;
    resultado?: {
        processos_encontrados: number;
        processos_atualizados: number;
        processos_novos: number;
    };
}
