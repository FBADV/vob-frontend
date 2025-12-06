import { useState, useEffect, useCallback } from 'react';
import { clientPortalService } from '../services/clientPortal.service';
import type {
    PortalAuthState,
    PortalLoginCredentials,
    PasswordChangeRequest
} from '../types/portal.types';

/**
 * usePortalAuth Hook
 * Manages client portal authentication state and actions
 */
export function usePortalAuth() {
    const [authState, setAuthState] = useState<PortalAuthState>({
        isAuthenticated: false,
        client: null,
        accessToken: null
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Load auth state from localStorage on mount
     */
    useEffect(() => {
        const savedAuth = localStorage.getItem('portal_auth');
        if (savedAuth) {
            try {
                const parsed = JSON.parse(savedAuth);
                setAuthState(parsed);
            } catch (err) {
                console.error('Error parsing saved auth:', err);
                localStorage.removeItem('portal_auth');
            }
        }
    }, []);

    /**
     * Save auth state to localStorage
     */
    const saveAuthState = useCallback((state: PortalAuthState) => {
        setAuthState(state);
        if (state.isAuthenticated) {
            localStorage.setItem('portal_auth', JSON.stringify(state));
        } else {
            localStorage.removeItem('portal_auth');
        }
    }, []);

    /**
     * Login to portal
     */
    const login = useCallback(async (credentials: PortalLoginCredentials) => {
        setIsLoading(true);
        setError(null);

        try {
            // 🎭 DEMO MODE: Aceita qualquer CPF e senha
            // TODO: Remover em produção
            const DEMO_MODE = true;

            if (DEMO_MODE) {
                // Simula delay de autenticação
                await new Promise(resolve => setTimeout(resolve, 500));

                // Cria cliente demo com base no CPF fornecido
                const demoClient = {
                    id: 'demo-client-' + credentials.cpf.replace(/\D/g, ''),
                    name: 'Cliente Demonstração',
                    email: 'demo@cliente.com',
                    cpf: credentials.cpf,
                    document: credentials.cpf,
                    phone: '(00) 00000-0000'
                };

                const newAuthState: PortalAuthState = {
                    isAuthenticated: true,
                    client: demoClient,
                    accessToken: 'demo-token-' + Date.now()
                };

                saveAuthState(newAuthState);
                return { success: true, requirePasswordChange: false };
            }

            // Autenticação real (quando DEMO_MODE = false)
            const response = await clientPortalService.login(credentials);

            if (!response.success) {
                setError(response.error || 'Erro ao fazer login');
                return { success: false, requirePasswordChange: false };
            }

            if (response.requirePasswordChange) {
                // Store temporary auth for password change flow
                const tempAuth: PortalAuthState = {
                    isAuthenticated: false,
                    client: response.client || null,
                    accessToken: null
                };
                sessionStorage.setItem('portal_temp_auth', JSON.stringify(tempAuth));
                return { success: true, requirePasswordChange: true };
            }

            // Full login successful
            const newAuthState: PortalAuthState = {
                isAuthenticated: true,
                client: response.client || null,
                accessToken: response.accessToken || null
            };
            saveAuthState(newAuthState);

            return { success: true, requirePasswordChange: false };

        } catch (err: any) {
            const errorMsg = err.message || 'Erro inesperado ao fazer login';
            setError(errorMsg);
            return { success: false, requirePasswordChange: false };
        } finally {
            setIsLoading(false);
        }
    }, [saveAuthState]);

    /**
     * Change password (first access or manual)
     */
    const changePassword = useCallback(async (request: PasswordChangeRequest) => {
        setIsLoading(true);
        setError(null);

        try {
            // Get client ID from temp auth or current auth
            const tempAuth = sessionStorage.getItem('portal_temp_auth');
            const clientId = tempAuth
                ? JSON.parse(tempAuth).client?.id
                : authState.client?.id;

            if (!clientId) {
                setError('Sessão inválida. Faça login novamente.');
                return { success: false };
            }

            const response = await clientPortalService.changePassword(clientId, request);

            if (!response.success) {
                setError(response.error || 'Erro ao alterar senha');
                return { success: false };
            }

            // Clear temp auth and set full auth
            sessionStorage.removeItem('portal_temp_auth');

            if (tempAuth) {
                const client = JSON.parse(tempAuth).client;
                const newAuthState: PortalAuthState = {
                    isAuthenticated: true,
                    client,
                    accessToken: null // Will be set by actual Supabase auth
                };
                saveAuthState(newAuthState);
            }

            return { success: true };

        } catch (err: any) {
            const errorMsg = err.message || 'Erro ao alterar senha';
            setError(errorMsg);
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    }, [authState.client?.id, saveAuthState]);

    /**
     * Logout from portal
     */
    const logout = useCallback(() => {
        saveAuthState({
            isAuthenticated: false,
            client: null,
            accessToken: null
        });
        sessionStorage.removeItem('portal_temp_auth');
    }, [saveAuthState]);

    /**
     * Check if password change is required
     */
    const isPasswordChangeRequired = useCallback(() => {
        return !!sessionStorage.getItem('portal_temp_auth');
    }, []);

    /**
     * Activate account (First Access)
     */
    const activateAccount = useCallback(async (cpf: string, code: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await clientPortalService.completeFirstAccess(cpf, code, password);

            if (!response.success) {
                setError(response.error || 'Erro na ativação');
                return { success: false };
            }

            // Auto login after activation
            return login({ cpf, password });

        } catch (err: any) {
            const errorMsg = err.message || 'Erro inesperado na ativação';
            setError(errorMsg);
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    }, [login]);

    return {
        // State
        isAuthenticated: authState.isAuthenticated,
        client: authState.client,
        isLoading,
        error,

        // Actions
        login,
        logout,
        activateAccount,
        changePassword,
        isPasswordChangeRequired,
        clearError: () => setError(null)
    };
}
