import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database.service';
import { gamificationService } from '../services/gamification.service';
import { useGlobalData } from '../context/GlobalDataContext';
import toast from 'react-hot-toast';
import type { Process } from '../types';

export const useProcesses = () => {
    const { user: currentUser } = useGlobalData();
    const [processes, setProcesses] = useState<Process[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load processes on mount
    useEffect(() => {
        loadProcesses();
    }, []);

    const loadProcesses = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await db.processes.getAll();
            setProcesses(data);
        } catch (err: any) {
            console.error('Error loading processes:', err);
            setError(err.message);
            toast.error('Erro ao carregar processos');
        } finally {
            setIsLoading(false);
        }
    };

    const addProcess = useCallback(async (processData: {
        processNumber: string;
        clientId: string;
        tribunalId: string;
        tribunalName: string;
        className?: string;
        subject?: string[];
        filingDate?: string;
        courtName?: string;
        caseValue?: number;
    }) => {
        setIsLoading(true);
        setError(null);
        try {
            const newProcess = await db.processes.create({
                ...processData,
                clientId: processData.clientId || undefined,
                tribunalId: processData.tribunalId || 'UNKNOWN', // Fallback
                tribunalName: processData.tribunalName || 'Tribunal Desconhecido'
            });

            setProcesses(prev => [newProcess, ...prev]);
            toast.success('Processo adicionado com sucesso!');

            // Gamification Trigger
            if (currentUser?.id) {
                gamificationService.registerEvent(currentUser.id, 'PROCESS_CREATED', { processId: newProcess.id });
            }

            return newProcess;
        } catch (err: any) {
            console.error('Error adding process:', err);
            setError(err instanceof Error ? err.message : 'Failed to create process');
            toast.error('Erro ao adicionar processo');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    const updateProcess = useCallback(async (id: string, updates: Partial<Process>) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedProcess = await db.processes.update(id, updates);
            setProcesses(prev => prev.map(p => p.id === id ? updatedProcess : p));
            toast.success('Processo atualizado com sucesso!');

            // Gamification Trigger
            if (currentUser?.id) {
                gamificationService.registerEvent(currentUser.id, 'PROCESS_UPDATED', { processId: id });
            }

            return updatedProcess;
        } catch (err: any) {
            console.error('Error updating process:', err);
            setError(err instanceof Error ? err.message : 'Failed to update process');
            toast.error('Erro ao atualizar processo');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    const deleteProcess = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await db.processes.delete(id);
            setProcesses(prev => prev.filter(p => p.id !== id));
            toast.success('Processo removido com sucesso!');

            // Gamification Trigger
            if (currentUser?.id) {
                gamificationService.registerEvent(currentUser.id, 'PROCESS_DELETED', { processId: id });
            }
        } catch (err: any) {
            console.error('Error deleting process:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete process');
            toast.error('Erro ao remover processo');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    const deleteBatchProcesses = async (ids: string[]) => {
        try {
            await Promise.all(ids.map(id => db.processes.delete(id)));
            setProcesses(prev => prev.filter(p => !ids.includes(p.id)));
            toast.success(`${ids.length} processo(s) removido(s) com sucesso!`);
        } catch (err: any) {
            console.error('Error deleting processes:', err);
            toast.error('Erro ao remover processos');
            throw err;
        }
    };

    const refreshProcesses = () => {
        loadProcesses();
    };

    return {
        processes,
        isLoading,
        error,
        addProcess,
        updateProcess,
        deleteProcess,
        deleteBatchProcesses,
        refreshProcesses
    };
}
