import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    FileSpreadsheet,
    RefreshCw,
    Scale,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronDown
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useGlobalData } from '../context/GlobalDataContext';
import { ModuleHeader } from '../components/ModuleHeader';
import { ViewToggle } from '../components/ViewToggle';

import { ProcessFormModal } from '../components/ProcessFormModal';
import { ProcessDetailsModal } from '../components/ProcessDetailsModal';
import { BatchImportModal } from '../components/BatchImportModal';
import type { Process } from '../types';
import { ProcessCard } from '../components/processes/ProcessCard';
import { ProcessListItem } from '../components/processes/ProcessListItem';
import { matchesSearch } from '../utils/searchUtils';

export const Processes: React.FC = () => {
    const { processes, clients, addProcess, updateProcess, deleteProcess, deleteBatchProcesses } = useGlobalData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortedProcesses, setSortedProcesses] = useState<Process[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
        const saved = localStorage.getItem('processes-view-mode');
        return (saved as 'list' | 'grid') || 'grid';
    });
    const [selectedProcesses, setSelectedProcesses] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const [sortConfig, setSortConfig] = useState<{ key: keyof Process | 'clientName' | 'updatedAt', direction: 'asc' | 'desc' }>({ key: 'updatedAt', direction: 'desc' });
    const [tribunalFilter, setTribunalFilter] = useState<string>('all');

    // Modals state
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showBatchImportModal, setShowBatchImportModal] = useState(false);
    const [selectedProcess, setSelectedProcess] = useState<Process | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(false);

    // Persist view mode preference
    useEffect(() => {
        localStorage.setItem('processes-view-mode', viewMode);
    }, [viewMode]);

    // Sensors for Drag & Drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Initialize sorted processes
    useEffect(() => {
        let filtered = processes.filter(process => {
            const matchesSearchTerm =
                matchesSearch(process.number, searchTerm) ||
                matchesSearch(process.title, searchTerm) ||
                matchesSearch(process.clientName, searchTerm);

            const matchesStatus = statusFilter === 'all' || process.status === statusFilter;
            const matchesTribunal = tribunalFilter === 'all' || process.court === tribunalFilter;

            return matchesSearchTerm && matchesStatus && matchesTribunal;
        });

        // Sort
        filtered.sort((a, b) => {
            let aValue: any = sortConfig.key === 'clientName' ? (a.clientName || '') : a[sortConfig.key];
            let bValue: any = sortConfig.key === 'clientName' ? (b.clientName || '') : b[sortConfig.key];

            // Handle dates
            if (sortConfig.key === 'updatedAt') {
                aValue = new Date(a.lastSyncAt || a.updatedAt).getTime();
                bValue = new Date(b.lastSyncAt || b.updatedAt).getTime();
            }

            // Handle strings
            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        setSortedProcesses(filtered);
    }, [processes, searchTerm, statusFilter, tribunalFilter, sortConfig]);

    const handleSort = (key: keyof Process | 'clientName' | 'updatedAt') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIcon = (key: string) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-[rgb(var(--accent-primary))]" /> : <ArrowDown size={14} className="text-[rgb(var(--accent-primary))]" />;
    };

    // Check for pending analysis processes to show notification
    const pendingAnalysisCount = processes.filter(p => p.status === 'pending_analysis').length;

    // Get unique tribunals for filter
    const uniqueTribunals = Array.from(new Set(processes.map(p => p.court))).filter(Boolean).sort();

    const handleOpenAddModal = () => {
        setSelectedProcess(undefined);
        setIsEditing(false);
        setShowFormModal(true);
    };

    const handleOpenEditModal = (process: Process) => {
        setSelectedProcess(process);
        setIsEditing(true);
        setShowFormModal(true);
    };

    const handleOpenDetailsModal = (process: Process) => {
        setSelectedProcess(process);
        setShowDetailsModal(true);
    };

    const handleSaveProcess = (processData: Process) => {
        if (isEditing && selectedProcess) {
            updateProcess(selectedProcess.id, processData);
        } else {
            addProcess(processData);
        }
        setShowFormModal(false);
    };

    const handleDeleteProcess = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.')) {
            deleteProcess(id);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = sortedProcesses.findIndex(p => p.id === active.id);
            const newIndex = sortedProcesses.findIndex(p => p.id === over.id);

            const reordered = arrayMove(sortedProcesses, oldIndex, newIndex);
            const reorderedWithIndex = reordered.map((p, index) => ({
                ...p,
                orderIndex: index
            }));

            setSortedProcesses(reorderedWithIndex);

            // Update each process with new orderIndex
            reorderedWithIndex.forEach(p => {
                updateProcess(p.id, { orderIndex: p.orderIndex });
            });
        }
    };

    // Batch delete handlers
    const toggleSelectProcess = (id: string) => {
        setSelectedProcesses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedProcesses.size === sortedProcesses.length) {
            setSelectedProcesses(new Set());
        } else {
            setSelectedProcesses(new Set(sortedProcesses.map(p => p.id)));
        }
    };

    const handleBatchDelete = () => {
        if (selectedProcesses.size === 0) return;

        const confirmMsg = `Tem certeza que deseja excluir ${selectedProcesses.size} processo(s)?`;
        if (window.confirm(confirmMsg)) {
            deleteBatchProcesses(Array.from(selectedProcesses));
            setSelectedProcesses(new Set());
            setIsSelectionMode(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Module Header */}
            <ModuleHeader
                icon={Scale}
                title="Processos"
                subtitle={`${sortedProcesses.length} ${sortedProcesses.length === 1 ? 'processo encontrado' : 'processos encontrados'}`}
                action={
                    <div className="flex flex-wrap gap-3">
                        {isSelectionMode ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsSelectionMode(false);
                                        setSelectedProcesses(new Set());
                                    }}
                                    className="btn-secondary-premium flex items-center gap-2"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleBatchDelete}
                                    disabled={selectedProcesses.size === 0}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    Excluir ({selectedProcesses.size})
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
                                    onClick={() => setShowBatchImportModal(true)}
                                    className="btn-secondary-premium flex items-center gap-2"
                                >
                                    <FileSpreadsheet size={18} />
                                    Importar Lote
                                </button>
                                <button
                                    onClick={handleOpenAddModal}
                                    className="btn-premium flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Novo Processo
                                </button>
                            </>
                        )}
                    </div>
                }
            />

            {/* Notification for Pending Analysis */}
            {pendingAnalysisCount > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex items-center justify-between animate-fade-in shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full text-purple-600 dark:text-purple-300">
                            <RefreshCw size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-purple-900 dark:text-purple-100">Novos Processos Encontrados!</h3>
                            <p className="text-sm text-purple-700 dark:text-purple-300">
                                O sistema encontrou {pendingAnalysisCount} processos vinculados à sua OAB. Revise-os para ativar.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setStatusFilter('pending_analysis')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                    >
                        Revisar Agora
                    </button>
                </div>
            )}

            {/* Search and Filters */}
            <div className="card-premium p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {isSelectionMode && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedProcesses.size === sortedProcesses.length && sortedProcesses.length > 0}
                                onChange={toggleSelectAll}
                                className="w-5 h-5 rounded border-gray-300 text-[rgb(var(--accent-primary))] focus:ring-[rgb(var(--accent-primary))]  cursor-pointer"
                            />
                            <span className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                                Selecionar Todos
                            </span>
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row gap-4 items-center flex-1 w-full">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] pointer-events-none" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por número, título ou cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-premium w-full !pl-16 pr-4"
                            />
                        </div>

                        {/* Tribunal Filter */}
                        <div className="relative min-w-[180px] w-full md:w-auto">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] pointer-events-none z-10" size={18} />
                            <select
                                value={tribunalFilter}
                                onChange={(e) => setTribunalFilter(e.target.value)}
                                className="input-premium pl-12 pr-10 w-full appearance-none cursor-pointer"
                            >
                                <option value="all">Todos os Tribunais</option>
                                {uniqueTribunals.map(tribunal => (
                                    <option key={tribunal} value={tribunal}>{tribunal}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[rgb(var(--text-tertiary))]">
                                <ChevronDown size={14} />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="relative min-w-[180px] w-full md:w-auto">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] pointer-events-none z-10" size={18} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="input-premium pl-12 pr-10 w-full appearance-none cursor-pointer"
                            >
                                <option value="all">Todos os Status</option>
                                <option value="active">Ativos</option>
                                <option value="inactive">Inativos</option>
                                <option value="suspended">Suspensos</option>
                                <option value="archived">Arquivados</option>
                                <option value="finished">Finalizados</option>
                                <option value="pending_analysis">Análise Pendente</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[rgb(var(--text-tertiary))]">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                </div>
            </div>

            {/* Content - List or Grid View */}
            {sortedProcesses.length === 0 ? (
                <div className="card-premium p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-24 h-24 bg-[rgb(var(--bg-tertiary))] rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Search size={48} className="text-[rgb(var(--text-tertiary))]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-3">Nenhum processo encontrado</h3>
                    <p className="text-[rgb(var(--text-secondary))] max-w-md mx-auto mb-8 text-lg">
                        Não encontramos nenhum processo com os filtros atuais. Tente buscar por outro termo ou limpe os filtros.
                    </p>
                    <button
                        onClick={() => { setSearchTerm(''); setStatusFilter('all'); setTribunalFilter('all'); }}
                        className="btn-premium flex items-center gap-2"
                    >
                        <RefreshCw size={18} />
                        Limpar Filtros
                    </button>
                </div>
            ) : viewMode === 'list' ? (
                <div className="card-premium overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] text-xs uppercase font-semibold border-b border-[rgb(var(--border-subtle))]">
                                <tr>
                                    <th className="px-6 py-4 text-left cursor-pointer group hover:bg-[rgb(var(--bg-secondary))] transition-colors" onClick={() => handleSort('number')}>
                                        <div className="flex items-center gap-2">
                                            Processo
                                            {getSortIcon('number')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left cursor-pointer group hover:bg-[rgb(var(--bg-secondary))] transition-colors" onClick={() => handleSort('clientName')}>
                                        <div className="flex items-center gap-2">
                                            Cliente
                                            {getSortIcon('clientName')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left cursor-pointer group hover:bg-[rgb(var(--bg-secondary))] transition-colors" onClick={() => handleSort('court')}>
                                        <div className="flex items-center gap-2">
                                            Tribunal
                                            {getSortIcon('court')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left cursor-pointer group hover:bg-[rgb(var(--bg-secondary))] transition-colors" onClick={() => handleSort('value')}>
                                        <div className="flex items-center gap-2">
                                            Valor
                                            {getSortIcon('value')}
                                        </div>
                                    </th>
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
                                {sortedProcesses.map((process) => {
                                    const client = clients.find(c => c.id === process.clientId);
                                    return (
                                        <ProcessListItem
                                            key={process.id}
                                            process={process}
                                            client={client}
                                            onClick={() => handleOpenDetailsModal(process)}
                                            onEdit={(e) => { e.stopPropagation(); handleOpenEditModal(process); }}
                                            onDelete={(e) => { e.stopPropagation(); handleDeleteProcess(process.id); }}
                                        />
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sortedProcesses.map(p => p.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3 pb-20">
                            {sortedProcesses.map((process) => {
                                const client = clients.find(c => c.id === process.clientId);
                                return (
                                    <ProcessCard
                                        key={process.id}
                                        process={process}
                                        client={client}
                                        onClick={() => handleOpenDetailsModal(process)}
                                        onEdit={(e) => { e.stopPropagation(); handleOpenEditModal(process); }}
                                        onDelete={(e) => { e.stopPropagation(); handleDeleteProcess(process.id); }}
                                        isSelectionMode={isSelectionMode}
                                        isSelected={selectedProcesses.has(process.id)}
                                        onToggleSelect={() => toggleSelectProcess(process.id)}
                                    />
                                );
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Modals */}
            <ProcessFormModal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                onSave={handleSaveProcess}
                initialData={selectedProcess}
            />

            {
                selectedProcess && (
                    <ProcessDetailsModal
                        isOpen={showDetailsModal}
                        onClose={() => setShowDetailsModal(false)}
                        onEdit={() => {
                            setShowDetailsModal(false);
                            handleOpenEditModal(selectedProcess);
                        }}
                        process={selectedProcess}
                    />
                )
            }

            <BatchImportModal
                isOpen={showBatchImportModal}
                onClose={() => setShowBatchImportModal(false)}
            />
        </div >
    );
};
