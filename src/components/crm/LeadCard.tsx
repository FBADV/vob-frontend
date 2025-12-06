import React, { useMemo, useCallback } from 'react';
import type { Lead } from '../../types';
import { Mail, Phone, Calendar, DollarSign, MoreVertical, UserPlus } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';

interface LeadCardProps {
    lead: Lead;
    onClick: (lead: Lead) => void;
    onConvert: (lead: Lead) => void;
    onDelete: (id: string) => void;
}

export const LeadCard = React.memo<LeadCardProps>(({ lead, onClick, onConvert, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: lead.id,
        data: lead
    });

    const [menuPos, setMenuPos] = React.useState<{ x: number, y: number } | null>(null);

    // Memoizar estilo de drag
    const style = useMemo(() => {
        return transform ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        } : undefined;
    }, [transform]);

    // Memoizar valor formatado
    const formattedValue = useMemo(() => {
        if (!lead.value) return null;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value);
    }, [lead.value]);

    // Memoizar data formatada
    const formattedDate = useMemo(() => {
        return new Date(lead.createdAt).toLocaleDateString();
    }, [lead.createdAt]);

    // Memoizar cor da fonte
    const sourceColor = useMemo(() => {
        switch (lead.source) {
            case 'indication': return 'bg-purple-100 text-purple-600';
            case 'website': return 'bg-blue-100 text-blue-600';
            case 'google': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    }, [lead.source]);

    // Callbacks estáveis
    const handleClick = useCallback(() => {
        onClick(lead);
    }, [onClick, lead]);

    const handleConvertClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onConvert(lead);
    }, [onConvert, lead]);

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(lead.id);
        setMenuPos(null);
    }, [onDelete, lead.id]);

    const toggleMenu = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (menuPos) {
            setMenuPos(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPos({
                x: rect.right,
                y: rect.bottom
            });
        }
    }, [menuPos]);

    // Close menu on scroll or click outside
    React.useEffect(() => {
        if (!menuPos) return;

        const handleScroll = () => setMenuPos(null);
        const handleClickOutside = () => setMenuPos(null);

        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('click', handleClickOutside);
        };
    }, [menuPos]);

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...listeners}
                {...attributes}
                onClick={handleClick}
                className={`
                bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 
                cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative
                ${isDragging ? 'opacity-50 rotate-2 scale-105 z-50' : ''}
            `}
            >
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 line-clamp-1">{lead.name}</h4>
                    <div className="flex items-center gap-1">
                        {lead.status === 'won' && (
                            <button
                                onClick={handleConvertClick}
                                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Converter em Cliente"
                            >
                                <UserPlus size={16} />
                            </button>
                        )}
                        <div className="relative">
                            <button
                                onClick={toggleMenu}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <span className="truncate">{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <span>{lead.phone}</span>
                    </div>
                    {formattedValue && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                            <DollarSign size={14} />
                            <span>{formattedValue}</span>
                        </div>
                    )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{formattedDate}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${sourceColor}`}>
                        {lead.source}
                    </span>
                </div>
            </div>

            {menuPos && (
                <div
                    className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-[9999] overflow-hidden w-32 animate-fade-in"
                    style={{
                        top: menuPos.y,
                        left: menuPos.x - 128, // Align right edge
                    }}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); onClick(lead); setMenuPos(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Editar
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        Excluir
                    </button>
                </div>
            )}
        </>
    );
}, (prevProps, nextProps) => {
    // Comparação customizada
    return (
        prevProps.lead.id === nextProps.lead.id &&
        prevProps.lead.name === nextProps.lead.name &&
        prevProps.lead.email === nextProps.lead.email &&
        prevProps.lead.phone === nextProps.lead.phone &&
        prevProps.lead.value === nextProps.lead.value &&
        prevProps.lead.status === nextProps.lead.status &&
        prevProps.lead.source === nextProps.lead.source &&
        prevProps.lead.createdAt === nextProps.lead.createdAt
    );
});

LeadCard.displayName = 'LeadCard';
