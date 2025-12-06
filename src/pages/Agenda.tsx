import React, { useState } from 'react';
import { useGlobalData } from '../context/GlobalDataContext';
import { EventModal } from '../components/EventModal';
import { CalendarMonthView } from '../components/CalendarMonthView';
import { CalendarToolbar } from '../components/calendar/CalendarToolbar';
import { CalendarWeekView } from '../components/calendar/CalendarWeekView';
import { CalendarDayView } from '../components/calendar/CalendarDayView';
import { AgendaDailySummary } from '../components/calendar/AgendaDailySummary';
import { googleCalendarService } from '../services/GoogleCalendarService';
import { ICalService } from '../services/ical.service';
import type { AgendaEvent } from '../types';

export const Agenda: React.FC = () => {
    const { agendaEvents, addAgendaEvent, settings } = useGlobalData();

    // View state
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal state
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

    // Event handlers
    const handleNewEvent = () => {
        setSelectedEvent(null);
        setShowEventModal(true);
    };

    const handleEventClick = (event: AgendaEvent) => {
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    // Google Calendar Sync
    const handleSyncGoogle = async () => {
        if (!settings?.integrations.calendarSync || !settings?.integrations.googleClientId || !settings?.integrations.googleApiKey) {
            alert('Configure Google Calendar nas configurações primeiro.');
            return;
        }

        try {
            await googleCalendarService.initialize(settings.integrations.googleClientId, settings.integrations.googleApiKey);
            await googleCalendarService.initiateAuth();
            const events = await googleCalendarService.listEvents();

            // Convert and add Google events
            events.forEach((gEvent: any) => {
                const newEvent: AgendaEvent = {
                    id: crypto.randomUUID(),
                    title: gEvent.summary || 'Sem título',
                    startDate: gEvent.start.dateTime ? new Date(gEvent.start.dateTime).toISOString().split('T')[0] : gEvent.start.date,
                    startTime: gEvent.start.dateTime ? new Date(gEvent.start.dateTime).toTimeString().slice(0, 5) : '00:00',
                    endDate: gEvent.end.dateTime ? new Date(gEvent.end.dateTime).toISOString().split('T')[0] : gEvent.end.date,
                    endTime: gEvent.end.dateTime ? new Date(gEvent.end.dateTime).toTimeString().slice(0, 5) : '23:59',
                    type: 'other',
                    status: 'scheduled',
                    description: gEvent.description,
                    location: gEvent.location,
                    createdAt: new Date().toISOString()
                };
                addAgendaEvent(newEvent);
            });

            alert(`${events.length} eventos importados do Google Calendar!`);
        } catch (error) {
            console.error('Erro ao sincronizar com Google Calendar:', error);
            alert('Erro ao sincronizar com Google Calendar. Verifique as configurações.');
        }
    };

    // iCal Import
    const handleImportICal = async () => {
        const url = prompt('Cole a URL do iCal:');
        if (!url) return;

        try {
            const events = await ICalService.fetchAndParseICal(url);
            events.forEach((event: any) => {
                const newEvent: AgendaEvent = {
                    id: event.id || crypto.randomUUID(),
                    title: event.title || 'Sem título',
                    startDate: event.start ? new Date(event.start).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    startTime: event.start ? new Date(event.start).toTimeString().slice(0, 5) : '00:00',
                    endDate: event.end ? new Date(event.end).toISOString().split('T')[0] : undefined,
                    endTime: event.end ? new Date(event.end).toTimeString().slice(0, 5) : undefined,
                    type: 'other',
                    status: 'scheduled',
                    description: event.description,
                    location: event.location,
                    createdAt: new Date().toISOString()
                };
                addAgendaEvent(newEvent);
            });
            alert(`${events.length} eventos importados do iCal!`);
        } catch (error) {
            console.error('Erro ao importar iCal:', error);
            alert('Erro ao importar iCal. Verifique a URL.');
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[rgb(var(--bg-primary))]">
            {/* Toolbar */}
            <CalendarToolbar
                currentDate={currentDate}
                viewMode={viewMode}
                onDateChange={setCurrentDate}
                onViewChange={setViewMode}
                onNewEvent={handleNewEvent}
                onSyncGoogle={handleSyncGoogle}
                onImportICal={handleImportICal}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Main Calendar View */}
                <div className="flex-1 overflow-auto p-6">
                    {viewMode === 'month' && (
                        <CalendarMonthView
                            currentDate={currentDate}
                            events={agendaEvents}
                            onDateClick={setCurrentDate}
                            onEventClick={handleEventClick}
                        />
                    )}

                    {viewMode === 'week' && (
                        <CalendarWeekView
                            currentDate={currentDate}
                            events={agendaEvents}
                            onEventClick={handleEventClick}
                            onTimeSlotClick={(date) => {
                                setCurrentDate(date);
                                handleNewEvent();
                            }}
                        />
                    )}

                    {viewMode === 'day' && (
                        <CalendarDayView
                            currentDate={currentDate}
                            events={agendaEvents}
                            onEventClick={handleEventClick}
                            onTimeSlotClick={() => {
                                handleNewEvent();
                            }}
                        />
                    )}
                </div>

                {/* Daily Summary Sidebar */}
                <AgendaDailySummary />
            </div>

            {/* Event Modal */}
            {showEventModal && (
                <EventModal
                    isOpen={showEventModal}
                    onClose={() => {
                        setShowEventModal(false);
                        setSelectedEvent(null);
                    }}
                    eventToEdit={selectedEvent}
                />
            )}
        </div>
    );
};
