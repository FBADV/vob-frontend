import React, { useMemo } from 'react';
import { X, MapPin, Phone, Mail, FileText, User, Edit2, Scale, Calendar, DollarSign, Building2, Briefcase, Clock } from 'lucide-react';
import type { Client, Process } from '../types';
import { useGlobalData } from '../context/GlobalDataContext';
import { formatCNJNumber } from '../utils/formatters';
import { getCourtTypeLabel } from '../utils/courtUtils';
import { COURT_COLORS } from '../types';

import { ChatLinkSuggestion } from './chat/ChatLinkSuggestion';
import { DocumentUploadModal } from './DocumentUploadModal';
import { documentsService, type Document } from '../services/database.service';
import { Upload, Download, Trash2, FolderOpen } from 'lucide-react';

interface ClientProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    onEdit: () => void;
    onOpenProcess: (process: Process) => void;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({ isOpen, onClose, client, onEdit, onOpenProcess }) => {
    const { processes, clients, services, updateProcess } = useGlobalData();

    const clientProcesses = useMemo(() => {
        return processes
            .filter(p => p.clientId === client.id)
            .sort((a, b) => {
                const dateA = new Date(a.lastSyncAt || a.updatedAt).getTime();
                const dateB = new Date(b.lastSyncAt || b.updatedAt).getTime();
                return dateB - dateA;
            });
    }, [processes, client.id]);

    const clientServices = useMemo(() => {
        return services
            .filter(s => s.clientId === client.id)
            .sort((a, b) => {
                const dateA = new Date(a.createdAt || a.date).getTime();
                const dateB = new Date(b.createdAt || b.date).getTime();
                return dateB - dateA;
            });
    }, [services, client.id]);

    // Documents State
    const [showUploadModal, setShowUploadModal] = React.useState(false);
    const [documents, setDocuments] = React.useState<Document[]>([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = React.useState(false);

    const loadDocuments = React.useCallback(async () => {
        if (!client.id) return;
        setIsLoadingDocuments(true);
        try {
            const docs = await documentsService.getByClientId(client.id);
            setDocuments(docs);
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setIsLoadingDocuments(false);
        }
    }, [client.id]);

    React.useEffect(() => {
        if (isOpen) {
            loadDocuments();
        }
    }, [isOpen, loadDocuments]);

    const handleDeleteDocument = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este documento?')) {
            try {
                await documentsService.delete(id);
                // Reload documents
                const docs = await documentsService.getByClientId(client.id);
                setDocuments(docs);
            } catch (error) {
                console.error('Error deleting document:', error);
            }
        }
    };

    // Load portal access status - Removed
    /*
    useEffect(() => {
        if (isOpen && client.id) {
            loadPortalStatus();
        }
    }, [isOpen, client.id]);

    const loadPortalStatus = async () => {
        setLoadingPortal(true);
        try {
            const access = await clientPortalService.getPortalAccess(client.id);
            setPortalAccess(access);
        } catch (err) {
            console.error('Error loading portal status:', err);
        } finally {
            setLoadingPortal(false);
        }
    };
    */

    const representative = useMemo(() => {
        if (client.type === 'company' && client.representativeId) {
            return clients.find(c => c.id === client.representativeId);
        }
        return null;
    }, [clients, client.type, client.representativeId]);

    if (!isOpen) return null;

    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const totalValue = clientProcesses.reduce((acc, curr) => acc + (curr.value || 0), 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-[rgb(var(--border-subtle))] animate-scale-in">

                <div className="flex-1 overflow-y-auto bg-[rgb(var(--bg-primary))]/50 relative z-10 custom-scrollbar">
                    {/* Header / Cover Area - Moved inside scroll to avoid avatar clipping */}
                    <div className="h-32 bg-gradient-to-r from-[rgb(var(--bg-primary))] via-[rgb(var(--bg-secondary))] to-[rgb(var(--bg-primary))] relative z-0 border-b border-[rgb(var(--border-subtle))]">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm z-50"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="px-8 pb-8">
                        {/* Profile Header Section */}
                        <div className="relative z-20 flex flex-col md:flex-row justify-between items-end -mt-16 mb-8 gap-6">
                            <div className="flex flex-col md:flex-row items-end gap-6">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full border-[6px] border-[rgb(var(--bg-secondary))] bg-[rgb(var(--bg-secondary))] overflow-hidden shadow-2xl flex items-center justify-center">
                                        {client.photoUrl ? (
                                            <img src={client.photoUrl} alt={client.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[rgb(var(--bg-tertiary))] to-[rgb(var(--bg-secondary))] flex items-center justify-center">
                                                <span className="text-4xl font-bold text-[rgb(var(--text-secondary))]">
                                                    {getInitials(client.name)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Representative Avatar (Overlapping) */}
                                    {representative && (
                                        <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full border-4 border-[rgb(var(--bg-secondary))] bg-[rgb(var(--bg-secondary))] overflow-hidden shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform z-10" title={`Representante: ${representative.name}`}>
                                            {representative.photoUrl ? (
                                                <img src={representative.photoUrl} alt={representative.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-purple-500 dark:text-purple-300">
                                                        {getInitials(representative.name)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-1">
                                    <h1 className="text-4xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-3 leading-tight">
                                        {client.socialName || client.name}
                                        {client.type === 'company' && (
                                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-xs font-bold tracking-wide uppercase shadow-sm align-middle">
                                                Corporativo
                                            </span>
                                        )}
                                    </h1>
                                    {client.socialName && (
                                        <p className="text-lg text-[rgb(var(--text-secondary))] font-medium mb-2">{client.name}</p>
                                    )}
                                    <div className="flex items-center gap-4 mt-3 text-[rgb(var(--text-tertiary))]">
                                        <span className="flex items-center gap-2 text-sm font-medium bg-[rgb(var(--bg-tertiary))] px-3 py-1.5 rounded-lg border border-[rgb(var(--border-subtle))]">
                                            <FileText size={16} className="text-[rgb(var(--accent-primary))]" />
                                            {client.document}
                                        </span>
                                        {representative && (
                                            <span className="flex items-center gap-2 text-sm font-medium bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                                                <User size={16} />
                                                Rep: {representative.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onEdit}
                                className="btn-secondary-premium flex items-center gap-2 mb-1"
                                title="Editar Perfil"
                            >
                                <Edit2 size={18} />
                                <span className="hidden sm:inline font-medium">Editar Perfil</span>
                            </button>
                        </div>

                        {/* Chat Link */}
                        <div className="mb-8 animate-fade-in">
                            <ChatLinkSuggestion
                                type="client"
                                id={client.id}
                                name={client.name}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Info & Stats */}
                            <div className="space-y-6">
                                {/* Contact Card */}
                                <div className="card-premium p-6">
                                    <h3 className="text-sm font-bold text-[rgb(var(--text-primary))] uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <User size={16} className="text-[rgb(var(--accent-primary))]" />
                                        Contatos
                                    </h3>
                                    <div className="space-y-4">
                                        {client.email && (
                                            <div className="flex items-start gap-3 group">
                                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                                    <Mail size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[rgb(var(--text-tertiary))] font-medium">Email</p>
                                                    <p className="text-sm text-[rgb(var(--text-primary))] font-medium break-all">{client.email}</p>
                                                </div>
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className="flex items-start gap-3 group">
                                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                                                    <Phone size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[rgb(var(--text-tertiary))] font-medium">Telefone</p>
                                                    <p className="text-sm text-[rgb(var(--text-primary))] font-medium">{client.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {(client.street || client.city) && (
                                            <div className="flex items-start gap-3 group">
                                                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                                                    <MapPin size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[rgb(var(--text-tertiary))] font-medium">Endereço</p>
                                                    <p className="text-sm text-[rgb(var(--text-primary))] font-medium leading-relaxed">
                                                        {[
                                                            client.street,
                                                            client.number,
                                                            client.neighborhood,
                                                            client.city,
                                                            client.state
                                                        ].filter(Boolean).join(', ')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="card-premium p-5">
                                        <div className="flex items-center gap-2 mb-2 text-[rgb(var(--text-tertiary))]">
                                            <Briefcase size={16} />
                                            <span className="text-xs font-bold uppercase">Processos</span>
                                        </div>
                                        <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">{clientProcesses.length}</p>
                                        <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">
                                            {clientProcesses.filter(p => p.status === 'active').length} ativos
                                        </p>
                                    </div>
                                    <div className="card-premium p-5">
                                        <div className="flex items-center gap-2 mb-2 text-[rgb(var(--text-tertiary))]">
                                            <DollarSign size={16} />
                                            <span className="text-xs font-bold uppercase">Valor Total</span>
                                        </div>
                                        <p className="text-lg font-bold text-[rgb(var(--text-primary))] truncate" title={formatCurrency(totalValue)}>
                                            {formatCurrency(totalValue)}
                                        </p>
                                        <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">Em causas</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Processes List */}
                            <div className="lg:col-span-2">
                                <div className="card-premium h-full flex flex-col p-0 overflow-hidden">
                                    <div className="p-6 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center bg-[rgb(var(--bg-secondary))]">
                                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                                            <Scale className="text-[rgb(var(--accent-primary))]" size={20} />
                                            Processos Vinculados
                                        </h3>
                                        <span className="px-3 py-1 bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] rounded-full text-xs font-medium">
                                            {clientProcesses.length} registros
                                        </span>
                                    </div>

                                    <div className="p-6 flex-1 overflow-y-auto max-h-[500px] bg-[rgb(var(--bg-primary))]/30">
                                        {clientProcesses.length > 0 ? (
                                            <div className="space-y-4">
                                                {clientProcesses.map(process => (
                                                    <div
                                                        key={process.id}
                                                        onClick={() => onOpenProcess(process)}
                                                        className="group bg-[rgb(var(--bg-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl p-5 border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent-primary))]/30 hover:shadow-md transition-all duration-200 cursor-pointer"
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-[rgb(var(--bg-tertiary))] rounded-lg shadow-sm text-[rgb(var(--text-tertiary))] group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                                                                    <Building2 size={20} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-[rgb(var(--text-primary))] text-base leading-tight mb-1 group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                                                                        {process.title}
                                                                    </h4>
                                                                    <p className="text-xs text-[rgb(var(--text-secondary))] font-mono bg-[rgb(var(--bg-tertiary))] px-2 py-0.5 rounded w-fit">
                                                                        {formatCNJNumber(process.number)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="relative group/status" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${process.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                                        process.status === 'suspended' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                                                                            process.status === 'archived' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' :
                                                                                process.status === 'pending_analysis' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                                                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                        }`}
                                                                >
                                                                    {process.status === 'active' ? 'Ativo' :
                                                                        process.status === 'suspended' ? 'Suspenso' :
                                                                            process.status === 'archived' ? 'Arquivado' :
                                                                                process.status === 'pending_analysis' ? 'Análise Pendente' :
                                                                                    'Inativo'}
                                                                    <Edit2 size={10} className="opacity-50" />
                                                                </button>

                                                                {/* Status Dropdown */}
                                                                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden hidden group-hover/status:block z-20">
                                                                    <div className="p-1">
                                                                        <button
                                                                            onClick={() => updateProcess(process.id, { ...process, status: 'active' })}
                                                                            className="w-full text-left px-3 py-1.5 text-xs text-green-700 hover:bg-green-50 rounded-md flex items-center gap-2"
                                                                        >
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                                            Ativo
                                                                        </button>
                                                                        <button
                                                                            onClick={() => updateProcess(process.id, { ...process, status: 'suspended' })}
                                                                            className="w-full text-left px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 rounded-md flex items-center gap-2"
                                                                        >
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                                                            Suspenso
                                                                        </button>
                                                                        <button
                                                                            onClick={() => updateProcess(process.id, { ...process, status: 'inactive' })}
                                                                            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"
                                                                        >
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                                                                            Inativo
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[rgb(var(--border-subtle))]">
                                                            {process.courtType && (
                                                                <div>
                                                                    <p className="text-xs text-[rgb(var(--text-tertiary))] mb-1.5">Tipo</p>
                                                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${COURT_COLORS[process.courtType].bg} ${COURT_COLORS[process.courtType].text} ${COURT_COLORS[process.courtType].border} border`}>
                                                                        {getCourtTypeLabel(process.courtType)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-xs text-[rgb(var(--text-tertiary))] mb-1.5">Tribunal/Vara</p>
                                                                <p className="text-sm font-medium text-[rgb(var(--text-secondary))] truncate" title={process.court}>
                                                                    {process.court || 'N/A'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-[rgb(var(--text-tertiary))] mb-1.5">Valor da Causa</p>
                                                                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                                                    {formatCurrency(process.value)}
                                                                </p>
                                                            </div>
                                                            <div className="hidden sm:block">
                                                                <p className="text-xs text-[rgb(var(--text-tertiary))] mb-1.5">Última Atualização</p>
                                                                <div className="flex items-center gap-1.5 text-sm font-medium text-[rgb(var(--text-secondary))]">
                                                                    <Calendar size={14} className="text-[rgb(var(--text-tertiary))]" />
                                                                    {new Date(process.lastSyncAt || process.updatedAt).toLocaleDateString('pt-BR')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-[rgb(var(--text-tertiary))] py-12">
                                                <div className="w-16 h-16 bg-[rgb(var(--bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                                                    <Scale size={32} className="opacity-50" />
                                                </div>
                                                <p className="text-lg font-medium">Nenhum processo vinculado</p>
                                                <p className="text-sm">Este cliente ainda não possui processos cadastrados.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Services Section */}
                                {clientServices.length > 0 && (
                                    <div className="mt-8">
                                        <div className="card-premium p-0 overflow-hidden">
                                            <div className="p-6 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center bg-[rgb(var(--bg-secondary))]">
                                                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                                                    <FileText className="text-[rgb(var(--accent-primary))]" size={20} />
                                                    Histórico de Atendimentos
                                                </h3>
                                                <span className="px-3 py-1 bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] rounded-full text-xs font-medium">
                                                    {clientServices.length} registros
                                                </span>
                                            </div>

                                            <div className="p-6 bg-[rgb(var(--bg-primary))]/30">
                                                <div className="space-y-3">
                                                    {clientServices.map(service => (
                                                        <div
                                                            key={service.id}
                                                            className="bg-[rgb(var(--bg-secondary))] rounded-xl p-4 border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent-primary))]/30 hover:shadow-md transition-all duration-200"
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="flex-1">
                                                                    <h4 className="font-bold text-[rgb(var(--text-primary))] text-sm mb-1">
                                                                        {service.title}
                                                                    </h4>
                                                                    {service.types && service.types.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                                            {service.types.map((type, idx) => (
                                                                                <span
                                                                                    key={idx}
                                                                                    className="px-2 py-0.5 bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] rounded text-xs font-medium"
                                                                                >
                                                                                    {type}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ml-3 ${service.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                                    service.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                                                                    }`}>
                                                                    {service.status === 'scheduled' ? 'Agendado' :
                                                                        service.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-4 text-xs text-[rgb(var(--text-secondary))]">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar size={14} className="text-[rgb(var(--text-tertiary))]" />
                                                                    {new Date(service.date).toLocaleDateString('pt-BR')}
                                                                </div>
                                                                {service.time && (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Clock size={14} className="text-[rgb(var(--text-tertiary))]" />
                                                                        {service.time}
                                                                    </div>
                                                                )}
                                                                {service.convertedToProcessId && (
                                                                    <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
                                                                        <Scale size={14} />
                                                                        Evoluído para Processo
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {service.description && (
                                                                <p className="mt-3 text-xs text-[rgb(var(--text-secondary))] line-clamp-2 bg-[rgb(var(--bg-tertiary))]/50 p-2 rounded">
                                                                    {service.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Documents Section */}
                                <div className="mt-8">
                                    <div className="card-premium p-0 overflow-hidden">
                                        <div className="p-6 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center bg-[rgb(var(--bg-secondary))]">
                                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                                                <FolderOpen className="text-[rgb(var(--accent-primary))]" size={20} />
                                                Documentos do Cliente
                                            </h3>
                                            <button
                                                onClick={() => setShowUploadModal(true)}
                                                className="btn-premium py-1.5 px-3 text-xs flex items-center gap-1.5"
                                            >
                                                <Upload size={14} />
                                                Novo Documento
                                            </button>
                                        </div>

                                        <div className="p-6 bg-[rgb(var(--bg-primary))]/30">
                                            {isLoadingDocuments ? (
                                                <div className="flex justify-center py-8">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[rgb(var(--accent-primary))]"></div>
                                                </div>
                                            ) : documents.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <p className="text-sm text-[rgb(var(--text-secondary))] mb-3">
                                                        Nenhum documento anexado.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {documents.map((doc) => (
                                                        <div key={doc.id} className="group bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] rounded-lg p-3 hover:shadow-sm transition-all hover:border-[rgb(var(--accent-primary))]">
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-[rgb(var(--bg-tertiary))] rounded-md text-[rgb(var(--text-secondary))]">
                                                                    <FileText size={20} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-medium text-[rgb(var(--text-primary))] text-sm truncate mb-0.5">
                                                                        {doc.title}
                                                                    </h4>
                                                                    <div className="flex items-center gap-1.5 text-[10px] text-[rgb(var(--text-secondary))]">
                                                                        <span className="uppercase">{doc.type}</span>
                                                                        <span>•</span>
                                                                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <a
                                                                        href={doc.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-1.5 hover:bg-[rgb(var(--bg-tertiary))] rounded text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))]"
                                                                        title="Baixar"
                                                                    >
                                                                        <Download size={14} />
                                                                    </a>
                                                                    <button
                                                                        onClick={() => handleDeleteDocument(doc.id)}
                                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-[rgb(var(--text-secondary))] hover:text-red-500"
                                                                        title="Excluir"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Document Upload Modal */}
            <DocumentUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={loadDocuments}
                clientId={client.id}
            />
        </div>
    );
};
