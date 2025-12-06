import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarToolbarProps {
    currentDate: Date;
    viewMode: 'month' | 'week' | 'day';
    onDateChange: (date: Date) => void;
    onViewChange: (view: 'month' | 'week' | 'day') => void;
    onNewEvent: () => void;
    onSyncGoogle?: () => void;
    onImportICal?: () => void;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
    currentDate,
    viewMode,
    onDateChange,
    onViewChange,
    onNewEvent,
    onSyncGoogle,
    onImportICal
}) => {
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        if (onSyncGoogle) {
            setIsSyncing(true);
            await onSyncGoogle();
            setIsSyncing(false);
        }
    };
    const handleToday = () => {
        onDateChange(new Date());
    };

    const handlePrevious = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setDate(newDate.getDate() - 1);
        }
        onDateChange(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() + 1);
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + 7);
        } else {
            newDate.setDate(newDate.getDate() + 1);
        }
        onDateChange(newDate);
    };

    const getDateLabel = () => {
        if (viewMode === 'month') {
            return format(currentDate, 'MMMM yyyy', { locale: ptBR });
        } else if (viewMode === 'week') {
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - currentDate.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            if (weekStart.getMonth() === weekEnd.getMonth()) {
                return format(weekStart, 'MMMM yyyy', { locale: ptBR });
            } else {
                return `${format(weekStart, 'MMM', { locale: ptBR })} - ${format(weekEnd, 'MMM yyyy', { locale: ptBR })}`;
            }
        } else {
            return format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
        }
    };

    return (
        <div className="bg-[rgb(var(--bg-secondary))] border-b border-[rgb(var(--border-subtle))] px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left: Navigation */}
                <div className="flex items-center gap-4">
                    {/* Today Button */}
                    <button
                        onClick={handleToday}
                        className="px-4 py-2 text-sm font-semibold text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
                    >
                        Hoje
                    </button>

                    {/* Navigation Arrows */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevious}
                            className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                            title="Anterior"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                            title="Próximo"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Current Date Label */}
                    <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] capitalize">
                        {getDateLabel()}
                    </h2>
                </div>

                {/* Center: View Selector */}
                <div className="flex items-center gap-1 bg-[rgb(var(--bg-tertiary))] p-1 rounded-lg">
                    <button
                        onClick={() => onViewChange('month')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'month'
                            ? 'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--accent-primary))] shadow-sm'
                            : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                            }`}
                    >
                        Mês
                    </button>
                    <button
                        onClick={() => onViewChange('week')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'week'
                            ? 'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--accent-primary))] shadow-sm'
                            : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                            }`}
                    >
                        Semana
                    </button>
                    <button
                        onClick={() => onViewChange('day')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === 'day'
                            ? 'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--accent-primary))] shadow-sm'
                            : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                            }`}
                    >
                        Dia
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Google Calendar Sync */}
                    {onSyncGoogle && (
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] disabled:opacity-50"
                            title="Sincronizar com Google Calendar"
                        >
                            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                        </button>
                    )}

                    {/* Import iCal */}
                    {onImportICal && (
                        <button
                            onClick={onImportICal}
                            className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                            title="Importar iCal"
                        >
                            <Download size={18} />
                        </button>
                    )}

                    {/* New Event Button */}
                    <button
                        onClick={onNewEvent}
                        className="btn-premium flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Novo Evento
                    </button>
                </div>
            </div>
        </div>
    );
};
