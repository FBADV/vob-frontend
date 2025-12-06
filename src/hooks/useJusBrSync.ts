import { useState } from 'react';
import { jusBrSyncService } from '../services/jusbr-sync.service';
import type { Process } from '../types';
import type { JusBrSyncResult, JusBrProcessSyncResult } from '../services/jusbr-sync.service';

/**
 * React hook for Jus.br data synchronization
 */
export function useJusBrSync() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<JusBrSyncResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Sync processes by OAB
     */
    const syncByOAB = async (
        oab: string,
        uf: string,
        existingProcesses: Process[]
    ): Promise<JusBrSyncResult | null> => {
        setIsSyncing(true);
        setError(null);
        setSyncResult(null);

        try {
            const result = await jusBrSyncService.syncProcessesByOAB(oab, uf, existingProcesses);
            setSyncResult(result);

            if (!result.success && result.errors.length > 0) {
                setError(result.errors.join('; '));
            }

            return result;
        } catch (err: any) {
            const errorMsg = err.message || 'Erro ao sincronizar processos';
            setError(errorMsg);
            return null;
        } finally {
            setIsSyncing(false);
        }
    };

    /**
     * Sync parties for a specific process
     */
    const syncProcessParties = async (
        processId: string,
        processNumber: string
    ): Promise<JusBrProcessSyncResult | null> => {
        setIsSyncing(true);
        setError(null);

        try {
            const result = await jusBrSyncService.syncProcessParties(processId, processNumber);

            if (!result.success && result.errors.length > 0) {
                setError(result.errors.join('; '));
            }

            return result;
        } catch (err: any) {
            const errorMsg = err.message || 'Erro ao sincronizar partes';
            setError(errorMsg);
            return null;
        } finally {
            setIsSyncing(false);
        }
    };

    /**
     * Fetch complete process details
     */
    const fetchProcessDetails = async (processNumber: string) => {
        setIsSyncing(true);
        setError(null);

        try {
            const details = await jusBrSyncService.fetchProcessDetails(processNumber);
            return details;
        } catch (err: any) {
            const errorMsg = err.message || 'Erro ao buscar detalhes';
            setError(errorMsg);
            return null;
        } finally {
            setIsSyncing(false);
        }
    };

    return {
        isSyncing,
        syncResult,
        error,
        syncByOAB,
        syncProcessParties,
        fetchProcessDetails,
        clearError: () => setError(null),
        clearResult: () => setSyncResult(null)
    };
}
