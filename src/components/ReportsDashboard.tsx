import React, { useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { useGlobalData } from '../context/GlobalDataContext';
import { Filter } from 'lucide-react';
import { format, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Premium color palette with gradients


const GRADIENT_COLORS = [
    { start: '#6366f1', end: '#8b5cf6' }, // Indigo to Purple
    { start: '#8b5cf6', end: '#ec4899' }, // Purple to Pink
    { start: '#ec4899', end: '#f59e0b' }, // Pink to Amber
    { start: '#10b981', end: '#06b6d4' }, // Emerald to Cyan
    { start: '#3b82f6', end: '#6366f1' }, // Blue to Indigo
    { start: '#f59e0b', end: '#f97316' }, // Amber to Orange
];

export const ReportsDashboard: React.FC = () => {
    const { processes, clients, services, agendaEvents } = useGlobalData();
    const [dateRange, setDateRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
    const [selectedClientId, setSelectedClientId] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // Filter logic
    const isWithinDateRange = (dateStr: string) => {
        if (dateRange === 'all') return true;
        const date = parseISO(dateStr);
        const now = new Date();
        let start = new Date();

        if (dateRange === 'month') start = subMonths(now, 1);
        if (dateRange === 'quarter') start = subMonths(now, 3);
        if (dateRange === 'year') start = subMonths(now, 12);

        return isWithinInterval(date, { start, end: now });
    };

    const filterProcess = (p: any) => {
        const matchesDate = p.folder?.basicData?.distributionDate ? isWithinDateRange(p.folder.basicData.distributionDate) : false;
        const matchesClient = selectedClientId === 'all' || p.clientId === selectedClientId;
        const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
        return matchesDate && matchesClient && matchesStatus;
    };

    // Data processing for charts
    const processesByStatus = useMemo(() => {
        if (!processes || processes.length === 0) {
            return [{ name: 'Sem dados', value: 0 }];
        }
        const counts: Record<string, number> = {};
        processes.forEach(p => {
            try {
                if (filterProcess(p)) {
                    counts[p.status] = (counts[p.status] || 0) + 1;
                }
            } catch (error) {
                console.warn('Error processing process:', error);
            }
        });
        const result = Object.entries(counts).map(([name, value]) => ({ name, value }));
        return result.length > 0 ? result : [{ name: 'Sem dados', value: 0 }];
    }, [processes, dateRange, selectedClientId, selectedStatus]);

    const clientsByType = useMemo(() => {
        if (!clients || clients.length === 0) {
            return [
                { name: 'Pessoa Física', value: 0 },
                { name: 'Pessoa Jurídica', value: 0 }
            ];
        }
        const counts = { individual: 0, company: 0 };
        clients.forEach(c => {
            try {
                if (c.createdAt && isWithinDateRange(c.createdAt)) {
                    // Client type filter doesn't apply to client distribution chart usually, 
                    // but if we selected a specific client, this chart becomes less useful. 
                    // Let's keep it date-filtered only for general overview, 
                    // or filter by the selected client (which would result in 1 or 0).
                    // For now, let's keep it date filtered only to show distribution of ALL clients in that period.
                    if (c.type === 'individual') counts.individual++;
                    else counts.company++;
                }
            } catch (error) {
                console.warn('Error processing client:', error);
            }
        });
        return [
            { name: 'Pessoa Física', value: counts.individual },
            { name: 'Pessoa Jurídica', value: counts.company }
        ];
    }, [clients, dateRange]);

    const processesByMonth = useMemo(() => {
        if (!processes || processes.length === 0) {
            return [{ name: 'Sem dados', value: 0 }];
        }
        const counts: Record<string, number> = {};
        processes.forEach(p => {
            try {
                if (filterProcess(p)) {
                    const month = format(parseISO(p.folder.basicData.distributionDate), 'MMM yyyy', { locale: ptBR });
                    counts[month] = (counts[month] || 0) + 1;
                }
            } catch (error) {
                console.warn('Error processing process for timeline:', error);
            }
        });
        const result = Object.entries(counts).map(([name, value]) => ({ name, value }));
        return result.length > 0 ? result : [{ name: 'Sem dados', value: 0 }];
    }, [processes, dateRange, selectedClientId, selectedStatus]);

    const servicesByStatus = useMemo(() => {
        if (!services || services.length === 0) {
            return [{ name: 'Sem dados', value: 0 }];
        }
        const counts: Record<string, number> = {};
        services.forEach(s => {
            try {
                // Services might not have clientId directly linked in the same way, or we need to check.
                // Assuming service has clientId.
                const matchesDate = s.createdAt ? isWithinDateRange(s.createdAt) : false;
                const matchesClient = selectedClientId === 'all' || s.clientId === selectedClientId;
                // Status filter might not apply to services directly if it's process status, 
                // but let's assume the status filter is for PROCESS status, so it shouldn't filter services?
                // Or maybe we want a separate service status filter?
                // For simplicity, let's only filter services by Client and Date.

                if (matchesDate && matchesClient) {
                    const statusLabel = s.status === 'scheduled' ? 'Agendado' :
                        s.status === 'completed' ? 'Concluído' :
                            s.status === 'in_progress' ? 'Em Andamento' : 'Cancelado';
                    counts[statusLabel] = (counts[statusLabel] || 0) + 1;
                }
            } catch (error) {
                console.warn('Error processing service:', error);
            }
        });
        const result = Object.entries(counts).map(([name, value]) => ({ name, value }));
        return result.length > 0 ? result : [{ name: 'Sem dados', value: 0 }];
    }, [services, dateRange, selectedClientId]);

    const eventsByType = useMemo(() => {
        if (!agendaEvents || agendaEvents.length === 0) {
            return [{ name: 'Sem dados', value: 0 }];
        }
        const counts: Record<string, number> = {};
        agendaEvents.forEach(e => {
            try {
                const matchesDate = e.createdAt ? isWithinDateRange(e.createdAt) : false;
                const matchesClient = selectedClientId === 'all' || e.clientId === selectedClientId;

                if (matchesDate && matchesClient) {
                    const typeLabel = e.type === 'hearing' ? 'Audiência' :
                        e.type === 'deadline' ? 'Prazo' :
                            e.type === 'meeting' ? 'Reunião' : 'Outro';
                    counts[typeLabel] = (counts[typeLabel] || 0) + 1;
                }
            } catch (error) {
                console.warn('Error processing event:', error);
            }
        });
        const result = Object.entries(counts).map(([name, value]) => ({ name, value }));
        return result.length > 0 ? result : [{ name: 'Sem dados', value: 0 }];
    }, [agendaEvents, dateRange, selectedClientId]);

    const financialData = useMemo(() => {
        if (!processes || processes.length === 0) {
            return { totalValue: 0, activeValue: 0, processCount: 0 };
        }
        let totalValue = 0;
        let activeValue = 0;
        let processCount = 0;

        processes.forEach(p => {
            try {
                if (filterProcess(p)) {
                    processCount++;
                    const value = p.value || 0;
                    totalValue += value;
                    if (p.status === 'active') {
                        activeValue += value;
                    }
                }
            } catch (error) {
                console.warn('Error processing financial data:', error);
            }
        });

        return { totalValue, activeValue, processCount };
    }, [processes, dateRange, selectedClientId, selectedStatus]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Filters Header */}
            <div className="bg-[rgb(var(--bg-secondary))] p-6 rounded-2xl border border-[rgb(var(--border-subtle))] shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[rgb(var(--text-primary))] mb-2">
                    <Filter size={20} className="text-[rgb(var(--accent-primary))]" />
                    <span className="font-bold text-lg">Filtros Avançados</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Date Range */}
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] uppercase mb-2">Período</label>
                        <div className="flex bg-[rgb(var(--bg-tertiary))] p-1 rounded-xl">
                            {(['all', 'month', 'quarter', 'year'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setDateRange(range)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${dateRange === range
                                        ? 'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] shadow-sm border border-[rgb(var(--border-subtle))]'
                                        : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                                        }`}
                                >
                                    {range === 'all' && 'Tudo'}
                                    {range === 'month' && '30 Dias'}
                                    {range === 'quarter' && '3 Meses'}
                                    {range === 'year' && '1 Ano'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Client Filter */}
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] uppercase mb-2">Cliente</label>
                        <select
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            className="input-premium w-full"
                        >
                            <option value="all">Todos os Clientes</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] uppercase mb-2">Status do Processo</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="input-premium w-full"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="active">Ativo</option>
                            <option value="suspended">Suspenso</option>
                            <option value="archived">Arquivado</option>
                            <option value="finished">Finalizado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* General Visualization (Financial & Counts) - Moved to Top */}
            <div className="card-premium p-8 bg-gradient-to-br from-[rgb(var(--bg-secondary))] to-[rgb(var(--bg-tertiary))]/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                        Visão Geral e Financeiro
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 dark:bg-green-700 rounded-full -mr-16 -mt-16 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
                        <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-2 relative z-10">Valor Total em Causas</p>
                        <p className="text-3xl font-bold text-green-900 dark:text-green-300 relative z-10">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialData.totalValue)}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-500 mt-2 relative z-10 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            {financialData.processCount} processos filtrados
                        </p>
                    </div>
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-violet-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-blue-700 rounded-full -mr-16 -mt-16 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2 relative z-10">Valor em Processos Ativos</p>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-300 relative z-10">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(financialData.activeValue)}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-500 mt-2 relative z-10 flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            {financialData.totalValue > 0 ? ((financialData.activeValue / financialData.totalValue) * 100).toFixed(1) : 0}% do total
                        </p>
                    </div>
                    <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-fuchsia-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 dark:bg-purple-700 rounded-full -mr-16 -mt-16 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
                        <p className="text-sm font-bold text-purple-700 dark:text-purple-400 mb-2 relative z-10">Total de Atendimentos</p>
                        <p className="text-3xl font-bold text-purple-900 dark:text-purple-300 relative z-10">
                            {servicesByStatus.reduce((acc, curr) => acc + curr.value, 0)}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-500 mt-2 relative z-10 flex items-center gap-1">
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                            {services?.filter(s => s.status === 'completed' && (selectedClientId === 'all' || s.clientId === selectedClientId) && (dateRange === 'all' || (s.createdAt && isWithinDateRange(s.createdAt)))).length || 0} concluídos
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Processes by Status - Premium Donut Chart */}
                <div className="card-premium p-8 bg-gradient-to-br from-[rgb(var(--bg-secondary))] to-[rgb(var(--bg-tertiary))]/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                            Processos por Status
                        </h3>
                        <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold">
                            {processesByStatus.reduce((acc, curr) => acc + curr.value, 0)} total
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    {GRADIENT_COLORS.map((gradient, index) => (
                                        <linearGradient key={`gradient-${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={gradient.start} stopOpacity={1} />
                                            <stop offset="100%" stopColor={gradient.end} stopOpacity={0.8} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <Pie
                                    data={processesByStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={3}
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={800}
                                >
                                    {processesByStatus.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`url(#colorGradient${index % GRADIENT_COLORS.length})`}
                                            stroke="rgb(var(--bg-primary))"
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgb(var(--bg-secondary))',
                                        borderColor: 'rgb(var(--border-subtle))',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: 'rgb(var(--text-primary))', fontWeight: 600 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Clients Distribution - Premium Bar Chart */}
                <div className="card-premium p-8 bg-gradient-to-br from-[rgb(var(--bg-secondary))] to-[rgb(var(--bg-tertiary))]/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                            Distribuição de Clientes
                        </h3>
                        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
                            {clientsByType.reduce((acc, curr) => acc + curr.value, 0)} total
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={clientsByType}>
                                <defs>
                                    <linearGradient id="colorPF" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                                    </linearGradient>
                                    <linearGradient id="colorPJ" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-subtle))" opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    stroke="rgb(var(--text-secondary))"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <YAxis
                                    stroke="rgb(var(--text-secondary))"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgb(var(--bg-tertiary))', opacity: 0.2, radius: 8 }}
                                    contentStyle={{
                                        backgroundColor: 'rgb(var(--bg-secondary))',
                                        borderColor: 'rgb(var(--border-subtle))',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: 'rgb(var(--text-primary))', fontWeight: 600 }}
                                />
                                <Bar dataKey="value" radius={[12, 12, 0, 0]} animationDuration={800}>
                                    {clientsByType.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? 'url(#colorPF)' : 'url(#colorPJ)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Processes Timeline - Premium Line Chart */}
                <div className="card-premium p-8 lg:col-span-2 bg-gradient-to-br from-[rgb(var(--bg-secondary))] to-[rgb(var(--bg-tertiary))]/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
                            Evolução de Processos
                        </h3>
                        <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
                            Tendência Temporal
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processesByMonth}>
                                <defs>
                                    <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-subtle))" opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    stroke="rgb(var(--text-secondary))"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <YAxis
                                    stroke="rgb(var(--text-secondary))"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgb(var(--bg-secondary))',
                                        borderColor: 'rgb(var(--border-subtle))',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: 'rgb(var(--text-primary))', fontWeight: 600 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 8, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }}
                                    animationDuration={1000}
                                    fill="url(#colorLine)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Services by Status - Premium Bar Chart */}
                <div className="card-premium p-8 bg-gradient-to-br from-[rgb(var(--bg-secondary))] to-[rgb(var(--bg-tertiary))]/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                            Atendimentos por Status
                        </h3>
                        <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold">
                            {servicesByStatus.reduce((acc, curr) => acc + curr.value, 0)} total
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={servicesByStatus}>
                                <defs>
                                    {GRADIENT_COLORS.map((gradient, index) => (
                                        <linearGradient key={`service-gradient-${index}`} id={`serviceGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={gradient.start} stopOpacity={1} />
                                            <stop offset="100%" stopColor={gradient.end} stopOpacity={0.8} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-subtle))" opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    stroke="rgb(var(--text-secondary))"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <YAxis
                                    stroke="rgb(var(--text-secondary))"
                                    style={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgb(var(--bg-tertiary))', opacity: 0.2, radius: 8 }}
                                    contentStyle={{
                                        backgroundColor: 'rgb(var(--bg-secondary))',
                                        borderColor: 'rgb(var(--border-subtle))',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: 'rgb(var(--text-primary))', fontWeight: 600 }}
                                />
                                <Bar dataKey="value" radius={[12, 12, 0, 0]} animationDuration={800}>
                                    {servicesByStatus.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#serviceGradient${index % GRADIENT_COLORS.length})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Events by Type - Premium Donut Chart */}
                <div className="card-premium p-8 bg-gradient-to-br from-[rgb(var(--bg-secondary))] to-[rgb(var(--bg-tertiary))]/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></div>
                            Eventos da Agenda por Tipo
                        </h3>
                        <div className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-xs font-bold">
                            {eventsByType.reduce((acc, curr) => acc + curr.value, 0)} total
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    {GRADIENT_COLORS.map((gradient, index) => (
                                        <linearGradient key={`event-gradient-${index}`} id={`eventGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={gradient.start} stopOpacity={1} />
                                            <stop offset="100%" stopColor={gradient.end} stopOpacity={0.8} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <Pie
                                    data={eventsByType}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={3}
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={800}
                                >
                                    {eventsByType.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`url(#eventGradient${index % GRADIENT_COLORS.length})`}
                                            stroke="rgb(var(--bg-primary))"
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgb(var(--bg-secondary))',
                                        borderColor: 'rgb(var(--border-subtle))',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ color: 'rgb(var(--text-primary))', fontWeight: 600 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
