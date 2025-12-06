import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jusBrOAuthService } from '../services/jusbr-oauth.service';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * OAuth Callback Handler Page
 * Handles redirect from CNJ SSO after authentication
 * Route: /auth/jusbr/callback
 */
export const JusBrCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Processando autenticação...');

    useEffect(() => {
        handleCallback();
    }, []);

    const handleCallback = async () => {
        try {
            console.log('[OAuth Debug] ============ START CALLBACK ============');
            console.log('[OAuth Debug] Current URL:', window.location.href);
            console.log('[OAuth Debug] Search params:', window.location.search);

            // Get code and state from URL params
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const error = searchParams.get('error');
            const errorDescription = searchParams.get('error_description');

            console.log('[OAuth Debug] Code:', code ? `${code.substring(0, 20)}...` : 'NULL');
            console.log('[OAuth Debug] State:', state ? `${state.substring(0, 20)}...` : 'NULL');
            console.log('[OAuth Debug] Error:', error || 'none');
            console.log('[OAuth Debug] Error Description:', errorDescription || 'none');

            // Check for errors
            if (error) {
                console.error('[OAuth Debug] ❌ OAuth error from provider');
                setStatus('error');
                setMessage(errorDescription || `Erro: ${error}`);
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            // Validate params
            if (!code || !state) {
                console.error('[OAuth Debug] ❌ Missing code or state parameter');
                console.log('[OAuth Debug] All URL params:', Array.from(searchParams.entries()));
                setStatus('error');
                setMessage('Parâmetros OAuth inválidos');
                setTimeout(() => navigate('/'), 3000);
                return;
            }

            // Exchange code for tokens
            console.log('[OAuth Debug] ✅ Parameters valid, exchanging code for tokens...');
            setMessage('Obtendo tokens de acesso...');
            await jusBrOAuthService.handleCallback(code, state);
            console.log('[OAuth Debug] ✅ Tokens obtained successfully');

            // Success
            setStatus('success');
            setMessage('Autenticação realizada com sucesso! Redirecionando...');

            // Redirect to settings or previous page
            setTimeout(() => {
                navigate('/settings/integrations');
            }, 2000);

        } catch (err: any) {
            console.error('[OAuth Debug] ❌ Exception:', err);
            console.error('[OAuth Debug] Error message:', err.message);
            console.error('[OAuth Debug] Full error:', err);
            setStatus('error');
            setMessage(err.message || 'Erro ao processar autenticação');
            setTimeout(() => navigate('/'), 5000);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="card-premium max-w-md w-full p-8 text-center">
                {status === 'processing' && (
                    <>
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
                            Processando Autenticação
                        </h2>
                        <p className="text-[rgb(var(--text-secondary))]">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-green-600 mb-2">
                            Sucesso!
                        </h2>
                        <p className="text-[rgb(var(--text-secondary))]">{message}</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-600 mb-2">
                            Erro na Autenticação
                        </h2>
                        <p className="text-[rgb(var(--text-secondary))] mb-4">{message}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-premium"
                        >
                            Voltar ao Início
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
