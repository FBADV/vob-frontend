import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalAuth } from '../../hooks/usePortalAuth';
import { Lock, User, ArrowRight, Key } from 'lucide-react';
import { VOBLogoLarge } from '../../components/Logo';

type LoginMode = 'login' | 'activate';

export const PortalLogin: React.FC = () => {
    const { login, activateAccount, isLoading, error } = usePortalAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState<LoginMode>('login');

    // Login State
    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');

    // Activation State
    const [activationCode, setActivationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await login({ cpf, password });

        // Redireciona após login bem-sucedido
        if (result.success && !result.requirePasswordChange) {
            setTimeout(() => navigate('/portal/dashboard'), 100); // Small delay to allow state to propagate
        }
    };

    const handleActivation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            // Toast handled by hook usually, but here we can show local error or toast
            // For now, let's just rely on the hook's error state or add a check
            alert('As senhas não coincidem');
            return;
        }
        await activateAccount(cpf, activationCode, newPassword);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl border border-[rgb(var(--border-primary))] overflow-hidden">
                    {/* Header */}
                    <div className="p-8 text-center bg-gradient-to-b from-[rgb(var(--bg-tertiary))] to-[rgb(var(--bg-secondary))]">
                        <div className="inline-flex p-4 rounded-full bg-[rgb(var(--bg-primary))] shadow-inner mb-4">
                            <VOBLogoLarge size="small" />
                        </div>
                        <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                            {mode === 'login' ? 'Acesso do Cliente' : 'Primeiro Acesso'}
                        </h1>
                        <p className="text-[rgb(var(--text-secondary))] mt-2 text-sm">
                            {mode === 'login'
                                ? 'Digite seu CPF e senha para entrar'
                                : 'Ative sua conta com o código recebido'}
                        </p>
                    </div>

                    {/* Form */}
                    <div className="p-8 pt-0">
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {mode === 'login' ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">CPF</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                        <input
                                            type="text"
                                            value={cpf}
                                            onChange={(e) => setCpf(e.target.value)} // TODO: Mask
                                            className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-primary))] rounded-xl text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                                            placeholder="000.000.000-00"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">Senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-primary))] rounded-xl text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-[rgb(var(--accent-primary))] text-white rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? 'Entrando...' : 'Entrar'}
                                    <ArrowRight size={18} />
                                </button>

                                <div className="text-center pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setMode('activate')}
                                        className="text-sm text-[rgb(var(--accent-primary))] hover:underline"
                                    >
                                        Primeiro acesso? Ative sua conta
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleActivation} className="space-y-4">
                                {/* Activation Form Fields */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">CPF</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                        <input
                                            type="text"
                                            value={cpf}
                                            onChange={(e) => setCpf(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-primary))] rounded-xl text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                                            placeholder="000.000.000-00"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">Código de Ativação</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                        <input
                                            type="text"
                                            value={activationCode}
                                            onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                                            className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-primary))] rounded-xl text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                                            placeholder="ABC12345"
                                            maxLength={8}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">Nova Senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-primary))] rounded-xl text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">Confirmar Senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-primary))] rounded-xl text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-[rgb(var(--accent-primary))] text-white rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? 'Ativando...' : 'Ativar Conta'}
                                    <ArrowRight size={18} />
                                </button>

                                <div className="text-center pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setMode('login')}
                                        className="text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                                    >
                                        Voltar para Login
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
