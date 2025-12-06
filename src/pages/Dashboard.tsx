
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Edit2 } from 'lucide-react';
import { useGlobalData } from '../context/GlobalDataContext';
import { useModal } from '../context/ModalContext';
import { ModuleHeader } from '../components/ModuleHeader';
import {
  Users,
  Scale,
  Calendar,
  CheckCircle,
  Clock,
  ChevronDown,
  DollarSign,
  Activity,
  PieChart as PieChartIcon,
  PowerOff,
  LayoutDashboard,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { RankingWidget, GoalsWidget } from '../components/gamification';
import { formatCNJNumber } from '../utils/formatters';
import { ClientAvatar } from '../components/ClientAvatar';

// Financial Graph Data (mock data)
const financialData = [
  { name: 'Jan', value: 4000 },
  { name: 'Fev', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Abr', value: 2780 },
  { name: 'Mai', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { clients, processes, agendaEvents, updateProcess, intimations } = useGlobalData();
  const { openModal } = useModal();
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);

  // Calculate real statistics
  const stats = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    // Novas Intimações (Unread)
    const newIntimations = intimations.filter(i => !i.isRead).length;

    return [
      {
        label: 'Novas Intimações',
        value: newIntimations.toString(),
        icon: Scale,
        gradient: 'from-blue-500 to-indigo-600',
        bgGradient: 'from-blue-500/10 to-indigo-600/10',
        iconColor: 'text-blue-600 dark:text-blue-400',
        trend: 'Não lidas',
        onClick: () => navigate('/intimations')
      },
      {
        label: 'Audiências',
        value: agendaEvents.filter(e => e.type === 'hearing' && e.status === 'scheduled' && new Date(e.startDate + 'T' + e.startTime) >= now).length.toString(),
        icon: Users,
        gradient: 'from-purple-500 to-pink-600',
        bgGradient: 'from-purple-500/10 to-pink-600/10',
        iconColor: 'text-purple-600 dark:text-purple-400',
        trend: 'Agendadas',
        onClick: () => navigate('/agenda')
      },
      {
        label: 'Prazos Fatais',
        value: agendaEvents.filter(e => e.type === 'deadline' && e.status === 'scheduled' && new Date(e.startDate + 'T' + e.startTime) >= now).length.toString(),
        icon: Clock,
        gradient: 'from-red-500 to-orange-600',
        bgGradient: 'from-red-500/10 to-orange-600/10',
        iconColor: 'text-red-600 dark:text-red-400',
        trend: 'Pendentes',
        onClick: () => navigate('/agenda')
      },
      {
        label: 'Tarefas Pendentes',
        value: agendaEvents.filter(e => e.status === 'scheduled' && e.type !== 'hearing' && e.type !== 'deadline').length.toString(),
        icon: CheckCircle,
        gradient: 'from-emerald-500 to-teal-600',
        bgGradient: 'from-emerald-500/10 to-teal-600/10',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        trend: 'A fazer',
        onClick: () => navigate('/agenda')
      },
    ];
  }, [processes, agendaEvents, intimations, navigate]);

  // Status Data based on real processes
  const statusData = useMemo(() => {
    const active = processes.filter(p => p.status === 'active').length;
    const suspended = processes.filter(p => p.status === 'suspended').length;
    const archived = processes.filter(p => p.status === 'archived').length;
    const finished = processes.filter(p => p.status === 'finished').length;

    return [
      { name: 'Ativos', value: active || 1, color: '#3b82f6' }, // blue-500
      { name: 'Suspensos', value: suspended || 0, color: '#f59e0b' }, // amber-500
      { name: 'Arquivados', value: archived || 0, color: '#6b7280' }, // gray-500
      { name: 'Finalizados', value: finished || 0, color: '#10b981' }, // emerald-500
    ];
  }, [processes]);

  // Recent activities based on real processes (limited to 5)
  const recentActivities = useMemo(() => {
    return processes
      .filter(p => p.status !== 'inactive' && p.status !== 'archived')
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 5)
      .map((proc, index) => {
        const client = clients.find(c => c.id === proc.clientId);

        return {
          id: index + 1,
          processId: proc.id,
          originalProcess: proc,
          client: client?.name || 'Cliente Desconhecido',
          clientObj: client,
          processNumber: formatCNJNumber(proc.number),
          description: `Processo ${proc.status}`,
          status: proc.status,
          type: proc.area || 'Geral',
          date: new Date(proc.updatedAt || proc.createdAt).toLocaleDateString('pt-BR'),
          details: `Valor: R$ ${proc.value.toLocaleString('pt-BR')} `
        };
      });
  }, [processes, clients]);

  // Next acts (Agenda)
  const nextActs = useMemo(() => {
    const now = new Date();
    return agendaEvents
      .filter(e => {
        const eventDate = new Date(e.startDate + 'T' + e.startTime);
        return eventDate >= now && e.status === 'scheduled';
      })
      .sort((a, b) => new Date(a.startDate + 'T' + a.startTime).getTime() - new Date(b.startDate + 'T' + b.startTime).getTime())
      .slice(0, 3)
      .map(e => ({
        id: e.id,
        title: e.title,
        client: clients.find(c => c.id === e.clientId)?.name || 'Geral',
        time: e.startTime,
        date: new Date(e.startDate).toLocaleDateString('pt-BR'),
        type: e.type === 'hearing' ? 'Audiência' : e.type === 'deadline' ? 'Prazo' : 'Reunião'
      }));
  }, [agendaEvents, clients]);

  const toggleActivity = (id: number) => {
    setExpandedActivity(expandedActivity === id ? null : id);
  };

  const handleDeactivateProcess = (processId: string) => {
    if (window.confirm('Tem certeza que deseja desativar este processo? Ele não será mais atualizado pelo DataJud.')) {
      updateProcess(processId, { status: 'inactive' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Module Header */}
      <ModuleHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle="Visão geral do escritório"
      />

      {/* Stats Cards - Premium Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={stat.onClick}
              className="group relative card-premium cursor-pointer overflow-hidden animate-fade-in hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient background overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  {/* Icon with gradient background */}
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${stat.bgGradient} transform group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <Icon size={24} className={stat.iconColor} strokeWidth={2.5} />
                  </div>
                  {/* Trend badge */}
                  <span className="text-xs font-semibold text-[rgb(var(--text-tertiary))] bg-[rgb(var(--bg-tertiary))] px-3 py-1.5 rounded-full border border-[rgb(var(--border-subtle))] group-hover:border-transparent group-hover:bg-white/20 transition-all">
                    {stat.trend}
                  </span>
                </div>

                {/* Value */}
                <h3 className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform duration-300 tracking-tight`}>
                  {stat.value}
                </h3>

                {/* Label */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--text-primary))] transition-colors">
                    {stat.label}
                  </p>
                  <ArrowUpRight size={16} className="text-[rgb(var(--text-tertiary))] opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>

              {/* Hover glow effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-300 -z-10`} />
            </div>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="card-premium overflow-hidden border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--border-strong))] transition-colors">
        <div className="p-6 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center bg-[rgb(var(--bg-secondary))]/30">
          <h2 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
            <div className="p-2 bg-[rgb(var(--accent-primary))]/10 rounded-lg text-[rgb(var(--accent-primary))]">
              <Activity size={20} />
            </div>
            Atividades Recentes
          </h2>
          <button className="text-sm text-[rgb(var(--accent-primary))] hover:text-[rgb(var(--accent-secondary))] hover:underline font-medium transition-colors flex items-center gap-1" onClick={() => navigate('/processes')}>
            Ver todas <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="divide-y divide-[rgb(var(--border-subtle))]">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="transition-all hover:bg-[rgb(var(--bg-tertiary))]/30 group border-l-4 border-transparent hover:border-[rgb(var(--accent-primary))]">
                <div
                  className="p-5 flex items-center gap-6 cursor-pointer"
                  onClick={() => toggleActivity(activity.id)}
                >
                  <ClientAvatar
                    client={activity.clientObj}
                    name={activity.client}
                    size="lg"
                    className="group-hover:scale-105 transition-transform group-hover:shadow-md border border-[rgb(var(--border-subtle))]"
                  />
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                    {/* Client & Date */}
                    <div className="md:col-span-4">
                      <h3 className="text-sm font-bold text-[rgb(var(--text-primary))] truncate group-hover:text-[rgb(var(--accent-primary))] transition-colors mb-1">
                        {activity.client}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-[rgb(var(--text-tertiary))]" />
                        <span className="text-xs text-[rgb(var(--text-tertiary))]">{activity.date}</span>
                      </div>
                    </div>

                    {/* Process Number (CNJ) */}
                    <div className="md:col-span-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wider mb-0.5">Processo</span>
                        <span className="font-mono text-sm font-medium text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--text-primary))] transition-colors select-all">
                          {activity.processNumber}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="md:col-span-3 flex justify-end relative group/status" onClick={(e) => e.stopPropagation()}>
                      <button className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${activity.status === 'active' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' :
                        activity.status === 'suspended' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800' :
                          'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                        }`}>
                        {activity.status === 'active' ? 'Ativo' : activity.status === 'suspended' ? 'Suspenso' : 'Arquivado'}
                        <Edit2 size={10} className="opacity-50" />
                      </button>

                      {/* Status Dropdown */}
                      <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden hidden group-hover/status:block z-50 animate-fade-in">
                        <div className="p-1">
                          <button
                            onClick={() => updateProcess(activity.processId!, { status: 'active' })}
                            className="w-full text-left px-3 py-1.5 text-xs text-green-700 hover:bg-green-50 rounded-md flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            Ativo
                          </button>
                          <button
                            onClick={() => updateProcess(activity.processId!, { status: 'suspended' })}
                            className="w-full text-left px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 rounded-md flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            Suspenso
                          </button>
                          <button
                            onClick={() => updateProcess(activity.processId!, { status: 'inactive' })}
                            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                            Inativo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chevron */}
                  <div className={`transform transition-transform duration-300 p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] ${expandedActivity === activity.id ? 'rotate-180 text-[rgb(var(--accent-primary))]' : 'text-[rgb(var(--text-tertiary))]'}`}>
                    <ChevronDown size={18} />
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedActivity === activity.id && (
                  <div className="px-5 pb-5 pl-[4.5rem] animate-fade-in-down">
                    <div className="bg-[rgb(var(--bg-tertiary))]/30 p-5 rounded-xl border border-[rgb(var(--border-subtle))]">


                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <span className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wider block mb-1">Área / Tipo</span>
                          <div className="flex items-center gap-2">
                            <Scale size={14} className="text-[rgb(var(--accent-primary))]" />
                            <p className="font-medium text-[rgb(var(--text-primary))]">{activity.type}</p>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wider block mb-1">Detalhes Financeiros</span>
                          <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-emerald-500" />
                            <p className="font-medium text-[rgb(var(--text-primary))]">{activity.details}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-[rgb(var(--border-subtle))]">
                        <button
                          onClick={() => openModal('processDetails', activity.originalProcess)}
                          className="btn-premium py-2 px-4 text-xs flex-1 md:flex-none flex items-center justify-center gap-2"
                        >
                          <ArrowUpRight size={14} />
                          Ver Detalhes Completos
                        </button>
                        <button
                          onClick={() => handleDeactivateProcess(activity.processId!)}
                          className="py-2 px-4 text-xs rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 font-medium"
                        >
                          <PowerOff size={14} />
                          Desativar Processo
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-[rgb(var(--text-tertiary))] flex flex-col items-center gap-3">
              <div className="p-4 bg-[rgb(var(--bg-tertiary))] rounded-full">
                <Activity size={24} className="opacity-50" />
              </div>
              <div>
                <p className="font-medium">Nenhuma atividade recente</p>
                <p className="text-sm mt-1 opacity-75">Adicione clientes e processos para começar.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Next Acts, Financial, Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Acts */}
        <div
          className="card-premium p-6 cursor-pointer hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 group border border-[rgb(var(--border-subtle))] hover:border-amber-500/30"
          onClick={() => navigate('/agenda')}
        >
          <h2 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Calendar size={20} />
            </div>
            Próximos Atos
          </h2>
          <div className="space-y-4">
            {nextActs.length > 0 ? (
              nextActs.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-[rgb(var(--bg-tertiary))]/50 border-l-4 border-amber-500 hover:bg-[rgb(var(--bg-tertiary))] transition-all hover:translate-x-1">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-[rgb(var(--text-primary))]">{act.title}</h4>
                    <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">{act.client}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-[rgb(var(--text-tertiary))] bg-[rgb(var(--bg-primary))] px-1.5 py-0.5 rounded border border-[rgb(var(--border-subtle))]">{act.type}</span>
                      <span className="text-[10px] text-[rgb(var(--text-tertiary))]">{act.date}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-lg shadow-sm">
                    {act.time}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[rgb(var(--text-tertiary))] text-sm bg-[rgb(var(--bg-tertiary))]/30 rounded-xl border border-dashed border-[rgb(var(--border-subtle))]">
                <Calendar size={24} className="mx-auto mb-2 opacity-30" />
                Nenhum ato agendado.
              </div>
            )}
            <button className="w-full py-2.5 text-sm text-center text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] transition-colors border-t border-[rgb(var(--border-subtle))] mt-2 font-medium flex items-center justify-center gap-1 group-hover:text-amber-600 dark:group-hover:text-amber-400">
              Ver agenda completa <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
            </button>
          </div>
        </div>

        {/* Financial Graph */}
        <div
          className="card-premium p-6 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group border border-[rgb(var(--border-subtle))] hover:border-emerald-500/30"
          onClick={() => navigate('/financial')}
        >
          <h2 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign size={20} />
            </div>
            Financeiro
          </h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgb(var(--border-subtle))"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'rgb(var(--text-tertiary))', fontWeight: 500 }}
                  dy={10}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.3)',
                    backgroundColor: 'rgba(var(--bg-secondary), 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: 'rgb(var(--text-primary))',
                    padding: '12px 16px',
                    fontWeight: 600
                  }}
                  itemStyle={{ color: '#10b981', fontSize: '14px' }}
                  cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '5 5' }}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')} `}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', strokeOpacity: 0.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Graph */}
        <div className="card-premium p-6 border border-[rgb(var(--border-subtle))] hover:border-blue-500/30 transition-colors">
          <h2 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <PieChartIcon size={20} />
            </div>
            Estado dos Processos
          </h2>
          <div className="h-48 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
                  </filter>
                </defs>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1200}
                  animationEasing="ease-out"
                  cornerRadius={6}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell - ${index} `}
                      fill={entry.color}
                      stroke="transparent"
                      filter="url(#shadow)"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid rgb(var(--border-subtle))',
                    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
                    backgroundColor: 'rgba(var(--bg-secondary), 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: 'rgb(var(--text-primary))',
                    padding: '12px 16px',
                    fontWeight: 600
                  }}
                  formatter={(value: number, name: string) => [`${value} processo${value !== 1 ? 's' : ''} `, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-3xl font-bold text-[rgb(var(--text-primary))]">
                  {statusData.reduce((sum, item) => sum + item.value, 0)}
                </div>
                <div className="text-xs text-[rgb(var(--text-tertiary))] font-medium mt-1 uppercase tracking-wider">
                  Total
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-2 flex-wrap">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-[rgb(var(--text-secondary))] font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gamification Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingWidget />
        <GoalsWidget />
      </div>
    </div>
  );
};
