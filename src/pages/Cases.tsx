import React, { useState } from 'react';
import { Briefcase, Search, Plus, Gavel, Scale, Clock } from 'lucide-react';
import { ModuleHeader } from '../components/ModuleHeader';

export const Cases: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Mock data
    const cases = [
        {
            id: 1,
            title: 'Ação de Indenização - Silva vs. Construtora XYZ',
            number: '1002345-67.2024.8.26.0100',
            client: 'João da Silva',
            status: 'active',
            type: 'Cível',
            nextDeadline: '2024-04-15',
            value: 150000
        },
        {
            id: 2,
            title: 'Divórcio Consensual - Pereira',
            number: '0045678-12.2023.8.26.0000',
            client: 'Maria Pereira',
            status: 'pending',
            type: 'Família',
            nextDeadline: '2024-03-30',
            value: 0
        },
        {
            id: 3,
            title: 'Reclamação Trabalhista - Souza vs. Empresa ABC',
            number: '0012345-89.2023.5.02.0001',
            client: 'Pedro Souza',
            status: 'archived',
            type: 'Trabalhista',
            nextDeadline: null,
            value: 85000
        }
    ];

    const filteredCases = cases.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.number.includes(searchTerm) ||
            c.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <ModuleHeader
                title="Casos Jurídicos"
                subtitle="Gestão estratégica de casos e teses jurídicas"
                icon={Briefcase}
                action={
                    <button className="btn-premium flex items-center gap-2 px-6 py-2.5">
                        <Plus size={20} />
                        Novo Caso
                    </button>
                }
            />

            {/* Filters */}
            <div className="card-premium p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] group-focus-within:text-[rgb(var(--accent-primary))] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar casos, clientes ou processos..."
                            className="input-premium pl-10 pr-4 py-2.5 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'active', label: 'Ativos' },
                            { id: 'pending', label: 'Pendentes' },
                            { id: 'archived', label: 'Arquivados' }
                        ].map((status) => (
                            <button
                                key={status.id}
                                onClick={() => setFilterStatus(status.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filterStatus === status.id
                                    ? 'bg-[rgb(var(--accent-primary))] text-white shadow-lg shadow-[rgb(var(--accent-primary))]/20'
                                    : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))]'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCases.map((c) => (
                    <div
                        key={c.id}
                        className="card-premium p-6 hover:shadow-lg transition-all group relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-opacity opacity-10 ${c.status === 'active' ? 'bg-green-500' :
                            c.status === 'pending' ? 'bg-amber-500' : 'bg-gray-500'
                            }`} />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${c.status === 'active'
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900/30'
                                    : c.status === 'pending'
                                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/30'
                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                    }`}>
                                    {c.status === 'active' ? 'Ativo' : c.status === 'pending' ? 'Pendente' : 'Arquivado'}
                                </span>
                                <div className="p-2 rounded-lg bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                                    <Scale size={20} />
                                </div>
                            </div>

                            <h3 className="font-bold text-[rgb(var(--text-primary))] mb-1 line-clamp-2 min-h-[3.5rem]">
                                {c.title}
                            </h3>
                            <p className="text-xs text-[rgb(var(--text-secondary))] mb-4 font-mono bg-[rgb(var(--bg-tertiary))]/50 px-2 py-1 rounded w-fit">
                                {c.number}
                            </p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
                                    <Briefcase size={16} className="text-[rgb(var(--text-tertiary))]" />
                                    {c.client}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
                                    <Gavel size={16} className="text-[rgb(var(--text-tertiary))]" />
                                    {c.type}
                                </div>
                                {c.nextDeadline && (
                                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
                                        <Clock size={16} />
                                        Prazo: {new Date(c.nextDeadline).toLocaleDateString('pt-BR')}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-[rgb(var(--border-subtle))] flex items-center justify-between">
                                <div className="text-sm">
                                    <span className="text-[rgb(var(--text-tertiary))] block text-xs">Valor da Causa</span>
                                    <span className="font-bold text-[rgb(var(--text-primary))]">
                                        {c.value > 0 ? `R$ ${c.value.toLocaleString('pt-BR')}` : 'Não informado'}
                                    </span>
                                </div>
                                <button className="btn-secondary-premium text-xs px-3 py-1.5">
                                    Detalhes
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
