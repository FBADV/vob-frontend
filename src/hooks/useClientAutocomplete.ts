import { useState, useEffect, useCallback } from 'react';
import type { Client } from '../types';
import { calculateStringSimilarity } from '../utils/fuzzyMatch';

interface UseClientAutocompleteOptions {
    minChars?: number; // Mínimo de caracteres para buscar (padrão: 2)
    debounceMs?: number; // Delay antes de buscar (padrão: 300ms)
    limit?: number; // Máximo de resultados (padrão: 10)
    threshold?: number; // Score mínimo fuzzy match (padrão: 0.4)
}

interface UseClientAutocompleteResult {
    suggestions: Client[];
    loading: boolean;
    error: string | null;
    search: (query: string) => void;
    clear: () => void;
}

/**
 * Hook para autocompletar clientes com busca incremental e fuzzy match
 * 
 * Features:
 * - Busca incremental no GlobalDataContext
 * - Debounce para performance
 * - Fuzzy match tolerante a erros
 * - Estados de loading/error
 * 
 * @example
 * const { suggestions, loading, search } = useClientAutocomplete();
 * 
 * <input onChange={(e) => search(e.target.value)} />
 * {suggestions.map(client => <div key={client.id}>{client.name}</div>)}
 */
export function useClientAutocomplete(options: UseClientAutocompleteOptions = {}): UseClientAutocompleteResult {
    const {
        minChars = 2,
        debounceMs = 300,
        limit = 10,
        threshold = 0.4
    } = options;

    const [suggestions, setSuggestions] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');

    // Debounced search effect
    useEffect(() => {
        if (!query || query.length < minChars) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const timeoutId = setTimeout(async () => {
            try {
                // Buscar todos os clientes
                const allClients = await fetchClients();

                // Aplicar fuzzy match usando função existente
                const results = allClients
                    .map(client => ({
                        client,
                        similarity: calculateStringSimilarity(query, client.name)
                    }))
                    .filter(match => match.similarity >= threshold * 100) // threshold original é 0-1, similarity é 0-100
                    .sort((a, b) => b.similarity - a.similarity)
                    .slice(0, limit)
                    .map(match => match.client);

                setSuggestions(results);
                setLoading(false);
            } catch (err) {
                console.error('[ClientAutocomplete] Erro na busca:', err);
                setError('Erro ao buscar clientes');
                setSuggestions([]);
                setLoading(false);
            }
        }, debounceMs);

        return () => clearTimeout(timeoutId);
    }, [query, minChars, debounceMs, limit, threshold]);

    const search = useCallback((searchQuery: string) => {
        setQuery(searchQuery);
    }, []);

    const clear = useCallback(() => {
        setQuery('');
        setSuggestions([]);
        setError(null);
        setLoading(false);
    }, []);

    return {
        suggestions,
        loading,
        error,
        search,
        clear
    };
}

/**
 * Função helper para buscar clientes
 * TODO: Integrar com GlobalDataContext
 */
async function fetchClients(): Promise<Client[]> {
    // Por enquanto, retorna mock
    // Em produção, buscar do GlobalDataContext ou API
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock data
            const mockClients: Client[] = [
                {
                    id: '1',
                    name: 'João Silva',
                    cpfCnpj: '123.456.789-00',
                    document: '123.456.789-00',
                    email: 'joao@example.com',
                    phone: '(84) 99999-9999',
                    type: 'individual',
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'Maria Santos',
                    cpfCnpj: '987.654.321-00',
                    document: '987.654.321-00',
                    email: 'maria@example.com',
                    phone: '(84) 98888-8888',
                    type: 'individual',
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            ];
            resolve(mockClients);
        }, 100);
    });
}
