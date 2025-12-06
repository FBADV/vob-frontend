import React, { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    GripVertical,
    Clock,
    FileText,
    UserPlus,
    Edit2,
    Trash2
} from 'lucide-react';
import type { Process } from '../../types';
import { formatCNJNumber } from '../../utils/formatters';
import { COURT_COLORS, type Client } from '../../types';
import { ClientAvatar } from '../ClientAvatar';

interface ProcessCardProps {
    process: Process;
    client?: Client;
    onClick: () => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
    isSelectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
}

export const ProcessCard = React.memo<ProcessCardProps>(({
    process,
    client,
    onClick,
    onEdit,
    onDelete,
    isSelectionMode = false,
    isSelected = false,
    onToggleSelect
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: process.id });

    // Memoizar estilo de drag
    const style = useMemo(() => ({
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: isDragging ? 'relative' as const : 'static' as const,
    }), [transform, transition, isDragging]);

    // Memoizar cor do status
    const statusColor = useMemo(() => {
        switch (process.status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 shadow-sm shadow-emerald-500/10';
            case 'suspended': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 shadow-sm shadow-amber-500/10';
            case 'archived': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
            case 'inactive': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/30';
            case 'pending_analysis': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30 animate-pulse';
            default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/30';
        }
    }, [process.status]);

    // Memoizar label do status
    const statusLabel = useMemo(() => {
        switch (process.status) {
            case 'active': return 'Ativo';
            case 'suspended': return 'Suspenso';
            case 'archived': return 'Arquivado';
            case 'inactive': return 'Inativo';
            case 'pending_analysis': return 'Análise';
            default: return process.status;
        }
    }, [process.status]);

    // Memoizar última movimentação
    const lastMovement = useMemo(() => {
        if (process.folder?.movements && process.folder.movements.length > 0) {
            return process.folder.movements[0];
        }
        return null;
    }, [process.folder?.movements]);

    // Memoizar cores do tribunal
    const courtColors = useMemo(() => {
        if (process.courtType && COURT_COLORS[process.courtType]) {
            return `${COURT_COLORS[process.courtType].bg} ${COURT_COLORS[process.courtType].text}`;
        }
        return 'bg-gray-100 text-gray-600';
    }, [process.courtType]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] rounded-2xl p-5 hover:border-[rgb(var(--accent-primary))] hover:shadow-lg transition-all duration-300 mb-3 ${isDragging ? 'shadow-2xl opacity-90 scale-[1.02] border-[rgb(var(--accent-primary))]' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-start gap-4">
                {/* Selection Checkbox */}
                {isSelectionMode && (
                    <div className="flex-shrink-0 mt-1" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={onToggleSelect}
                            className="w-5 h-5 rounded border-gray-300 text-[rgb(var(--accent-primary))] focus:ring-[rgb(var(--accent-primary))] cursor-pointer"
                        />
                    </div>
                )}

                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-1 p-1 text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] cursor-grab active:cursor-grabbing rounded-lg hover:bg-[rgb(var(--bg-tertiary))]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical size={20} />
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* Header: Number & Court */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${courtColors}`}>
                                {process.court}
                            </span>
                            <h3 className="font-bold text-[rgb(var(--text-primary))] text-base font-mono group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                                {formatCNJNumber(process.number)}
                            </h3>
                        </div>

                        {/* Status Badge */}
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-transparent ${statusColor}`}>
                            {statusLabel}
                        </span>
                    </div>

                    {/* Client Section - Prominent */}
                    <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-[rgb(var(--bg-tertiary))]/30 border border-transparent hover:border-[rgb(var(--border-subtle))] transition-colors">
                        <ClientAvatar
                            client={client}
                            name={client?.name || process.clientName}
                            size="md"
                            className="shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                            {client || process.clientName ? (
                                <>
                                    <p className="text-xs text-[rgb(var(--text-tertiary))] font-medium uppercase tracking-wider mb-0.5">Cliente</p>
                                    <p className="font-bold text-[rgb(var(--text-primary))] truncate text-sm">
                                        {client?.name || process.clientName}
                                    </p>
                                </>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(e); }}
                                    className="flex items-center gap-2 text-[rgb(var(--accent-primary))] hover:underline text-sm font-medium"
                                >
                                    <UserPlus size={16} />
                                    Vincular Cliente
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {/* Subject */}
                        <div className="flex items-start gap-2 min-w-0">
                            <FileText size={14} className="text-[rgb(var(--text-tertiary))] mt-0.5 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] text-[rgb(var(--text-tertiary))] uppercase font-bold">Assunto</p>
                                <p className="text-xs text-[rgb(var(--text-secondary))] truncate font-medium">
                                    {process.subjects?.[0] || process.subject || 'Não informado'}
                                </p>
                            </div>
                        </div>

                        {/* Last Movement */}
                        <div className="flex items-start gap-2 min-w-0">
                            <Clock size={14} className="text-[rgb(var(--text-tertiary))] mt-0.5 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] text-[rgb(var(--text-tertiary))] uppercase font-bold">Última Movimentação</p>
                                {lastMovement ? (
                                    <p className="text-xs text-[rgb(var(--text-secondary))] truncate font-medium" title={lastMovement.title}>
                                        {lastMovement.title}
                                    </p>
                                ) : (
                                    <p className="text-xs text-[rgb(var(--text-tertiary))] italic">Sem movimentações</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                        onClick={onEdit}
                        className="p-2 text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
                        title="Editar"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-[rgb(var(--text-tertiary))] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Excluir"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Comparação customizada para evitar re-renders desnecessários
    return (
        prevProps.process.id === nextProps.process.id &&
        prevProps.process.status === nextProps.process.status &&
        prevProps.process.title === nextProps.process.title &&
        prevProps.process.clientName === nextProps.process.clientName &&
        prevProps.process.updatedAt === nextProps.process.updatedAt &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isSelectionMode === nextProps.isSelectionMode &&
        prevProps.process.folder?.movements?.length === nextProps.process.folder?.movements?.length
    );
});

ProcessCard.displayName = 'ProcessCard';
