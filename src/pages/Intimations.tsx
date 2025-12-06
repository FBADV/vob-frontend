import React, { useState } from 'react';
import { Search, Bell, AlertTriangle, RefreshCw, CheckCircle, Archive, FileText, Filter, Clock, CheckSquare } from 'lucide-react';
import type { Intimation } from '../types';
import { ModuleHeader } from '../components/ModuleHeader';

export const Intimations: React.FC = () => {
    // Local state for demonstration purposes, as global context integration for intimations 
    // would require updating the context provider which is out of scope for this specific file edit.
    // In a real app, this would come from useGlobalData().
    const [localIntimations, setLocalIntimations] = useState<Intimation[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'evaluated' | 'concluded'>('all');
    const [isSimulatingFetch, setIsSimulatingFetch] = useState(false);

    const handleFetchIntimations = () => {
        setIsSimulatingFetch(true);
        // Simulate API call
        setTimeout(() => {
            const newIntimations: Intimation[] = [
                {
                    id: crypto.randomUUID(),
                    processNumber: '1002345-67.2024.8.26.0100',
                    court: 'TJSP - 25ª Vara Cível',
                    content: 'Fica intimada a parte para manifestar-se sobre o laudo pericial, no prazo de 15 dias.',
                    date: new Date().toISOString(),
                    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    isRead: false,
                    status: 'pending',
                    source: 'DJE'
                },
                {
                    id: crypto.randomUUID(),
                    processNumber: '0045678-12.2023.8.26.0000',
                    court: 'TJSP - 2ª Câmara de Direito Privado',
                    content: 'Publicado o acórdão. Negaram provimento ao recurso. V. U.',
                    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    isRead: false,
                    status: 'pending',
                    source: 'DJE'
                }
            ];
            setLocalIntimations(prev => [...newIntimations, ...prev]);
            setIsSimulatingFetch(false);
        }, 2000);
    };

    const handleEvaluate = (id: string, note: string) => {
        setLocalIntimations(prev => prev.map(i =>
            i.id === id ? { ...i, status: 'evaluated', evaluationNote: note, isRead: true } : i
        ));
    };

    const handleConclude = (id: string) => {
        setLocalIntimations(prev => prev.map(i =>
            i.id === id ? { ...i, status: 'concluded' } : i
        ));
    };

    const filteredIntimations = localIntimations.filter(intimation => {
        const matchesSearch =
            intimation.processNumber.includes(searchTerm) ||
            intimation.content.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filter === 'all' || intimation.status === filter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <ModuleHeader
                title="Intimações"
                subtitle="Monitoramento e gestão de publicações e intimações"
                icon={Bell}
                action={
                    <div className="flex items-center gap-3">
                        <div className="text-sm text-[rgb(var(--text-secondary))] hidden sm:block bg-[rgb(var(--bg-secondary))] px-3 py-1.5 rounded-lg border border-[rgb(var(--border-subtle))] shadow-sm">
                            Monitorando: <span className="font-semibold text-[rgb(var(--accent-primary))]">OAB/SP 123.456</span>
                        </div>
                        <button
                            onClick={handleFetchIntimations}
                            disabled={isSimulatingFetch}
                            className="btn-premium flex items-center gap-2 px-6 py-2.5"
                        >
                            <RefreshCw size={20} className={isSimulatingFetch ? 'animate-spin' : ''} />
                            <span>{isSimulatingFetch ? 'Buscando...' : 'Buscar Intimações'}</span>
                        </button>
                    </div>
                }
            />

            {/* Filters and Search */}
            <div className="card-premium p-5 flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] group-focus-within:text-[rgb(var(--accent-primary))] transition-colors pointer-events-none" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por número ou conteúdo..."
                        className="input-premium pl-16 pr-4 py-2.5 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                    {[
                        { id: 'all', label: 'Todas', icon: Filter },
                        { id: 'pending', label: 'Pendentes', icon: Clock },
                        { id: 'evaluated', label: 'Avaliadas', icon: CheckSquare },
                        { id: 'concluded', label: 'Concluídas', icon: Archive },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setFilter(item.id as 'all' | 'pending' | 'evaluated' | 'concluded')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === item.id
                                ? 'bg-[rgb(var(--accent-primary))] text-white shadow-lg shadow-[rgb(var(--accent-primary))]/20'
                                : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))]'
                                }`}
                        >
                            <item.icon size={16} />
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredIntimations.map((intimation) => (
                    <div
                        key={intimation.id}
                        className={`card-premium p-6 transition-all hover:shadow-lg group relative overflow-hidden ${intimation.status === 'pending'
                            ? 'border-l-4 border-l-amber-500'
                            : intimation.status === 'evaluated'
                                ? 'border-l-4 border-l-[rgb(var(--accent-primary))]'
                                : 'opacity-75'
                            }`}
                    >
                        {/* Status Indicator Background */}
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 transition-opacity opacity-5 group-hover:opacity-10 ${intimation.status === 'pending' ? 'bg-amber-500' :
                            intimation.status === 'evaluated' ? 'bg-[rgb(var(--accent-primary))]' : 'bg-green-500'
                            }`} />

                        <div className="flex flex-col md:flex-row gap-6 justify-between relative z-10">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] border border-[rgb(var(--border-subtle))]">
                                        {intimation.source}
                                    </span>
                                    <span className="text-xs text-[rgb(var(--text-tertiary))] flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(intimation.date).toLocaleDateString('pt-BR')} às {new Date(intimation.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {intimation.status === 'pending' && (
                                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                            <AlertTriangle size={12} />
                                            Pendente de Avaliação
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-1 group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                                        {intimation.processNumber}
                                    </h3>
                                    <p className="text-sm text-[rgb(var(--text-secondary))] font-medium flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--text-tertiary))]"></span>
                                        {intimation.court}
                                    </p>
                                </div>

                                <div className="bg-[rgb(var(--bg-tertiary))]/50 p-4 rounded-xl border border-[rgb(var(--border-subtle))] text-sm text-[rgb(var(--text-secondary))] leading-relaxed font-serif">
                                    {intimation.content}
                                </div>

                                {intimation.deadline && (
                                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg w-fit border border-amber-100 dark:border-amber-900/30">
                                        <AlertTriangle size={16} />
                                        <span className="text-sm font-medium">
                                            Prazo Fatal: {new Date(intimation.deadline).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                )}

                                {intimation.evaluationNote && (
                                    <div className="flex gap-3 p-4 bg-[rgb(var(--accent-primary))]/5 rounded-xl border border-[rgb(var(--accent-primary))]/20">
                                        <div className="mt-0.5 text-[rgb(var(--accent-primary))]">
                                            <CheckSquare size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[rgb(var(--accent-primary))] mb-1 uppercase tracking-wide">Avaliação do Advogado</p>
                                            <p className="text-sm text-[rgb(var(--text-primary))]">{intimation.evaluationNote}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex md:flex-col gap-3 justify-end md:justify-start min-w-[160px]">
                                {intimation.status === 'pending' && (
                                    <button
                                        onClick={() => {
                                            const note = prompt('Insira uma nota de avaliação:');
                                            if (note) handleEvaluate(intimation.id, note);
                                        }}
                                        className="btn-premium flex items-center justify-center gap-2 w-full"
                                    >
                                        <CheckCircle size={18} />
                                        Avaliar
                                    </button>
                                )}
                                {intimation.status === 'evaluated' && (
                                    <button
                                        onClick={() => handleConclude(intimation.id)}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg shadow-green-500/20 text-sm font-bold w-full"
                                    >
                                        <Archive size={18} />
                                        Concluir
                                    </button>
                                )}
                                <button className="btn-secondary-premium flex items-center justify-center gap-2 w-full">
                                    <FileText size={18} />
                                    Ver Processo
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredIntimations.length === 0 && (
                    <div className="py-16 px-6 text-center text-[rgb(var(--text-tertiary))] card-premium border-dashed">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[rgb(var(--bg-tertiary))] mb-6">
                            <Bell size={40} className="text-[rgb(var(--text-tertiary))]" />
                        </div>
                        <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">Nenhuma intimação encontrada</h3>
                        <p className="text-sm max-w-md mx-auto mb-8 text-[rgb(var(--text-secondary))]">
                            Não encontramos nenhuma intimação correspondente aos seus filtros. Clique em "Buscar Intimações" para verificar novos eventos nos diários oficiais.
                        </p>
                        <button
                            onClick={handleFetchIntimations}
                            disabled={isSimulatingFetch}
                            className="btn-premium inline-flex items-center gap-2 px-6 py-2.5"
                        >
                            <RefreshCw size={20} className={isSimulatingFetch ? 'animate-spin' : ''} />
                            <span>{isSimulatingFetch ? 'Buscando...' : 'Buscar Agora'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
