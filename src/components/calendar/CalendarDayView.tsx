import React from 'react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, MapPin } from 'lucide-react';
import type { AgendaEvent } from '../../types';

interface CalendarDayViewProps {
    currentDate: Date;
    events: AgendaEvent[];
    onEventClick: (event: AgendaEvent) => void;
    onTimeSlotClick?: (time: string) => void;
}

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
    currentDate,
    events,
    onEventClick,
    onTimeSlotClick
}) => {
    // Generate time slots (30-minute intervals)
    const timeSlots = Array.from({ length: 48 }, (_, i) => {
        const hour = Math.floor(i / 2);
        const minute = (i % 2) * 30;
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    });

    // Get events for current day
    const dayEvents = events.filter(event =>
        isSameDay(new Date(event.startDate), currentDate)
    );

    // Separate all-day and timed events
    const allDayEvents = dayEvents.filter(event => !event.startTime || event.startTime === '00:00');
    const timedEvents = dayEvents.filter(event => event.startTime && event.startTime !== '00:00');

    // Sort timed events by start time
    const sortedTimedEvents = [...timedEvents].sort((a, b) => {
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        return timeA.localeCompare(timeB);
    });

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

        const pixelsPerMinute = 60 / 30; // 60px per 30 minutes
        const top = startMinutes * pixelsPerMinute;
        const height = Math.max(durationMinutes * pixelsPerMinute, 40); // Minimum 40px

        return { top, height };
    };

    // Get event color by type
    const getEventColor = (type: string) => {
        switch (type) {
            case 'hearing': return 'bg-red-500 border-red-600 text-white';
            case 'deadline': return 'bg-orange-500 border-orange-600 text-white';
            case 'meeting': return 'bg-blue-500 border-blue-600 text-white';
            case 'task': return 'bg-green-500 border-green-600 text-white';
            default: return 'bg-purple-500 border-purple-600 text-white';
        }
    };

    const getEventColorLight = (type: string) => {
        switch (type) {
            case 'hearing': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300';
            case 'deadline': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300';
            case 'meeting': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
            case 'task': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300';
            default: return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300';
        }
    };

    return (
        <div className="flex gap-6 h-full">
            {/* Main Timeline */}
            <div className="flex-1 overflow-auto">
                <div className="bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-subtle))]">
                    {/* Date Header */}
                    <div className="p-6 border-b border-[rgb(var(--border-subtle))]">
                        <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                            {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                        </h2>
                    </div>

                    {/* All-day events */}
                    {allDayEvents.length > 0 && (
                        <div className="p-4 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]">
                            <div className="text-xs font-semibold text-[rgb(var(--text-tertiary))] mb-2">
                                DIA INTEIRO
                            </div>
                            <div className="space-y-2">
                                {allDayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        onClick={() => onEventClick(event)}
                                        className={`${getEventColor(event.type)} px-3 py-2 rounded-lg cursor-pointer hover:opacity-90 transition-opacity border-l-4`}
                                    >
                                        <div className="font-semibold">{event.title}</div>
                                        {event.location && (
                                            <div className="text-xs opacity-90 mt-1">📍 {event.location}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="relative">
                        {/* Time slots */}
                        {timeSlots.map((time, index) => (
                            <div
                                key={time}
                                className="flex border-b border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-tertiary))] transition-colors cursor-pointer"
                                onClick={() => onTimeSlotClick && onTimeSlotClick(time)}
                            >
                                <div className="w-20 flex-shrink-0 p-2 text-xs font-medium text-[rgb(var(--text-tertiary))] text-right">
                                    {index % 2 === 0 ? time : ''}
                                </div>
                                <div className="flex-1 h-[60px]"></div>
                            </div>
                        ))}

                        {/* Events overlay */}
                        <div className="absolute inset-0 left-20 pointer-events-none">
                            {timedEvents.map(event => {
                                const { top, height } = getEventStyle(event);
                                return (
                                    <div
                                        key={event.id}
                                        className={`absolute left-2 right-2 ${getEventColor(event.type)} px-3 py-2 rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity pointer-events-auto border-l-4 overflow-hidden`}
                                        style={{ top: `${top}px`, height: `${height}px` }}
                                        onClick={() => onEventClick(event)}
                                    >
                                        <div className="font-bold text-sm">{event.title}</div>
                                        <div className="text-xs opacity-90 mt-0.5">
                                            {event.startTime}
                                            {event.endTime && ` - ${event.endTime}`}
                                        </div>
                                        {height > 60 && event.location && (
                                            <div className="text-xs opacity-75 mt-1">
                                                📍 {event.location}
                                            </div>
                                        )}
                                        {height > 80 && event.description && (
                                            <div className="text-xs opacity-75 mt-1 line-clamp-2">
                                                {event.description}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar - Events List */}
            <div className="w-80 flex-shrink-0 space-y-4">
                {/* Summary Card */}
                <div className="card-premium p-4">
                    <h3 className="font-bold text-[rgb(var(--text-primary))] mb-2">
                        Resumo do Dia
                    </h3>
                    <div className="text-sm text-[rgb(var(--text-secondary))]">
                        {dayEvents.length === 0 ? (
                            <p>Nenhum evento agendado</p>
                        ) : (
                            <p>{dayEvents.length} evento(s) agendado(s)</p>
                        )}
                    </div>
                </div>

                {/* Events List */}
                {sortedTimedEvents.length > 0 && (
                    <div className="card-premium p-4">
                        <h3 className="font-bold text-[rgb(var(--text-primary))] mb-3 flex items-center gap-2">
                            <Clock size={16} />
                            Eventos do Dia
                        </h3>
                        <div className="space-y-2">
                            {sortedTimedEvents.map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => onEventClick(event)}
                                    className={`${getEventColorLight(event.type)} p-3 rounded-lg cursor-pointer hover:shadow-md transition-all border-l-4`}
                                >
                                    <div className="font-semibold text-sm mb-1">
                                        {event.title}
                                    </div>
                                    <div className="text-xs opacity-75 flex items-center gap-1">
                                        <Clock size={12} />
                                        {event.startTime}
                                        {event.endTime && ` - ${event.endTime}`}
                                    </div>
                                    {event.location && (
                                        <div className="text-xs opacity-75 flex items-center gap-1 mt-1">
                                            <MapPin size={12} />
                                            {event.location}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All-day events in sidebar */}
                {allDayEvents.length > 0 && (
                    <div className="card-premium p-4">
                        <h3 className="font-bold text-[rgb(var(--text-primary))] mb-3">
                            Dia Inteiro
                        </h3>
                        <div className="space-y-2">
                            {allDayEvents.map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => onEventClick(event)}
                                    className={`${getEventColorLight(event.type)} p-3 rounded-lg cursor-pointer hover:shadow-md transition-all border-l-4`}
                                >
                                    <div className="font-semibold text-sm">
                                        {event.title}
                                    </div>
                                    {event.location && (
                                        <div className="text-xs opacity-75 flex items-center gap-1 mt-1">
                                            <MapPin size={12} />
                                            {event.location}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
