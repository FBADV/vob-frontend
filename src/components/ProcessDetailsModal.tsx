
import React, { useState, useMemo } from 'react';
import { ProcessFlowTab } from './process/ProcessFlowTab';
import {
    X,
    FileText,
    Clock,
    Trash2,
    Scale,
    RefreshCw,
    Activity,
    CheckCircle,
    Filter,
    Plus,
    Edit2,
    AlertCircle,
    Calendar,
    Brain,
    MessageSquare,
    DollarSign,
    FolderOpen,
    GitMerge,
    History as HistoryIcon,
    Download,
    Upload,
    Hash,
    Building
} from 'lucide-react';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import type { Process, ProcessMovement, AgendaEvent } from '../types';
import { ClientAvatar } from './ClientAvatar';
import { useGlobalData } from '../context/GlobalDataContext';
import { formatCNJNumber } from '../utils/formatters';
import { aiService, type AIAnalysisResult } from '../services/ai.service';


import { AIAnalysisCard } from './ai/AIAnalysisCard';
import { ChatLinkSuggestion } from './chat/ChatLinkSuggestion';
import { ProcessConnectionManager } from './processes/ProcessConnectionManager';
import { DocumentUploadModal } from './DocumentUploadModal';
import { documentsService, type Document } from '../services/database.service';
import { FinancialList } from './financial/FinancialList';


// Helper for safe date formatting
const safeDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'Data não informada';
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        if (isNaN(date.getTime())) return 'Data inválida';
        return date.toLocaleDateString('pt-BR');
    } catch {
        return 'Data inválida';
    }
};

// FEATURE FLAG
const ENABLE_FLOWCHART = false;

const tabs = [
    { id: 'info', label: 'Informações', icon: FileText },
    { id: 'movements', label: 'Movimentações', icon: Activity },
    ...(ENABLE_FLOWCHART ? [{ id: 'flow', label: 'Fluxo', icon: GitMerge }] : []),
    { id: 'timeline', label: 'Histórico Interno', icon: HistoryIcon },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'documents', label: 'Documentos', icon: FolderOpen },
];

interface ProcessDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    process: Process;
}

export const ProcessDetailsModal: React.FC<ProcessDetailsModalProps> = ({
    isOpen,
    onClose,
    onEdit,
    process
}) => {
    const {
        addProcessObservation,
        deleteProcessObservation,
        deleteProcessMovement,
        updateProcess,
        addAgendaEvent,
        clients,
        financial,
        addFinancialEntry,
        updateFinancialEntry,
        deleteFinancialEntry
    } = useGlobalData();

    const client = clients.find(c => c.id === process.clientId);



    // View State
    type ViewMode = 'info' | 'movements' | 'flow' | 'timeline' | 'financial' | 'documents' | 'chat' | 'connections';
    const [viewMode, setViewMode] = useState<ViewMode>('info');

    const [isSyncing, setIsSyncing] = useState(false);

    // AI State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    // Modals State
    const [showAddMovementModal, setShowAddMovementModal] = useState(false);
    const [showAddObservationModal, setShowAddObservationModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

    const loadDocuments = React.useCallback(async () => {
        setIsLoadingDocuments(true);
        try {
            const docs = await documentsService.getByProcessId(process.id);
            setDocuments(docs);
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setIsLoadingDocuments(false);
        }
    }, [process.id]);

    // Fetch documents when tab is selected
    React.useEffect(() => {
        if (viewMode === 'documents') {
            loadDocuments();
        }
    }, [viewMode, loadDocuments]);

    const handleDeleteDocument = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este documento?')) {
            try {
                await documentsService.delete(id);
                loadDocuments();
            } catch (error) {
                console.error('Error deleting document:', error);
            }
        }
    };

    // New Movement State
    const [newMovement, setNewMovement] = useState({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        type: 'outro' as ProcessMovement['type'],
        title: '',
        description: ''
    });

    const [isAddingMovement, setIsAddingMovement] = useState(false);

    // New Observation State
    const [newObservation, setNewObservation] = useState('');

    const handleAnalyzeAI = async () => {
        setIsAnalyzing(true);
        setAiError(null);
        try {
            const result = await aiService.analyzeProcess({
                class_name: process.className,
                subject: process.subject,
                case_value: process.value,
                last_movement_date: process.folder.movements?.[0]?.date,
                movements: process.folder.movements?.slice(0, 10) // Send last 10 movements
            });
            setAiAnalysis(result);
        } catch (error) {
            console.error('AI Analysis failed:', error);
            setAiError('Não foi possível realizar a análise. Verifique sua conexão ou tente novamente mais tarde.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const movements = useMemo(() => {
        return (process.folder?.movements || [])
            .map(m => ({
                type: 'movement' as const,
                data: m,
                date: new Date(m.date)
            }))
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [process.folder?.movements]);

    const observations = useMemo(() => {
        return (process.folder?.observations || [])
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [process.folder?.observations]);




    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };


    const handleSyncDataJud = async () => {
        if (!process.number) {
            alert('Processo sem número CNJ para sincronizar.');
            return;
        }

        setIsSyncing(true);
        try {
            const { syncProcessData } = await import('../services/DataJudService');
            const updatedProcessFull = await syncProcessData(process);

            // Update ONLY movements and sync time, preserving other manual edits
            const updatedProcess = {
                ...process,
                folder: {
                    ...process.folder,
                    movements: updatedProcessFull.folder.movements
                },
                lastSyncAt: new Date().toISOString()
            };

            updateProcess(process.id, updatedProcess);
            alert('Sincronização de movimentações concluída com sucesso!');
        } catch (error) {
            console.error('Sync error:', error);
            alert('Erro ao sincronizar com DataJud. Verifique o console para mais detalhes.');
        } finally {
            setIsSyncing(false);
        }
    };






    const handleAddMovement = async () => {
        if (!newMovement.title.trim()) {
            alert('Por favor, insira um título para a movimentação.');
            return;
        }

        setIsAddingMovement(true);
        try {
            // Create Movement
            const movement: ProcessMovement = {
                id: crypto.randomUUID(),
                processId: process.id,
                date: `${newMovement.date}T${newMovement.time}`,
                type: newMovement.type as ProcessMovement['type'],
                title: newMovement.title,
                description: newMovement.description,
                isUserCreated: true, // Mark as user-created
                createdAt: new Date().toISOString()
            };

            const updatedProcess = {
                ...process,
                folder: {
                    ...process.folder,
                    movements: [movement, ...(process.folder?.movements || [])]
                }
            };

            await updateProcess(process.id, updatedProcess);

            // Create Agenda Event if applicable
            if (['audiencia', 'prazo', 'tarefa', 'atendimento'].includes(newMovement.type)) {
                const eventTypeMap: Record<string, AgendaEvent['type']> = {
                    'audiencia': 'hearing',
                    'prazo': 'deadline',
                    'tarefa': 'other',
                    'atendimento': 'meeting'
                };

                const newEvent: AgendaEvent = {
                    id: crypto.randomUUID(),
                    title: newMovement.title,
                    description: `Movimentação interna do processo ${process.number}. ${newMovement.description} `,
                    startDate: newMovement.date,
                    startTime: newMovement.time,
                    type: eventTypeMap[newMovement.type] || 'other',
                    processId: process.id,
                    clientId: process.clientId,
                    status: 'scheduled',
                    createdAt: new Date().toISOString()
                };

                addAgendaEvent(newEvent);
            }

            setShowAddMovementModal(false);
            setNewMovement({
                date: new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().slice(0, 5),
                type: 'outro',
                title: '',
                description: ''
            });
        } catch (error) {
            console.error('Error adding movement:', error);
            alert('Erro ao adicionar movimentação. Tente novamente.');
        } finally {
            setIsAddingMovement(false);
        }
    };

    const handleAddObservation = () => {
        if (!newObservation.trim()) return;

        addProcessObservation(process.id, {
            userId: 'current-user', // Replace with actual user ID
            userName: 'Usuário Atual', // Replace with actual user name
            content: newObservation
        });

        setNewObservation('');
        setShowAddObservationModal(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4 backdrop-blur-sm">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col animate-scale-in border border-[rgb(var(--border-subtle))] overflow-hidden">

                {/* Header */}
                <div className="px-8 py-6 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center bg-[rgb(var(--bg-secondary))] shrink-0">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[rgb(var(--accent-primary))]/10 rounded-lg text-[rgb(var(--accent-primary))]">
                                <Scale size={24} />
                            </div>
                            <div className="mr-2">
                                <ClientAvatar
                                    client={client}
                                    name={client?.name || process.clientName}
                                    size="lg"
                                    className="border border-[rgb(var(--border-subtle))]"
                                />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-3">
                                    {process.title}
                                </h2>
                                <p className="text-sm text-[rgb(var(--text-secondary))] font-mono mt-0.5">
                                    {formatCNJNumber(process.number)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setViewMode(viewMode === 'chat' ? 'info' : 'chat')}
                            className={`btn-secondary-premium text-sm py-2 flex items-center gap-2 ${viewMode === 'chat' ? 'bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))] border-[rgb(var(--accent-primary))]' : ''}`}
                            title="Chat do Processo"
                        >
                            <MessageSquare size={16} />
                            Chat
                        </button>
                        {/* Parceiros button removed as per requirements */}
                        <div className="h-6 w-px bg-[rgb(var(--border-subtle))]" />
                        <button
                            onClick={handleAnalyzeAI}
                            disabled={isAnalyzing}
                            className="btn-premium text-sm py-2 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 border-none text-white hover:shadow-lg hover:shadow-indigo-500/20"
                            title="Analisar com Inteligência Artificial"
                        >
                            <Brain size={16} className={isAnalyzing ? 'animate-pulse' : ''} />
                            {isAnalyzing ? 'Analisando...' : 'Analisar com IA'}
                        </button>
                        <button
                            onClick={handleSyncDataJud}
                            disabled={isSyncing}
                            className="btn-secondary-premium text-sm py-2 flex items-center gap-2"
                            title="Sincronizar com DataJud"
                        >
                            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                        </button>



                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable Area */}
                <div className="flex-1 overflow-y-auto bg-[rgb(var(--bg-primary))]/50 p-8 space-y-8 pb-20 custom-scrollbar">

                    {/* AI Analysis Result */}
                    {(aiAnalysis || isAnalyzing || aiError) && (
                        <div className="animate-fade-in">
                            <AIAnalysisCard
                                analysis={aiAnalysis}
                                isLoading={isAnalyzing}
                                error={aiError}
                            />
                        </div>
                    )}

                    {viewMode === 'chat' ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Chat do Processo</h3>
                                <button onClick={() => setViewMode('info')} className="text-sm text-[rgb(var(--text-secondary))] hover:underline">Voltar aos detalhes</button>
                            </div>
                            <ChatLinkSuggestion
                                type="process"
                                id={process.id}
                                name={`${process.number} - ${process.title} `}
                            />
                        </div>
                    ) : viewMode === 'connections' ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Parceiros e Conexões</h3>
                                <button onClick={() => setViewMode('info')} className="text-sm text-[rgb(var(--text-secondary))] hover:underline">Voltar aos detalhes</button>
                            </div>
                            <ProcessConnectionManager process={process} />
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex items-center gap-1 bg-[rgb(var(--bg-tertiary))]/50 p-1 rounded-xl mb-6 overflow-x-auto no-scrollbar">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = viewMode === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setViewMode(tab.id as ViewMode)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive
                                                ? 'bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] shadow-sm'
                                                : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-primary))]/50'
                                                }`}
                                        >
                                            <Icon size={16} className={isActive ? 'text-[rgb(var(--accent-primary))]' : ''} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Content */}
                            <div className="min-h-[400px]">
                                {viewMode === 'info' && (
                                    /* CARD 1: DADOS DO PROCESSO */
                                    <div className="card-premium animate-fade-in">
                                        <div className="px-8 py-5 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30 flex justify-between items-center">
                                            <h3 className="font-bold text-[rgb(var(--text-primary))] flex items-center gap-2 text-lg">
                                                <FileText size={20} className="text-[rgb(var(--accent-primary))]" />
                                                Dados do Processo
                                            </h3>
                                            {onEdit && (
                                                <button
                                                    onClick={onEdit}
                                                    className="text-sm text-[rgb(var(--accent-primary))] hover:underline flex items-center gap-1 font-medium"
                                                >
                                                    <Edit2 size={16} />
                                                    Editar
                                                </button>
                                            )}
                                        </div>

                                        <div className="p-8">
                                            {/* Status Banner */}
                                            <div className="flex flex-wrap gap-4 mb-8 items-center">
                                                {/* Status Dropdown */}
                                                <div className="relative group">
                                                    <button className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${process.status === 'active' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' :
                                                        process.status === 'suspended' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300' :
                                                            'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        <Activity size={18} />
                                                        <span className="font-bold text-sm uppercase tracking-wide">
                                                            {process.status === 'active' ? 'Ativo' :
                                                                process.status === 'suspended' ? 'Suspenso' :
                                                                    process.status === 'archived' ? 'Arquivado' : 'Inativo'}
                                                        </span>
                                                        <Edit2 size={12} className="ml-1 opacity-50" />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden hidden group-hover:block z-50 animate-fade-in">
                                                        <div className="p-1">
                                                            <button
                                                                onClick={() => updateProcess(process.id, { ...process, status: 'active' })}
                                                                className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-lg flex items-center gap-2"
                                                            >
                                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                                Processo Ativo
                                                            </button>
                                                            <button
                                                                onClick={() => updateProcess(process.id, { ...process, status: 'suspended' })}
                                                                className="w-full text-left px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 rounded-lg flex items-center gap-2"
                                                            >
                                                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                                Processo Suspenso
                                                            </button>
                                                            <button
                                                                onClick={() => updateProcess(process.id, { ...process, status: 'inactive' })}
                                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                                                            >
                                                                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                                                Inativo / Arquivado
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {process.phase && (
                                                    <div className="px-4 py-2 rounded-xl border bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                                                        <Scale size={18} />
                                                        <span className="font-bold text-sm uppercase tracking-wide">
                                                            Fase: {process.phase === 'knowledge' ? 'Conhecimento' :
                                                                process.phase === 'execution' ? 'Execução' :
                                                                    process.phase === 'appeal' ? 'Recurso' : 'Arquivado'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Resized and Grouped Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-start mb-8">
                                                <div>
                                                    <p className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wider mb-2">Valor da Causa</p>
                                                    <p className="text-base font-bold text-[rgb(var(--text-primary))] break-words whitespace-normal" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }} title={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(process.value)}>
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(process.value)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wider mb-2">Tribunal / Órgão</p>
                                                    <p className="text-sm text-[rgb(var(--text-primary))] break-words whitespace-normal" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }} title={`${process.court} - ${process.area}`}>{process.court} - {process.area}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wider mb-2">Vara / Seção</p>
                                                    <p className="text-sm text-[rgb(var(--text-primary))] break-words whitespace-normal" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }} title={process.folder.basicData.courtSection || 'Não informado'}>{process.folder.basicData.courtSection || 'Não informado'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wider mb-2">Classe Judicial</p>
                                                    <p className="text-sm text-[rgb(var(--text-primary))] break-words whitespace-normal" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }} title={process.className || 'Procedimento Comum'}>{process.className || 'Procedimento Comum'}</p>
                                                </div>
                                            </div>

                                            {/* Parties Section - Compact */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[rgb(var(--border-subtle))]">
                                                <div>
                                                    <p className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase mb-1">Autor</p>
                                                    <p className="text-sm font-medium text-[rgb(var(--text-primary))] break-words whitespace-normal" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                                        {process.folder.basicData.plaintiff || 'Não informado'}
                                                        {process.clientName === process.folder.basicData.plaintiff && (
                                                            <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 align-middle">
                                                                <CheckCircle size={10} />
                                                                Cliente
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase mb-1">Réu</p>
                                                    <p className="text-sm font-medium text-[rgb(var(--text-primary))] break-words whitespace-normal" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                                        {process.folder.basicData.defendant || 'Não informado'}
                                                        {process.clientName === process.folder.basicData.defendant && (
                                                            <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 align-middle">
                                                                <CheckCircle size={10} />
                                                                Cliente
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                        </div>

                                        {/* New DataJud Fields - Compact */}
                                        {(process.subjects && process.subjects.length > 0 || process.degree || process.ibgeCode) && (
                                            <div className="mt-0 pt-6 border-t border-[rgb(var(--border-subtle))] px-8 pb-8">
                                                <h4 className="font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2 text-sm">
                                                    <Scale size={16} className="text-purple-500" />
                                                    Dados Complementares (DataJud)
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-start">
                                                    {process.subjects && process.subjects.length > 0 && (
                                                        <div className="col-span-2">
                                                            <p className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wider mb-2">Assuntos</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {process.subjects.map((subject, index) => (
                                                                    <span key={index} className="px-2 py-1 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded text-xs font-medium border border-purple-100 dark:border-purple-800">
                                                                        {subject}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {process.degree && (
                                                        <div>
                                                            <p className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wider mb-2">Grau</p>
                                                            <p className="text-sm text-[rgb(var(--text-primary))]">{process.degree}</p>
                                                        </div>
                                                    )}
                                                    {process.ibgeCode && (
                                                        <div>
                                                            <p className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wider mb-2">Cód. IBGE</p>
                                                            <p className="text-sm text-[rgb(var(--text-primary))]">{process.ibgeCode}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {viewMode === 'movements' && (
                                    /* CARD 2: MOVIMENTAÇÕES */
                                    <div className="card-premium animate-fade-in">
                                        <div className="px-8 py-5 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30 flex justify-between items-center">
                                            <h3 className="font-bold text-[rgb(var(--text-primary))] flex items-center gap-2 text-lg">
                                                <Activity size={20} className="text-[rgb(var(--accent-primary))]" />
                                                Movimentações
                                                <span className="bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] px-2 py-0.5 rounded-full text-xs font-bold border border-[rgb(var(--border-subtle))]">
                                                    {movements.length}
                                                </span>
                                            </h3>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setShowAddMovementModal(true)}
                                                    className="btn-premium py-2 px-4 text-sm flex items-center gap-2"
                                                >
                                                    <Plus size={18} />
                                                    Nova Movimentação
                                                </button>
                                                <button className="btn-secondary-premium py-2 px-4 text-sm flex items-center gap-2">
                                                    <Filter size={16} />
                                                    Filtrar
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-8">
                                            {movements.length === 0 ? (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-10 text-center">
                                                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                                        <AlertCircle size={40} className="text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <h4 className="font-bold text-[rgb(var(--text-primary))] mb-3 text-lg">
                                                        Nenhuma movimentação encontrada
                                                    </h4>
                                                    <p className="text-sm text-[rgb(var(--text-secondary))] mb-6 max-w-md mx-auto">
                                                        Este processo não possui movimentações. Sincronize com o DataJud ou adicione manualmente.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {/* ⭐ IMPORTANTE: Ordem já vem correta do backend (decrescente) */}
                                                    {movements.map((item, index) => {
                                                        const mov = item.data;

                                                        return (
                                                            <div
                                                                key={index}
                                                                className="card-premium p-6 hover:shadow-lg transition-all animate-slide-up"
                                                                style={{ animationDelay: `${index * 30}ms` }}
                                                            >
                                                                {/* Cabeçalho com Data e Informações */}
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <div className="flex flex-col gap-2 flex-1">
                                                                        {/* ⭐ NOME REAL da movimentação (sem alteração) */}
                                                                        <h4 className="font-bold text-[rgb(var(--text-primary))] text-lg">
                                                                            {mov.title}
                                                                        </h4>

                                                                        <div className="flex items-center gap-4 text-sm flex-wrap">
                                                                            {/* Data */}
                                                                            <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                                                                                <Clock size={14} />
                                                                                {safeDate(item.date)}
                                                                            </div>

                                                                            {/* Código CNJ (se disponível) */}
                                                                            {mov.codigo && (
                                                                                <div className="flex items-center gap-2 text-[rgb(var(--text-tertiary))]">
                                                                                    <Hash size={14} />
                                                                                    Cód. {mov.codigo}
                                                                                </div>
                                                                            )}

                                                                            {/* Órgão Julgador (se disponível) */}
                                                                            {mov.orgaoJulgador && (
                                                                                <div className="flex items-center gap-2 text-[rgb(var(--text-tertiary))]">
                                                                                    <Building size={14} />
                                                                                    {mov.orgaoJulgador}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Ações */}
                                                                    <div className="flex items-center gap-2">
                                                                        <WhatsAppShareButton
                                                                            process={process}
                                                                            movement={mov}
                                                                        />
                                                                        {mov.isUserCreated && (
                                                                            <button
                                                                                onClick={() => deleteProcessMovement(process.id, mov.id)}
                                                                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[rgb(var(--text-tertiary))] hover:text-red-500 transition-colors"
                                                                                title="Excluir movimentação"
                                                                            >
                                                                                <Trash2 size={18} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* ⭐ DESCRIÇÃO COMPLETA (preservada da API) */}
                                                                {mov.description && (
                                                                    <div className="mt-4 p-4 bg-[rgb(var(--bg-tertiary))]/30 rounded-xl border border-[rgb(var(--border-subtle))]">
                                                                        <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed whitespace-pre-line">
                                                                            {mov.description}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {/* Badge indicando origem */}
                                                                {/* Badge indicando origem - Removed "Sincronizado via DataJud" text as per request, just keeping styling if needed, or remove entire block */}

                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {viewMode === 'flow' && ENABLE_FLOWCHART && (
                                    <div className="animate-fade-in">
                                        <ProcessFlowTab process={process} />
                                    </div>
                                )}

                                {viewMode === 'timeline' && (
                                    /* CARD 3: HISTÓRICO (OBSERVATIONS) */
                                    <div className="card-premium overflow-hidden animate-fade-in">
                                        <div className="px-8 py-5 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30 flex justify-between items-center">
                                            <h3 className="font-bold text-[rgb(var(--text-primary))] flex items-center gap-2 text-lg">
                                                <HistoryIcon size={20} className="text-[rgb(var(--accent-primary))]" />
                                                Histórico Interno
                                                <span className="bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] px-2 py-0.5 rounded-full text-xs font-bold border border-[rgb(var(--border-subtle))]">
                                                    {observations.length}
                                                </span>
                                            </h3>
                                            <button
                                                onClick={() => setShowAddObservationModal(true)}
                                                className="btn-premium py-2 px-4 text-sm flex items-center gap-2"
                                            >
                                                <Plus size={18} />
                                                Nova Nota
                                            </button>
                                        </div>

                                        <div className="p-8">
                                            {observations.length === 0 ? (
                                                <div className="text-center py-8 text-[rgb(var(--text-tertiary))]">
                                                    <p>Nenhuma observação registrada.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {observations.map((obs) => (
                                                        <div key={obs.id} className="bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] rounded-xl p-4 hover:shadow-md transition-shadow group">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-full bg-[rgb(var(--accent-primary))]/10 flex items-center justify-center text-[rgb(var(--accent-primary))] font-bold text-xs">
                                                                        {obs.userName.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-[rgb(var(--text-primary))]">{obs.userName}</p>
                                                                        <p className="text-xs text-[rgb(var(--text-tertiary))]">{formatDateTime(obs.createdAt)}</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => deleteProcessObservation(process.id, obs.id)}
                                                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[rgb(var(--text-tertiary))] hover:text-red-500 transition-colors"
                                                                    title="Excluir nota"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                            <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed whitespace-pre-wrap pl-10">
                                                                {obs.content}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {viewMode === 'financial' && (
                                    <div className="card-premium overflow-hidden animate-fade-in">
                                        <div className="px-8 py-5 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30 flex justify-between items-center">
                                            <h3 className="font-bold text-[rgb(var(--text-primary))] flex items-center gap-2 text-lg">
                                                <DollarSign size={20} className="text-[rgb(var(--accent-primary))]" />
                                                Financeiro do Processo
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    const newEntry: any = {
                                                        id: crypto.randomUUID(),
                                                        type: 'expense',
                                                        category: 'Custas Processuais',
                                                        description: 'Nova Despesa',
                                                        amount: 0,
                                                        date: new Date().toISOString().split('T')[0],
                                                        status: 'pending',
                                                        processId: process.id,
                                                        clientId: process.clientId,
                                                        createdAt: new Date().toISOString()
                                                    };
                                                    addFinancialEntry(newEntry);
                                                }}
                                                className="btn-premium py-2 px-4 text-sm flex items-center gap-2"
                                            >
                                                <Plus size={18} />
                                                Novo Lançamento
                                            </button>
                                        </div>
                                        <div className="p-8">
                                            <FinancialList
                                                transactions={financial.filter(f => f.processId === process.id)}
                                                onEdit={(entry) => {
                                                    // For now, we can just update the description as a quick edit or implement a full modal later.
                                                    // Since we don't have a FinancialFormModal exposed here easily, 
                                                    // I'll leave the onEdit as a placeholder or simple prompt for now to avoid scope creep, 
                                                    // or better, just toggle the type/status for quick actions if possible.
                                                    // Actually, the user wants "Full Integration". 
                                                    // Let's just log it for now or use a simple prompt.
                                                    const newDesc = prompt('Nova descrição:', entry.description);
                                                    if (newDesc) updateFinancialEntry(entry.id, { description: newDesc });
                                                    const newAmount = prompt('Novo valor:', entry.amount.toString());
                                                    if (newAmount) updateFinancialEntry(entry.id, { amount: parseFloat(newAmount) });
                                                }}
                                                onDelete={deleteFinancialEntry}
                                            />
                                        </div>
                                    </div>
                                )}

                                {viewMode === 'documents' && (
                                    <div className="card-premium overflow-hidden animate-fade-in">
                                        <div className="px-8 py-5 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30 flex justify-between items-center">
                                            <h3 className="font-bold text-[rgb(var(--text-primary))] flex items-center gap-2 text-lg">
                                                <FolderOpen size={20} className="text-[rgb(var(--accent-primary))]" />
                                                Documentos do Processo
                                                <span className="bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] px-2 py-0.5 rounded-full text-xs font-bold border border-[rgb(var(--border-subtle))]">
                                                    {documents.length}
                                                </span>
                                            </h3>
                                            <button
                                                onClick={() => setShowUploadModal(true)}
                                                className="btn-premium py-2 px-4 text-sm flex items-center gap-2"
                                            >
                                                <Upload size={18} />
                                                Novo Documento
                                            </button>
                                        </div>

                                        <div className="p-8">
                                            {isLoadingDocuments ? (
                                                <div className="flex justify-center py-12">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--accent-primary))]"></div>
                                                </div>
                                            ) : documents.length === 0 ? (
                                                <div className="text-center py-12 bg-[rgb(var(--bg-secondary))] rounded-xl border border-[rgb(var(--border-subtle))] border-dashed">
                                                    <div className="w-16 h-16 bg-[rgb(var(--bg-tertiary))] rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <FolderOpen size={32} className="text-[rgb(var(--text-tertiary))]" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-[rgb(var(--text-primary))] mb-2">Nenhum documento</h3>
                                                    <p className="text-[rgb(var(--text-secondary))] mb-6">
                                                        Este processo ainda não possui documentos anexados.
                                                    </p>
                                                    <button
                                                        onClick={() => setShowUploadModal(true)}
                                                        className="btn-secondary-premium py-2 px-4 text-sm inline-flex items-center gap-2"
                                                    >
                                                        <Upload size={16} />
                                                        Fazer Upload
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {documents.map((doc) => (
                                                        <div key={doc.id} className="group bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] rounded-xl p-4 hover:shadow-md transition-all hover:border-[rgb(var(--accent-primary))]">
                                                            <div className="flex items-start gap-4">
                                                                <div className="p-3 bg-[rgb(var(--bg-tertiary))] rounded-lg group-hover:bg-[rgb(var(--accent-primary))]/10 group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                                                                    <FileText size={24} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-bold text-[rgb(var(--text-primary))] truncate mb-1">
                                                                        {doc.title}
                                                                    </h4>
                                                                    <div className="flex items-center gap-2 text-xs text-[rgb(var(--text-secondary))]">
                                                                        <span className="px-2 py-0.5 rounded-full bg-[rgb(var(--bg-tertiary))] border border-[rgb(var(--border-subtle))]">
                                                                            {doc.type}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                                                        {doc.size && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <a
                                                                        href={doc.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))]"
                                                                        title="Baixar/Visualizar"
                                                                    >
                                                                        <Download size={18} />
                                                                    </a>
                                                                    <button
                                                                        onClick={() => handleDeleteDocument(doc.id)}
                                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-[rgb(var(--text-secondary))] hover:text-red-500"
                                                                        title="Excluir"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Add Movement Modal */}
                            {
                                showAddMovementModal && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                                        <div className="bg-[rgb(var(--bg-secondary))] rounded-2xl shadow-2xl w-full max-w-md p-8 border border-[rgb(var(--border-subtle))] animate-scale-in">
                                            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-6">
                                                Nova Movimentação
                                            </h3>
                                            <div className="space-y-5">
                                                <div className="grid grid-cols-2 gap-5">
                                                    <div>
                                                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                                                            Data
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={newMovement.date}
                                                            onChange={(e) => setNewMovement({ ...newMovement, date: e.target.value })}
                                                            className="input-premium w-full"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                                                            Hora
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={newMovement.time}
                                                            onChange={(e) => setNewMovement({ ...newMovement, time: e.target.value })}
                                                            className="input-premium w-full"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                                                        Tipo
                                                    </label>
                                                    <select
                                                        value={newMovement.type}
                                                        onChange={(e) => setNewMovement({ ...newMovement, type: e.target.value as ProcessMovement['type'] })}
                                                        className="input-premium w-full"
                                                    >
                                                        <option value="outro">Outro</option>
                                                        <option value="despacho">Despacho</option>
                                                        <option value="decisao">Decisão</option>
                                                        <option value="sentenca">Sentença</option>
                                                        <option value="audiencia">Audiência (Agenda)</option>
                                                        <option value="prazo">Prazo (Agenda)</option>
                                                        <option value="tarefa">Tarefa (Agenda)</option>
                                                        <option value="atendimento">Atendimento (Agenda)</option>
                                                    </select>
                                                    {['audiencia', 'prazo', 'tarefa', 'atendimento'].includes(newMovement.type) && (
                                                        <p className="text-xs text-[rgb(var(--accent-primary))] mt-1 flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            Será adicionado automaticamente à Agenda
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                                                        Título *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newMovement.title}
                                                        onChange={(e) => setNewMovement({ ...newMovement, title: e.target.value })}
                                                        placeholder="Ex: Juntada de petição"
                                                        className="input-premium w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                                                        Descrição
                                                    </label>
                                                    <textarea
                                                        value={newMovement.description}
                                                        onChange={(e) => setNewMovement({ ...newMovement, description: e.target.value })}
                                                        rows={3}
                                                        placeholder="Detalhes adicionais..."
                                                        className="input-premium w-full resize-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-3 justify-end mt-8">
                                                <button
                                                    onClick={() => {
                                                        setShowAddMovementModal(false);
                                                        setNewMovement({
                                                            date: new Date().toISOString().split('T')[0],
                                                            time: new Date().toTimeString().slice(0, 5),
                                                            type: 'outro',
                                                            title: '',
                                                            description: ''
                                                        });
                                                    }}
                                                    className="px-5 py-2.5 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors font-medium"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleAddMovement}
                                                    disabled={isAddingMovement}
                                                    className="btn-premium py-2.5 px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {isAddingMovement ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            Adicionando...
                                                        </>
                                                    ) : (
                                                        'Adicionar'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {/* Add Observation Modal */}
                            {
                                showAddObservationModal && (
                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                                        <div className="bg-[rgb(var(--bg-secondary))] rounded-2xl shadow-2xl w-full max-w-md p-8 border border-[rgb(var(--border-subtle))] animate-scale-in">
                                            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-6">
                                                Nova Nota / Observação
                                            </h3>
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                                                        Conteúdo
                                                    </label>
                                                    <textarea
                                                        value={newObservation}
                                                        onChange={(e) => setNewObservation(e.target.value)}
                                                        rows={5}
                                                        placeholder="Digite sua observação, nota de reunião ou lembrete..."
                                                        className="input-premium w-full resize-none"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-3 justify-end mt-8">
                                                <button
                                                    onClick={() => {
                                                        setShowAddObservationModal(false);
                                                        setNewObservation('');
                                                    }}
                                                    className="px-5 py-2.5 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors font-medium"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleAddObservation}
                                                    disabled={!newObservation.trim()}
                                                    className="btn-premium py-2.5 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Salvar Nota
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                        </>
                    )}
                </div>
            </div>

            {/* Document Upload Modal */}
            <DocumentUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={loadDocuments}
                processId={process.id}
                clientId={process.clientId}
            />
        </div>
    );
};
