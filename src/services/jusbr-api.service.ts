import { jusBrOAuthService } from './jusbr-oauth.service';
import type {
    PJeProcess,
    PJeProcessDetails,
    PJeParty,
    PJeSearchFilters,
    // PJeAPIResponse,
    PJeProcessListResponse
} from '../types/jusbr.types';

/**
 * Jus.br PJe API Service
 * Handles communication with PJe API after OAuth authentication
 */
class JusBrAPIService {
    // Base URL will be determined per tribunal
    // For now, using a generic pattern
    private readonly API_BASE = 'https://api.pje.jus.br/api/v1';

    /**
     * Search processes by lawyer OAB
     */
    async searchProcessesByOAB(
        oab: string,
        uf: string,
        filters?: PJeSearchFilters
    ): Promise<PJeProcess[]> {
        const token = await jusBrOAuthService.getValidAccessToken();

        if (!token) {
            throw new Error('Not authenticated - please login first');
        }

        const params = new URLSearchParams({
            oab,
            uf,
            ...this.buildQueryParams(filters)
        });

        const response = await fetch(
            `${this.API_BASE}/processos/advogado?${params}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch processes: ${response.status}`);
        }

        const data: PJeProcessListResponse = await response.json();
        return data.processos || [];
    }

    /**
     * Get process details (WITHOUT marking intimation as read)
     */
    async getProcessDetails(processNumber: string): Promise<PJeProcessDetails> {
        const token = await jusBrOAuthService.getValidAccessToken();

        if (!token) {
            throw new Error('Not authenticated');
        }

        // CRITICAL: marcarIntimacaoLida=false to avoid marking as read
        const response = await fetch(
            `${this.API_BASE}/processos/${processNumber}?marcarIntimacaoLida=false`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch process details: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Get ALL parties of a process (crucial for multi-client)
     */
    async getProcessParties(processNumber: string): Promise<PJeParty[]> {
        const token = await jusBrOAuthService.getValidAccessToken();

        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(
            `${this.API_BASE}/processos/${processNumber}/partes`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch parties: ${response.status}`);
        }

        const data = await response.json();

        // Parse response structure
        // Expected: { poloAtivo: [...], poloPassivo: [...], terceiros: [...] }
        return this.parsePartiesResponse(data);
    }

    /**
     * Get process movements (WITHOUT marking intimation as read)
     */
    async getProcessMovements(processNumber: string) {
        const token = await jusBrOAuthService.getValidAccessToken();

        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(
            `${this.API_BASE}/processos/${processNumber}/movimentacoes?marcarLido=false`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch movements: ${response.status}`);
        }

        return await response.json();
    }

    // Helper: Parse parties response from PJe API
    private parsePartiesResponse(data: any): PJeParty[] {
        const parties: PJeParty[] = [];

        // Polo Ativo (plaintiffs)
        if (data.poloAtivo && Array.isArray(data.poloAtivo)) {
            for (const party of data.poloAtivo) {
                parties.push({
                    nome: party.nome,
                    documento: party.documento || party.cpf || party.cnpj,
                    tipo: party.tipo || party.tipoPessoa || 'FISICA',
                    polo: 'ATIVO',
                    advogados: party.advogados || [],
                    email: party.email,
                    telefone: party.telefone,
                    endereco: party.endereco
                });
            }
        }

        // Polo Passivo (defendants)
        if (data.poloPassivo && Array.isArray(data.poloPassivo)) {
            for (const party of data.poloPassivo) {
                parties.push({
                    nome: party.nome,
                    documento: party.documento || party.cpf || party.cnpj,
                    tipo: party.tipo || party.tipoPessoa || 'FISICA',
                    polo: 'PASSIVO',
                    advogados: party.advogados || [],
                    email: party.email,
                    telefone: party.telefone,
                    endereco: party.endereco
                });
            }
        }

        // Terceiros
        if (data.terceiros && Array.isArray(data.terceiros)) {
            for (const party of data.terceiros) {
                parties.push({
                    nome: party.nome,
                    documento: party.documento || party.cpf || party.cnpj,
                    tipo: party.tipo || party.tipoPessoa || 'FISICA',
                    polo: 'TERCEIRO',
                    advogados: party.advogados || [],
                    email: party.email,
                    telefone: party.telefone,
                    endereco: party.endereco
                });
            }
        }

        return parties;
    }

    // Helper: Build query params
    private buildQueryParams(filters?: PJeSearchFilters): Record<string, string> {
        if (!filters) return {};

        const params: Record<string, string> = {};

        if (filters.tribunal) params.tribunal = filters.tribunal;
        if (filters.dataInicio) params.dataInicio = filters.dataInicio;
        if (filters.dataFim) params.dataFim = filters.dataFim;
        if (filters.classe) params.classe = filters.classe;
        if (filters.comarca) params.comarca = filters.comarca;
        if (filters.pagina) params.pagina = String(filters.pagina);
        if (filters.tamanhoPagina) params.tamanhoPagina = String(filters.tamanhoPagina);

        return params;
    }
}

export const jusBrAPIService = new JusBrAPIService();
