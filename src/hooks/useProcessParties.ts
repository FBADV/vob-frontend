import { useState, useEffect } from 'react';
import { processPartiesService } from '../services/processParties.service';
import type { ProcessParty, GroupedProcessParties, CreateProcessPartyInput, PartyClientMatch } from '../types/processParty.types';
import type { Client } from '../types';

/**
 * React hook for managing process parties
 */
export function useProcessParties(processId: string | null) {
    const [parties, setParties] = useState<ProcessParty[]>([]);
    const [groupedParties, setGroupedParties] = useState<GroupedProcessParties | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load parties when processId changes
    useEffect(() => {
        if (processId) {
            loadParties();
        } else {
            setParties([]);
            setGroupedParties(null);
        }
    }, [processId]);

    const loadParties = async () => {
        if (!processId) return;

        setIsLoading(true);
        setError(null);

        try {
            const [fetchedParties, grouped] = await Promise.all([
                processPartiesService.getProcessParties(processId),
                processPartiesService.getGroupedParties(processId)
            ]);

            setParties(fetchedParties);
            setGroupedParties(grouped);
        } catch (err: any) {
            console.error('Error loading parties:', err);
            setError(err.message || 'Erro ao carregar partes do processo');
        } finally {
            setIsLoading(false);
        }
    };

    const createParty = async (input: CreateProcessPartyInput): Promise<ProcessParty | null> => {
        setError(null);

        try {
            const newParty = await processPartiesService.createProcessParty(input);
            await loadParties();  // Reload all parties
            return newParty;
        } catch (err: any) {
            console.error('Error creating party:', err);
            setError(err.message || 'Erro ao criar parte');
            return null;
        }
    };

    const createMultiple = async (inputs: CreateProcessPartyInput[]): Promise<ProcessParty[] | null> => {
        setError(null);

        try {
            const newParties = await processPartiesService.createMultipleParties(inputs);
            await loadParties();  // Reload all parties
            return newParties;
        } catch (err: any) {
            console.error('Error creating multiple parties:', err);
            setError(err.message || 'Erro ao criar partes');
            return null;
        }
    };

    const updateParty = async (partyId: string, updates: any): Promise<ProcessParty | null> => {
        setError(null);

        try {
            const updated = await processPartiesService.updateProcessParty(partyId, updates);
            await loadParties();  // Reload all parties
            return updated;
        } catch (err: any) {
            console.error('Error updating party:', err);
            setError(err.message || 'Erro ao atualizar parte');
            return null;
        }
    };

    const deleteParty = async (partyId: string): Promise<boolean> => {
        setError(null);

        try {
            await processPartiesService.deleteProcessParty(partyId);
            await loadParties();  // Reload all parties
            return true;
        } catch (err: any) {
            console.error('Error deleting party:', err);
            setError(err.message || 'Erro ao deletar parte');
            return false;
        }
    };

    const identifyClients = async (
        partyInputs: CreateProcessPartyInput[],
        allClients: Client[]
    ): Promise<PartyClientMatch[]> => {
        setError(null);

        try {
            return await processPartiesService.identifyClientParties(partyInputs, allClients);
        } catch (err: any) {
            console.error('Error identifying clients:', err);
            setError(err.message || 'Erro ao identificar clientes');
            return [];
        }
    };

    const replaceAll = async (newParties: CreateProcessPartyInput[]): Promise<boolean> => {
        if (!processId) return false;

        setError(null);

        try {
            await processPartiesService.replaceProcessParties(processId, newParties);
            await loadParties();  // Reload all parties
            return true;
        } catch (err: any) {
            console.error('Error replacing parties:', err);
            setError(err.message || 'Erro ao substituir partes');
            return false;
        }
    };

    // Computed values
    const clients = parties.filter(p => p.isClient);
    const hasMultipleClients = clients.length > 1;

    return {
        parties,
        groupedParties,
        clients,
        hasMultipleClients,
        isLoading,
        error,
        createParty,
        createMultiple,
        updateParty,
        deleteParty,
        identifyClients,
        replaceAll,
        reload: loadParties
    };
}
