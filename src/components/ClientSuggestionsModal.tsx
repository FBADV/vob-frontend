import React from 'react';
import { X, Check, UserPlus, AlertCircle, TrendingUp } from 'lucide-react';
import type { ClientMatch } from '../utils/fuzzyMatch';
import type { Client } from '../types';
import { useToast } from '../context/ToastContext';

interface ClientSuggestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    searchName: string;
    matches: ClientMatch[];
    onSelectClient: (client: Client) => void;
    onCreateNew: () => void;
}

export const ClientSuggestionsModal: React.FC<ClientSuggestionsModalProps> = ({
    isOpen,
    onClose,
    searchName,
    matches,
    onSelectClient,
    onCreateNew
}) => {
    const toast = useToast();

    if (!isOpen) return null;

    const getSimilarityColor = (similarity: number): string => {
        if (similarity >= 90) return 'emerald';
        if (similarity >= 80) return 'blue';
        return 'amber';
    };

    const getSimilarityLabel = (similarity: number): string => {
        if (similarity >= 95) return 'Correspondência Excelente';
        if (similarity >= 90) return 'Alta Similaridade';
        if (similarity >= 80) return 'Boa Similaridade';
        return 'Similaridade Moderada';
    };

    const handleSelectClient = (client: Client) => {
        onSelectClient(client);
        toast.success('Cliente Selecionado', `${client.name} foi vinculado ao processo.`);
        onClose();
    };

    const handleCreateNew = () => {
        onCreateNew();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] animate-fade-in p-4 backdrop-blur-sm">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in border border-[rgb(var(--border-subtle))]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-[rgb(var(--border-subtle))] bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <TrendingUp size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                                    Clientes Similares Encontrados
                                </h3>
                            </div>
                            <p className="text-sm text-[rgb(var(--text-tertiary))] ml-14">
                                Encontramos {matches.length} {matches.length === 1 ? 'cliente similar' : 'clientes similares'} para: <strong className="text-[rgb(var(--text-primary))]">{searchName}</strong>
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    {/* Info Alert */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-start gap-3 border border-blue-100 dark:border-blue-900/30">
                        <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">
                                Sistema de Correspondência Inteligente
                            </h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Selecione um cliente existente ou crie um novo cadastro se nenhum corresponder à pessoa correta.
                            </p>
                        </div>
                    </div>

                    {/* Suggested Clients */}
                    <div className="space-y-3">
                        {matches.map((match) => {
                            const color = getSimilarityColor(match.similarity);
                            return (
                                <button
                                    key={match.client.id}
                                    onClick={() => handleSelectClient(match.client)}
                                    className="w-full p-5 rounded-2xl border-2 border-[rgb(var(--border-default))] hover:border-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--bg-tertiary))] transition-all group text-left"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            {/* Client Name */}
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-bold text-[rgb(var(--text-primary))] text-lg group-hover:text-[rgb(var(--accent-primary))] transition-colors truncate">
                                                    {match.client.name}
                                                </h4>
                                                <div className={`
                                                    px-3 py-1 rounded-full text-xs font-bold
                                                    ${color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : ''}
                                                    ${color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                                                    ${color === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : ''}
                                                `}>
                                                    {match.similarity}% Match
                                                </div>
                                            </div>

                                            {/* Client Details */}
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-[rgb(var(--text-secondary))]">
                                                {match.client.document && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[rgb(var(--text-tertiary))] text-xs">Doc:</span>
                                                        <span className="font-mono">{match.client.document}</span>
                                                    </div>
                                                )}
                                                {match.client.email && (
                                                    <div className="flex items-center gap-2 truncate">
                                                        <span className="text-[rgb(var(--text-tertiary))] text-xs">Email:</span>
                                                        <span className="truncate">{match.client.email}</span>
                                                    </div>
                                                )}
                                                {match.client.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[rgb(var(--text-tertiary))] text-xs">Tel:</span>
                                                        <span>{match.client.phone}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[rgb(var(--text-tertiary))] text-xs">Tipo:</span>
                                                    <span className="capitalize">{match.client.type === 'individual' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span>
                                                </div>
                                            </div>

                                            {/* Similarity Label */}
                                            <div className="mt-3 flex items-center gap-2">
                                                <div className={`h-1.5 rounded-full flex-1 bg-gray-200 dark:bg-gray-700 overflow-hidden`}>
                                                    <div
                                                        className={`h-full transition-all ${color === 'emerald' ? 'bg-emerald-500' :
                                                                color === 'blue' ? 'bg-blue-500' :
                                                                    'bg-amber-500'
                                                            }`}
                                                        style={{ width: `${match.similarity}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-[rgb(var(--text-tertiary))] whitespace-nowrap">
                                                    {getSimilarityLabel(match.similarity)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Select Button Indicator */}
                                        <div className="shrink-0 p-3 rounded-xl bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))] group-hover:bg-[rgb(var(--accent-primary))] group-hover:text-white transition-colors">
                                            <Check size={20} />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Create New Option */}
                    <div className="mt-6 pt-6 border-t border-[rgb(var(--border-subtle))]">
                        <button
                            onClick={handleCreateNew}
                            className="w-full p-5 rounded-2xl border-2 border-dashed border-[rgb(var(--border-default))] hover:border-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--bg-tertiary))] transition-all group"
                        >
                            <div className="flex items-center justify-center gap-3">
                                <div className="p-2 rounded-xl bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))] group-hover:bg-[rgb(var(--accent-primary))] group-hover:text-white transition-colors">
                                    <UserPlus size={20} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                                        Nenhum desses é o cliente correto?
                                    </h4>
                                    <p className="text-sm text-[rgb(var(--text-tertiary))]">
                                        Clique aqui para cadastrar <strong>{searchName}</strong> como novo cliente
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
