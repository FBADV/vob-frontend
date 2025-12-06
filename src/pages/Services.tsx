import React, { useState } from 'react';
import {
    Search,
    Plus,
    MessageSquare,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    RefreshCw
} from 'lucide-react';
import type { Service, Process } from '../types';
import { useGlobalData } from '../context/GlobalDataContext';
import { ModuleHeader } from '../components/ModuleHeader';
import { ViewToggle } from '../components/ViewToggle';
import { ServiceFormModal } from '../components/ServiceFormModal';
import { AttendanceCard } from '../components/attendance/AttendanceCard';
import { AttendanceDetailsModal } from '../components/attendance/AttendanceDetailsModal';
import { AttendanceListItem } from '../components/attendance/AttendanceListItem';
import { useNavigate } from 'react-router-dom';

export const Services: React.FC = () => {
    const { services, addProcess, updateService, deleteService, deleteBatchServices } = useGlobalData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const navigate = useNavigate();

    const [sortConfig, setSortConfig] = useState<{ key: keyof Service | 'clientName' | 'date', direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

    const filteredServices = services.filter(service => {
        const matchesSearch =
            service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (service.clientName && service.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (service.personServed && service.personServed.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || service.status === statusFilter;

        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof Service];
        let bValue: any = b[sortConfig.key as keyof Service];

        if (sortConfig.key === 'clientName') {
            aValue = a.clientName || a.personServed || '';
            bValue = b.clientName || b.personServed || '';
        }

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key: keyof Service | 'clientName' | 'date') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIcon = (key: string) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-[rgb(var(--accent-primary))]" /> : <ArrowDown size={14} className="text-[rgb(var(--accent-primary))]" />;
    };

    const handleViewService = (service: Service) => {
        setSelectedService(service);
        setIsDetailsOpen(true);
    };

    const handleEditService = (service: Service) => {
        setServiceToEdit(service);
        setIsFormOpen(true);
        setIsDetailsOpen(false);
    };

    const handleNewService = () => {
        setServiceToEdit(null);
        setIsFormOpen(true);
    };

    const handleDeleteService = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este atendimento?')) {
            deleteService(id);
            setIsDetailsOpen(false);
        }
    };

    const convertToCase = (service: Service) => {
        if (confirm('Deseja transformar este atendimento em um Caso/Processo?')) {
            const newProcess: Process = {
                id: crypto.randomUUID(),
                number: 'A Gerar',
                title: service.title,
                clientId: service.clientId,
                clientName: service.clientName || service.personServed,
                area: 'Cível',
                className: 'Procedimento Comum',
                court: 'Tribunal a definir',
                value: service.feeAgreement?.value || 0,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                folder: {
                    basicData: {
                        plaintiff: service.clientName || service.personServed || '',
                        defendant: '',
                        judge: '',
                        prosecutor: '',
                        courtSection: '',
                        distributionDate: new Date().toISOString()
                    },
                    movements: [],
                    timeline: [],
                    observations: [{
                        id: crypto.randomUUID(),
                        processId: '',
                        userId: 'current-user',
                        userName: 'Sistema',
                        content: `Processo criado a partir do atendimento: ${service.description}`,
                        createdAt: new Date().toISOString()
                    }],
                    documents: []
                }
            };

            newProcess.folder.observations[0].processId = newProcess.id;

            addProcess(newProcess);
            updateService(service.id, { convertedToProcessId: newProcess.id, status: 'completed' });
            setIsDetailsOpen(false);
            navigate('/processes');
        }
    };

    // Batch delete handlers
    // Note: toggleSelectService will be added when implementing checkboxes in AttendanceCard
    const toggleSelectAll = () => {
        if (selectedServices.size === filteredServices.length) {
            setSelectedServices(new Set());
        } else {
            setSelectedServices(new Set(filteredServices.map(s => s.id)));
        }
    };

    const handleBatchDelete = () => {
        if (selectedServices.size === 0) return;

        const confirmMsg = `Tem certeza que deseja excluir ${selectedServices.size} atendimento(s)?`;
        if (window.confirm(confirmMsg)) {
            deleteBatchServices(Array.from(selectedServices));
            setSelectedServices(new Set());
            setIsSelectionMode(false);
        }
    };


    return (
        <div className="space-y-6 animate-fade-in">
            <ModuleHeader
                icon={MessageSquare}
                title="Atendimentos"
                subtitle="Gerencie consultas e atendimentos iniciais"
                action={
                    <div className="flex flex-wrap gap-3">
                        {isSelectionMode ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsSelectionMode(false);
                                        setSelectedServices(new Set());
                                    }}
                                    className="btn-secondary-premium flex items-center gap-2"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleBatchDelete}
                                    disabled={selectedServices.size === 0}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    Excluir ({selectedServices.size})
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsSelectionMode(true)}
                                    className="btn-secondary-premium flex items-center gap-2"
                                >
                                    Selecionar
                                </button>
                                <button
                                    onClick={handleNewService}
                                    className="btn-premium flex items-center gap-2"
                                >
                                    <Plus size={20} />
                                    Novo Atendimento
                                </button>
                            </>
                        )}
                    </div>
                }
            />

            {/* Search and Filters */}
            <div className="card-premium p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {isSelectionMode && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedServices.size === filteredServices.length && filteredServices.length > 0}
                                onChange={toggleSelectAll}
                                className="w-5 h-5 rounded border-gray-300 text-[rgb(var(--accent-primary))] focus:ring-[rgb(var(--accent-primary))] cursor-pointer"
                            />
                            <span className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                                Selecionar Todos
                            </span>
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row gap-4 items-center flex-1 w-full">
                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] pointer-events-none z-10" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por título ou cliente..."
                                className="input-premium w-full pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                            {[
                                { id: 'all', label: 'Todos' },
                                { id: 'scheduled', label: 'Agendados' },
                                { id: 'in_progress', label: 'Em Andamento' },
                                { id: 'completed', label: 'Concluídos' },
                                { id: 'canceled', label: 'Cancelados' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setStatusFilter(item.id)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${statusFilter === item.id
                                        ? 'bg-[rgb(var(--accent-primary))] text-white border-[rgb(var(--accent-primary))] shadow-lg shadow-[rgb(var(--accent-primary))]/20'
                                        : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-secondary))] hover:border-[rgb(var(--accent-primary))]/30'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                </div>
            </div>

            {/* Content - List or Grid View */}
            {filteredServices.length === 0 ? (
                <div className="card-premium p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-24 h-24 bg-[rgb(var(--bg-tertiary))] rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <MessageSquare size={48} className="text-[rgb(var(--text-tertiary))]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-3">Nenhum atendimento encontrado</h3>
                    <p className="text-[rgb(var(--text-secondary))] max-w-md mx-auto mb-8 text-lg">
                        Não encontramos nenhum atendimento com os filtros atuais. Tente buscar por outro termo ou limpe os filtros.
                    </p>
                    {searchTerm || statusFilter !== 'all' ? (
                        <button
                            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                            className="btn-premium flex items-center gap-2"
                        >
                            <RefreshCw size={18} />
                            Limpar Filtros
                        </button>
                    ) : (
                        <button
                            onClick={handleNewService}
                            className="btn-premium inline-flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Novo Atendimento
                        </button>
                    )}
                </div>
            ) : viewMode === 'list' ? (
                <div className="card-premium overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] text-xs uppercase font-semibold border-b border-[rgb(var(--border-subtle))]">
                                <tr>
                                    <th className="px-6 py-4 text-left cursor-pointer group hover:bg-[rgb(var(--bg-secondary))] transition-colors" onClick={() => handleSort('title')}>
                                        <div className="flex items-center gap-2">
                                            Atendimento
                                            {getSortIcon('title')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left cursor-pointer group hover:bg-[rgb(var(--bg-secondary))] transition-colors" onClick={() => handleSort('date')}>
                                        <div className="flex items-center gap-2">
                                            Data
                                            {getSortIcon('date')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">Hora</th>
                                    <th className="px-6 py-4 text-left">Situação</th>
                                    <th className="px-6 py-4 text-left cursor-pointer group hover:bg-[rgb(var(--bg-secondary))] transition-colors" onClick={() => handleSort('status')}>
                                        <div className="flex items-center gap-2">
                                            Status
                                            {getSortIcon('status')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredServices.map((service) => (
                                    <AttendanceListItem
                                        key={service.id}
                                        attendance={service}
                                        onClick={() => handleViewService(service)}
                                        onEdit={(e) => { e.stopPropagation(); handleEditService(service); }}
                                        onDelete={(e) => { e.stopPropagation(); handleDeleteService(service.id); }}
                                        onConvertToProcess={(e) => { e.stopPropagation(); convertToCase(service); }}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                        <AttendanceCard
                            key={service.id}
                            attendance={service}
                            onView={handleViewService}
                            onEdit={handleEditService}
                            onDelete={handleDeleteService}
                            onConvertToProcess={convertToCase}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <ServiceFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                serviceToEdit={serviceToEdit}
            />

            {selectedService && (
                <AttendanceDetailsModal
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    attendance={selectedService}
                    onEdit={() => handleEditService(selectedService)}
                    onDelete={() => handleDeleteService(selectedService.id)}
                    onConvertToProcess={() => convertToCase(selectedService)}
                />
            )}
        </div>
    );
};
