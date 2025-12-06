import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Plus, Trash2, GripVertical, Settings, Check, X, AlertCircle } from 'lucide-react';
import type { FlowStep } from '../../types/flowchart.types';
import toast from 'react-hot-toast';

interface FlowchartEditorProps {
    steps: FlowStep[];
    onSave: (steps: FlowStep[]) => void;
    onCancel: () => void;
}

export const FlowchartEditor: React.FC<FlowchartEditorProps> = ({ steps: initialSteps, onSave, onCancel }) => {
    const [steps, setSteps] = useState<FlowStep[]>(initialSteps);
    const [editingStepId, setEditingStepId] = useState<string | null>(null);
    const [tempStepData, setTempStepData] = useState<Partial<FlowStep>>({});

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(steps);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order property
        const updatedItems = items.map((item, index) => ({
            ...item,
            order: index + 1
        }));

        setSteps(updatedItems);
    };

    const handleAddStep = () => {
        const newStep: FlowStep = {
            id: crypto.randomUUID(),
            flowchartId: steps.length > 0 ? steps[0].flowchartId : '', // Should be passed from parent ideally
            name: 'Nova Etapa',
            description: '',
            order: steps.length + 1,
            responsibleRole: 'lawyer',
            mandatory: true,
            checklist: [],
            createdAt: new Date().toISOString()
        };
        setSteps([...steps, newStep]);
        setEditingStepId(newStep.id);
        setTempStepData(newStep);
    };

    const handleDeleteStep = (id: string) => {
        if (confirm('Tem certeza que deseja remover esta etapa?')) {
            const filtered = steps.filter(s => s.id !== id);
            // Reorder remaining
            const reordered = filtered.map((item, index) => ({
                ...item,
                order: index + 1
            }));
            setSteps(reordered);
        }
    };

    const startEditing = (step: FlowStep) => {
        setEditingStepId(step.id);
        setTempStepData(step);
    };

    const saveStep = () => {
        if (!tempStepData.name) {
            toast.error('O nome da etapa é obrigatório');
            return;
        }

        setSteps(steps.map(s => s.id === editingStepId ? { ...s, ...tempStepData } as FlowStep : s));
        setEditingStepId(null);
        setTempStepData({});
    };

    const cancelEditing = () => {
        setEditingStepId(null);
        setTempStepData({});
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Editor de Fluxo</h3>
                <button
                    onClick={handleAddStep}
                    className="btn-premium px-3 py-1.5 text-sm flex items-center gap-2"
                >
                    <Plus size={16} />
                    Adicionar Etapa
                </button>
            </div>

            <div className="bg-[rgb(var(--bg-tertiary))]/30 rounded-xl p-4 border border-[rgb(var(--border-subtle))]">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="flow-steps">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-3"
                            >
                                {steps.map((step, index) => (
                                    <Draggable key={step.id} draggableId={step.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`bg-[rgb(var(--bg-primary))] rounded-lg border ${editingStepId === step.id ? 'border-[rgb(var(--accent-primary))] ring-1 ring-[rgb(var(--accent-primary))]' : 'border-[rgb(var(--border-subtle))]'} p-4 shadow-sm transition-all`}
                                            >
                                                {editingStepId === step.id ? (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium text-[rgb(var(--accent-primary))]">Editando Etapa #{index + 1}</h4>
                                                            <div className="flex gap-2">
                                                                <button onClick={cancelEditing} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg">
                                                                    <X size={18} />
                                                                </button>
                                                                <button onClick={saveStep} className="p-1.5 hover:bg-green-50 text-green-500 rounded-lg">
                                                                    <Check size={18} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-medium text-[rgb(var(--text-secondary))] mb-1">Nome da Etapa</label>
                                                                <input
                                                                    type="text"
                                                                    value={tempStepData.name || ''}
                                                                    onChange={(e) => setTempStepData({ ...tempStepData, name: e.target.value })}
                                                                    className="input-premium w-full text-sm"
                                                                    placeholder="Ex: Análise Inicial"
                                                                    autoFocus
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-[rgb(var(--text-secondary))] mb-1">Responsável Padrão</label>
                                                                <select
                                                                    value={tempStepData.responsibleRole || 'lawyer'}
                                                                    onChange={(e) => setTempStepData({ ...tempStepData, responsibleRole: e.target.value as any })}
                                                                    className="input-premium w-full text-sm"
                                                                >
                                                                    <option value="lawyer">Advogado</option>
                                                                    <option value="controller">Controlador</option>
                                                                    <option value="assistant">Assistente</option>
                                                                    <option value="intern">Estagiário</option>
                                                                    <option value="admin">Admin</option>
                                                                </select>
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-medium text-[rgb(var(--text-secondary))] mb-1">Descrição</label>
                                                                <textarea
                                                                    value={tempStepData.description || ''}
                                                                    onChange={(e) => setTempStepData({ ...tempStepData, description: e.target.value })}
                                                                    className="input-premium w-full text-sm min-h-[60px]"
                                                                    placeholder="Instruções para esta etapa..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-[rgb(var(--text-secondary))] mb-1">Prazo Interno (dias)</label>
                                                                <input
                                                                    type="number"
                                                                    value={tempStepData.deadlineDays || ''}
                                                                    onChange={(e) => setTempStepData({ ...tempStepData, deadlineDays: parseInt(e.target.value) || 0 })}
                                                                    className="input-premium w-full text-sm"
                                                                    min="0"
                                                                />
                                                            </div>
                                                            <div className="flex items-center pt-6">
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={tempStepData.mandatory}
                                                                        onChange={(e) => setTempStepData({ ...tempStepData, mandatory: e.target.checked })}
                                                                        className="rounded border-gray-300 text-[rgb(var(--accent-primary))] focus:ring-[rgb(var(--accent-primary))]"
                                                                    />
                                                                    <span className="text-sm text-[rgb(var(--text-primary))]">Etapa Obrigatória</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4">
                                                        <div {...provided.dragHandleProps} className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] cursor-grab active:cursor-grabbing">
                                                            <GripVertical size={20} />
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-[rgb(var(--bg-tertiary))] flex items-center justify-center font-bold text-[rgb(var(--text-secondary))] text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-[rgb(var(--text-primary))]">{step.name}</h4>
                                                            <p className="text-xs text-[rgb(var(--text-secondary))] truncate max-w-md">
                                                                {step.description || 'Sem descrição'} • {step.deadlineDays ? `${step.deadlineDays} dias` : 'Sem prazo'} • {step.responsibleRole}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => startEditing(step)}
                                                                className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))]"
                                                            >
                                                                <Settings size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteStep(step.id)}
                                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-[rgb(var(--text-secondary))] hover:text-red-500"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                {steps.length === 0 && (
                    <div className="text-center py-8 text-[rgb(var(--text-secondary))]">
                        <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
                        <p>Nenhuma etapa definida. Adicione a primeira etapa para começar.</p>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border-subtle))]">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-xl border border-[rgb(var(--border-default))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => onSave(steps)}
                    className="btn-premium px-6 py-2 flex items-center gap-2"
                >
                    <Check size={18} />
                    Salvar Fluxo
                </button>
            </div>
        </div>
    );
};
