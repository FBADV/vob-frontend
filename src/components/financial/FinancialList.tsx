import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Trash2, Edit2, Calendar, Tag } from 'lucide-react';
import type { FinancialEntry } from '../../types';
import { useGlobalData } from '../../context/GlobalDataContext';
import { ClientAvatar } from '../ClientAvatar';
import { formatCurrency } from '../../utils/formatters';

interface FinancialListProps {
    transactions: FinancialEntry[];
    onEdit: (entry: FinancialEntry) => void;
    onDelete: (id: string) => void;
}

export const FinancialList: React.FC<FinancialListProps> = ({ transactions, onEdit, onDelete }) => {
    const { clients } = useGlobalData();

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12 text-[rgb(var(--text-tertiary))]">
                <div className="w-16 h-16 bg-[rgb(var(--bg-tertiary))] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag size={24} className="opacity-50" />
                </div>
                <p className="text-sm font-medium">Nenhuma transação encontrada.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map((transaction) => {
                const client = clients.find(c => c.id === transaction.clientId);
                const isIncome = transaction.type === 'income';

                return (
                    <div
                        key={transaction.id}
                        className="group flex items-center justify-between p-4 rounded-2xl bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent-primary))]/30 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center gap-4">
                            {/* Avatar or Type Icon */}
                            <div className="relative">
                                {client ? (
                                    <ClientAvatar
                                        client={client}
                                        size="md"
                                        className="shadow-sm"
                                    />
                                ) : (
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${isIncome
                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {isIncome ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                    </div>
                                )}

                                {/* Type Badge Overlay (if client avatar is shown) */}
                                {client && (
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[rgb(var(--bg-secondary))] flex items-center justify-center text-[10px] ${isIncome
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-red-500 text-white'
                                        }`}>
                                        {isIncome ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="font-bold text-[rgb(var(--text-primary))] text-sm mb-0.5">
                                    {transaction.description}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-[rgb(var(--text-secondary))]">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} className="text-[rgb(var(--text-tertiary))]" />
                                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-[rgb(var(--text-tertiary))]" />
                                    <span className="font-medium text-[rgb(var(--text-primary))]">
                                        {transaction.category}
                                    </span>
                                    {client && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-[rgb(var(--text-tertiary))]" />
                                            <span className="text-[rgb(var(--text-tertiary))] truncate max-w-[150px]">
                                                {client.name}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <span className={`block font-bold text-sm ${isIncome
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mt-1 ${transaction.status === 'paid'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                    : transaction.status === 'pending'
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                        : transaction.status === 'overdue'
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                    }`}>
                                    {transaction.status === 'paid' ? 'Pago' :
                                        transaction.status === 'pending' ? 'Pendente' :
                                            transaction.status === 'overdue' ? 'Atrasado' : 'Cancelado'}
                                </span>
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit(transaction)}
                                    className="p-2 text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(transaction.id)}
                                    className="p-2 text-[rgb(var(--text-tertiary))] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
