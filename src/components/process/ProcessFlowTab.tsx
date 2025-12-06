import React, { useState, useEffect } from 'react';
import { GitMerge, CheckCircle2, ArrowRight, Clock, AlertTriangle, Play, RotateCcw } from 'lucide-react';
import { db } from '../../services/database.service';
import type { Process } from '../../types';
import type { Flowchart, FlowStep, ProcessFlowState, FlowHistory } from '../../types/flowchart.types';
import { useGlobalData } from '../../context/GlobalDataContext';
import toast from 'react-hot-toast';

interface ProcessFlowTabProps {
    process: Process;
}

export const ProcessFlowTab: React.FC<ProcessFlowTabProps> = ({ process }) => {
    const { user } = useGlobalData();
    const [flowState, setFlowState] = useState<ProcessFlowState | null>(null);
    const [currentFlowchart, setCurrentFlowchart] = useState<Flowchart | null>(null);
    const [steps, setSteps] = useState<FlowStep[]>([]);
    const [history, setHistory] = useState<FlowHistory[]>([]);
    const [availableFlowcharts, setAvailableFlowcharts] = useState<Flowchart[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFlowId, setSelectedFlowId] = useState<string>('');

    useEffect(() => {
        loadData();
    }, [process.id]);

    const loadData = async () => {
        try {
            setIsLoading(true);

            // Load current state
            const state = await db.flowExecution.getState(process.id);
            setFlowState(state);

            if (state) {
                // Load flowchart details
                const flowcharts = await db.flowcharts.getAll();
                const flowchart = flowcharts.find(f => f.id === state.flowchartId) || null;
                setCurrentFlowchart(flowchart);

                if (flowchart) {
                    const flowSteps = await db.flowcharts.getSteps(flowchart.id);
                    setSteps(flowSteps);
                }

                // Load history
                const hist = await db.flowExecution.getHistory(process.id);
                setHistory(hist);
            } else {
                // Load available flowcharts for selection
                const flows = await db.flowcharts.getAll();
                setAvailableFlowcharts(flows.filter(f => f.active));
                if (flows.length > 0) {
                    setSelectedFlowId(flows[0].id);
                }
            }
        } catch (error) {
            console.error('Error loading flow data:', error);
            toast.error('Erro ao carregar dados do fluxo');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartFlow = async () => {
        if (!selectedFlowId) return;
        try {
            await db.flowExecution.startFlow(process.id, selectedFlowId);
            toast.success('Fluxo iniciado com sucesso!');
            loadData();
        } catch (error) {
            console.error('Error starting flow:', error);
            toast.error('Erro ao iniciar fluxo');
        }
    };

    const handleAdvanceStep = async () => {
        if (!flowState || !currentFlowchart) return;

        const currentStepIndex = steps.findIndex(s => s.id === flowState.currentStepId);
        if (currentStepIndex === -1 || currentStepIndex === steps.length - 1) return;

        const nextStep = steps[currentStepIndex + 1];

        try {
            await db.flowExecution.advanceStep(
                process.id,
                nextStep.id,
                user?.id || 'unknown',
                user?.name || 'Usuário',
                'Avanço manual de etapa'
            );
            toast.success(`Avançado para: ${nextStep.name}`);
            loadData();
        } catch (error) {
            console.error('Error advancing step:', error);
            toast.error('Erro ao avançar etapa');
        }
    };

    const handleReturnStep = async () => {
        if (!flowState || !currentFlowchart) return;

        const currentStepIndex = steps.findIndex(s => s.id === flowState.currentStepId);
        if (currentStepIndex <= 0) return;

        const previousStep = steps[currentStepIndex - 1];

        if (!confirm(`Tem certeza que deseja retornar para a etapa "${previousStep.name}"?`)) return;

        try {
            await db.flowExecution.returnStep(
                process.id,
                previousStep.id,
                user?.id || 'unknown',
                user?.name || 'Usuário',
                'Retorno manual de etapa'
            );
            toast.success(`Retornado para: ${previousStep.name}`);
            loadData();
        } catch (error) {
            console.error('Error returning step:', error);
            toast.error('Erro ao retornar etapa');
        }
    };

    const getCurrentStep = () => {
        if (!flowState || steps.length === 0) return null;
        return steps.find(s => s.id === flowState.currentStepId);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-[rgb(var(--text-secondary))]">Carregando fluxo...</div>;
    }

    // STATE: No flow started
    if (!flowState) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[rgb(var(--bg-tertiary))] flex items-center justify-center text-[rgb(var(--text-secondary))] mb-2">
                    <GitMerge size={32} />
                </div>
                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Nenhum fluxo iniciado</h3>
                <p className="text-[rgb(var(--text-secondary))] max-w-md">
                    Selecione um fluxograma para iniciar o acompanhamento processual deste caso.
                </p>

                {availableFlowcharts.length > 0 ? (
                    <div className="flex items-center gap-3 mt-4">
                        <select
                            value={selectedFlowId}
                            onChange={(e) => setSelectedFlowId(e.target.value)}
                            className="input-premium min-w-[200px]"
                        >
                            {availableFlowcharts.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleStartFlow}
                            className="btn-premium px-4 py-2 flex items-center gap-2"
                        >
                            <Play size={16} />
                            Iniciar Fluxo
                        </button>
                    </div>
                ) : (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-xl border border-yellow-200 dark:border-yellow-800 mt-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={18} />
                            <span className="font-medium">Nenhum fluxograma disponível</span>
                        </div>
                        <p className="text-sm mt-1">Crie fluxogramas nas Configurações para utilizar este recurso.</p>
                    </div>
                )}
            </div>
        );
    }

    const currentStep = getCurrentStep();
    const currentStepIndex = steps.findIndex(s => s.id === flowState.currentStepId);
    const progress = Math.round(((currentStepIndex + 1) / steps.length) * 100);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Progress */}
            <div className="bg-[rgb(var(--bg-tertiary))]/30 rounded-xl p-6 border border-[rgb(var(--border-subtle))]">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                            {currentFlowchart?.name}
                            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))] border border-[rgb(var(--accent-primary))]/20">
                                {progress}% Concluído
                            </span>
                        </h3>
                        <p className="text-sm text-[rgb(var(--text-secondary))]">
                            Iniciado em {new Date(flowState.startedAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {currentStepIndex > 0 && (
                            <button
                                onClick={handleReturnStep}
                                className="px-4 py-2 rounded-xl border border-[rgb(var(--border-default))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] transition-colors flex items-center gap-2"
                            >
                                <RotateCcw size={16} />
                                <span>Voltar</span>
                            </button>
                        )}

                        {currentStepIndex < steps.length - 1 ? (
                            <button
                                onClick={handleAdvanceStep}
                                className="btn-premium px-4 py-2 flex items-center gap-2"
                            >
                                <span>Próxima Etapa</span>
                                <ArrowRight size={16} />
                            </button>
                        ) : (
                            <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl font-medium flex items-center gap-2">
                                <CheckCircle2 size={18} />
                                Fluxo Concluído
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-[rgb(var(--bg-tertiary))] rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full bg-[rgb(var(--accent-primary))] transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Current Step Detail */}
                {currentStep && (
                    <div className="flex items-start gap-4 p-4 bg-[rgb(var(--bg-primary))] rounded-xl border border-[rgb(var(--border-subtle))] shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-[rgb(var(--accent-primary))] flex items-center justify-center text-white font-bold shrink-0">
                            {currentStepIndex + 1}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-[rgb(var(--text-primary))] text-lg mb-1">{currentStep.name}</h4>
                            <p className="text-[rgb(var(--text-secondary))] mb-3">{currentStep.description || 'Sem descrição disponível.'}</p>

                            <div className="flex flex-wrap gap-3 text-sm">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))]">
                                    <Clock size={14} />
                                    <span>Prazo: {currentStep.deadlineDays ? `${currentStep.deadlineDays} dias` : 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))]">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span>Responsável: {currentStep.responsibleRole}</span>
                                </div>
                                {currentStep.mandatory && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                        <AlertTriangle size={14} />
                                        <span>Obrigatória</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline / History */}
            <div>
                <h4 className="font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                    <RotateCcw size={18} />
                    Histórico de Movimentações
                </h4>
                <div className="space-y-4 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-[rgb(var(--border-subtle))]">
                    {history.map((entry, index) => {
                        const fromStep = steps.find(s => s.id === entry.fromStepId);
                        const toStep = steps.find(s => s.id === entry.toStepId);

                        return (
                            <div key={entry.id} className="relative flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="w-10 h-10 rounded-full bg-[rgb(var(--bg-primary))] border-2 border-[rgb(var(--accent-primary))] flex items-center justify-center shrink-0 z-10">
                                    <CheckCircle2 size={16} className="text-[rgb(var(--accent-primary))]" />
                                </div>
                                <div className="flex-1 bg-[rgb(var(--bg-tertiary))]/20 rounded-xl p-4 border border-[rgb(var(--border-subtle))]">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-[rgb(var(--text-primary))]">
                                            {toStep?.name || 'Início'}
                                        </span>
                                        <span className="text-xs text-[rgb(var(--text-tertiary))]">
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">
                                        {fromStep ? `Movido de: ${fromStep.name}` : 'Fluxo iniciado'}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-[rgb(var(--text-tertiary))]">
                                        <span className="font-medium text-[rgb(var(--text-secondary))]">{entry.userName}</span>
                                        <span>•</span>
                                        <span>{entry.comments}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
