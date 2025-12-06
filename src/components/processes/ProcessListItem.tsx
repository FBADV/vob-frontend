import React, { useState, useRef, useEffect } from 'react';
import { Calendar, DollarSign, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';
import type { Process } from '../../types';
import { getCourtTypeLabel } from '../../utils/courtUtils';
import { formatCNJNumber } from '../../utils/formatters';
import { COURT_COLORS, type Client } from '../../types';
import { ClientAvatar } from '../ClientAvatar';
import { createPortal } from 'react-dom';

interface ProcessListItemProps {
    process: Process;
    client?: Client;
    onClick: () => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}

export const ProcessListItem: React.FC<ProcessListItemProps> = ({
    process,
    client,
    onClick,
    onEdit,
    onDelete
}) => {
    const [showActions, setShowActions] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 shadow-sm shadow-emerald-500/10';
            case 'inactive': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/30';
            case 'suspended': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 shadow-sm shadow-amber-500/10';
            case 'archived': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
            case 'finished': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30 shadow-sm shadow-purple-500/10';
            case 'pending_analysis': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30 animate-pulse';
            default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/30';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'inactive': return 'Inativo';
            case 'suspended': return 'Suspenso';
            case 'archived': return 'Arquivado';
            case 'finished': return 'Finalizado';
            case 'pending_analysis': return 'Análise Pendente';
            default: return status;
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const courtColor = (COURT_COLORS as any)[process.court] || {
        bg: 'bg-gray-50 dark:bg-gray-800',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-700'
    };

    const handleToggleActions = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!showActions && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY,
                left: rect.right - 160 // 160px is approx width of menu
            });
        }
        setShowActions(!showActions);
    };

    // Close on scroll
    useEffect(() => {
        if (showActions) {
            const handleScroll = () => setShowActions(false);
            window.addEventListener('scroll', handleScroll, true);
            return () => window.removeEventListener('scroll', handleScroll, true);
        }
    }, [showActions]);

    return (
        <>
            <tr
                className="hover:bg-[rgb(var(--bg-tertiary))]/50 transition-colors cursor-pointer group border-b border-[rgb(var(--border-subtle))]"
                onClick={onClick}
            >
                <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                        <div className={`p-2.5 ${courtColor.bg} rounded-xl ${courtColor.text} border ${courtColor.border}`}>
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[rgb(var(--text-primary))] text-sm group-hover:text-[rgb(var(--accent-primary))] transition-colors font-mono">
                                {formatCNJNumber(process.number)}
                            </h3>
                            <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5 line-clamp-1">
                                {process.title}
                            </p>
                        </div>
                    </div>
                </td>

                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <ClientAvatar
                            client={client}
                            name={client?.name || process.clientName}
                            size="sm"
                            className="border border-[rgb(var(--border-subtle))]"
                        />
                        <span className="font-medium text-sm text-[rgb(var(--text-secondary))] truncate max-w-[200px]">
                            {client?.name || process.clientName || 'Sem cliente'}
                        </span>
                    </div>
                </td>

                <td className="px-6 py-4">
                    <span className="text-xs bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] px-2.5 py-1 rounded-lg border border-[rgb(var(--border-subtle))] font-medium">
                        {getCourtTypeLabel(process.court as any)}
                    </span>
                </td>

                <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--text-primary))]">
                        <DollarSign size={14} className="text-green-600 dark:text-green-400" />
                        {formatCurrency(process.value || 0)}
                    </div>
                </td>

                <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(process.status)}`}>
                        {getStatusLabel(process.status)}
                    </span>
                </td>

                <td className="px-6 py-4 text-right">
                    <button
                        ref={buttonRef}
                        onClick={handleToggleActions}
                        className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <MoreVertical size={18} />
                    </button>
                </td>
            </tr>

            {showActions && createPortal(
                <>
                    <div
                        className="fixed inset-0 z-[60]"
                        onClick={() => setShowActions(false)}
                    />
                    <div
                        className="fixed bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] rounded-xl shadow-xl z-[70] min-w-[160px] animate-scale-in"
                        style={{
                            top: `${menuPosition.top + 8}px`,
                            left: `${menuPosition.left}px`
                        }}
                    >
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
                </>,
                document.body
            )}
        </>
    );
};
