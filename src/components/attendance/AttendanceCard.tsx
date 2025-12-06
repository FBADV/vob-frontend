import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Clock, Users, MoreVertical, CheckCircle, Briefcase, Edit2, Trash2 } from 'lucide-react';
import type { Service } from '../../types';

interface AttendanceCardProps {
    attendance: Service;
    onView: (attendance: Service) => void;
    onEdit: (attendance: Service) => void;
    onDelete: (id: string) => void;
    onConvertToProcess: (attendance: Service) => void;
    isSelectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
}

export const AttendanceCard = React.memo<AttendanceCardProps>(({
    attendance,
    onView,
    onEdit,
    onDelete,
    onConvertToProcess,
    isSelectionMode = false,
    isSelected = false,
    onToggleSelect
}) => {
    const [showActions, setShowActions] = useState(false);

    // Memoizar cor do status
    const statusColor = useMemo(() => {
        switch (attendance.status) {
            case 'scheduled': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
            case 'in_progress': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 shadow-sm shadow-amber-500/10';
            case 'completed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 shadow-sm shadow-emerald-500/10';
            case 'canceled': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30';
            default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/30';
        }
    }, [attendance.status]);

    // Memoizar label do status
    const statusLabel = useMemo(() => {
        switch (attendance.status) {
            case 'scheduled': return 'Agendado';
            case 'in_progress': return 'Em Andamento';
            case 'completed': return 'Concluído';
            case 'canceled': return 'Cancelado';
            default: return attendance.status;
        }
    }, [attendance.status]);

    // Memoizar data formatada
    const formattedDate = useMemo(() => {
        return new Date(attendance.date).toLocaleDateString('pt-BR');
    }, [attendance.date]);

    // Memoizar nome do cliente
    const clientName = useMemo(() => {
        return attendance.clientName || attendance.personServed || 'Sem nome';
    }, [attendance.clientName, attendance.personServed]);

    // Memoizar tipos visíveis
    const visibleTypes = useMemo(() => {
        return attendance.types?.slice(0, 3) || [];
    }, [attendance.types]);

    // Memoizar contador de tipos extras
    const extraTypesCount = useMemo(() => {
        return (attendance.types?.length || 0) - 3;
    }, [attendance.types?.length]);

    // Callbacks estáveis
    const handleToggleActions = useCallback(() => {
        setShowActions(prev => !prev);
    }, []);

    const handleView = useCallback(() => {
        onView(attendance);
    }, [onView, attendance]);

    const handleEdit = useCallback(() => {
        onEdit(attendance);
        setShowActions(false);
    }, [onEdit, attendance]);

    const handleConvert = useCallback(() => {
        onConvertToProcess(attendance);
        setShowActions(false);
    }, [onConvertToProcess, attendance]);

    const handleDelete = useCallback(() => {
        onDelete(attendance.id);
        setShowActions(false);
    }, [onDelete, attendance.id]);

    return (
        <div
            className="card-premium p-6 hover:border-[rgb(var(--accent-primary))]/30 transition-all duration-300 cursor-pointer group"
            onClick={handleView}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                    {/* Selection Checkbox */}
                    {isSelectionMode && (
                        <div className="flex-shrink-0 pt-2" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={onToggleSelect}
                                className="w-5 h-5 rounded border-gray-300 text-[rgb(var(--accent-primary))] focus:ring-[rgb(var(--accent-primary))] cursor-pointer"
                            />
                        </div>
                    )}
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                        <Calendar size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-[rgb(var(--text-primary))] text-lg mb-1 group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                            {attendance.title}
                        </h3>
                        <p className="text-sm text-[rgb(var(--text-secondary))] flex items-center gap-1.5">
                            <Users size={14} />
                            {clientName}
                        </p>
                    </div>
                </div>

                {/* Actions Menu */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={handleToggleActions}
                        className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showActions && (
                        <div className="absolute right-0 top-full mt-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] rounded-xl shadow-xl z-10 min-w-[180px] animate-scale-in">
                            <button
                                onClick={handleEdit}
                                className="w-full px-4 py-3 text-left hover:bg-[rgb(var(--bg-tertiary))] transition-colors flex items-center gap-2 text-sm font-medium text-[rgb(var(--text-primary))] first:rounded-t-xl"
                            >
                                <Edit2 size={16} />
                                Editar
                            </button>
                            {!attendance.convertedToProcessId && (
                                <button
                                    onClick={handleConvert}
                                    className="w-full px-4 py-3 text-left hover:bg-[rgb(var(--bg-tertiary))] transition-colors flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400"
                                >
                                    <Briefcase size={16} />
                                    Converter em Processo
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 last:rounded-b-xl"
                            >
                                <Trash2 size={16} />
                                Excluir
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Date and Time */}
            <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                    <Calendar size={16} className="text-[rgb(var(--text-tertiary))]" />
                    <span className="font-medium">
                        {formattedDate}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                    <Clock size={16} className="text-[rgb(var(--text-tertiary))]" />
                    <span className="font-medium">{attendance.time}</span>
                </div>
            </div>

            {/* Types */}
            {visibleTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {visibleTypes.map((type, idx) => (
                        <span
                            key={idx}
                            className="text-xs bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] px-2.5 py-1 rounded-lg border border-[rgb(var(--border-subtle))] font-medium"
                        >
                            {type}
                        </span>
                    ))}
                    {extraTypesCount > 0 && (
                        <span className="text-xs text-[rgb(var(--text-tertiary))] bg-[rgb(var(--bg-tertiary))] px-2 py-1 rounded-lg border border-[rgb(var(--border-subtle))]">
                            +{extraTypesCount}
                        </span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--border-subtle))]">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusColor}`}>
                    {statusLabel}
                </span>

                {attendance.convertedToProcessId && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold border border-green-200 dark:border-green-800">
                        <CheckCircle size={14} />
                        Processo Gerado
                    </span>
                )}
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Comparação customizada
    return (
        prevProps.attendance.id === nextProps.attendance.id &&
        prevProps.attendance.status === nextProps.attendance.status &&
        prevProps.attendance.title === nextProps.attendance.title &&
        prevProps.attendance.date === nextProps.attendance.date &&
        prevProps.attendance.time === nextProps.attendance.time &&
        prevProps.attendance.clientName === nextProps.attendance.clientName &&
        prevProps.attendance.personServed === nextProps.attendance.personServed &&
        prevProps.attendance.convertedToProcessId === nextProps.attendance.convertedToProcessId &&
        prevProps.attendance.types?.length === nextProps.attendance.types?.length &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isSelectionMode === nextProps.isSelectionMode
    );
});

AttendanceCard.displayName = 'AttendanceCard';
