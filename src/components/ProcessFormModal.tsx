import React, { useState, useEffect } from 'react';
import { X, Save, User, Search, Loader2, Check, AlertCircle, AlertTriangle, Edit2, FileText, Scale, Calendar, DollarSign, Building2, MapPin } from 'lucide-react';
import type { Process, Client, CourtType } from '../types';
import { inferTribunalsFromCNJ } from '../services/DataJudService';
import { unifiedProcessSearchService } from '../services/UnifiedProcessSearch.service';
import { converterDadosPJe, converterDadosDataJud, isProcessoRecente } from '../utils/processDataConverters';
import { useGlobalData } from '../context/GlobalDataContext';
import { useToast } from '../context/ToastContext';
import { findMatchingClients, type ClientMatch } from '../utils/fuzzyMatch';
import { QuickClientModal } from './QuickClientModal';
import { ClientSuggestionsModal } from './ClientSuggestionsModal';
import { ClientAutocomplete } from './ClientAutocomplete';
import { parseCurrency, formatCurrency, formatProcessNumber } from '../utils/formatters';

interface ProcessFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (process: Process) => void;
    initialData?: Partial<Process>;
}

interface DataJudParty {
    nome: string;
    polo: 'ativo' | 'passivo' | 'outro';
    tipo: string;
}

const CNJ_CLASSES = [
    "Procedimento Comum Cível",
    "Cumprimento de Sentença",
    "Execução de Título Extrajudicial",
    "Monitória",
    "Mandado de Segurança",
    "Habeas Corpus",
    "Agravo de Instrumento",
    "Apelação",
    "Recurso Inominado",
    "Inventário",
    "Divórcio Litigioso",
    "Divórcio Consensual",
    "Alimentos",
    "Guarda",
    "Usucapião",
    "Despejo",
    "Reintegração de Posse",
    "Busca e Apreensão",
    "Execução Fiscal",
    "Reclamação Trabalhista",
    "Inquérito Policial",
    "Ação Penal",
    "Outros"
].sort();


export const ProcessFormModal: React.FC<ProcessFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData
}) => {
    const { addClient, clients, processes, addProcess, updateProcess } = useGlobalData();
    const toast = useToast();
    const [isLoadingDataJud, setIsLoadingDataJud] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [, setIsManualEntry] = useState(false);
    const [step, setStep] = useState<'form' | 'party-selection'>('form');
    const [foundParties, setFoundParties] = useState<DataJudParty[]>([]);
    const [selectedClientParty, setSelectedClientParty] = useState<string | null>(null);
    const [selectedOpponentParty, setSelectedOpponentParty] = useState<string | null>(null);
    const [isNewClient, setIsNewClient] = useState(false);
    const [clientMatches, setClientMatches] = useState<ClientMatch[]>([]);
    const [showClientSuggestions, setShowClientSuggestions] = useState(false);
    const [showQuickClientModal, setShowQuickClientModal] = useState(false);
    const [pendingFields, setPendingFields] = useState<string[]>([]);

    const [formData, setFormData] = useState<Partial<Process>>({
        status: 'active',
        folder: {
            basicData: {
                plaintiff: '',
                defendant: '',
                judge: '',
                prosecutor: '',
                courtSection: '',
                distributionDate: new Date().toISOString().split('T')[0]
            },
            movements: [],
            timeline: [],
            observations: [],
            documents: []
        }
    });

    const [isNonCNJ, setIsNonCNJ] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            setFoundParties([]);
            setSelectedClientParty(null);
            setSelectedOpponentParty(null);
            setIsNewClient(false);
            setIsNonCNJ(false);
            setPendingFields([]);

            if (initialData) {
                setFormData({
                    ...initialData,
                    folder: initialData.folder || {
                        basicData: {
                            plaintiff: '',
                            defendant: '',
                            judge: '',
                            prosecutor: '',
                            courtSection: '',
                            distributionDate: new Date().toISOString().split('T')[0]
                        },
                        movements: [],
                        timeline: [],
                        observations: [],
                        documents: []
                    }
                });
                // Check if initial number is non-CNJ (simple heuristic: length < 20 or no dots/dashes)
                if (initialData.number && (initialData.number.length < 20 || !initialData.number.includes('.'))) {
                    setIsNonCNJ(true);
                }
            } else {
                setFormData({
                    status: 'active',
                    folder: {
                        basicData: {
                            plaintiff: '',
                            defendant: '',
                            judge: '',
                            prosecutor: '',
                            courtSection: '',
                            distributionDate: new Date().toISOString().split('T')[0]
                        },
                        movements: [],
                        timeline: [],
                        observations: [],
                        documents: []
                    }
                });
            }
        }
    }, [isOpen, initialData]);

    // Handle CNJ number formatting
    const handleCNJNumberChange = (value: string) => {
        if (isNonCNJ) {
            setFormData({ ...formData, number: value });
        } else {
            const formatted = formatProcessNumber(value);
            setFormData({ ...formData, number: formatted });
        }
    };

    // Handle currency formatting for case value
    const handleCurrencyChange = (value: string) => {
        setFormData({ ...formData, value: parseCurrency(value) });
    };

    const handleSearchDataJud = async () => {
        if (isNonCNJ) {
            toast.info('Busca Indisponível', 'A busca automática só está disponível para números CNJ padrão.');
            return;
        }

        if (!formData.number || formData.number.length < 15) {
            toast.error('Número inválido', 'Por favor, insira um número de processo válido (CNJ).');
            return;
        }

        const tribunalIds = inferTribunalsFromCNJ(formData.number);
        if (tribunalIds.length === 0) {
            toast.error('Tribunal não identificado', 'Verifique se o número está correto.');
            return;
        }

        setIsLoadingDataJud(true);
        setSearchError(null);
        setPendingFields([]);

        try {
            console.log('🔍 Usando busca unificada PJe + DataJud...');

            // ⭐ USA SERVIÇO UNIFICADO (PJe + DataJud)
            const result = await unifiedProcessSearchService.searchProcess(formData.number);

            if (!result.encontrado) {
                // Processo não encontrado em nenhuma fonte
                setSearchError(result.mensagem || 'Processo não encontrado');

                if (result.mensagem?.includes('conecte-se ao PJe') && isProcessoRecente(formData.number)) {
                    toast.warning(
                        'Processo Recente - Autenticação Necessária',
                        'Para acessar dados em tempo real de processos recentes, conecte-se ao PJe nas configurações.',
                    );
                } else {
                    toast.warning('Processo Não Encontrado', result.mensagem || 'Preencha os dados manualmente.');
                }
                return;
            }

            // Processo encontrado! Converter dados conforme a fonte
            const sourceBadge = result.fonte === 'pje' ? '🟢 Tempo Real (PJe)' : '🔵 Indexado (DataJud)';
            console.log(`✅ Processo encontrado! Fonte: ${sourceBadge}`);

            let processData;
            if (result.fonte === 'pje') {
                processData = converterDadosPJe(result.dados);
            } else {
                processData = converterDadosDataJud(result.dados, result.dados._metadata?.tribunal);
            }

            // Preencher formulário com dados encontrados
            const newFormData = { ...formData };
            const missingFields: string[] = [];

            // Dados básicos
            newFormData.title = processData.classe || '';
            if (!newFormData.title) missingFields.push('title');

            newFormData.court = tribunalIds[0]?.toUpperCase() || '';

            newFormData.area = processData.orgaoJulgador || '';
            if (!newFormData.area) missingFields.push('area');

            newFormData.folder!.basicData.distributionDate = processData.dataDistribuicao?.split('T')[0] || '';
            if (!newFormData.folder!.basicData.distributionDate) missingFields.push('distributionDate');

            newFormData.folder!.basicData.courtSection = processData.orgaoJulgador || '';

            // Campos adicionais
            newFormData.subjects = processData.assuntos?.map((a: any) => a.nome || a) || [];
            newFormData.degree = processData.grau;
            newFormData.ibgeCode = (processData._metadata as any)?.ibgeCode;

            // Valor da causa
            if (processData.valorCausa) {
                newFormData.value = Number(processData.valorCausa);
            } else {
                missingFields.push('value');
            }

            // Juiz e promotor vazios
            newFormData.folder!.basicData.judge = '';
            newFormData.folder!.basicData.prosecutor = '';

            // Movimentações
            if (processData.movimentos && Array.isArray(processData.movimentos)) {
                newFormData.folder!.movements = processData.movimentos;
            } else {
                // Se não houver movimentações, não é erro, mas avisa
                toast.info('Sem Movimentações', 'Não foram encontradas movimentações para este processo.');
            }

            // Partes do processo
            const parties: DataJudParty[] = [];
            if (processData.partes && Array.isArray(processData.partes)) {
                processData.partes.forEach((p: any) => {
                    parties.push({
                        nome: p.nome,
                        polo: p.polo === 'AT' || p.polo === 'ATIVO' ? 'ativo' :
                            (p.polo === 'PA' || p.polo === 'PASSIVO' ? 'passivo' : 'outro'),
                        tipo: p.tipo || p.tipoPessoa || 'Desconhecido'
                    });
                });
            }

            setFormData(newFormData);
            setPendingFields(missingFields);

            if (parties.length > 0) {
                setFoundParties(parties);
                setStep('party-selection');
                toast.success(
                    'Processo Encontrado!',
                    `${sourceBadge} - Partes identificadas. Por favor, selecione seu cliente.`
                );
            } else {
                toast.success(
                    'Processo Encontrado!',
                    `${sourceBadge} - Classe: ${processData.classe || 'Desconhecida'}`
                );
            }
        } catch (error: unknown) {
            console.error('❌ Erro na busca unificada:', error);
            console.error('Número do processo:', formData.number);

            const msg = (error as Error).message || 'Erro desconhecido';
            setSearchError(msg);

            if (msg.includes('não encontrado') || msg.includes('404')) {
                toast.warning('Processo não encontrado', 'Verifique o número ou preencha manualmente.');
            } else {
                toast.error('Erro na Busca', 'Ocorreu um erro. Tente novamente ou preencha manualmente.');
            }
        } finally {
            setIsLoadingDataJud(false);
        }
    };

    const handlePartySelectionConfirm = () => {
        if (!selectedClientParty) {
            toast.error('Seleção Obrigatória', 'Por favor, selecione quem é o seu cliente.');
            return;
        }

        const clientParty = foundParties.find(p => p.nome === selectedClientParty);
        const opponentParty = foundParties.find(p => p.nome === selectedOpponentParty);

        if (clientParty) {
            // Use fuzzy matching to find similar clients
            const matches = findMatchingClients(clientParty.nome, clients);

            if (matches.length > 0 && matches[0].isExact) {
                // Exact match found
                const existingClient = matches[0].client;
                setFormData(prev => ({
                    ...prev,
                    clientId: existingClient.id,
                    folder: {
                        ...prev.folder!,
                        basicData: {
                            ...prev.folder!.basicData,
                            plaintiff: clientParty.polo === 'ativo' ? clientParty.nome : (opponentParty?.nome || ''),
                            defendant: clientParty.polo === 'passivo' ? clientParty.nome : (opponentParty?.nome || '')
                        }
                    }
                }));
                toast.success('Cliente Identificado', `Cliente existente: ${existingClient.name}`);
                setStep('form');
            } else if (matches.length > 0 && matches[0].similarity >= 80) {
                // High similarity - show suggestion
                setClientMatches(matches);
                setShowClientSuggestions(true);
            } else if (isNewClient) {
                // Create new client
                const newClient: Client = {
                    id: crypto.randomUUID(),
                    name: clientParty.nome,
                    type: clientParty.tipo.toLowerCase().includes('jurídica') ? 'company' : 'individual',
                    email: '',
                    phone: '',
                    document: '',
                    cpfCnpj: '',
                    status: 'active',
                    address: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                addClient(newClient);
                setFormData(prev => ({
                    ...prev,
                    clientId: newClient.id,
                    folder: {
                        ...prev.folder!,
                        basicData: {
                            ...prev.folder!.basicData,
                            plaintiff: clientParty.polo === 'ativo' ? clientParty.nome : (opponentParty?.nome || ''),
                            defendant: clientParty.polo === 'passivo' ? clientParty.nome : (opponentParty?.nome || '')
                        }
                    }
                }));
                toast.success('Novo Cliente', `Cliente cadastrado: ${newClient.name}`);
                setStep('form');
            } else {
                // No match and not creating new client
                toast.warning('Cliente Não Selecionado', 'Marque a opção para cadastrar como novo cliente ou selecione um existente.');
            }
        }
    };

    const handleQuickClientCreated = (newClient: Client) => {
        // Add client to global context
        addClient(newClient);
        // Auto-select the newly created client in the form
        setFormData(prev => ({ ...prev, clientId: newClient.id }));
        // Close the modal
        setShowQuickClientModal(false);
    };

    const handleSelectSuggestedClient = (client: Client) => {
        // When user selects a suggested client from the modal
        const clientParty = foundParties.find(p => p.nome === selectedClientParty);
        const opponentParty = foundParties.find(p => p.nome === selectedOpponentParty);

        setFormData(prev => ({
            ...prev,
            clientId: client.id,
            folder: {
                ...prev.folder!,
                basicData: {
                    ...prev.folder!.basicData,
                    plaintiff: clientParty?.polo === 'ativo' ? clientParty.nome : (opponentParty?.nome || ''),
                    defendant: clientParty?.polo === 'passivo' ? clientParty.nome : (opponentParty?.nome || '')
                }
            }
        }));
        setShowClientSuggestions(false);
        setStep('form');
    };

    const handleCreateNewFromSuggestions = async () => {
        // Close suggestions modal and open quick client creation
        setShowClientSuggestions(false);

        const clientParty = foundParties.find(p => p.nome === selectedClientParty);
        if (clientParty) {
            const newClient: Client = {
                id: crypto.randomUUID(),
                name: clientParty.nome,
                type: clientParty.tipo.toLowerCase().includes('jurídica') ? 'company' : 'individual',
                email: '',
                phone: '',
                document: '',
                cpfCnpj: '',
                status: 'active',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await addClient(newClient);

            const opponentParty = foundParties.find(p => p.nome === selectedOpponentParty);
            setFormData(prev => ({
                ...prev,
                clientId: newClient.id,
                folder: {
                    ...prev.folder!,
                    basicData: {
                        ...prev.folder!.basicData,
                        plaintiff: clientParty.polo === 'ativo' ? clientParty.nome : (opponentParty?.nome || ''),
                        defendant: clientParty.polo === 'passivo' ? clientParty.nome : (opponentParty?.nome || '')
                    }
                }
            }));
            toast.success('Novo Cliente', `Cliente cadastrado: ${newClient.name}`);
            setStep('form');
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mandatory fields validation
        if (!formData.title || !formData.number || !formData.clientId) {
            toast.error('Campos Obrigatórios', 'Por favor, preencha: Cliente, Número do Processo e Título.');
            return;
        }

        // Set loading state
        setIsSaving(true);

        try {
            const client = formData.clientId ? clients.find(c => c.id === formData.clientId) : undefined;

            // Check for duplicate process (same number and court/tribunal)
            // Allow same number if it's in a different court instance (1st degree, 2nd degree, superior courts)
            const isDuplicate = processes.some(p => {
                // Skip if it's the same process being edited
                if (formData.id && p.id === formData.id) return false;

                // Check if same CNJ number
                if (p.number === formData.number) {
                    // Allow if different court/tribunal (different instances)
                    // Compare court and courtType to determine if it's a different instance
                    const isSameCourt = p.court === formData.court && p.courtType === formData.courtType;
                    return isSameCourt; // Only duplicate if same number AND same court
                }
                return false;
            });

            if (isDuplicate) {
                alert('Já existe um processo cadastrado com este número no mesmo tribunal. Se for o mesmo processo em instância superior (2º grau, STJ, STF), altere o tribunal antes de salvar.');
                setIsSaving(false);
                return;
            }

            const processToSave: Process = {
                ...formData as Process,
                clientName: client?.name,
                id: formData.id || crypto.randomUUID(),
                createdAt: formData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                value: Number(formData.value) || 0
            };

            if (onSave) {
                await onSave(processToSave);
            } else {
                if (formData.id && initialData?.id) {
                    await updateProcess(formData.id, processToSave);
                } else {
                    await addProcess(processToSave);
                }
            }

            // Success feedback
            console.log('Process saved successfully:', processToSave.id);

            // Close modal
            onClose();
        } catch (error) {
            console.error('Error saving process:', error);
            alert('Erro ao salvar processo. Por favor, tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const updateFolderData = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            folder: {
                ...prev.folder!,
                basicData: {
                    ...prev.folder!.basicData,
                    [field]: value
                }
            }
        }));
    };

    // Render Party Selection Step
    if (step === 'party-selection') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4 backdrop-blur-sm">
                <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col border border-[rgb(var(--border-subtle))]">
                    <div className="px-8 py-6 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center bg-[rgb(var(--bg-secondary))]">
                        <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                            Identificação das Partes
                        </h3>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl flex items-start gap-4 border border-blue-100 dark:border-blue-900/30">
                            <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={24} />
                            <div>
                                <h4 className="font-bold text-blue-900 dark:text-blue-100 text-lg">Dados Encontrados</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                    Identificamos as seguintes partes no processo. Por favor, identifique seu cliente e a parte contrária.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-3">Quem é seu Cliente?</label>
                                <div className="space-y-3">
                                    {foundParties.map((party) => (
                                        <label key={party.nome} className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${selectedClientParty === party.nome
                                            ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/10 ring-1 ring-[rgb(var(--accent-primary))]'
                                            : 'border-[rgb(var(--border-default))] hover:bg-[rgb(var(--bg-tertiary))]'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="client"
                                                value={party.nome}
                                                checked={selectedClientParty === party.nome}
                                                onChange={() => setSelectedClientParty(party.nome)}
                                                className="mr-4 text-[rgb(var(--accent-primary))] focus:ring-[rgb(var(--accent-primary))]"
                                            />
                                            <div className="flex-1">
                                                <div className="font-bold text-[rgb(var(--text-primary))]">{party.nome}</div>
                                                <div className="text-xs text-[rgb(var(--text-tertiary))] capitalize mt-0.5">{party.polo} - {party.tipo}</div>
                                            </div>
                                            {selectedClientParty === party.nome && <Check size={20} className="text-[rgb(var(--accent-primary))]" />}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {selectedClientParty && (
                                <div className="ml-1 pl-6 border-l-2 border-[rgb(var(--border-default))]">
                                    {!clients.find(c => c.name.toLowerCase() === selectedClientParty.toLowerCase()) ? (
                                        <label className="flex items-center gap-3 text-sm text-[rgb(var(--text-primary))] cursor-pointer font-medium">
                                            <input
                                                type="checkbox"
                                                checked={isNewClient}
                                                onChange={(e) => setIsNewClient(e.target.checked)}
                                                className="rounded border-[rgb(var(--border-default))] text-[rgb(var(--accent-primary))] focus:ring-[rgb(var(--accent-primary))]"
                                            />
                                            <span>Cadastrar <strong>{selectedClientParty}</strong> como novo cliente?</span>
                                        </label>
                                    ) : (
                                        <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2 font-medium">
                                            <Check size={18} />
                                            Cliente já cadastrado na base.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-3">Quem é a Parte Contrária?</label>
                                <div className="space-y-3">
                                    {foundParties.filter(p => p.nome !== selectedClientParty).map((party) => (
                                        <label key={party.nome} className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${selectedOpponentParty === party.nome
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500'
                                            : 'border-[rgb(var(--border-default))] hover:bg-[rgb(var(--bg-tertiary))]'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="opponent"
                                                value={party.nome}
                                                checked={selectedOpponentParty === party.nome}
                                                onChange={() => setSelectedOpponentParty(party.nome)}
                                                className="mr-4 text-red-500 focus:ring-red-500"
                                            />
                                            <div className="flex-1">
                                                <div className="font-bold text-[rgb(var(--text-primary))]">{party.nome}</div>
                                                <div className="text-xs text-[rgb(var(--text-tertiary))] capitalize mt-0.5">{party.polo} - {party.tipo}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-t border-[rgb(var(--border-subtle))] flex justify-end gap-4 bg-[rgb(var(--bg-tertiary))]/30">
                        <button
                            onClick={() => setStep('form')}
                            className="px-6 py-2.5 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors font-medium"
                        >
                            Voltar
                        </button>
                        <button
                            onClick={handlePartySelectionConfirm}
                            disabled={!selectedClientParty}
                            className="btn-premium py-2.5 px-6 flex items-center gap-2"
                        >
                            <Check size={18} />
                            Confirmar e Continuar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] animate-fade-in p-4 backdrop-blur-sm">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col border border-[rgb(var(--border-subtle))]">
                <div className="px-8 py-6 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center sticky top-0 bg-[rgb(var(--bg-secondary))] z-10">
                    <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                        {initialData?.id ? 'Editar Processo' : 'Novo Processo'}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30">
                    <div className="px-8 py-4">
                        <h4 className="text-sm font-bold text-[rgb(var(--text-secondary))] uppercase tracking-wider">Dados Básicos</h4>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* CLIENT FIELD - MANDATORY - FIRST */}
                        <div className="col-span-2">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))]">
                                    Cliente *
                                    <span className="ml-2 text-xs font-normal text-[rgb(var(--text-tertiary))]">(obrigatório)</span>
                                </label>
                            </div>

                            <ClientAutocomplete
                                value={formData.clientId || null}
                                onChange={(clientId) => setFormData({ ...formData, clientId: clientId || undefined })}
                                onNewClient={() => setShowQuickClientModal(true)}
                                required={true}
                                placeholder="Digite o nome do cliente..."
                            />

                            {!formData.clientId && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    O cliente é obrigatório para cadastrar o processo.
                                </p>
                            )}
                        </div>

                        <div className="col-span-2">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))]">Número do Processo *</label>
                                <label className="flex items-center gap-2 text-xs text-[rgb(var(--text-secondary))] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isNonCNJ}
                                        onChange={(e) => setIsNonCNJ(e.target.checked)}
                                        className="rounded border-[rgb(var(--border-default))] text-[rgb(var(--accent-primary))] focus:ring-[rgb(var(--accent-primary))]"
                                    />
                                    Número não-CNJ / Administrativo
                                </label>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    required
                                    value={formData.number || ''}
                                    onChange={(e) => handleCNJNumberChange(e.target.value)}
                                    className="input-premium flex-1 px-4"
                                    placeholder={isNonCNJ ? "Digite o número do processo..." : "0000000-00.0000.0.00.0000"}
                                />
                                <button
                                    type="button"
                                    onClick={handleSearchDataJud}
                                    disabled={isLoadingDataJud || isNonCNJ}
                                    className="px-5 py-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2 disabled:opacity-50 font-medium border border-blue-100 dark:border-blue-900/50 disabled:cursor-not-allowed"
                                    title={isNonCNJ ? "Busca indisponível para números não-CNJ" : "Buscar dados no DataJud"}
                                >
                                    {isLoadingDataJud ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                                    <span className="hidden sm:inline">Buscar</span>
                                </button>
                            </div>

                            {searchError && (
                                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-fade-in">
                                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-red-700 dark:text-red-300 text-sm mb-1">Falha na Busca Automática</h4>
                                        <p className="text-xs text-red-600 dark:text-red-400 mb-2">{searchError}</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchError(null);
                                                setIsManualEntry(true);
                                                toast.info('Modo Manual', 'Preencha os dados do processo manualmente.');
                                            }}
                                            className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <Edit2 size={12} />
                                            Preencher Manualmente
                                        </button>
                                    </div>
                                </div>
                            )}
                            <p className="text-xs text-[rgb(var(--text-tertiary))] mt-2 flex items-center gap-1">
                                <Search size={12} />
                                Digite o número CNJ para buscar dados automaticamente.
                            </p>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                                Título do Processo *
                                {pendingFields.includes('title') && <span className="ml-2 text-amber-500 text-xs">(Pendente - Preencha manualmente)</span>}
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={`input-premium w-full pl-10 px-4 ${pendingFields.includes('title') ? 'border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/10' : ''}`}
                                    placeholder="Ex: Ação de Cobrança"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Classe Judicial</label>
                            <div className="relative">
                                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                <input
                                    type="text"
                                    list="cnj-classes"
                                    value={formData.courtType || ''}
                                    onChange={(e) => setFormData({ ...formData, courtType: e.target.value as CourtType })}
                                    className="input-premium w-full pl-10 px-4"
                                    placeholder="Selecione ou digite..."
                                />
                                <datalist id="cnj-classes">
                                    {CNJ_CLASSES.map(c => (
                                        <option key={c} value={c} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                                Área / Vara
                                {pendingFields.includes('area') && <span className="ml-2 text-amber-500 text-xs">(Pendente)</span>}
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                <input
                                    type="text"
                                    value={formData.area || ''}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    className={`input-premium w-full pl-10 px-4 ${pendingFields.includes('area') ? 'border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/10' : ''}`}
                                    placeholder="Ex: 1ª Vara Cível"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Tribunal</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                <input
                                    type="text"
                                    value={formData.court || ''}
                                    onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                                    className="input-premium w-full pl-10 px-4"
                                    placeholder="Ex: TJSP"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Comarca / Seção</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                <input
                                    type="text"
                                    value={formData.folder?.basicData.courtSection || ''}
                                    onChange={(e) => updateFolderData('courtSection', e.target.value)}
                                    className="input-premium w-full pl-10 px-4"
                                    placeholder="Ex: São Paulo"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                                Data de Distribuição
                                {pendingFields.includes('distributionDate') && <span className="ml-2 text-amber-500 text-xs">(Pendente)</span>}
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                <input
                                    type="date"
                                    value={formData.folder?.basicData.distributionDate || ''}
                                    onChange={(e) => updateFolderData('distributionDate', e.target.value)}
                                    className={`input-premium w-full pl-10 px-4 ${pendingFields.includes('distributionDate') ? 'border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/10' : ''}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                                Valor da Causa
                                {pendingFields.includes('value') && <span className="ml-2 text-amber-500 text-xs">(Pendente)</span>}
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                <input
                                    type="text"
                                    value={formatCurrency(formData.value || 0)}
                                    onChange={(e) => handleCurrencyChange(e.target.value)}
                                    className={`input-premium w-full pl-10 px-4 ${pendingFields.includes('value') ? 'border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/10' : ''}`}
                                    placeholder="R$ 0,00"
                                />
                            </div>
                        </div>

                        <div className="col-span-2 pt-4 border-t border-[rgb(var(--border-subtle))]">
                            <h4 className="text-sm font-bold text-[rgb(var(--text-secondary))] uppercase tracking-wider mb-4">Partes</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Autor / Exequente</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                        <input
                                            type="text"
                                            value={formData.folder?.basicData.plaintiff || ''}
                                            onChange={(e) => updateFolderData('plaintiff', e.target.value)}
                                            className="input-premium w-full pl-10 px-4"
                                            placeholder="Nome do Autor"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Réu / Executado</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                        <input
                                            type="text"
                                            value={formData.folder?.basicData.defendant || ''}
                                            onChange={(e) => updateFolderData('defendant', e.target.value)}
                                            className="input-premium w-full pl-10 px-4"
                                            placeholder="Nome do Réu"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t border-[rgb(var(--border-subtle))] flex justify-end gap-4 bg-[rgb(var(--bg-tertiary))]/30">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="btn-premium py-2.5 px-6 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSaving ? 'Salvando...' : 'Salvar Processo'}
                    </button>
                </div>
            </div>

            {/* Quick Client Modal */}
            <QuickClientModal
                isOpen={showQuickClientModal}
                onClose={() => setShowQuickClientModal(false)}
                onClientCreated={handleQuickClientCreated}
            />

            {/* Client Suggestions Modal */}
            <ClientSuggestionsModal
                isOpen={showClientSuggestions}
                onClose={() => setShowClientSuggestions(false)}
                searchName={selectedClientParty || ''}
                matches={clientMatches}
                onSelectClient={handleSelectSuggestedClient}
                onCreateNew={handleCreateNewFromSuggestions}
            />
        </div>
    );
};
