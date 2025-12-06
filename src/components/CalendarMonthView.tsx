import React from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
// import { MapPin } from 'lucide-react';
import type { AgendaEvent } from '../types';

interface CalendarMonthViewProps {
    currentDate: Date;
    events: AgendaEvent[];
    onDateClick: (date: Date) => void;
    onEventClick: (event: AgendaEvent) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
    currentDate,
    events,
    onDateClick,
    onEventClick
}) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const getEventsForDay = (date: Date) => {
        return events.filter(event =>
            isSameDay(new Date(event.startDate), date)
        );
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case 'hearing': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
            case 'deadline': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
            case 'meeting': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
            default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
        }
    };

    return (
        <div className="flex flex-col h-full bg-[rgb(var(--bg-secondary))] rounded-2xl border border-[rgb(var(--border-subtle))] overflow-hidden shadow-sm">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30">
                {weekDays.map(day => (
                    <div key={day} className="py-3 text-center text-sm font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {calendarDays.map((day, dayIdx) => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isDayToday = isToday(day);

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDateClick(day)}
                            className={`
                                min-h-[120px] p-2 border-b border-r border-[rgb(var(--border-subtle))] transition-colors cursor-pointer group
                                ${!isCurrentMonth ? 'bg-[rgb(var(--bg-tertiary))]/20 text-[rgb(var(--text-tertiary))]' : 'bg-[rgb(var(--bg-secondary))]'}
                                ${isDayToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-[rgb(var(--bg-tertiary))]/30'}
                                ${(dayIdx + 1) % 7 === 0 ? 'border-r-0' : ''} 
                            `}
                        >
                            {/* Date Number */}
                            <div className="flex justify-between items-start mb-1">
                                <span className={`
                                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                    ${isDayToday
                                        ? 'bg-[rgb(var(--accent-primary))] text-white shadow-md'
                                        : 'text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--text-primary))]'}
                                `}>
                                    {format(day, 'd')}
                                </span>
                                {dayEvents.length > 0 && (
                                    <span className="text-[10px] font-bold text-[rgb(var(--text-tertiary))] bg-[rgb(var(--bg-tertiary))] px-1.5 py-0.5 rounded-md">
                                        {dayEvents.length}
                                    </span>
                                )}
                            </div>

                            {/* Events List */}
                            <div className="space-y-1.5 overflow-y-auto max-h-[90px] no-scrollbar">
                                {dayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(event);
                                        }}
                                        className={`
                                            px-2 py-1 rounded-md text-xs font-medium border truncate transition-transform hover:scale-[1.02] hover:shadow-sm cursor-pointer
                                            ${getEventColor(event.type)}
                                        `}
                                        title={event.title}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span className="flex-shrink-0 font-bold opacity-75">
                                                {event.startTime}
                                            </span>
                                            <span className="truncate">
                                                {event.title}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
