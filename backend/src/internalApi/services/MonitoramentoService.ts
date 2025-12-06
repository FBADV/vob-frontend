import { v4 as uuidv4 } from 'uuid';
import {
    CadastrarMonitoramentoRequest,
    CadastrarMonitoramentoResponse,
    ListarMonitoramentosPendentesResponse,
    MonitoramentoPendente,
    FrequenciaMonitoramento
} from '../types/ProcessoNormalizado';

interface Monitoramento {
    id: string;
    numero_cnj: string;
    id_cliente: string;
    frequencia: FrequenciaMonitoramento;
    ativo: boolean;
    palavras_relevantes?: string[];
    notificar_email?: boolean;
    notificar_whatsapp?: boolean;
    criado_em: string;
    ultima_consulta?: string;
    proxima_consulta: string;
}

/**
 * Serviço de Monitoramento de Processos
 * 
 * Gerencia monitoramentos automáticos e reconsultas periódicas
 */
export class MonitoramentoService {
    // Em produção: substituir por banco de dados
    private monitoramentos: Map<string, Monitoramento> = new Map();

    /**
     * Cadastra ou atualiza monitoramento
     */
    async cadastrar(request: CadastrarMonitoramentoRequest): Promise<CadastrarMonitoramentoResponse> {
        // Verifica se já existe monitoramento para este CNJ + cliente
        const existente = Array.from(this.monitoramentos.values()).find(
            m => m.numero_cnj === request.numero_cnj && m.id_cliente === request.id_cliente
        );

        if (existente) {
            // Atualizar
            existente.frequencia = request.frequencia;
            existente.ativo = request.ativo;
            existente.palavras_relevantes = request.palavras_relevantes;
            existente.notificar_email = request.notificar_email;
            existente.notificar_whatsapp = request.notificar_whatsapp;
            existente.proxima_consulta = this.calcularProximaConsulta(request.frequencia);

            this.monitoramentos.set(existente.id, existente);

            return {
                monitoramento_id: existente.id,
                status: 'ATUALIZADO'
            };
        }

        // Criar novo
        const id = uuidv4();
        const monitoramento: Monitoramento = {
            id,
            numero_cnj: request.numero_cnj,
            id_cliente: request.id_cliente,
            frequencia: request.frequencia,
            ativo: request.ativo,
            palavras_relevantes: request.palavras_relevantes,
            notificar_email: request.notificar_email,
            notificar_whatsapp: request.notificar_whatsapp,
            criado_em: new Date().toISOString(),
            proxima_consulta: this.calcularProximaConsulta(request.frequencia)
        };

        this.monitoramentos.set(id, monitoramento);

        return {
            monitoramento_id: id,
            status: 'CRIADO'
        };
    }

    /**
     * Lista monitoramentos que precisam ser reconsultados
     */
    async listarPendentes(limite: number): Promise<ListarMonitoramentosPendentesResponse> {
        const agora = new Date();

        const pendentes = Array.from(this.monitoramentos.values())
            .filter(m =>
                m.ativo &&
                new Date(m.proxima_consulta) <= agora
            )
            .slice(0, limite)
            .map(m => ({
                monitoramento_id: m.id,
                numero_cnj: m.numero_cnj,
                id_cliente: m.id_cliente,
                ultima_consulta: m.ultima_consulta
            }));

        return {
            itens: pendentes,
            total: pendentes.length
        };
    }

    /**
     * Marca monitoramento como consultado
     */
    async marcarComoConsultado(monitoramento_id: string): Promise<void> {
        const monitoramento = this.monitoramentos.get(monitoramento_id);
        if (monitoramento) {
            monitoramento.ultima_consulta = new Date().toISOString();
            monitoramento.proxima_consulta = this.calcularProximaConsulta(monitoramento.frequencia);
            this.monitoramentos.set(monitoramento_id, monitoramento);
        }
    }

    /**
     * Calcula próxima data de consulta baseada na frequência
     */
    private calcularProximaConsulta(frequencia: FrequenciaMonitoramento): string {
        const agora = new Date();

        switch (frequencia) {
            case 'DIARIA':
                agora.setDate(agora.getDate() + 1);
                break;
            case 'SEMANAL':
                agora.setDate(agora.getDate() + 7);
                break;
            case 'MENSAL':
                agora.setMonth(agora.getMonth() + 1);
                break;
            case 'PERSONALIZADA':
                // Em produção: permitir customização
                agora.setDate(agora.getDate() + 3);
                break;
        }

        return agora.toISOString();
    }
}
