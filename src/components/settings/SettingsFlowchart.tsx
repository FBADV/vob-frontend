import React, { useState, useEffect } from 'react';
import { Plus, GitMerge, Edit2, Trash2, X, Copy } from 'lucide-react';
import { db } from '../../services/database.service';
import type { Flowchart, FlowStep } from '../../types/flowchart.types';
import { FlowchartEditor } from '../flowchart/FlowchartEditor';
import toast from 'react-hot-toast';

export const SettingsFlowchart: React.FC = () => {
    const [flowcharts, setFlowcharts] = useState<Flowchart[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentFlowchart, setCurrentFlowchart] = useState<Flowchart | null>(null);
    const [currentSteps, setCurrentSteps] = useState<FlowStep[]>([]);

    useEffect(() => {
        loadFlowcharts();
    }, []);

    const loadFlowcharts = async () => {
        try {
            setIsLoading(true);
            const data = await db.flowcharts.getAll();
            setFlowcharts(data);
        } catch (error) {
            console.error('Error loading flowcharts:', error);
            toast.error('Erro ao carregar fluxogramas');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        const newFlowchart: Flowchart = {
            id: '', // Will be set by service
            name: 'Novo Fluxograma',
            description: '',
            type: 'unique',
            active: true,
            createdAt: '',
            updatedAt: ''
        };
        setCurrentFlowchart(newFlowchart);
        setCurrentSteps([]);
        setIsEditing(true);
    };

    const handleEdit = async (flowchart: Flowchart) => {
        try {
            const steps = await db.flowcharts.getSteps(flowchart.id);
            setCurrentFlowchart(flowchart);
            setCurrentSteps(steps);
            setIsEditing(true);
        } catch (error) {
            console.error('Error loading steps:', error);
            toast.error('Erro ao carregar etapas do fluxo');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este fluxograma? Esta ação não pode ser desfeita.')) {
            try {
                await db.flowcharts.delete(id);
                setFlowcharts(flowcharts.filter(f => f.id !== id));
                toast.success('Fluxograma excluído com sucesso');
            } catch (error) {
                console.error('Error deleting flowchart:', error);
                toast.error('Erro ao excluir fluxograma');
            }
        }
    };

    const handleDuplicate = async (flowchart: Flowchart) => {
        try {
            // 1. Create new flowchart copy
            const newFlowchartData = {
                ...flowchart,
                name: `${flowchart.name} (Cópia)`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            // @ts-ignore - id will be removed by create method logic if we passed it, but we want a new one.
            // Actually the service ignores ID on create if we use the Omit type, but here we are passing full object.
            // Let's manually construct the object to be safe.
            const { id, ...dataToCopy } = newFlowchartData;
            const createdFlowchart = await db.flowcharts.create(dataToCopy);

            // 2. Get original steps
            const originalSteps = await db.flowcharts.getSteps(flowchart.id);

            // 3. Create copies of steps
            const newSteps = originalSteps.map(step => ({
                ...step,
                id: crypto.randomUUID(),
                flowchartId: createdFlowchart.id
            }));

            // 4. Save new steps
            await db.flowcharts.saveSteps(createdFlowchart.id, newSteps);

            // 5. Update list
            setFlowcharts([...flowcharts, createdFlowchart]);
            toast.success('Fluxograma duplicado com sucesso');
        } catch (error) {
            console.error('Error duplicating flowchart:', error);
            toast.error('Erro ao duplicar fluxograma');
        }
    };

    const handleSave = async (steps: FlowStep[]) => {
        if (!currentFlowchart) return;

        try {
            let savedFlowchart: Flowchart;

            if (currentFlowchart.id) {
                // Update existing
                savedFlowchart = await db.flowcharts.update(currentFlowchart.id, currentFlowchart);

                // Update steps (simple replace strategy for now)
                // We need to ensure steps have the correct flowchartId
                const stepsWithId = steps.map(s => ({ ...s, flowchartId: savedFlowchart.id }));
                await db.flowcharts.saveSteps(savedFlowchart.id, stepsWithId);

                setFlowcharts(flowcharts.map(f => f.id === savedFlowchart.id ? savedFlowchart : f));
                toast.success('Fluxograma atualizado com sucesso');
            } else {
                // Create new
                savedFlowchart = await db.flowcharts.create(currentFlowchart);

                const stepsWithId = steps.map(s => ({ ...s, flowchartId: savedFlowchart.id }));
                await db.flowcharts.saveSteps(savedFlowchart.id, stepsWithId);

                setFlowcharts([...flowcharts, savedFlowchart]);
                toast.success('Fluxograma criado com sucesso');
            }

            setIsEditing(false);
            setCurrentFlowchart(null);
            setCurrentSteps([]);
        } catch (error) {
            console.error('Error saving flowchart:', error);
            toast.error('Erro ao salvar fluxograma');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-[rgb(var(--text-secondary))]">Carregando...</div>;
    }

    if (isEditing && currentFlowchart) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))]"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                        {currentFlowchart.id ? 'Editar Fluxograma' : 'Novo Fluxograma'}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Nome do Fluxo</label>
                        <input
                            type="text"
                            value={currentFlowchart.name}
                            onChange={(e) => setCurrentFlowchart({ ...currentFlowchart, name: e.target.value })}
                            className="input-premium w-full"
                            placeholder="Ex: Fluxo Trabalhista Padrão"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Tipo</label>
                        <select
                            value={currentFlowchart.type}
                            onChange={(e) => setCurrentFlowchart({ ...currentFlowchart, type: e.target.value as any })}
                            className="input-premium w-full"
                        >
                            <option value="unique">Único (Padrão)</option>
                            <option value="legal_area">Por Área do Direito</option>
                            <option value="case_type">Por Tipo de Ação</option>
                            <option value="client">Por Cliente</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Descrição</label>
                        <textarea
                            value={currentFlowchart.description}
                            onChange={(e) => setCurrentFlowchart({ ...currentFlowchart, description: e.target.value })}
                            className="input-premium w-full min-h-[80px]"
                            placeholder="Descreva o objetivo deste fluxo..."
                        />
                    </div>
                </div>

                <FlowchartEditor
                    steps={currentSteps}
                    onSave={handleSave}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">Fluxogramas Processuais</h2>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Defina os fluxos de trabalho do escritório</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="btn-premium flex items-center gap-2 px-4 py-2"
                >
                    <Plus size={18} />
                    Novo Fluxo
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {flowcharts.length === 0 ? (
                    <div className="text-center py-12 text-[rgb(var(--text-secondary))] bg-[rgb(var(--bg-tertiary))]/30 rounded-xl border border-[rgb(var(--border-subtle))]">
                        <GitMerge className="mx-auto mb-3 opacity-50" size={48} />
                        <p className="text-lg font-medium">Nenhum fluxograma criado</p>
                        <p className="text-sm mt-1">Crie seu primeiro fluxo para padronizar os processos.</p>
                        <button
                            onClick={handleCreate}
                            className="mt-4 text-[rgb(var(--accent-primary))] hover:underline font-medium"
                        >
                            Criar agora
                        </button>
                    </div>
                ) : (
                    flowcharts.map((flow) => (
                        <div key={flow.id} className="card-premium p-5 flex items-center justify-between group hover:border-[rgb(var(--accent-primary))]/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[rgb(var(--bg-tertiary))] flex items-center justify-center text-[rgb(var(--accent-primary))]">
                                    <GitMerge size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[rgb(var(--text-primary))] text-lg">{flow.name}</h3>
                                    <p className="text-sm text-[rgb(var(--text-secondary))]">{flow.description || 'Sem descrição'}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-medium">
                                            {flow.type === 'unique' ? 'Fluxo Padrão' :
                                                flow.type === 'legal_area' ? 'Por Área' :
                                                    flow.type === 'case_type' ? 'Por Ação' : 'Por Cliente'}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${flow.active ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'}`}>
                                            {flow.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(flow)}
                                    className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] transition-colors"
                                    title="Editar"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDuplicate(flow)}
                                    className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] transition-colors"
                                    title="Duplicar"
                                >
                                    <Copy size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(flow.id)}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-[rgb(var(--text-secondary))] hover:text-red-600 transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
