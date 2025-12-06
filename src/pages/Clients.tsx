import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalData } from '../context/GlobalDataContext';
import { ModuleHeader } from '../components/ModuleHeader';
import { ViewToggle } from '../components/ViewToggle';
import { Plus, Search, Mail, Phone, FileText, User as UserIcon, Building, Edit2, Trash2, MapPin, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Filter, RefreshCw, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import type { Client } from '../types';
import { ClientFormModal } from '../components/ClientFormModal';
import { ClientProfileModal } from '../components/ClientProfileModal';
import { ProcessDetailsModal } from '../components/ProcessDetailsModal';
import { ClientListItem } from '../components/clients/ClientListItem';
import { matchesSearch } from '../utils/searchUtils';
import type { Process } from '../types';
import { ClientAvatar } from '../components/ClientAvatar';

export const Clients: React.FC = () => {
    const { clients, deleteClient, deleteBatchClients, processes } = useGlobalData();
    const { startWhatsAppConversation } = useChat();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
        const saved = localStorage.getItem('clients-view-mode');
        return (saved as 'list' | 'grid') || 'grid';
    });
    const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const [sortConfig, setSortConfig] = useState<{ key: keyof Client | 'processCount', direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' });
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // Modal States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
    const [clientToView, setClientToView] = useState<Client | null>(null);

    // Process Details Modal State
    const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
    const [isProcessDetailsOpen, setIsProcessDetailsOpen] = useState(false);

    const location = useLocation();

    // Persist view mode preference
    useEffect(() => {
        localStorage.setItem('clients-view-mode', viewMode);
    }, [viewMode]);

    // Check for openCreateModal in location state
    useEffect(() => {
        if (location.state && (location.state as any).openCreateModal) {
            handleCreateClient();
            // Clear state to prevent reopening on refresh (optional, but good practice)
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const filteredClients = useMemo(() => {
        let filtered = clients.filter(client => {
            const matchesSearchTerm =
                matchesSearch(client.name, searchTerm) ||
                matchesSearch(client.cpfCnpj, searchTerm) ||
                matchesSearch(client.phone, searchTerm) ||
                matchesSearch(client.email, searchTerm);

            const matchesType = typeFilter === 'all' || client.type === typeFilter;

            return matchesSearchTerm && matchesType;
        });

        return filtered.sort((a, b) => {
            let aValue: any = a[sortConfig.key as keyof Client];
            let bValue: any = b[sortConfig.key as keyof Client];

            if (sortConfig.key === 'processCount') {
                aValue = processes.filter(p => p.clientId === a.id).length;
                bValue = processes.filter(p => p.clientId === b.id).length;
            }

            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [clients, processes, searchTerm, typeFilter, sortConfig]);

    const handleSort = (key: keyof Client | 'processCount') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIcon = (key: string) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-[rgb(var(--accent-primary))]" /> : <ArrowDown size={14} className="text-[rgb(var(--accent-primary))]" />;
    };

    const handleCreateClient = () => {
        setClientToEdit(null);
        setIsFormOpen(true);
    };

    const handleViewClient = (client: Client) => {
        setClientToView(client);
    };

    const handleEditClient = (client: Client) => {
        setClientToView(null); // Close profile if open
        setClientToEdit(client);
        setIsFormOpen(true);
    };

    const handleOpenProcess = (process: Process) => {
        setSelectedProcess(process);
        setIsProcessDetailsOpen(true);
    };

    const handleDeleteClient = (id: string) => {
        const clientProcesses = processes.filter(p => p.clientId === id);
        if (clientProcesses.length > 0) {
            alert(`Não é possível excluir este cliente pois ele possui ${clientProcesses.length} processo(s) vinculado(s).`);
            return;
        }

        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            deleteClient(id);
        }
    };

    const handleWhatsApp = async (client: Client) => {
        try {
            await startWhatsAppConversation({
                id: client.id,
                name: client.name,
                phone: client.phone,
                photo: client.photoUrl
            });
            navigate('/chat');
        } catch (error) {
            console.error('Error starting WhatsApp conversation:', error);
            alert('Erro ao iniciar conversa no WhatsApp');
        }
    };

    // Batch delete handlers
    const toggleSelectClient = (id: string) => {
        setSelectedClients(prev => {
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
        if (selectedClients.size === filteredClients.length) {
            setSelectedClients(new Set());
        } else {
            setSelectedClients(new Set(filteredClients.map(c => c.id)));
        }
    };

    const handleBatchDelete = () => {
        if (selectedClients.size === 0) return;

        const confirmMsg = `Tem certeza que deseja excluir ${selectedClients.size} cliente(s)?`;
        if (window.confirm(confirmMsg)) {
            deleteBatchClients(Array.from(selectedClients));
            setSelectedClients(new Set());
            setIsSelectionMode(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Module Header */}
            <ModuleHeader
                icon={UserIcon}
                title="Clientes"
                subtitle={`${filteredClients.length} ${filteredClients.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}`}
                action={
                    <div className="flex flex-wrap gap-3">
                        {isSelectionMode ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsSelectionMode(false);
                                        setSelectedClients(new Set());
                                    }}
                                    className="btn-secondary-premium flex items-center gap-2"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleBatchDelete}
                                    disabled={selectedClients.size === 0}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    Excluir ({selectedClients.size})
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
                                    onClick={handleCreateClient}
                                    className="btn-premium flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Novo Cliente
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
                                checked={selectedClients.size === filteredClients.length && filteredClients.length > 0}
                                onChange={toggleSelectAll}
                                className="w-5 h-5 rounded border-gray-300 text-[rgb(var(--accent-primary))] focus:ring-[rgb(var(--accent-primary))] cursor-pointer"
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
                                placeholder="Buscar por nome, email ou documento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-premium w-full !pl-16 pr-4"
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="relative min-w-[180px] w-full md:w-auto">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] pointer-events-none z-10" size={18} />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="input-premium pl-12 pr-10 w-full appearance-none cursor-pointer"
                            >
                                <option value="all">Todos os Tipos</option>
                                <option value="individual">Pessoa Física</option>
                                <option value="company">Pessoa Jurídica</option>
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
            {filteredClients.length === 0 ? (
                <div className="card-premium p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-24 h-24 bg-[rgb(var(--bg-tertiary))] rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <UserIcon size={48} className="text-[rgb(var(--text-tertiary))]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-3">
                        Nenhum cliente encontrado
                    </h3>
                    <p className="text-[rgb(var(--text-secondary))] max-w-md mx-auto mb-8 text-lg">
                        {searchTerm || typeFilter !== 'all' ? 'Tente ajustar sua busca ou limpar os filtros.' : 'Comece adicionando seu primeiro cliente.'}
                    </p>
                    {searchTerm || typeFilter !== 'all' ? (
                        <button
                            onClick={() => { setSearchTerm(''); setTypeFilter('all'); }}
                            className="btn-premium flex items-center gap-2"
                        >
                            <RefreshCw size={18} />
                            Limpar Filtros
                        </button>
                    ) : (
                        <button
                            onClick={handleCreateClient}
                            className="btn-premium inline-flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Adicionar Cliente
                        </button>
                    )}
                </div>
            ) : viewMode === 'list' ? (
                <div className="card-premium overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] text-xs uppercase font-semibold border-b border-[rgb(var(--border-subtle))]">
                                <tr>
                                    <th className="px-6 py-4 text-left cursor-pointer group hover:bg-[rgb(var(--bg-secondary))] transition-colors" onClick={() => handleSort('name')}>
                                        <div className="flex items-center gap-2">
                                            Cliente
                                            {getSortIcon('name')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left cursor-pointer group hover:bg-[rgb(var(--bg-secondary))] transition-colors" onClick={() => handleSort('email')}>
                                        <div className="flex items-center gap-2">
                                            Email
                                            {getSortIcon('email')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left cursor-pointer group hover:bg-[rgb(var(--bg-secondary))] transition-colors" onClick={() => handleSort('phone')}>
                                        <div className="flex items-center gap-2">
                                            Telefone
                                            {getSortIcon('phone')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left cursor-pointer group hover:bg-[rgb(var(--bg-secondary))] transition-colors" onClick={() => handleSort('document')}>
                                        <div className="flex items-center gap-2">
                                            Documento
                                            {getSortIcon('document')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map((client) => (
                                    <ClientListItem
                                        key={client.id}
                                        client={client}
                                        onClick={() => handleViewClient(client)}
                                        onEdit={(e) => { e.stopPropagation(); handleEditClient(client); }}
                                        onDelete={(e) => { e.stopPropagation(); handleDeleteClient(client.id); }}
                                        onWhatsApp={(e) => { e.stopPropagation(); handleWhatsApp(client); }}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredClients.map((client, index) => {
                    const clientProcessCount = processes.filter(p => p.clientId === client.id).length;
                    const representative = client.type === 'company' && client.representativeId
                        ? clients.find(c => c.id === client.representativeId)
                        : null;

                    return (
                        <div
                            key={client.id}
                            onClick={() => handleViewClient(client)}
                            className="group card-premium p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden"
                            style={{
                                animationDelay: `${index * 50}ms`,
                                animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) both'
                            }}
                        >
                            {/* Gradient Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent-primary))]/5 to-[rgb(var(--accent-secondary))]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Content */}
                            <div className="relative">
                                {/* Avatar and Name */}
                                <div className="flex items-center gap-4 mb-4 mt-2">
                                    {/* Selection Checkbox */}
                                    {isSelectionMode && (
                                        <div className="flex-shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedClients.has(client.id)}
                                                onChange={() => toggleSelectClient(client.id)}
                                                className="w-5 h-5 rounded border-gray-300 text-[rgb(var(--accent-primary))] focus:ring-[rgb(var(--accent-primary))] cursor-pointer"
                                            />
                                        </div>
                                    )}
                                    <div className="relative">
                                        <ClientAvatar
                                            client={client}
                                            size="xl"
                                            className="ring-2 ring-[rgb(var(--border-default))] group-hover:ring-[rgb(var(--accent-primary))] transition-all group-hover:scale-105"
                                            representativeName={representative?.name}
                                            representativePhotoUrl={representative?.photoUrl}
                                        />
                                        {/* Type Badge on Avatar - Only show if NO representative (otherwise it overlaps) */}
                                        {!representative && (
                                            <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-[rgb(var(--bg-secondary))] shadow-md">
                                                {client.type === 'individual' ? (
                                                    <UserIcon size={12} className="text-blue-600" />
                                                ) : (
                                                    <Building size={12} className="text-purple-600" />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[rgb(var(--text-primary))] text-lg mb-1 truncate group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                                            {client.name}
                                        </h3>
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border w-fit ${client.type === 'individual'
                                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                                                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30'
                                                }`}>
                                                {client.type === 'individual' ? (
                                                    <>
                                                        <UserIcon size={12} />
                                                        Pessoa Física
                                                    </>
                                                ) : (
                                                    <>
                                                        <Building size={12} />
                                                        Pessoa Jurídica
                                                    </>
                                                )}
                                            </span>
                                            {representative && (
                                                <span className="text-xs text-[rgb(var(--text-tertiary))] flex items-center gap-1">
                                                    <UserIcon size={12} />
                                                    Rep: <span className="font-medium text-[rgb(var(--text-secondary))] truncate max-w-[120px]">{representative.name}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2.5 mb-4">
                                    <div className="flex items-center gap-2.5 text-sm text-[rgb(var(--text-secondary))]">
                                        <Mail size={16} className="text-[rgb(var(--accent-primary))] flex-shrink-0" />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm text-[rgb(var(--text-secondary))]">
                                        <Phone size={16} className="text-[rgb(var(--accent-primary))] flex-shrink-0" />
                                        <span>{client.phone}</span>
                                    </div>
                                    {(client.city || client.state) && (
                                        <div className="flex items-center gap-2.5 text-sm text-[rgb(var(--text-secondary))]">
                                            <MapPin size={16} className="text-[rgb(var(--accent-primary))] flex-shrink-0" />
                                            <span className="truncate">
                                                {client.city}{client.city && client.state && ', '}{client.state}
                                            </span>
                                        </div>
                                    )}
                                    {client.type === 'company' && client.representativeId && (
                                        <div className="flex items-center gap-2.5 text-sm text-[rgb(var(--text-secondary))] pt-1">
                                            <UserIcon size={16} className="text-purple-500 flex-shrink-0" />
                                            <span className="truncate">
                                                Resp: {clients.find(c => c.id === client.representativeId)?.name || 'N/A'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Process Count Badge */}
                                <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--border-subtle))]">
                                    <div className="flex items-center gap-2 text-sm">
                                        <FileText size={16} className="text-[rgb(var(--text-tertiary))]" />
                                        <span className="text-[rgb(var(--text-secondary))]">
                                            {clientProcessCount} {clientProcessCount === 1 ? 'processo' : 'processos'}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleWhatsApp(client);
                                            }}
                                            className="p-2 rounded-lg hover:bg-green-500/10 text-green-600 transition-colors"
                                            title="WhatsApp"
                                        >
                                            <MessageCircle size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClient(client);
                                            }}
                                            className="p-2 rounded-lg hover:bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))] transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteClient(client.id); }}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                </div>

            )}

            {/* Modals */}
            <ClientFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                clientToEdit={clientToEdit}
            />

            {
                clientToView && (
                    <ClientProfileModal
                        isOpen={!!clientToView}
                        onClose={() => setClientToView(null)}
                        client={clientToView}
                        onEdit={() => handleEditClient(clientToView)}
                        onOpenProcess={handleOpenProcess}
                    />
                )
            }

            {
                selectedProcess && (
                    <ProcessDetailsModal
                        isOpen={isProcessDetailsOpen}
                        onClose={() => setIsProcessDetailsOpen(false)}
                        process={selectedProcess}
                    />
                )
            }
        </div >
    );
};
