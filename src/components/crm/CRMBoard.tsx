import React, { useState } from 'react';
import { DndContext, DragOverlay, useDroppable, closestCorners } from '@dnd-kit/core';
import { HelpCircle } from 'lucide-react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Lead, CRMColumn } from '../../types';
import { LeadCard } from './LeadCard';
import { useGlobalData } from '../../context/GlobalDataContext';

const COLUMNS: CRMColumn[] = [
    { id: 'new', title: 'Novos Leads', status: 'new', color: 'bg-blue-500', description: 'Leads recém-chegados que ainda não foram contatados.' },
    { id: 'contacted', title: 'Em Contato', status: 'contacted', color: 'bg-indigo-500', description: 'Leads que já receberam o primeiro contato.' },
    { id: 'meeting', title: 'Reunião', status: 'meeting', color: 'bg-purple-500', description: 'Reunião agendada ou realizada.' },
    { id: 'proposal', title: 'Proposta', status: 'proposal', color: 'bg-orange-500', description: 'Proposta comercial enviada.' },
    { id: 'won', title: 'Fechado', status: 'won', color: 'bg-green-500', description: 'Contrato fechado e convertido em cliente.' },
    { id: 'lost', title: 'Perdido', status: 'lost', color: 'bg-red-500', description: 'Oportunidade perdida ou descartada.' },
];

interface CRMBoardProps {
    onEditLead: (lead: Lead) => void;
    onDeleteLead: (id: string) => void;
    searchTerm?: string;
    filterStatus?: string;
}

export const CRMBoard: React.FC<CRMBoardProps> = ({ onEditLead, onDeleteLead, searchTerm = '', filterStatus = 'all' }) => {
    const { leads, updateLead, convertLeadToClient } = useGlobalData();
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const leadId = active.id as string;
            const newStatus = over.id as Lead['status'];

            // Update lead status
            updateLead(leadId, { status: newStatus });
        }

        setActiveId(null);
    };

    const handleConvert = (lead: Lead) => {
        if (confirm(`Deseja converter ${lead.name} em Cliente?`)) {
            convertLeadToClient(lead.id);
        }
    };

    const activeLead = leads.find(l => l.id === activeId);

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const [tooltipData, setTooltipData] = useState<{ x: number; y: number; text: string } | null>(null);

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCorners}
        >
            <div className="flex h-full gap-6 overflow-x-auto pb-4 custom-scrollbar">
                {COLUMNS.map(column => (
                    <Column
                        key={column.id}
                        column={column}
                        leads={filteredLeads.filter(l => l.status === column.status)}
                        onEditLead={onEditLead}
                        onDeleteLead={onDeleteLead}
                        onConvertLead={handleConvert}
                        onShowTooltip={(e, text) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipData({
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                                text
                            });
                        }}
                        onHideTooltip={() => setTooltipData(null)}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeLead ? <LeadCard lead={activeLead} onClick={() => { }} onConvert={() => { }} onDelete={() => { }} /> : null}
            </DragOverlay>

            {tooltipData && (
                <div
                    className="fixed z-[9999] px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl pointer-events-none max-w-xs text-center animate-fade-in"
                    style={{
                        left: tooltipData.x,
                        top: tooltipData.y - 8,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    {tooltipData.text}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                </div>
            )}
        </DndContext>
    );
};

interface ColumnProps {
    column: CRMColumn;
    leads: Lead[];
    onEditLead: (lead: Lead) => void;
    onDeleteLead: (id: string) => void;
    onConvertLead: (lead: Lead) => void;
    onShowTooltip: (e: React.MouseEvent, text: string) => void;
    onHideTooltip: () => void;
}

const Column: React.FC<ColumnProps> = ({ column, leads, onEditLead, onDeleteLead, onConvertLead, onShowTooltip, onHideTooltip }) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
    });

    const totalValue = leads.reduce((acc, curr) => acc + (curr.value || 0), 0);

    return (
        <div
            ref={setNodeRef}
            className="flex-shrink-0 w-80 flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${column.color}`} />
                        <h3 className="font-bold text-gray-700 dark:text-gray-200">{column.title}</h3>
                        <div
                            className="cursor-help text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            onMouseEnter={(e) => onShowTooltip(e, (column as any).description)}
                            onMouseLeave={onHideTooltip}
                        >
                            <HelpCircle size={14} />
                        </div>
                    </div>
                    <span className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded-md text-xs font-bold text-gray-500 border border-gray-100 dark:border-gray-700">
                        {leads.length}
                    </span>
                </div>
                {totalValue > 0 && (
                    <div className="text-xs text-gray-500 font-medium">
                        Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                    </div>
                )}
            </div>

            {/* Cards Area */}
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                {leads.map(lead => (
                    <LeadCard
                        key={lead.id}
                        lead={lead}
                        onClick={onEditLead}
                        onConvert={onConvertLead}
                        onDelete={onDeleteLead}
                    />
                ))}
                {leads.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl m-2">
                        <span className="text-sm">Arraste aqui</span>
                    </div>
                )}
            </div>
        </div>
    );
};
