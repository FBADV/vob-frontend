import React, { useState, useEffect, useCallback } from 'react';
import { X, DollarSign, AlertCircle, Plus, Trash2, Mic, FileText, Tag, Brain, Sparkles, Lightbulb, ArrowRightCircle, Scale, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import type { Service, Process } from '../types';
import { ProcessFormModal } from './ProcessFormModal';
import { useGlobalData } from '../context/GlobalDataContext';
import { useGamification } from '../context/GamificationContext';
import { aiService, type AIAnalysisResult } from '../services/ai.service';

interface ServiceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceToEdit?: Service | null;
    initialClient?: { id: string; name: string };
}

const SERVICE_TYPES = [
    'Consulta Inicial',
    'Reunião de Alinhamento',
    'Audiência',
    'Elaboração de Documentos',
    'Diligência',
    'Outro'
];

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ isOpen, onClose, serviceToEdit, initialClient }) => {
    const { addService, updateService, clients, addAgendaEvent, addProcess, processes, addFinancialEntry } = useGlobalData();
    const { refreshGamification } = useGamification();

    const { startWhatsAppConversation } = useChat();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Partial<Service>>({
        status: 'scheduled',
        types: [],
        deadlines: [],
        feeAgreement: { closed: false }
    });
    const [newDeadline, setNewDeadline] = useState({ date: '', description: '' });
    const [generateFinancialEntry, setGenerateFinancialEntry] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = React.useRef<any>(null);

    useEffect(() => {
        if (serviceToEdit) {
            setFormData(serviceToEdit);
        } else {
            setFormData({
                status: 'scheduled',
                types: [],
                deadlines: [],
                feeAgreement: { closed: false },
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                clientId: initialClient?.id,
                clientName: initialClient?.name
            });
        }
        setAnalysisResult(null); // Reset analysis on open
    }, [serviceToEdit, isOpen, initialClient]);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (formData.title && formData.date) {
                const client = clients.find(c => c.id === formData.clientId);
                const serviceData = {
                    ...formData,
                    clientName: client ? client.name : formData.personServed,
                } as Service;

                if (serviceToEdit && serviceToEdit.id) {
                    await updateService(serviceToEdit.id, serviceData);
                } else {
                    const newServiceId = crypto.randomUUID();
                    await addService({
                        ...serviceData,
                        id: newServiceId,
                        createdAt: new Date().toISOString(),
                    });

                    // Create Agenda Events for Deadlines
                    if (serviceData.deadlines && serviceData.deadlines.length > 0) {
                        try {
                            serviceData.deadlines.forEach(async (deadline) => {
                                await addAgendaEvent({
                                    id: crypto.randomUUID(),
                                    title: `Prazo: ${deadline.description}`,
                                    description: `Prazo referente ao atendimento: ${serviceData.title}`,
                                    startDate: deadline.date,
                                    startTime: '09:00',
                                    type: 'deadline',
                                    status: 'scheduled',
                                    serviceId: newServiceId,
                                    clientId: serviceData.clientId,
                                    createdAt: new Date().toISOString()
                                });
                            });
                        } catch (err) {
                            console.error('Error creating deadline events:', err);
                        }
                    }

                    // Generate Financial Entry
                    if (generateFinancialEntry && serviceData.feeAgreement?.value && serviceData.feeAgreement.value > 0) {
                        try {
                            await addFinancialEntry({
                                id: crypto.randomUUID(),
                                type: 'income',
                                category: 'Honorários',
                                description: `Honorários - ${serviceData.title}`,
                                amount: serviceData.feeAgreement.value,
                                date: new Date().toISOString().split('T')[0],
                                status: 'pending',
                                clientId: serviceData.clientId,
                                createdAt: new Date().toISOString()
                            });
                        } catch (err) {
                            console.error('Error creating financial entry:', err);
                        }
                    }
                }

                // Trigger gamification update only on creation
                try {
                    if (refreshGamification) {
                        await refreshGamification();
                    }
                } catch (err) {
                    console.error('Erro ao atualizar gamificação:', err);
                }

                // Force a small delay to allow state propagation
                setTimeout(() => {
                    onClose();
                }, 100);
            } else {
                alert('Por favor, preencha o título e a data do atendimento.');
            }
        } catch (error) {
            console.error('Erro ao salvar atendimento:', error);
            alert('Ocorreu um erro ao salvar o atendimento. Tente novamente.');
        }
    };

    const handleProcessNumberChange = (value: string) => {
        setFormData({ ...formData, processNumber: value });

        // Try to find and link to existing process
        if (value) {
            const existingProcess = processes.find(p => p.number === value);
            if (existingProcess) {
                setFormData(prev => ({
                    ...prev,
                    processNumber: value,
                    convertedToProcessId: existingProcess.id,
                    clientId: existingProcess.clientId || prev.clientId
                }));
            } else {
                // Clear the link if process not found
                setFormData(prev => ({
                    ...prev,
                    processNumber: value,
                    convertedToProcessId: undefined
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                processNumber: undefined,
                convertedToProcessId: undefined
            }));
        }
    };

    const handleAnalyze = async () => {
        if (!formData.description) {
            alert('Por favor, adicione uma descrição para analisar.');
            return;
        }
        setIsAnalyzing(true);
        try {
            const result = await aiService.analyzeService(formData);
            setAnalysisResult(result);
        } catch (error) {
            console.error('Error analyzing service:', error);
            alert('Erro ao analisar atendimento. Verifique o console.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const toggleType = useCallback((type: string) => {
        const currentTypes = formData.types || [];
        if (currentTypes.includes(type)) {
            setFormData({ ...formData, types: currentTypes.filter(t => t !== type) });
        } else {
            setFormData({ ...formData, types: [...currentTypes, type] });
        }
    }, [formData]);

    const addDeadline = useCallback(() => {
        if (newDeadline.date && newDeadline.description) {
            setFormData({
                ...formData,
                deadlines: [...(formData.deadlines || []), { ...newDeadline, completed: false }]
            });
            setNewDeadline({ date: '', description: '' });
        }
    }, [formData, newDeadline]);

    const removeDeadline = useCallback((index: number) => {
        const newDeadlines = [...(formData.deadlines || [])];
        newDeadlines.splice(index, 1);
        setFormData({ ...formData, deadlines: newDeadlines });
    }, [formData]);

    // Format dictated text for better readability
    const formatDictatedText = (text: string): string => {
        let formatted = text.trim();

        // Capitalize first letter
        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

        // Add period at the end if missing
        if (!/[.!?]$/.test(formatted)) {
            formatted += '.';
        }

        // Detect keywords that suggest new paragraphs
        const paragraphKeywords = [
            'primeiro',
            'segundo',
            'terceiro',
            'além disso',
            'por outro lado',
            'em seguida',
            'posteriormente',
            'adicionalmente',
            'outrossim',
            'ademais'
        ];

        paragraphKeywords.forEach(keyword => {
            const regex = new RegExp(`\\s+(${keyword})\\s+`, 'gi');
            formatted = formatted.replace(regex, '\n\n$1 ');
        });

        // Capitalize after periods
        formatted = formatted.replace(/\.\s+([a-z])/g, (_, letter) => {
            return '. ' + letter.toUpperCase();
        });

        // Remove multiple spaces
        formatted = formatted.replace(/\s+/g, ' ');

        // Clean up multiple line breaks
        formatted = formatted.replace(/\n{3,}/g, '\n\n');

        return formatted;
    };

    const [showProcessModal, setShowProcessModal] = useState(false);

    const handleConvertToProcess = () => {
        setShowProcessModal(true);
    };

    const handleProcessSaved = (process: Process) => {
        // Add the process
        addProcess(process);

        // Update or create the service to link to the process
        if (serviceToEdit && serviceToEdit.id) {
            // Existing service: update it
            updateService(serviceToEdit.id, {
                ...serviceToEdit,
                convertedToProcessId: process.id,
                status: 'completed'
            });
        } else if (formData.title && formData.date) {
            // New service: save it first with the process link
            const client = clients.find(c => c.id === formData.clientId);
            const newService: Service = {
                ...formData as Service,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                clientName: client ? client.name : formData.personServed,
                convertedToProcessId: process.id,
                status: 'completed'
            };
            addService(newService);

            // Create agenda events for deadlines if any
            if (newService.deadlines && newService.deadlines.length > 0) {
                newService.deadlines.forEach(deadline => {
                    addAgendaEvent({
                        id: crypto.randomUUID(),
                        title: `Prazo: ${deadline.description}`,
                        description: `Prazo referente ao atendimento: ${newService.title}`,
                        startDate: deadline.date,
                        startTime: '09:00',
                        type: 'deadline',
                        status: 'scheduled',
                        serviceId: newService.id,
                        clientId: newService.clientId,
                        createdAt: new Date().toISOString()
                    });
                });
            }
        }

        setShowProcessModal(false);
        onClose(); // Close service modal after conversion
    };

    const handleSendUpdate = async () => {
        if (!formData.clientId) {
            alert('Selecione um cliente para enviar atualização.');
            return;
        }

        const client = clients.find(c => c.id === formData.clientId);
        if (!client) return;

        try {
            let linkData = undefined;
            if (formData.convertedToProcessId) {
                linkData = {
                    type: 'process' as const,
                    id: formData.convertedToProcessId,
                    name: formData.processNumber || 'Processo'
                };
            }

            await startWhatsAppConversation({
                id: client.id,
                name: client.name,
                phone: client.phone,
                photo: client.photoUrl
            }, linkData);
            navigate('/chat');
        } catch (error) {
            console.error('Error starting WhatsApp conversation:', error);
            alert('Erro ao iniciar conversa no WhatsApp');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] animate-fade-in p-4 backdrop-blur-sm">
                <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto border border-[rgb(var(--border-subtle))]">
                    <div className="px-8 py-6 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center sticky top-0 bg-[rgb(var(--bg-secondary))] z-10">
                        <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                            <FileText className="text-[rgb(var(--accent-primary))]" size={24} />
                            {serviceToEdit ? 'Editar Atendimento' : 'Novo Atendimento'}
                        </h3>
                        <div className="flex items-center gap-2">
                            {!formData.convertedToProcessId && (
                                <button
                                    type="button"
                                    onClick={handleConvertToProcess}
                                    className="px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-xs font-bold uppercase tracking-wide flex items-center gap-2"
                                    title="Transformar este atendimento em um Processo Judicial"
                                >
                                    <ArrowRightCircle size={16} />
                                    Evoluir para Processo
                                </button>
                            )}
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Título do Atendimento</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-premium px-4 w-full"
                                    placeholder="Ex: Consulta Inicial - Divórcio"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Cliente (Opcional)</label>
                                <select
                                    value={formData.clientId || ''}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    className="input-premium px-4 w-full"
                                >
                                    <option value="">Selecione um cliente...</option>
                                    {Array.isArray(clients) && clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Pessoa Atendida</label>
                                <input
                                    type="text"
                                    value={formData.personServed || ''}
                                    onChange={(e) => setFormData({ ...formData, personServed: e.target.value })}
                                    className="input-premium px-4 w-full"
                                    placeholder="Nome da pessoa (se diferente ou novo)"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2 flex items-center gap-2">
                                    <Scale size={16} className="text-[rgb(var(--accent-primary))]" />
                                    Número do Processo (Opcional)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.processNumber || ''}
                                        onChange={(e) => handleProcessNumberChange(e.target.value)}
                                        className="input-premium px-4 w-full"
                                        placeholder="Ex: 0000000-00.0000.0.00.0000"
                                    />
                                    {formData.processNumber && formData.convertedToProcessId && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-bold">
                                            <Scale size={14} />
                                            Vinculado
                                        </div>
                                    )}
                                </div>
                                {formData.processNumber && !formData.convertedToProcessId && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        Processo não encontrado. Será criado ao evoluir este atendimento.
                                    </p>
                                )}
                                {formData.processNumber && formData.convertedToProcessId && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                                        <Scale size={12} />
                                        Atendimento vinculado ao processo existente.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Data</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date || ''}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="input-premium px-4 w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Hora</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.time || ''}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="input-premium px-4 w-full"
                                />
                            </div>
                        </div>

                        {/* Types */}
                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-3 flex items-center gap-2">
                                <Tag size={18} className="text-[rgb(var(--accent-primary))]" />
                                Tipo de Situação (Múltipla escolha)
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {SERVICE_TYPES.map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => toggleType(type)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${formData.types?.includes(type)
                                            ? 'bg-[rgb(var(--accent-primary))]/10 border-[rgb(var(--accent-primary))] text-[rgb(var(--accent-primary))] shadow-sm'
                                            : 'bg-[rgb(var(--bg-tertiary))] border-transparent text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))]/80 hover:text-[rgb(var(--text-primary))]'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))]">Descrição / Anotações</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isRecording) {
                                            // Stop recording
                                            if (recognitionRef.current) {
                                                recognitionRef.current.stop();
                                            }
                                            setIsRecording(false);
                                        } else {
                                            // Start recording
                                            if ('webkitSpeechRecognition' in window) {
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                const recognition = new (window as any).webkitSpeechRecognition();
                                                recognition.lang = 'pt-BR';
                                                recognition.continuous = true;
                                                recognition.interimResults = true;

                                                recognition.onstart = () => {
                                                    setIsRecording(true);
                                                };

                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                recognition.onresult = (event: any) => {
                                                    let finalTranscript = '';
                                                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                                                        if (event.results[i].isFinal) {
                                                            finalTranscript += event.results[i][0].transcript;
                                                        }
                                                    }

                                                    if (finalTranscript) {
                                                        const formattedText = formatDictatedText(finalTranscript);
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            description: (prev.description || '') + (prev.description ? ' ' : '') + formattedText
                                                        }));
                                                    }
                                                };

                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                recognition.onerror = (event: any) => {
                                                    console.error('Speech recognition error', event.error);
                                                    setIsRecording(false);
                                                };

                                                recognition.onend = () => {
                                                    setIsRecording(false);
                                                };

                                                recognitionRef.current = recognition;
                                                recognition.start();
                                            } else {
                                                alert('Navegador não suporta voz.');
                                            }
                                        }
                                    }}
                                    className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${isRecording
                                        ? 'text-red-500 hover:text-red-600 animate-pulse'
                                        : 'text-[rgb(var(--accent-primary))] hover:text-[rgb(var(--accent-secondary))]'
                                        }`}
                                    title={isRecording ? "Clique para parar" : "Clique para ditar"}
                                >
                                    <Mic size={14} className={isRecording ? "fill-current" : ""} />
                                    {isRecording ? 'Parar Gravação' : 'Ditar Nota'}
                                </button>
                            </div>
                            <textarea
                                rows={12}
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-premium px-4 w-full resize-y min-h-[200px]"
                                placeholder="Detalhes do atendimento (Ex: Caso Munck - Relatório completo...)"
                            />

                            <div className="flex justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !formData.description}
                                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-purple-600 hover:text-purple-700 disabled:opacity-50 transition-colors"
                                >
                                    {isAnalyzing ? (
                                        <span className="animate-pulse">Analisando...</span>
                                    ) : (
                                        <>
                                            <Sparkles size={14} />
                                            Analisar com IA
                                        </>
                                    )}
                                </button>
                            </div>

                            {analysisResult && (
                                <div className="mt-4 bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 animate-fade-in">
                                    <div className="flex items-center gap-2 mb-3 text-purple-800 dark:text-purple-300 font-bold text-sm uppercase tracking-wide">
                                        <Brain size={16} />
                                        Análise Jurídica (IA)
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                                            <span className="text-xs text-gray-500 block mb-1">Complexidade</span>
                                            <span className={`text-sm font-bold ${analysisResult.complexity === 'Alta' ? 'text-red-500' : 'text-green-500'}`}>
                                                {analysisResult.complexity}
                                            </span>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                                            <span className="text-xs text-gray-500 block mb-1">Risco Estimado</span>
                                            <span className={`text-sm font-bold ${analysisResult.risk_level === 'Alto' ? 'text-red-500' : 'text-amber-500'}`}>
                                                {analysisResult.risk_level}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <h5 className="text-xs font-bold text-purple-700 dark:text-purple-400 mb-1 flex items-center gap-1">
                                                <Lightbulb size={12} /> Estratégias Sugeridas
                                            </h5>
                                            <ul className="list-disc list-inside text-xs text-gray-700 dark:text-gray-300 space-y-1">
                                                {analysisResult.strategies.map((strat, i) => (
                                                    <li key={i}>{strat}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Deadlines */}
                        <div className="bg-[rgb(var(--bg-tertiary))]/30 p-6 rounded-2xl border border-[rgb(var(--border-subtle))]">
                            <h4 className="text-sm font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <AlertCircle size={18} className="text-amber-500" />
                                Prazos e Entregas
                            </h4>

                            <div className="flex gap-3 mb-4">
                                <input
                                    type="date"
                                    value={newDeadline.date}
                                    onChange={(e) => setNewDeadline({ ...newDeadline, date: e.target.value })}
                                    className="input-premium px-4 w-40 text-sm"
                                />
                                <input
                                    type="text"
                                    value={newDeadline.description}
                                    onChange={(e) => setNewDeadline({ ...newDeadline, description: e.target.value })}
                                    placeholder="Descrição do prazo..."
                                    className="input-premium px-4 flex-1 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={addDeadline}
                                    className="p-3 bg-[rgb(var(--accent-primary))] text-white rounded-xl hover:bg-[rgb(var(--accent-secondary))] transition-colors shadow-lg shadow-[rgb(var(--accent-primary))]/20"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {formData.deadlines?.map((deadline, index) => (
                                    <div key={index} className="flex items-center justify-between bg-[rgb(var(--bg-secondary))] p-3 rounded-xl border border-[rgb(var(--border-subtle))] shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2.5 py-1 rounded-lg">
                                                {new Date(deadline.date).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span className="text-sm font-medium text-[rgb(var(--text-primary))]">{deadline.description}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeDeadline(index)}
                                            className="text-[rgb(var(--text-tertiary))] hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                {(!formData.deadlines || formData.deadlines.length === 0) && (
                                    <p className="text-xs text-[rgb(var(--text-tertiary))] text-center italic py-2">Nenhum prazo definido.</p>
                                )}
                            </div>
                        </div>

                        {/* Fees */}
                        <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-900/30">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-[rgb(var(--text-primary))] flex items-center gap-2 uppercase tracking-wider">
                                    <DollarSign size={18} className="text-green-600 dark:text-green-400" />
                                    Honorários
                                </h4>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.feeAgreement?.closed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${formData.feeAgreement?.closed ? 'translate-x-6' : ''}`} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.feeAgreement?.closed || false}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            feeAgreement: { ...formData.feeAgreement, closed: e.target.checked }
                                        })}
                                        className="hidden"
                                    />
                                    <span className="text-sm font-bold text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--text-primary))] transition-colors">Fechamento Realizado</span>
                                </label>
                            </div>

                            {formData.feeAgreement?.closed && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                    <div>
                                        <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] mb-2 uppercase tracking-wide">Valor Pactuado (R$)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-[rgb(var(--text-tertiary))]">R$</span>
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.feeAgreement?.value || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    feeAgreement: { ...formData.feeAgreement!, value: parseFloat(e.target.value) }
                                                })}
                                                className="input-premium pl-10 w-full"
                                                placeholder="0,00"
                                            />
                                        </div>

                                        {(formData.feeAgreement?.value || 0) > 0 && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="generateFinancial"
                                                    checked={generateFinancialEntry}
                                                    onChange={(e) => setGenerateFinancialEntry(e.target.checked)}
                                                    className="rounded border-gray-300 text-[rgb(var(--accent-primary))] focus:ring-[rgb(var(--accent-primary))]"
                                                />
                                                <label htmlFor="generateFinancial" className="text-sm text-[rgb(var(--text-secondary))] cursor-pointer select-none">
                                                    Gerar lançamento financeiro (Pendente)
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] mb-2 uppercase tracking-wide">Observações Financeiras</label>
                                        <input
                                            type="text"
                                            value={formData.feeAgreement?.notes || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                feeAgreement: {
                                                    closed: true,
                                                    notes: e.target.value,
                                                    value: formData.feeAgreement?.value
                                                }
                                            })}
                                            className="input-premium px-4 w-full"
                                            placeholder="Condições de pagamento..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t border-[rgb(var(--border-subtle))]">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            {serviceToEdit && (
                                <button
                                    type="button"
                                    onClick={handleSendUpdate}
                                    className="px-6 py-3 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-colors font-bold flex items-center gap-2"
                                >
                                    <MessageCircle size={20} />
                                    Enviar Atualização
                                </button>
                            )}
                            <button
                                type="submit"
                                className="btn-premium py-3 px-8 shadow-lg shadow-[rgb(var(--accent-primary))]/20"
                            >
                                {serviceToEdit ? 'Salvar Alterações' : 'Criar Atendimento'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showProcessModal && (
                <ProcessFormModal
                    isOpen={showProcessModal}
                    onClose={() => setShowProcessModal(false)}
                    initialData={{
                        title: formData.title,
                        number: formData.processNumber || '',
                        clientId: formData.clientId,
                        folder: {
                            basicData: {
                                plaintiff: formData.clientName || formData.personServed || '',
                                defendant: '',
                                judge: '',
                                prosecutor: '',
                                courtSection: '',
                                distributionDate: new Date().toISOString().split('T')[0]
                            },
                            movements: [],
                            timeline: [],
                            observations: formData.description ? [{
                                id: crypto.randomUUID(),
                                processId: '', // Will be set by ProcessFormModal or we should set it
                                userId: 'current-user', // Should get from context
                                userName: 'Usuário',
                                content: `Origem: Atendimento "${formData.title}"\n\n${formData.description}`,
                                createdAt: new Date().toISOString()
                            }] : [],
                            documents: []
                        }
                    }}
                    onSave={handleProcessSaved}
                />
            )}
        </>
    );
};
