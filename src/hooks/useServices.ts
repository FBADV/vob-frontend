import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database.service';
import toast from 'react-hot-toast';
import type { Service } from '../types';

export function useServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load services on mount
    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await db.services.getAll();
            setServices(data);
        } catch (err: any) {
            console.error('Error loading services:', err);
            setError(err.message);
            toast.error('Erro ao carregar serviços');
        } finally {
            setIsLoading(false);
        }
    };

    const addService = useCallback(async (service: Service) => {
        setIsLoading(true);
        setError(null);
        try {
            const newService = await db.services.create(service);
            setServices(prev => [...prev, newService]);
            toast.success('Serviço adicionado com sucesso!');
            return newService;
        } catch (err: any) {
            console.error('Error adding service:', err);
            setError(err instanceof Error ? err.message : 'Failed to create service');
            toast.error('Erro ao adicionar serviço');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateService = useCallback(async (id: string, updates: Partial<Service>) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedService = await db.services.update(id, updates);
            setServices(prev => prev.map(s => s.id === id ? updatedService : s));
            toast.success('Serviço atualizado com sucesso!');
            return updatedService;
        } catch (err: any) {
            console.error('Error updating service:', err);
            setError(err instanceof Error ? err.message : 'Failed to update service');
            toast.error('Erro ao atualizar serviço');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteService = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await db.services.delete(id);
            setServices(prev => prev.filter(s => s.id !== id));
            toast.success('Serviço removido com sucesso!');
        } catch (err: any) {
            console.error('Error deleting service:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete service');
            toast.error('Erro ao remover serviço');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteBatchServices = useCallback(async (ids: string[]) => {
        try {
            await Promise.all(ids.map(id => db.services.delete(id)));
            setServices(prev => prev.filter(s => !ids.includes(s.id)));
            toast.success(`${ids.length} serviço(s) removido(s) com sucesso!`);
        } catch (err: any) {
            console.error('Error deleting services:', err);
            toast.error('Erro ao remover serviços');
            throw err;
        }
    }, []);

    const refreshServices = () => {
        loadServices();
    };

    return {
        services,
        isLoading,
        error,
        addService,
        updateService,
        deleteService,
        deleteBatchServices,
        refreshServices
    };
}
