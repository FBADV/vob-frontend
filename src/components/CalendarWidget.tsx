import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarWidgetProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    tasks?: { date: string; count: number }[]; // Array of dates with task counts
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ selectedDate, onDateSelect, tasks = [] }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const getTaskCountForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const task = tasks.find(t => t.date === dateStr);
        return task ? task.count : 0;
    };

    return (
        <div className="card-premium p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[rgb(var(--text-primary))] capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-full text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-full text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 mb-3">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase py-1 tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isTodayDate = isToday(day);
                    const taskCount = getTaskCountForDate(day);

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => onDateSelect(day)}
                            className={`
                                relative h-10 w-full flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200
                                ${!isCurrentMonth ? 'text-[rgb(var(--text-tertiary))]/50' : 'text-[rgb(var(--text-secondary))]'}
                                ${isSelected
                                    ? 'bg-[rgb(var(--accent-primary))] text-white shadow-lg shadow-[rgb(var(--accent-primary))]/30 scale-105 font-bold'
                                    : 'hover:bg-[rgb(var(--bg-tertiary))] hover:text-[rgb(var(--text-primary))]'}
                                ${isTodayDate && !isSelected ? 'border border-[rgb(var(--accent-primary))] text-[rgb(var(--accent-primary))] font-bold' : ''}
                            `}
                        >
                            {format(day, 'd')}
                            {taskCount > 0 && (
                                <span className={`
                                    absolute bottom-1.5 w-1.5 h-1.5 rounded-full 
                                    ${isSelected ? 'bg-white' : 'bg-[rgb(var(--accent-primary))]'}
                                `} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
