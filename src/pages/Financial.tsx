import React, { useState } from 'react';
import { DollarSign, Plus, Calendar, PieChart, Filter, Brain, Sparkles, TrendingUp, Lightbulb } from 'lucide-react';
import { ModuleHeader } from '../components/ModuleHeader';
import { useGlobalData } from '../context/GlobalDataContext';
import { FinancialSummary } from '../components/financial/FinancialSummary';
import { FinancialList } from '../components/financial/FinancialList';
import { FinancialModal } from '../components/financial/FinancialModal';
import { aiService } from '../services/ai.service';
import type { FinancialEntry } from '../types';

export const Financial: React.FC = () => {
    const { financial, addFinancialEntry, updateFinancialEntry, deleteFinancialEntry } = useGlobalData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);
    const [filter, setFilter] = useState<'month' | 'year' | 'all'>('month');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    // Filter logic
    const filteredTransactions = financial.filter(t => {
        if (filter === 'all') return true;
        const date = new Date(t.date);
        const now = new Date();
        if (filter === 'month') {
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }
        if (filter === 'year') {
            return date.getFullYear() === now.getFullYear();
        }
        return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleSave = (entryData: Partial<FinancialEntry>) => {
        if (editingEntry) {
            updateFinancialEntry(editingEntry.id, entryData);
        } else {
            const newEntry = {
                id: crypto.randomUUID(),
                ...entryData,
                createdAt: new Date().toISOString()
            } as FinancialEntry;
            addFinancialEntry(newEntry);
        }
        setIsModalOpen(false);
        setEditingEntry(null);
    };

    const handleEdit = (entry: FinancialEntry) => {
        setEditingEntry(entry);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            deleteFinancialEntry(id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEntry(null);
    };

    const handleAnalyzeFinancial = async () => {
        setIsAnalyzing(true);
        try {
            // Calculate totals for analysis
            const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
            const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

            const financialData = {
                income,
                expense,
                balance: income - expense,
                transactions: filteredTransactions.slice(0, 10).map(t => ({
                    description: t.description,
                    amount: t.amount,
                    type: t.type
                }))
            };

            const result = await aiService.analyzeFinancial(financialData);
            setAnalysisResult(result);
        } catch (error) {
            console.error('Error analyzing financials:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Calculate category distribution for chart (mock for now, can be real later)
    const categories = filteredTransactions.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {} as Record<string, number>);

    const totalAmount = Object.values(categories).reduce((a, b) => a + b, 0);
    const categoryData = Object.entries(categories).map(([label, value]) => ({
        label,
        value: Math.round((value / totalAmount) * 100),
        color: 'bg-blue-500' // Dynamic colors can be added
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    return (
        <div className="space-y-6 animate-fade-in">
            <ModuleHeader
                title="Financeiro"
                subtitle="Controle de receitas, despesas e fluxo de caixa"
                icon={DollarSign}
                action={
                    <div className="flex gap-3">
                        <button
                            onClick={handleAnalyzeFinancial}
                            disabled={isAnalyzing}
                            className="btn-secondary-premium flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/30"
                        >
                            {isAnalyzing ? <Sparkles size={18} className="animate-spin" /> : <Brain size={18} />}
                            Advisor IA
                        </button>
                        <button className="btn-secondary-premium flex items-center gap-2">
                            <Filter size={18} />
                            Filtrar
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn-premium flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Nova Transação
                        </button>
                    </div>
                }
            />

            {analysisResult && (
                <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <Sparkles className="text-purple-300" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Financial Advisor AI</h3>
                                <p className="text-purple-200 text-sm">Análise inteligente do seu fluxo de caixa</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAnalysisResult(null)}
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            Fechar
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-2 text-purple-200 mb-2 font-medium">
                                <TrendingUp size={18} />
                                Saúde Financeira
                            </div>
                            <div className="text-2xl font-bold mb-1">{analysisResult.health_status}</div>
                            <p className="text-sm text-white/70">{analysisResult.recommendation}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-2 text-amber-200 mb-2 font-medium">
                                <Lightbulb size={18} />
                                Insights
                            </div>
                            <ul className="space-y-2">
                                {analysisResult.insights?.map((insight: string, i: number) => (
                                    <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                                        <span className="text-amber-400 mt-1">•</span>
                                        {insight}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-2 text-emerald-200 mb-2 font-medium">
                                <DollarSign size={18} />
                                Oportunidade de Economia
                            </div>
                            <div className="text-lg font-semibold text-emerald-100 mb-1">
                                {analysisResult.savings_opportunity}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <FinancialSummary transactions={filteredTransactions} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transactions List */}
                <div className="lg:col-span-2 card-premium p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                            <Calendar size={20} className="text-[rgb(var(--accent-primary))]" />
                            Transações Recentes
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('month')}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter === 'month'
                                    ? 'bg-[rgb(var(--accent-primary))] text-white'
                                    : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-secondary))]'
                                    }`}
                            >
                                Mês
                            </button>
                            <button
                                onClick={() => setFilter('year')}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter === 'year'
                                    ? 'bg-[rgb(var(--accent-primary))] text-white'
                                    : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-secondary))]'
                                    }`}
                            >
                                Ano
                            </button>
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter === 'all'
                                    ? 'bg-[rgb(var(--accent-primary))] text-white'
                                    : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-secondary))]'
                                    }`}
                            >
                                Tudo
                            </button>
                        </div>
                    </div>

                    <FinancialList
                        transactions={filteredTransactions}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                {/* Summary/Chart Placeholder */}
                <div className="card-premium p-6">
                    <h3 className="font-bold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-2">
                        <PieChart size={20} className="text-[rgb(var(--accent-primary))]" />
                        Resumo por Categoria
                    </h3>
                    <div className="space-y-4">
                        {categoryData.length > 0 ? categoryData.map((item, index) => (
                            <div key={item.label} className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-[rgb(var(--text-secondary))]">{item.label}</span>
                                    <span className="text-sm font-bold text-[rgb(var(--text-primary))]">{item.value}%</span>
                                </div>
                                <div className="w-full bg-[rgb(var(--bg-tertiary))] rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`h-2.5 rounded-full ${['bg-blue-500', 'bg-red-500', 'bg-amber-500', 'bg-green-500', 'bg-purple-500'][index % 5]} transition-all duration-500`}
                                        style={{ width: `${item.value}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-gray-400 py-8">
                                Sem dados para exibir
                            </div>
                        )}
                    </div>

                    <div className="mt-8 p-4 bg-[rgb(var(--bg-tertiary))]/50 rounded-xl border border-[rgb(var(--border-subtle))]">
                        <h4 className="font-bold text-[rgb(var(--text-primary))] mb-2 text-sm">Dica Financeira</h4>
                        <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed">
                            Mantenha o registro de todas as despesas processuais para facilitar o reembolso futuro e a prestação de contas aos clientes.
                        </p>
                    </div>
                </div>
            </div>

            <FinancialModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                entry={editingEntry}
            />
        </div>
    );
};
