import React, { useMemo } from 'react';
import { Clock, MapPin, Calendar as CalendarIcon, MoreVertical, AlertCircle, Gavel, Users, FileText, Edit, Trash2 } from 'lucide-react';
import { useGlobalData } from '../../context/GlobalDataContext';
import type { AgendaEvent } from '../../types';
import { EventModal } from '../EventModal';

export const AgendaDailySummary: React.FC = () => {
    const { agendaEvents, deleteAgendaEvent } = useGlobalData();
    const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
    const [eventToEdit, setEventToEdit] = React.useState<AgendaEvent | null>(null);
    const [showEditModal, setShowEditModal] = React.useState(false);

    const eventsToShow = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];

        return agendaEvents
            .filter(e => {
                const isToday = e.startDate === today;
                const isOverdue = e.startDate < today && e.status === 'scheduled';
                return (isToday || isOverdue) && e.status !== 'canceled';
            })
            .sort((a, b) => {
                // Sort by date first (oldest first for overdue), then by time
                if (a.startDate !== b.startDate) {
                    return a.startDate.localeCompare(b.startDate);
                }
                return a.startTime.localeCompare(b.startTime);
            });
    }, [agendaEvents]);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir este evento?')) {
            deleteAgendaEvent(id);
            setActiveMenuId(null);
        }
    };

    const handleEdit = (event: AgendaEvent, e: React.MouseEvent) => {
        e.stopPropagation();
        setEventToEdit(event);
        setShowEditModal(true);
        setActiveMenuId(null);
    };

    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const todayDate = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    const getEventSymbol = (type: AgendaEvent['type']) => {
        switch (type) {
            case 'hearing':
                return {
                    icon: <Gavel size={18} />,
                    bg: 'bg-purple-100 dark:bg-purple-900/30',
                    text: 'text-purple-600 dark:text-purple-400',
                    border: 'border-purple-200 dark:border-purple-800'
                };
            case 'deadline':
                return {
                    icon: <Clock size={18} />,
                    bg: 'bg-red-100 dark:bg-red-900/30',
                    text: 'text-red-600 dark:text-red-400',
                    border: 'border-red-200 dark:border-red-800'
                };
            case 'meeting':
                return {
                    icon: <Users size={18} />,
                    bg: 'bg-blue-100 dark:bg-blue-900/30',
                    text: 'text-blue-600 dark:text-blue-400',
                    border: 'border-blue-200 dark:border-blue-800'
                };
            case 'diligence':
                return {
                    icon: <FileText size={18} />,
                    bg: 'bg-amber-100 dark:bg-amber-900/30',
                    text: 'text-amber-600 dark:text-amber-400',
                    border: 'border-amber-200 dark:border-amber-800'
                };
            default:
                return {
                    icon: <CalendarIcon size={18} />,
                    bg: 'bg-gray-100 dark:bg-gray-800',
                    text: 'text-gray-600 dark:text-gray-400',
                    border: 'border-gray-200 dark:border-gray-700'
                };
        }
    };

    const isOverdue = (date: string) => {
        const today = new Date().toISOString().split('T')[0];
        return date < today;
    };

    return (
        <>
            <div className="w-80 bg-[rgb(var(--bg-secondary))] border-l border-[rgb(var(--border-subtle))] h-full flex flex-col animate-slide-in-right hidden xl:flex">
                <div className="p-6 border-b border-[rgb(var(--border-subtle))]">
                    <h2 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                        <CalendarIcon size={20} className="text-[rgb(var(--accent-primary))]" />
                        Resumo e Pendências
                    </h2>
                    <p className="text-sm text-[rgb(var(--text-secondary))] capitalize mt-1">
                        {todayDate}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {eventsToShow.length > 0 ? (
                        eventsToShow.map(event => {
                            const overdue = isOverdue(event.startDate);
                            const symbol = getEventSymbol(event.type);

                            return (
                                <div key={event.id} className={`group relative border rounded-2xl p-4 transition-all hover:shadow-md cursor-pointer ${overdue
                                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                                    : 'bg-[rgb(var(--bg-secondary))] border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent-primary))]/30'
                                    }`}>

                                    <div className="flex gap-3">
                                        {/* Premium Symbol */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${symbol.bg} ${symbol.text} ${symbol.border}`}>
                                            {symbol.icon}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={`font-bold text-sm line-clamp-2 ${overdue ? 'text-red-700 dark:text-red-400' : 'text-[rgb(var(--text-primary))]'}`}>
                                                    {event.title}
                                                </h3>
                                                <div className="relative ml-2">
                                                    <button
                                                        onClick={(e) => toggleMenu(event.id, e)}
                                                        className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-[rgb(var(--bg-tertiary))]"
                                                    >
                                                        <MoreVertical size={14} />
                                                    </button>

                                                    {activeMenuId === event.id && (
                                                        <div className="absolute right-0 top-full mt-1 w-32 bg-[rgb(var(--bg-secondary))] rounded-lg shadow-lg border border-[rgb(var(--border-subtle))] z-10 overflow-hidden animate-scale-in">
                                                            <button
                                                                onClick={(e) => handleEdit(event, e)}
                                                                className="w-full text-left px-3 py-2 text-xs font-medium text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] hover:text-[rgb(var(--text-primary))] flex items-center gap-2"
                                                            >
                                                                <Edit size={12} />
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDelete(event.id, e)}
                                                                className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                            >
                                                                <Trash2 size={12} />
                                                                Excluir
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {overdue && (
                                                <div className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 mb-1.5">
                                                    <AlertCircle size={12} />
                                                    <span>Atrasado ({new Date(event.startDate).toLocaleDateString('pt-BR')})</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 text-xs text-[rgb(var(--text-secondary))] mb-1">
                                                <Clock size={12} className="text-[rgb(var(--text-tertiary))]" />
                                                <span>{event.startTime} - {event.endTime}</span>
                                            </div>

                                            {event.location && (
                                                <div className="flex items-center gap-2 text-xs text-[rgb(var(--text-tertiary))]">
                                                    <MapPin size={12} />
                                                    <span className="truncate">{event.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 text-[rgb(var(--text-tertiary))]">
                            <div className="w-16 h-16 bg-[rgb(var(--bg-tertiary))] rounded-full flex items-center justify-center mx-auto mb-4">
                                <CalendarIcon size={24} className="opacity-50" />
                            </div>
                            <p className="text-sm font-medium">Tudo em dia!</p>
                            <p className="text-xs mt-1">Nenhuma pendência ou compromisso.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-secondary))]">
                    <div className="flex items-center justify-between text-xs text-[rgb(var(--text-tertiary))]">
                        <span>{eventsToShow.length} itens</span>
                        <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <EventModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEventToEdit(null);
                    }}
                    eventToEdit={eventToEdit}
                />
            )}
        </>
    );
};
