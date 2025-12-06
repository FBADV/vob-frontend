import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Loader2, Shield, Key, UserPlus } from 'lucide-react';
import { clientPortalService } from '../services/clientPortal.service';
import type { Client } from '../types';

interface PortalActivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    onSuccess?: () => void;
}

export const PortalActivationModal: React.FC<PortalActivationModalProps> = ({
    isOpen,
    onClose,
    client,
    onSuccess
}) => {
    const [isActivating, setIsActivating] = useState(false);
    const [sendSMS, setSendSMS] = useState(false);
    const [activationResult, setActivationResult] = useState<{
        code: string;
        password: string;
    } | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleActivate = async () => {
        setIsActivating(true);
        setError(null);

        try {
            const result = await clientPortalService.activatePortalAccess({
                clientId: client.id,
                sendSMS
            });

            if (!result.success) {
                setError(result.error || 'Erro ao ativar portal');
                return;
            }

            setActivationResult({
                code: result.activationCode || '',
                password: result.temporaryPassword || ''
            });

            if (onSuccess) onSuccess();

        } catch (err: any) {
            setError(err.message || 'Erro inesperado ao ativar portal');
        } finally {
            setIsActivating(false);
        }
    };

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleClose = () => {
        setActivationResult(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in p-4">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in border border-[rgb(var(--border-default))]">
                {/* Header */}
                <div className="p-6 border-b border-[rgb(var(--border-subtle))]">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                {activationResult ? (
                                    <Check size={24} className="text-green-600 dark:text-green-400" />
                                ) : (
                                    <Shield size={24} className="text-blue-600 dark:text-blue-400" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                                    {activationResult ? 'Portal Ativado!' : 'Habilitar Acesso ao Portal'}
                                </h2>
                                <p className="text-sm text-[rgb(var(--text-secondary))]">
                                    {client.name}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!activationResult ? (
                        /* Confirmation Screen */
                        <>
                            {/* Client Info */}
                            <div className="bg-[rgb(var(--bg-tertiary))] rounded-xl p-4 mb-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[rgb(var(--text-tertiary))]">Cliente:</span>
                                        <span className="font-medium text-[rgb(var(--text-primary))]">{client.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[rgb(var(--text-tertiary))]">CPF:</span>
                                        <span className="font-mono font-medium text-[rgb(var(--text-primary))]">{client.document}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[rgb(var(--text-tertiary))]">Email:</span>
                                        <span className="font-medium text-[rgb(var(--text-primary))]">{client.email || 'Não informado'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Access Info */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4 border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                                    <strong>O que acontecerá:</strong>
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                        Login: CPF do cliente (sem formatação)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                        Senha temporária gerada automaticamente
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                        Email de boas-vindas enviado
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                        Cliente deverá trocar a senha no 1º acesso
                                    </li>
                                </ul>
                            </div>

                            {/* SMS Option */}
                            <label className="flex items-center gap-3 p-4 bg-[rgb(var(--bg-tertiary))] rounded-xl cursor-pointer hover:bg-[rgb(var(--bg-primary))] transition-colors mb-4">
                                <input
                                    type="checkbox"
                                    checked={sendSMS}
                                    onChange={(e) => setSendSMS(e.target.checked)}
                                    className="w-4 h-4 rounded border-2 border-[rgb(var(--border-default))]"
                                />
                                <div className="flex items-center gap-2 flex-1">
                                    <MessageCircle size={18} className="text-green-600 dark:text-green-400" />
                                    <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                        Enviar instruções por SMS
                                    </span>
                                </div>
                            </label>

                            {/* Error Display */}
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                                    <p className="text-sm text-red-800 dark:text-red-300">
                                        <strong>Erro:</strong> {error}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="btn-secondary flex-1"
                                    disabled={isActivating}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleActivate}
                                    disabled={isActivating || !client.email}
                                    className="btn-premium flex-1 flex items-center justify-center gap-2"
                                    title={!client.email ? 'Cliente precisa ter email cadastrado' : ''}
                                >
                                    {isActivating ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Ativando...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={18} />
                                            Confirmar Ativação
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Success Screen with Credentials */
                        <>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6 border border-green-200 dark:border-green-800">
                                <p className="text-sm text-green-800 dark:text-green-300 font-medium flex items-center gap-2">
                                    <Check size={16} />
                                    Acesso ao portal habilitado com sucesso!
                                </p>
                                {client.email && (
                                    <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                                        Email de boas-vindas enviado para: {client.email}
                                    </p>
                                )}
                            </div>

                            {/* Credentials */}
                            <div className="space-y-4 mb-6">
                                {/* Login (CPF) */}
                                <div>
                                    <label className="block text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase mb-2">
                                        Login (CPF)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-[rgb(var(--bg-tertiary))] rounded-xl p-3 font-mono text-[rgb(var(--text-primary))] font-medium border border-[rgb(var(--border-subtle))]">
                                            {client.document}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(client.document || '', 'cpf')}
                                            className="p-3 bg-[rgb(var(--bg-tertiary))] hover:bg-[rgb(var(--bg-primary))] rounded-xl transition-colors border border-[rgb(var(--border-subtle))]"
                                            title="Copiar CPF"
                                        >
                                            {copiedField === 'cpf' ? (
                                                <Check size={18} className="text-green-600" />
                                            ) : (
                                                <Copy size={18} className="text-[rgb(var(--text-secondary))]" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Temporary Password */}
                                <div>
                                    <label className="block text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase mb-2 flex items-center gap-2">
                                        <Key size={14} />
                                        Senha Temporária
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 font-mono text-amber-900 dark:text-amber-100 font-bold border-2 border-amber-300 dark:border-amber-700 text-lg">
                                            {activationResult.password}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(activationResult.password, 'password')}
                                            className="p-3 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/40 rounded-xl transition-colors border-2 border-amber-300 dark:border-amber-700"
                                            title="Copiar Senha"
                                        >
                                            {copiedField === 'password' ? (
                                                <Check size={18} className="text-green-600" />
                                            ) : (
                                                <Copy size={18} className="text-amber-700 dark:text-amber-400" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                                        ⚠️ Cliente será solicitado a trocar esta senha no primeiro acesso
                                    </p>
                                </div>
                            </div>

                            {/* Important Note */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4 border border-blue-200 dark:border-blue-800">
                                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                                    <strong>IMPORTANTE:</strong> Certifique-se de enviar estas credenciais ao cliente de forma segura.
                                    Recomendamos copiar e enviar por WhatsApp ou outro canal seguro, além do email automático.
                                </p>
                            </div>

                            <button
                                onClick={handleClose}
                                className="btn-premium w-full"
                            >
                                Fechar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
