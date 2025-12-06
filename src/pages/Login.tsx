import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGlobalData } from '../context/GlobalDataContext';
import { Lock, Mail, ArrowRight, Loader2, Key, ShieldCheck, ArrowLeft } from 'lucide-react';
import { VOBLogoLarge } from '../components/Logo';
import { SplashScreen } from '../components/SplashScreen';

type AuthMode = 'login' | 'forgot-password' | 'activate';

export const Login: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [activationCode, setActivationCode] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showSplash, setShowSplash] = useState(true);

    const { signIn, resetPassword, activateAccount, isLoading } = useAuth();
    const { login } = useGlobalData();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await signIn(email, password);

            // Also update GlobalDataContext for backward compatibility
            const user = {
                id: 'user-' + Date.now(),
                name: email.split('@')[0],
                email,
                role: 'associate' as const,
                avatar: email.substring(0, 2).toUpperCase()
            };
            login(user);

            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Credenciais inválidas. Tente novamente.');
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            await resetPassword(email);
            setSuccessMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
            setTimeout(() => setMode('login'), 3000);
        } catch (err: any) {
            setError(err.message || 'Erro ao solicitar recuperação de senha.');
        }
    };

    const handleActivation = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await activateAccount(activationCode, password);

            // Auto login after activation
            const user = {
                id: 'new-user-' + Date.now(),
                name: 'Novo Usuário',
                email: 'novo.usuario@vob.com.br',
                role: 'associate' as const,
                avatar: 'NU'
            };
            login(user);

            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Código inválido ou erro na ativação.');
        }
    };

    if (showSplash) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-black">
            {/* Background Image - Matches Splash Screen exactly */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0 animate-fade-in"
                style={{
                    backgroundImage: `url('/bg-premium.png')`,
                    // "Fundo opaco": Using brightness reduction and blur
                    filter: 'brightness(0.3) blur(4px) grayscale(20%)'
                }}
            />

            {/* Overlay Gradient for consistency and text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 z-0"></div>

            <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl p-8 animate-scale-in border border-white/20 dark:border-gray-700/50 relative z-10 transition-all duration-500">
                <div className="mb-10 flex justify-center transform hover:scale-105 transition-transform duration-300">
                    <VOBLogoLarge animated={true} />
                </div>

                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {mode === 'login' && 'Bem-vindo de volta'}
                        {mode === 'forgot-password' && 'Recuperar Senha'}
                        {mode === 'activate' && 'Ativar Conta'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {mode === 'login' && 'Acesse sua conta para continuar'}
                        {mode === 'forgot-password' && 'Digite seu email para receber o link'}
                        {mode === 'activate' && 'Insira seu código de ativação'}
                    </p>
                </div>

                {mode === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">E-mail</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Senha</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 animate-shake">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-secondary to-blue-600 hover:from-blue-600 hover:to-secondary text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transform hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    Entrar <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {mode === 'forgot-password' && (
                    <form onSubmit={handleForgotPassword} className="space-y-5 animate-fade-in">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">E-mail</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 animate-shake">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30 animate-fade-in">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                                {successMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-secondary to-blue-600 hover:from-blue-600 hover:to-secondary text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transform hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    Enviar Link <Mail size={20} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {mode === 'activate' && (
                    <form onSubmit={handleActivation} className="space-y-5 animate-fade-in">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Código de Ativação</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={activationCode}
                                    onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all uppercase tracking-widest font-mono"
                                    placeholder="XXXX-XXXX"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Definir Senha</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 animate-shake">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 hover:shadow-emerald-600/40 transform hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    Ativar Conta <ShieldCheck size={20} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                <div className="mt-8 space-y-3 text-center">
                    {mode === 'login' ? (
                        <>
                            <div>
                                <button
                                    onClick={() => setMode('forgot-password')}
                                    className="text-sm font-medium text-gray-500 hover:text-secondary dark:text-gray-400 dark:hover:text-white transition-colors"
                                >
                                    Esqueceu sua senha?
                                </button>
                            </div>
                            <div>
                                <button
                                    onClick={() => setMode('activate')}
                                    className="text-sm font-medium text-secondary hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                >
                                    Primeiro acesso? Ativar conta
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => setMode('login')}
                            className="text-sm font-medium text-gray-500 hover:text-secondary dark:text-gray-400 dark:hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                        >
                            <ArrowLeft size={16} /> Voltar para o login
                        </button>
                    )}
                </div>
            </div>

            <div className="absolute bottom-6 text-center text-xs text-gray-400 dark:text-gray-600">
                &copy; {new Date().getFullYear()} Virtual Office Brazil. Todos os direitos reservados.
            </div>
        </div>
    );
};
