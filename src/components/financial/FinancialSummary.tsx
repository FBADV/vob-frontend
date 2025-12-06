import React from 'react';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import type { FinancialEntry } from '../../types';

interface FinancialSummaryProps {
    transactions: FinancialEntry[];
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ transactions }) => {
    const income = transactions
        .filter(t => t.type === 'income' && t.status !== 'canceled')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense' && t.status !== 'canceled')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = income - expense;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-premium p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <DollarSign size={24} />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp size={12} />
                        Saldo
                    </span>
                </div>
                <div className="relative z-10">
                    <p className="text-sm text-[rgb(var(--text-secondary))] font-medium">Saldo Atual</p>
                    <h3 className={`text-3xl font-bold mt-1 ${balance >= 0 ? 'text-[rgb(var(--text-primary))]' : 'text-red-600'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
                    </h3>
                </div>
            </div>

            <div className="card-premium p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                        <ArrowUpRight size={24} />
                    </div>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                        Receitas
                    </span>
                </div>
                <div className="relative z-10">
                    <p className="text-sm text-[rgb(var(--text-secondary))] font-medium">Total Receitas</p>
                    <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-1">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(income)}
                    </h3>
                </div>
            </div>

            <div className="card-premium p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                        <ArrowDownLeft size={24} />
                    </div>
                    <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                        Despesas
                    </span>
                </div>
                <div className="relative z-10">
                    <p className="text-sm text-[rgb(var(--text-secondary))] font-medium">Total Despesas</p>
                    <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-1">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense)}
                    </h3>
                </div>
            </div>
        </div>
    );
};
