import React from 'react';
import { Clock, Plus } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AgendaEvent } from '../../types';

interface CalendarSidebarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    events: AgendaEvent[];
    onCreateEvent: () => void;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
    selectedDate,
    onDateSelect,
    events,
    onCreateEvent
}) => {
    const [miniCalDate, setMiniCalDate] = React.useState(selectedDate);

    const monthStart = startOfMonth(miniCalDate);
    const monthEnd = endOfMonth(miniCalDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get upcoming events (next 5)
    const upcomingEvents = events
        .filter(e => new Date(e.startDate) >= new Date())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 5);

    const getEventColor = (type: string) => {
        switch (type) {
            case 'hearing': return 'bg-red-500';
            case 'deadline': return 'bg-orange-500';
            case 'meeting': return 'bg-blue-500';
            case 'task': return 'bg-green-500';
            default: return 'bg-purple-500';
        }
    };

    const hasEvents = (date: Date) => {
        return events.some(e => isSameDay(new Date(e.startDate), date));
    };

    return (
        <div className="w-64 flex-shrink-0 space-y-4">
            {/* Create Event Button */}
            <button
                onClick={onCreateEvent}
                className="w-full btn-premium flex items-center justify-center gap-2 py-3"
            >
                <Plus size={20} />
                Novo Evento
            </button>

            {/* Mini Calendar */}
            <div className="card-premium p-4">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => setMiniCalDate(subMonths(miniCalDate, 1))}
                        className="p-1 hover:bg-[rgb(var(--bg-tertiary))] rounded transition-colors"
                    >
                        ‹
                    </button>
                    <h3 className="text-sm font-bold text-[rgb(var(--text-primary))] capitalize">
                        {format(miniCalDate, 'MMMM yyyy', { locale: ptBR })}
                    </h3>
                    <button
                        onClick={() => setMiniCalDate(addMonths(miniCalDate, 1))}
                        className="p-1 hover:bg-[rgb(var(--bg-tertiary))] rounded transition-colors"
                    >
                        ›
                    </button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-xs font-medium text-[rgb(var(--text-tertiary))]">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, i) => {
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentDay = isToday(day);
                        const isCurrentMonth = isSameMonth(day, miniCalDate);
                        const dayHasEvents = hasEvents(day);

                        return (
                            <button
                                key={i}
                                onClick={() => onDateSelect(day)}
                                className={`
                                    aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all relative
                                    ${!isCurrentMonth ? 'text-[rgb(var(--text-tertiary))]/40' : ''}
                                    ${isSelected ? 'bg-[rgb(var(--accent-primary))] text-white font-bold' : ''}
                                    ${!isSelected && isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold' : ''}
                                    ${!isSelected && !isCurrentDay ? 'hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-primary))]' : ''}
                                `}
                            >
                                {format(day, 'd')}
                                {dayHasEvents && (
                                    <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[rgb(var(--accent-primary))]'}`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="card-premium p-4">
                <h3 className="text-sm font-bold text-[rgb(var(--text-primary))] mb-3 flex items-center gap-2">
                    <Clock size={16} />
                    Próximos Eventos
                </h3>
                <div className="space-y-2">
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map(event => (
                            <div
                                key={event.id}
                                className="flex items-start gap-2 p-2 rounded-lg hover:bg-[rgb(var(--bg-tertiary))] transition-colors cursor-pointer"
                            >
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getEventColor(event.type)}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-[rgb(var(--text-primary))] truncate">
                                        {event.title}
                                    </p>
                                    <p className="text-[10px] text-[rgb(var(--text-secondary))]">
                                        {format(new Date(event.startDate), "d 'de' MMM", { locale: ptBR })} • {event.startTime}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-[rgb(var(--text-tertiary))] text-center py-4">
                            Nenhum evento próximo
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
