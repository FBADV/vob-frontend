import React from 'react';
import { Calendar, Clock, Users, CheckCircle, MoreVertical, Edit2, Trash2, Eye, Briefcase } from 'lucide-react';
import type { Service } from '../../types';

interface AttendanceListItemProps {
    attendance: Service;
    onClick: () => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
    onConvertToProcess: (e: React.MouseEvent) => void;
}

export const AttendanceListItem: React.FC<AttendanceListItemProps> = ({
    attendance,
    onClick,
    onEdit,
    onDelete,
    onConvertToProcess
}) => {
    const [showActions, setShowActions] = React.useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
            case 'in_progress': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 shadow-sm shadow-amber-500/10';
            case 'completed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 shadow-sm shadow-emerald-500/10';
            case 'canceled': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30';
            default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/30';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'scheduled': return 'Agendado';
            case 'in_progress': return 'Em Andamento';
            case 'completed': return 'Concluído';
            case 'canceled': return 'Cancelado';
            default: return status;
        }
    };

    return (
        <tr
            className="hover:bg-[rgb(var(--bg-tertiary))]/50 transition-colors cursor-pointer group border-b border-[rgb(var(--border-subtle))]"
            onClick={onClick}
        >
            <td className="px-6 py-4">
                <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[rgb(var(--text-primary))] text-sm group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                            {attendance.title}
                        </h3>
                        <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5 flex items-center gap-1.5">
                            <Users size={12} />
                            {attendance.clientName || attendance.personServed || 'Sem nome'}
                        </p>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
                    <Calendar size={14} className="text-[rgb(var(--text-tertiary))]" />
                    <span className="font-medium">
                        {new Date(attendance.date).toLocaleDateString('pt-BR')}
                    </span>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
                    <Clock size={14} className="text-[rgb(var(--text-tertiary))]" />
                    <span className="font-medium">{attendance.time}</span>
                </div>
            </td>

            <td className="px-6 py-4">
                {attendance.types && attendance.types.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {attendance.types.slice(0, 2).map((type, idx) => (
                            <span
                                key={idx}
                                className="text-xs bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] px-2.5 py-1 rounded-lg border border-[rgb(var(--border-subtle))] font-medium"
                            >
                                {type}
                            </span>
                        ))}
                        {attendance.types.length > 2 && (
                            <span className="text-xs text-[rgb(var(--text-tertiary))] bg-[rgb(var(--bg-tertiary))] px-2 py-1 rounded-lg border border-[rgb(var(--border-subtle))]">
                                +{attendance.types.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(attendance.status)}`}>
                        {getStatusLabel(attendance.status)}
                    </span>
                    {attendance.convertedToProcessId && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold border border-green-200 dark:border-green-800">
                            <CheckCircle size={12} />
                        </span>
                    )}
                </div>
            </td>

            <td className="px-6 py-4 text-right">
                <div className="relative flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setShowActions(!showActions)}
                        className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {showActions && (
                        <>
                            {/* Backdrop to prevent click-through */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowActions(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] rounded-xl shadow-xl z-50 min-w-[180px] animate-scale-in">
                                <button
                                    onClick={() => {
                                        onClick();
                                        setShowActions(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-[rgb(var(--bg-tertiary))] transition-colors flex items-center gap-2 text-sm font-medium text-[rgb(var(--text-primary))] first:rounded-t-xl"
                                >
                                    <Eye size={16} />
                                    Visualizar
                                </button>
                                <button
                                    onClick={(e) => {
                                        onEdit(e);
                                        setShowActions(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-[rgb(var(--bg-tertiary))] transition-colors flex items-center gap-2 text-sm font-medium text-[rgb(var(--text-primary))]"
                                >
                                    <Edit2 size={16} />
                                    Editar
                                </button>
                                {!attendance.convertedToProcessId && (
                                    <button
                                        onClick={(e) => {
                                            onConvertToProcess(e);
                                            setShowActions(false);
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-[rgb(var(--bg-tertiary))] transition-colors flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400"
                                    >
                                        <Briefcase size={16} />
                                        Converter em Processo
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        onDelete(e);
                                        setShowActions(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 last:rounded-b-xl"
                                >
                                    <Trash2 size={16} />
                                    Excluir
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};
