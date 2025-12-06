import { useState, useEffect } from 'react';
import { jusBrOAuthService } from '../services/jusbr-oauth.service';
import { jusBrAPIService } from '../services/jusbr-api.service';
import type { JusBrAuthState, PJeProcess, PJeParty } from '../types/jusbr.types';

/**
 * React hook for Jus.br authentication and API access
 */
export function useJusBr() {
    const [authState, setAuthState] = useState<JusBrAuthState>({ isAuthenticated: false });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load auth state on mount
    useEffect(() => {
        loadAuthState();
    }, []);

    const loadAuthState = async () => {
        try {
            // Check for simulation first
            if (sessionStorage.getItem('jusbr_simulated') === 'true') {
                setAuthState({
                    isAuthenticated: true,
                    isSimulated: true,
                    userInfo: {
                        sub: 'simulated-user-123',
                        name: 'Usuário Simulado (VOB)',
                        email: 'simulacao@vob.legal',
                        cpf: '000.000.000-00'
                    },
                    expiresAt: Date.now() + 3600000
                });
                return;
            }

            const state = await jusBrOAuthService.getAuthState();
            setAuthState(state);
        } catch (err: any) {
            console.error('Error loading auth state:', err);
            setError(err.message);
        }
    };

    /**
     * Initiate OAuth login flow
     * Redirects user to CNJ SSO
     */
    const login = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await jusBrOAuthService.initiateAuth();
            // Will redirect, so loading state will persist until redirect completes
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Erro ao iniciar autenticação');
            setIsLoading(false);
        }
    };

    /**
     * Simulate login for localhost testing
     */
    const simulateLogin = () => {
        setIsLoading(true);
        setTimeout(() => {
            const mockState: JusBrAuthState = {
                isAuthenticated: true,
                isSimulated: true,
                userInfo: {
                    sub: 'simulated-user-123',
                    name: 'Usuário Simulado (VOB)',
                    email: 'simulacao@vob.legal',
                    cpf: '000.000.000-00'
                },
                expiresAt: Date.now() + 3600000 // 1 hour
            };
            setAuthState(mockState);
            setIsLoading(false);
            // Persist simulation state
            sessionStorage.setItem('jusbr_simulated', 'true');
        }, 1000);
    };

    /**
     * Logout and clear tokens
     */
    const logout = async () => {
        try {
            await jusBrOAuthService.logout();
            sessionStorage.removeItem('jusbr_simulated');
            setAuthState({ isAuthenticated: false });
        } catch (err: any) {
            console.error('Logout error:', err);
            setError(err.message);
        }
    };

    /**
     * Search processes by OAB
     */
    const searchProcessesByOAB = async (oab: string, uf: string): Promise<PJeProcess[]> => {
        setIsLoading(true);
        setError(null);

        try {
            const processes = await jusBrAPIService.searchProcessesByOAB(oab, uf);
            return processes;
        } catch (err: any) {
            console.error('Error searching processes:', err);
            setError(err.message || 'Erro ao buscar processos');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Get process details
     */
    const getProcessDetails = async (processNumber: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const details = await jusBrAPIService.getProcessDetails(processNumber);
            return details;
        } catch (err: any) {
            console.error('Error fetching process details:', err);
            setError(err.message || 'Erro ao buscar detalhes do processo');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Get process parties (crucial for multi-client)
     */
    const getProcessParties = async (processNumber: string): Promise<PJeParty[]> => {
        setIsLoading(true);
        setError(null);

        try {
            const parties = await jusBrAPIService.getProcessParties(processNumber);
            return parties;
        } catch (err: any) {
            console.error('Error fetching parties:', err);
            setError(err.message || 'Erro ao buscar partes do processo');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    return {
        // Auth state
        isAuthenticated: authState.isAuthenticated,
        authState,
        isLoading,
        error,

        // Auth methods
        login,
        logout,
        simulateLogin,
        reload: loadAuthState,

        // API methods
        searchProcessesByOAB,
        getProcessDetails,
        getProcessParties
    };
}
