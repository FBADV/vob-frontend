import React, { useState, useEffect } from 'react';
import { useGlobalData } from '../context/GlobalDataContext';
import type { AgendaEvent } from '../types';
import { X, Calendar } from 'lucide-react';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventToEdit?: AgendaEvent | null;
}

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, eventToEdit }) => {
    const { addAgendaEvent, updateAgendaEvent, deleteAgendaEvent, clients } = useGlobalData();
    const [newEvent, setNewEvent] = useState<Partial<AgendaEvent>>({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        type: 'meeting',
        status: 'scheduled'
    });

    useEffect(() => {
        if (eventToEdit) {
            setNewEvent(eventToEdit);
        } else {
            setNewEvent({
                title: '',
                description: '',
                startDate: new Date().toISOString().split('T')[0],
                startTime: '09:00',
                type: 'meeting',
                status: 'scheduled'
            });
        }
    }, [eventToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newEvent.title && newEvent.startDate && newEvent.startTime) {
            if (eventToEdit && eventToEdit.id) {
                updateAgendaEvent(eventToEdit.id, newEvent);
            } else {
                addAgendaEvent({
                    ...newEvent as AgendaEvent,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString()
                });
            }
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4 backdrop-blur-sm">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in border border-[rgb(var(--border-subtle))]">
                <div className="px-8 py-6 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center bg-[rgb(var(--bg-secondary))]">
                    <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                        <Calendar className="text-[rgb(var(--accent-primary))]" size={24} />
                        {eventToEdit ? 'Editar Evento' : 'Novo Evento'}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Título</label>
                            <input
                                type="text"
                                required
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                className="input-premium px-4 w-full"
                                placeholder="Ex: Reunião com Cliente"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Descrição</label>
                            <textarea
                                rows={3}
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                className="input-premium px-4 w-full resize-none"
                                placeholder="Detalhes do evento..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Data</label>
                            <input
                                type="date"
                                required
                                value={newEvent.startDate}
                                onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                                className="input-premium px-4 w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Hora</label>
                            <input
                                type="time"
                                required
                                value={newEvent.startTime}
                                onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                className="input-premium px-4 w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Tipo</label>
                            <select
                                value={newEvent.type}
                                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                                className="input-premium px-4 w-full"
                            >
                                <option value="hearing">Audiência</option>
                                <option value="meeting">Reunião</option>
                                <option value="deadline">Prazo</option>
                                <option value="consultation">Consulta</option>
                                <option value="other">Outro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Local (Opcional)</label>
                            <input
                                type="text"
                                value={newEvent.location}
                                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                className="input-premium px-4 w-full"
                                placeholder="Ex: Fórum Central"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Cliente (Opcional)</label>
                            <select
                                value={newEvent.clientId || ''}
                                onChange={(e) => setNewEvent({ ...newEvent, clientId: e.target.value || undefined })}
                                className="input-premium px-4 w-full"
                            >
                                <option value="">Nenhum</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[rgb(var(--border-subtle))]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        {eventToEdit && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('Tem certeza que deseja excluir este evento?')) {
                                        if (eventToEdit.id) {
                                            deleteAgendaEvent(eventToEdit.id);
                                            onClose();
                                        }
                                    }
                                }}
                                className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors font-bold"
                            >
                                Excluir
                            </button>
                        )}
                        <button
                            type="submit"
                            className="btn-premium py-3 px-8"
                        >
                            {eventToEdit ? 'Salvar Alterações' : 'Salvar Evento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
