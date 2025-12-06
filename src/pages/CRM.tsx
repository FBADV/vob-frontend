import React, { useState } from 'react';
import { ModuleHeader } from '../components/ModuleHeader';
import { CRMBoard } from '../components/crm/CRMBoard';
import { LeadModal } from '../components/crm/LeadModal';
import { CRMMetrics } from '../components/crm/CRMMetrics';
import { useGlobalData } from '../context/GlobalDataContext';
import type { Lead } from '../types';
import { Plus, Filter, Download, Target, Search } from 'lucide-react';

export const CRM: React.FC = () => {
    const { addLead, updateLead, deleteLead } = useGlobalData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const handleCreateLead = (leadData: Partial<Lead>) => {
        const newLead = {
            id: crypto.randomUUID(),
            ...leadData
        } as Lead;
        addLead(newLead);
    };

    const handleUpdateLead = (leadData: Partial<Lead>) => {
        if (editingLead) {
            updateLead(editingLead.id, leadData);
        }
    };

    const handleEditLead = (lead: Lead) => {
        setEditingLead(lead);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLead(null);
    };

    const handleDeleteLead = (leadId: string) => {
        if (confirm('Tem certeza que deseja excluir este lead?')) {
            deleteLead(leadId);
        }
    };

    return (
        <div className="h-full flex flex-col animate-fade-in">
            <ModuleHeader
                title="CRM Jurídico"
                subtitle="Gestão de Leads e Oportunidades"
                icon={Target}
                action={
                    <div className="flex items-center gap-3">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={18} />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                            >
                                <option value="all">Todos Status</option>
                                <option value="new">Novos</option>
                                <option value="contacted">Em Contato</option>
                                <option value="meeting">Reunião</option>
                                <option value="proposal">Proposta</option>
                                <option value="won">Fechado</option>
                                <option value="lost">Perdido</option>
                            </select>
                        </div>
                        <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <Download size={20} />
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn-premium flex items-center gap-2 px-4 py-2"
                        >
                            <Plus size={20} />
                            Novo Lead
                        </button>
                    </div>
                }
            />

            <div className="flex-1 overflow-hidden p-6 flex flex-col">
                <CRMMetrics />
                <div className="flex-1 overflow-hidden">
                    <CRMBoard
                        onEditLead={handleEditLead}
                        onDeleteLead={handleDeleteLead}
                        searchTerm={searchTerm}
                        filterStatus={filterStatus}
                    />
                </div>
            </div>

            <LeadModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={editingLead ? handleUpdateLead : handleCreateLead}
                lead={editingLead}
            />
        </div>
    );
};
