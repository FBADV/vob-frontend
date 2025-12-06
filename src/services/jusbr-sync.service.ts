import { jusBrAPIService } from './jusbr-api.service';
import { processPartiesService } from './processParties.service';
import type { Process } from '../types';
import type { CreateProcessPartyInput, PartyRole, PartyType } from '../types/processParty.types';

/**
 * Jus.br Data Synchronization Service
 * Syncs PJe process data with local database
 */

export interface JusBrSyncResult {
    success: boolean;
    processesFound: number;
    processesCreated: number;
    partiesCreated: number;
    errors: string[];
}

export interface JusBrProcessSyncResult {
    success: boolean;
    partiesCreated: number;
    partiesMatched: number;
    errors: string[];
}

class JusBrSyncService {
    /**
     * Search and import processes by OAB
     * Fetches processes from PJe and creates/updates them locally
     */
    async syncProcessesByOAB(
        oab: string,
        uf: string,
        existingProcesses: Process[]
    ): Promise<JusBrSyncResult> {
        const result: JusBrSyncResult = {
            success: false,
            processesFound: 0,
            processesCreated: 0,
            partiesCreated: 0,
            errors: []
        };

        try {
            // Search processes on Jus.br
            const pjeProcesses = await jusBrAPIService.searchProcessesByOAB(oab, uf);
            result.processesFound = pjeProcesses.length;

            if (pjeProcesses.length === 0) {
                result.success = true;
                return result;
            }

            // Process each PJe process
            for (const pjeProcess of pjeProcesses) {
                try {
                    // Check if process already exists locally
                    const existingProcess = existingProcesses.find(
                        p => this.normalizeProcessNumber(p.number || '') ===
                            this.normalizeProcessNumber(pjeProcess.numero)
                    );

                    if (existingProcess) {
                        // Sync parties for existing process
                        const syncResult = await this.syncProcessParties(
                            existingProcess.id,
                            pjeProcess.numero
                        );
                        result.partiesCreated += syncResult.partiesCreated;
                    } else {
                        // Process doesn't exist - would need to create it
                        // This is typically done through ProcessFormModal
                        // Just track that it was found
                        result.processesCreated++;
                    }
                } catch (err: any) {
                    result.errors.push(`Erro no processo ${pjeProcess.numero}: ${err.message}`);
                }
            }

            result.success = result.errors.length === 0;
            return result;

        } catch (err: any) {
            result.errors.push(`Erro ao buscar processos: ${err.message}`);
            return result;
        }
    }

    /**
     * Sync parties from Jus.br for a specific process
     * Fetches parties from PJe and creates them in process_parties table
     */
    async syncProcessParties(
        processId: string,
        processNumber: string
    ): Promise<JusBrProcessSyncResult> {
        const result: JusBrProcessSyncResult = {
            success: false,
            partiesCreated: 0,
            partiesMatched: 0,
            errors: []
        };

        try {
            // Fetch parties from PJe API
            const pjeParties = await jusBrAPIService.getProcessParties(processNumber);

            if (pjeParties.length === 0) {
                result.success = true;
                return result;
            }

            // Get existing parties for this process
            const existingParties = await processPartiesService.getProcessParties(processId);

            // Convert PJe parties to our format and create them
            const partiesToCreate: CreateProcessPartyInput[] = [];

            for (const pjeParty of pjeParties) {
                // Check if party already exists
                const alreadyExists = existingParties.some(
                    ep => this.normalizeDocument(ep.document || '') ===
                        this.normalizeDocument(pjeParty.documento || '') &&
                        ep.role === this.mapPjePoloToRole(pjeParty.polo)
                );

                if (!alreadyExists) {
                    partiesToCreate.push({
                        processId,
                        name: pjeParty.nome,
                        document: pjeParty.documento,
                        role: this.mapPjePoloToRole(pjeParty.polo),
                        type: this.mapPjeTipoToType(pjeParty.tipo),
                        email: pjeParty.email,
                        phone: pjeParty.telefone
                    });
                }
            }

            // Create parties in batch
            if (partiesToCreate.length > 0) {
                const created = await processPartiesService.createMultipleParties(partiesToCreate);
                result.partiesCreated = created.length;

                // Count parties that were auto-matched by document/name during creation
                result.partiesMatched = created.filter(p => p.isClient).length;
            }

            result.success = true;
            return result;

        } catch (err: any) {
            result.errors.push(`Erro ao sincronizar partes: ${err.message}`);
            return result;
        }
    }

    /**
     * Fetch complete process details from Jus.br
     * Includes parties, movements, and documents
     */
    async fetchProcessDetails(processNumber: string) {
        try {
            const details = await jusBrAPIService.getProcessDetails(processNumber);
            return details;
        } catch (err: any) {
            console.error('Error fetching process details:', err);
            throw new Error(`Erro ao buscar detalhes do processo: ${err.message}`);
        }
    }

    /**
     * Helper: Normalize process number for comparison
     */
    private normalizeProcessNumber(processNumber: string): string {
        return processNumber.replace(/[^\d]/g, '');
    }

    /**
     * Helper: Normalize document (CPF/CNPJ) for comparison
     */
    private normalizeDocument(document: string): string {
        return document.replace(/[^\d]/g, '');
    }

    /**
     * Helper: Map PJe polo to our PartyRole
     */
    private mapPjePoloToRole(polo: 'ATIVO' | 'PASSIVO' | 'TERCEIRO'): PartyRole {
        switch (polo) {
            case 'ATIVO':
                return 'plaintiff';
            case 'PASSIVO':
                return 'defendant';
            case 'TERCEIRO':
                return 'third_party';
            default:
                return 'plaintiff';
        }
    }

    /**
     * Helper: Map PJe tipo to our PartyType
     */
    private mapPjeTipoToType(tipo: 'FISICA' | 'JURIDICA'): PartyType {
        return tipo === 'FISICA' ? 'individual' : 'company';
    }
}

export const jusBrSyncService = new JusBrSyncService();
