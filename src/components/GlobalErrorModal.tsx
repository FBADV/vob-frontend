import React from 'react';
import { AlertTriangle, X, Copy, CheckCircle } from 'lucide-react';
import { useGlobalError } from '../context/GlobalErrorContext';

export const GlobalErrorModal: React.FC = () => {
    const { error, clearError } = useGlobalError();
    const [copied, setCopied] = React.useState(false);

    if (!error) return null;

    const handleCopy = () => {
        const errorText = `Título: ${error.title}\nMensagem: ${error.message}\nStack Trace:\n${error.stack || 'N/A'}`;
        navigator.clipboard.writeText(errorText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-2xl shadow-2xl border border-red-500/30 w-full max-w-lg overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="bg-red-500/10 px-6 py-4 border-b border-red-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg text-red-600 dark:text-red-400">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                                {error.title}
                            </h3>
                            <p className="text-xs text-red-500/80 font-medium">
                                Ocorreu um erro inesperado
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={clearError}
                        className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] p-1 rounded-lg hover:bg-[rgb(var(--bg-tertiary))] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-[rgb(var(--text-primary))] font-medium mb-4">
                        {error.message}
                    </p>

                    {error.stack && (
                        <div className="bg-[rgb(var(--bg-primary))] rounded-lg border border-[rgb(var(--border-subtle))] p-3 overflow-x-auto">
                            <pre className="text-[10px] text-[rgb(var(--text-tertiary))] font-mono leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                                {error.stack}
                            </pre>
                        </div>
                    )}

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleCopy}
                            className="flex-1 btn-secondary-premium py-2.5 flex items-center justify-center gap-2"
                        >
                            {copied ? <CheckCircle size={18} className="text-emerald-500" /> : <Copy size={18} />}
                            {copied ? 'Copiado!' : 'Copiar Erro para Suporte'}
                        </button>
                        <button
                            onClick={clearError}
                            className="flex-1 btn-premium py-2.5"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
