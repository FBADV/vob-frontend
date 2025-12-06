import React from 'react';
import { ModuleHeader } from '../components/ModuleHeader';
import {
    BarChart3,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Filter,
    MoreVertical
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

// Mock Data
const processesByStepData = [
    { name: 'Início', count: 12 },
    { name: 'Análise', count: 8 },
    { name: 'Petição', count: 15 },
    { name: 'Audiência', count: 5 },
    { name: 'Sentença', count: 3 },
    { name: 'Recurso', count: 7 },
    { name: 'Conclusão', count: 45 },
];

const productivityData = [
    { name: 'Seg', completed: 4 },
    { name: 'Ter', completed: 7 },
    { name: 'Qua', completed: 5 },
    { name: 'Qui', completed: 12 },
    { name: 'Sex', completed: 9 },
];

const delayedSteps = [
    { id: 1, process: '0012345-88.2024.8.26.0100', step: 'Petição Inicial', days: 5, responsible: 'Dr. Silva' },
    { id: 2, process: '0054321-11.2024.8.26.0100', step: 'Réplica', days: 3, responsible: 'Dra. Santos' },
    { id: 3, process: '0098765-22.2024.8.26.0100', step: 'Alegações Finais', days: 2, responsible: 'Dr. Oliveira' },
];

const recentActivity = [
    { id: 1, process: '0012345-88.2024.8.26.0100', action: 'Avançou para', step: 'Análise', user: 'Dr. Silva', time: '10 min atrás' },
    { id: 2, process: '0054321-11.2024.8.26.0100', action: 'Concluiu', step: 'Petição Inicial', user: 'Dra. Santos', time: '1h atrás' },
    { id: 3, process: '0098765-22.2024.8.26.0100', action: 'Iniciou', step: 'Fluxo Padrão', user: 'Admin', time: '2h atrás' },
];

export const Controladoria: React.FC = () => {
    return (
        <div className="p-8 animate-fade-in space-y-8">
            <ModuleHeader
                title="Controladoria"
                subtitle="Gestão de Fluxos e Produtividade"
                icon={BarChart3}
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-premium p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Processos em Andamento</p>
                        <h3 className="text-3xl font-bold text-[rgb(var(--text-primary))] mt-2">50</h3>
                        <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                            <TrendingUp size={12} />
                            +12% este mês
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <BarChart3 size={24} />
                    </div>
                </div>

                <div className="card-premium p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Etapas Atrasadas</p>
                        <h3 className="text-3xl font-bold text-[rgb(var(--text-primary))] mt-2">3</h3>
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle size={12} />
                            Atenção necessária
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                        <Clock size={24} />
                    </div>
                </div>

                <div className="card-premium p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">Produtividade Semanal</p>
                        <h3 className="text-3xl font-bold text-[rgb(var(--text-primary))] mt-2">37</h3>
                        <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                            <CheckCircle size={12} />
                            Etapas concluídas
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                        <TrendingUp size={24} />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Processos por Etapa */}
                <div className="card-premium p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-[rgb(var(--text-primary))] text-lg">Processos por Etapa</h3>
                        <button className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors">
                            <Filter size={18} className="text-[rgb(var(--text-secondary))]" />
                        </button>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={processesByStepData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border-subtle))" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgb(var(--text-secondary))', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgb(var(--text-secondary))', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgb(var(--bg-secondary))',
                                        borderColor: 'rgb(var(--border-subtle))',
                                        borderRadius: '0.75rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    cursor={{ fill: 'rgb(var(--bg-tertiary))', opacity: 0.4 }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="rgb(var(--accent-primary))"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Produtividade */}
                <div className="card-premium p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-[rgb(var(--text-primary))] text-lg">Produtividade (Etapas Concluídas)</h3>
                        <button className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors">
                            <MoreVertical size={18} className="text-[rgb(var(--text-secondary))]" />
                        </button>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={productivityData}>
                                <defs>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="rgb(var(--accent-primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="rgb(var(--accent-primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border-subtle))" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgb(var(--text-secondary))', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgb(var(--text-secondary))', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgb(var(--bg-secondary))',
                                        borderColor: 'rgb(var(--border-subtle))',
                                        borderRadius: '0.75rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="rgb(var(--accent-primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCompleted)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Etapas Atrasadas */}
                <div className="card-premium p-6">
                    <h3 className="font-bold text-[rgb(var(--text-primary))] text-lg mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-red-500" />
                        Etapas Atrasadas
                    </h3>
                    <div className="space-y-4">
                        {delayedSteps.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--bg-tertiary))]/30 border border-[rgb(var(--border-subtle))] hover:border-red-200 dark:hover:border-red-900/50 transition-colors group">
                                <div>
                                    <p className="font-bold text-[rgb(var(--text-primary))] text-sm">{item.process}</p>
                                    <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">
                                        Etapa: <span className="font-medium text-[rgb(var(--text-primary))]">{item.step}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                        +{item.days} dias
                                    </span>
                                    <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">{item.responsible}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 text-sm text-[rgb(var(--accent-primary))] font-medium hover:bg-[rgb(var(--accent-primary))]/10 rounded-lg transition-colors">
                        Ver todos os atrasos
                    </button>
                </div>

                {/* Timeline Recente */}
                <div className="card-premium p-6">
                    <h3 className="font-bold text-[rgb(var(--text-primary))] text-lg mb-6 flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-500" />
                        Atividade Recente
                    </h3>
                    <div className="relative border-l-2 border-[rgb(var(--border-subtle))] ml-3 space-y-6">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="relative pl-6">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-[rgb(var(--bg-primary))] bg-[rgb(var(--accent-primary))]"></div>
                                <div>
                                    <p className="text-sm text-[rgb(var(--text-primary))]">
                                        <span className="font-bold">{activity.user}</span> {activity.action} <span className="font-bold">{activity.step}</span>
                                    </p>
                                    <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5 font-mono">
                                        {activity.process}
                                    </p>
                                    <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 text-sm text-[rgb(var(--accent-primary))] font-medium hover:bg-[rgb(var(--accent-primary))]/10 rounded-lg transition-colors">
                        Ver histórico completo
                    </button>
                </div>
            </div>
        </div>
    );
};
