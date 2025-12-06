import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database.service';
import toast from 'react-hot-toast';
import type { FinancialEntry } from '../types';

export function useFinancial() {
    const [financial, setFinancial] = useState<FinancialEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load financial entries on mount
    useEffect(() => {
        loadFinancial();
    }, []);

    const loadFinancial = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await db.financial.getAll();
            setFinancial(data);
        } catch (err: any) {
            console.error('Error loading financial entries:', err);
            setError(err.message);
            toast.error('Erro ao carregar lançamentos');
        } finally {
            setIsLoading(false);
        }
    };

    const addFinancialEntry = useCallback(async (entry: FinancialEntry) => {
        setIsLoading(true);
        setError(null);
        try {
            const newEntry = await db.financial.create(entry);
            setFinancial(prev => [...prev, newEntry]);
            toast.success('Lançamento adicionado com sucesso!');
            return newEntry;
        } catch (err: any) {
            console.error('Error adding financial entry:', err);
            setError(err instanceof Error ? err.message : 'Failed to create entry');
            toast.error('Erro ao adicionar lançamento');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateFinancialEntry = useCallback(async (id: string, updates: Partial<FinancialEntry>) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedEntry = await db.financial.update(id, updates);
            setFinancial(prev => prev.map(f => f.id === id ? updatedEntry : f));
            toast.success('Lançamento atualizado com sucesso!');
            return updatedEntry;
        } catch (err: any) {
            console.error('Error updating financial entry:', err);
            setError(err instanceof Error ? err.message : 'Failed to update entry');
            toast.error('Erro ao atualizar lançamento');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteFinancialEntry = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await db.financial.delete(id);
            setFinancial(prev => prev.filter(f => f.id !== id));
            toast.success('Lançamento removido com sucesso!');
        } catch (err: any) {
            console.error('Error deleting financial entry:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete entry');
            toast.error('Erro ao remover lançamento');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshFinancial = () => {
        loadFinancial();
    };

    return {
        financial,
        isLoading,
        error,
        addFinancialEntry,
        updateFinancialEntry,
        deleteFinancialEntry,
        refreshFinancial
    };
}
