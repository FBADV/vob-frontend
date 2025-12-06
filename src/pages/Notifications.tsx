import React, { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, XCircle, Info, Trash2, Check, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobalData } from '../context/GlobalDataContext';
import type { Notification } from '../types';

export const Notifications: React.FC = () => {
    const {
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearNotifications,
        acceptConnectionRequest,
        rejectConnectionRequest
    } = useGlobalData();

    // Local state for filter
    const [filter, setFilter] = useState<'all' | 'unread' | 'info' | 'success' | 'warning' | 'error'>('all');





    const handleConnectionAction = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            if (action === 'accept') {
                await acceptConnectionRequest(requestId);
                toast.success('Conexão aceita com sucesso');
            } else {
                await rejectConnectionRequest(requestId);
                toast.success('Conexão recusada');
            }
            // Remove notification after action - relying on context update or local optimisic update
            deleteNotification(requestId);
        } catch (error) {
            toast.error('Erro ao processar solicitação');
        }
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={20} className="text-yellow-500" />;
            case 'error': return <XCircle size={20} className="text-red-500" />;
            case 'info': return <Info size={20} className="text-blue-500" />;
            default: return <Bell size={20} className="text-[rgb(var(--accent-primary))]" />;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    });

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-3">
                        <Bell className="text-[rgb(var(--accent-primary))]" />
                        Central de Notificações
                    </h1>
                    <p className="text-[rgb(var(--text-secondary))] mt-1">
                        Acompanhe todas as atualizações e alertas do sistema
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={markAllNotificationsAsRead}
                        className="btn-secondary-premium flex items-center gap-2 text-sm"
                        title="Marcar todas como lidas"
                    >
                        <Check size={16} />
                        <span className="hidden sm:inline">Marcar todas como lidas</span>
                    </button>
                    <button
                        onClick={clearNotifications}
                        className="p-2 text-[rgb(var(--text-secondary))] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Limpar todas"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                <Filter size={16} className="text-[rgb(var(--text-tertiary))] mr-2 flex-shrink-0" />
                {[
                    { id: 'all', label: 'Todas' },
                    { id: 'unread', label: 'Não lidas' },
                    { id: 'success', label: 'Sucesso' },
                    { id: 'warning', label: 'Alertas' },
                    { id: 'error', label: 'Erros' },
                    { id: 'info', label: 'Info' }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id as any)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === f.id
                            ? 'bg-[rgb(var(--accent-primary))] text-white shadow-md'
                            : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-20 bg-[rgb(var(--bg-secondary))] rounded-3xl border border-[rgb(var(--border-subtle))]">
                        <div className="w-16 h-16 bg-[rgb(var(--bg-tertiary))] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={32} className="text-[rgb(var(--text-tertiary))]" />
                        </div>
                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Tudo limpo por aqui!</h3>
                        <p className="text-[rgb(var(--text-secondary))]">Nenhuma notificação encontrada com os filtros atuais.</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`group relative p-5 rounded-2xl border transition-all duration-300 ${notification.read
                                ? 'bg-[rgb(var(--bg-secondary))] border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--border-default))]'
                                : 'bg-[rgb(var(--bg-elevated))] border-[rgb(var(--accent-primary))]/20 shadow-sm hover:shadow-md'
                                }`}
                        >
                            <div className="flex gap-4 items-start">
                                <div className={`p-2.5 rounded-xl ${notification.read ? 'bg-[rgb(var(--bg-tertiary))]' : 'bg-[rgb(var(--bg-secondary))] shadow-sm'
                                    }`}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h3 className={`font-bold text-base truncate ${notification.read ? 'text-[rgb(var(--text-primary))]' : 'text-[rgb(var(--accent-primary))]'
                                            }`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs font-medium text-[rgb(var(--text-tertiary))] whitespace-nowrap">
                                            {notification.date} • {notification.time}
                                        </span>
                                    </div>
                                    <p className="text-[rgb(var(--text-secondary))] text-sm leading-relaxed">
                                        {notification.message}
                                    </p>
                                    {notification.type === 'info' && notification.message.includes('Solicitação de conexão') && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleConnectionAction(notification.id, 'accept');
                                                }}
                                                className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                                            >
                                                Aceitar
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleConnectionAction(notification.id, 'reject');
                                                }}
                                                className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                Recusar
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notification.read && (
                                        <button
                                            onClick={() => markNotificationAsRead(notification.id)}
                                            className="p-2 rounded-lg hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--accent-primary))]"
                                            title="Marcar como lida"
                                        >
                                            <Check size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[rgb(var(--text-tertiary))] hover:text-red-500"
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            {!notification.read && (
                                <div className="absolute top-5 right-5 w-2 h-2 bg-[rgb(var(--accent-primary))] rounded-full animate-pulse md:hidden"></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
