import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database.service';
import toast from 'react-hot-toast';
import type { AgendaEvent } from '../types';

export function useAgenda() {
    const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load agenda events on mount
    useEffect(() => {
        loadAgendaEvents();
    }, []);

    const loadAgendaEvents = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await db.agenda.getAll();
            setAgendaEvents(data);
        } catch (err: any) {
            console.error('Error loading agenda events:', err);
            setError(err.message);
            toast.error('Erro ao carregar eventos');
        } finally {
            setIsLoading(false);
        }
    };

    const addAgendaEvent = useCallback(async (event: AgendaEvent) => {
        setIsLoading(true);
        setError(null);
        try {
            const newEvent = await db.agenda.create(event);
            setAgendaEvents(prev => [...prev, newEvent]);
            toast.success('Evento adicionado com sucesso!');
            return newEvent;
        } catch (err: any) {
            console.error('Error adding event:', err);
            setError(err instanceof Error ? err.message : 'Failed to create event');
            toast.error('Erro ao adicionar evento');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateAgendaEvent = useCallback(async (id: string, updates: Partial<AgendaEvent>) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedEvent = await db.agenda.update(id, updates);
            setAgendaEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
            toast.success('Evento atualizado com sucesso!');
            return updatedEvent;
        } catch (err: any) {
            console.error('Error updating event:', err);
            setError(err instanceof Error ? err.message : 'Failed to update event');
            toast.error('Erro ao atualizar evento');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteAgendaEvent = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await db.agenda.delete(id);
            setAgendaEvents(prev => prev.filter(e => e.id !== id));
            toast.success('Evento removido com sucesso!');
        } catch (err: any) {
            console.error('Error deleting event:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete event');
            toast.error('Erro ao remover evento');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshAgenda = () => {
        loadAgendaEvents();
    };

    return {
        agendaEvents,
        isLoading,
        error,
        addAgendaEvent,
        updateAgendaEvent,
        deleteAgendaEvent,
        refreshAgenda
    };
}
