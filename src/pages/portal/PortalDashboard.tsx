import React from 'react';
import { usePortalAuth } from '../../hooks/usePortalAuth';
import { FileText, Bell, Calendar, LogOut, ChevronRight } from 'lucide-react';

export const PortalDashboard: React.FC = () => {
    const { client, logout } = usePortalAuth();

    // Mock data for now
    const processes = [
        { id: '1', number: '0012345-67.2024.8.26.0100', title: 'Ação de Indenização', status: 'Em Andamento', lastUpdate: '28/11/2024' },
        { id: '2', number: '0054321-99.2023.8.26.0100', title: 'Inventário', status: 'Aguardando Decisão', lastUpdate: '15/11/2024' },
    ];

    const notifications = [
        { id: '1', title: 'Nova movimentação no processo 0012345...', date: 'Hoje, 14:30', read: false },
        { id: '2', title: 'Documento anexado: Petição Inicial', date: 'Ontem, 09:15', read: true },
    ];

    return (
        <div className="container mx-auto px-4 pb-12">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                        Olá, {client?.name?.split(' ')[0] || 'Cliente'}
                    </h1>
                    <p className="text-[rgb(var(--text-secondary))]">
                        Bem-vindo ao seu portal exclusivo.
                    </p>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                >
                    <LogOut size={16} />
                    Sair
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Processes */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card-premium p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="text-[rgb(var(--accent-primary))]" size={20} />
                                Seus Processos
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {processes.map(proc => (
                                <div key={proc.id} className="p-4 rounded-xl bg-[rgb(var(--bg-tertiary))]/50 border border-[rgb(var(--border-primary))] hover:border-[rgb(var(--accent-primary))] transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                                                {proc.title}
                                            </h3>
                                            <p className="text-sm text-[rgb(var(--text-secondary))] mt-1 font-mono">
                                                {proc.number}
                                            </p>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))]">
                                            {proc.status}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-xs text-[rgb(var(--text-tertiary))]">
                                        <span>Última atualização: {proc.lastUpdate}</span>
                                        <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Notifications & Events */}
                <div className="space-y-6">
                    {/* Notifications */}
                    <div className="card-premium p-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                            <Bell className="text-[rgb(var(--accent-secondary))]" size={20} />
                            Notificações
                        </h2>
                        <div className="space-y-3">
                            {notifications.map(notif => (
                                <div key={notif.id} className={`p-3 rounded-lg border ${notif.read ? 'border-transparent bg-[rgb(var(--bg-tertiary))]/30' : 'border-[rgb(var(--accent-secondary))]/30 bg-[rgb(var(--accent-secondary))]/5'}`}>
                                    <p className={`text-sm ${notif.read ? 'text-[rgb(var(--text-secondary))]' : 'text-[rgb(var(--text-primary))] font-medium'}`}>
                                        {notif.title}
                                    </p>
                                    <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">
                                        {notif.date}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Events (Mock) */}
                    <div className="card-premium p-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                            <Calendar className="text-green-500" size={20} />
                            Próximos Eventos
                        </h2>
                        <div className="text-center py-8 text-[rgb(var(--text-tertiary))] text-sm">
                            Nenhum evento agendado para os próximos dias.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
