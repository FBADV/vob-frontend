import React from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AgendaEvent } from '../../types';

interface CalendarWeekViewProps {
    currentDate: Date;
    events: AgendaEvent[];
    onEventClick: (event: AgendaEvent) => void;
    onTimeSlotClick?: (date: Date, time: string) => void;
}

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
    currentDate,
    events,
    onEventClick,
    onTimeSlotClick
}) => {
    // Get week days (Sunday to Saturday)
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Hours for timeline (00:00 to 23:00)
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Get events for a specific day
    const getEventsForDay = (day: Date) => {
        return events.filter(event => isSameDay(new Date(event.startDate), day));
    };

    // Get all-day events for a specific day
    const getAllDayEvents = (day: Date) => {
        return getEventsForDay(day).filter(event => !event.startTime || event.startTime === '00:00');
    };

    // Get timed events for a specific day
    const getTimedEvents = (day: Date) => {
        return getEventsForDay(day).filter(event => event.startTime && event.startTime !== '00:00');
    };

    // Calculate event position and height
    const getEventStyle = (event: AgendaEvent) => {
        if (!event.startTime) return { top: 0, height: 60 };

        const [startHour, startMinute] = event.startTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;

        let durationMinutes = 60; // Default 1 hour
        if (event.endTime) {
            const [endHour, endMinute] = event.endTime.split(':').map(Number);
            const endMinutes = endHour * 60 + endMinute;
            durationMinutes = endMinutes - startMinutes;
        }

        const pixelsPerMinute = 60 / 60; // 60px per hour
        const top = startMinutes * pixelsPerMinute;
        const height = Math.max(durationMinutes * pixelsPerMinute, 30); // Minimum 30px

        return { top, height };
    };

    // Get event color by type
    const getEventColor = (type: string) => {
        switch (type) {
            case 'hearing': return 'bg-red-500 border-red-600';
            case 'deadline': return 'bg-orange-500 border-orange-600';
            case 'meeting': return 'bg-blue-500 border-blue-600';
            case 'task': return 'bg-green-500 border-green-600';
            default: return 'bg-purple-500 border-purple-600';
        }
    };

    return (
        <div className="flex flex-col h-full bg-[rgb(var(--bg-primary))]">
            {/* Header with days */}
            <div className="grid grid-cols-8 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-secondary))] sticky top-0 z-10">
                {/* Time column header */}
                <div className="p-4 border-r border-[rgb(var(--border-subtle))]"></div>

                {/* Day headers */}
                {weekDays.map((day, i) => {
                    const isCurrentDay = isToday(day);
                    return (
                        <div
                            key={i}
                            className={`p-4 text-center border-r border-[rgb(var(--border-subtle))] ${isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                        >
                            <div className="text-xs font-medium text-[rgb(var(--text-tertiary))] uppercase">
                                {format(day, 'EEE', { locale: ptBR })}
                            </div>
                            <div
                                className={`text-2xl font-bold mt-1 ${isCurrentDay
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-[rgb(var(--text-primary))]'
                                    }`}
                            >
                                {format(day, 'd')}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* All-day events section */}
            <div className="grid grid-cols-8 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-secondary))]">
                <div className="p-2 border-r border-[rgb(var(--border-subtle))] text-xs font-medium text-[rgb(var(--text-tertiary))]">
                    Dia inteiro
                </div>
                {weekDays.map((day, i) => {
                    const allDayEvents = getAllDayEvents(day);
                    return (
                        <div
                            key={i}
                            className="p-2 border-r border-[rgb(var(--border-subtle))] min-h-[60px]"
                        >
                            {allDayEvents.map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => onEventClick(event)}
                                    className={`${getEventColor(event.type)} text-white text-xs px-2 py-1 rounded mb-1 cursor-pointer hover:opacity-90 transition-opacity border-l-4`}
                                >
                                    <div className="font-semibold truncate">{event.title}</div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Timeline grid */}
            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-8 relative">
                    {/* Time labels column */}
                    <div className="border-r border-[rgb(var(--border-subtle))]">
                        {hours.map(hour => (
                            <div
                                key={hour}
                                className="h-[60px] border-b border-[rgb(var(--border-subtle))] px-2 py-1 text-xs font-medium text-[rgb(var(--text-tertiary))]"
                            >
                                {hour.toString().padStart(2, '0')}:00
                            </div>
                        ))}
                    </div>

                    {/* Day columns with events */}
                    {weekDays.map((day, dayIndex) => {
                        const timedEvents = getTimedEvents(day);
                        const isCurrentDay = isToday(day);

                        return (
                            <div
                                key={dayIndex}
                                className={`relative border-r border-[rgb(var(--border-subtle))] ${isCurrentDay ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                                    }`}
                            >
                                {/* Hour grid lines */}
                                {hours.map(hour => (
                                    <div
                                        key={hour}
                                        className="h-[60px] border-b border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-tertiary))] transition-colors cursor-pointer"
                                        onClick={() => {
                                            if (onTimeSlotClick) {
                                                onTimeSlotClick(day, `${hour.toString().padStart(2, '0')}:00`);
                                            }
                                        }}
                                    />
                                ))}

                                {/* Events overlay */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {timedEvents.map(event => {
                                        const { top, height } = getEventStyle(event);
                                        return (
                                            <div
                                                key={event.id}
                                                className={`absolute left-1 right-1 ${getEventColor(event.type)} text-white text-xs px-2 py-1 rounded shadow-md cursor-pointer hover:opacity-90 transition-opacity pointer-events-auto border-l-4 overflow-hidden`}
                                                style={{ top: `${top}px`, height: `${height}px` }}
                                                onClick={() => onEventClick(event)}
                                            >
                                                <div className="font-semibold truncate">{event.title}</div>
                                                <div className="text-[10px] opacity-90">
                                                    {event.startTime}
                                                    {event.endTime && ` - ${event.endTime}`}
                                                </div>
                                                {height > 40 && event.location && (
                                                    <div className="text-[10px] opacity-75 truncate mt-0.5">
                                                        📍 {event.location}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
