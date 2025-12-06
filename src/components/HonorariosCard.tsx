import React, { useState } from 'react';
import { DollarSign, Edit2, Save, X } from 'lucide-react';

interface Honorarios {
    tipo: 'contratuais' | 'exito' | 'sucumbencia' | 'proveito_economico';
    valorPactuado: number;
    condicoes: string;
    dataInicio?: string;
    dataFim?: string;
    observacoes?: string;
}

interface HonorariosCardProps {
    clientId: string;
    honorarios?: Honorarios;
    onSave: (honorarios: Honorarios) => void;
}

const tiposHonorarios = [
    { value: 'contratuais', label: 'Honorários Contratuais' },
    { value: 'exito', label: 'Honorários de Êxito' },
    { value: 'sucumbencia', label: 'Honorários por Sucumbência' },
    { value: 'proveito_economico', label: 'Honorários por Proveito Econômico' }
];

export const HonorariosCard: React.FC<HonorariosCardProps> = ({ honorarios, onSave }) => {
    const [isEditing, setIsEditing] = useState(!honorarios);
    const [formData, setFormData] = useState<Honorarios>(honorarios || {
        tipo: 'contratuais',
        valorPactuado: 0,
        condicoes: '',
        observacoes: ''
    });

    const handleSave = () => {
        onSave(formData);
        setIsEditing(false);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                    <DollarSign className="text-[rgb(var(--accent-primary))]" size={24} />
                    Honorários / Contrato
                </h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 rounded-lg hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] transition-colors"
                    >
                        <Edit2 size={18} />
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                            Tipo de Honorário
                        </label>
                        <select
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                            className="input-premium w-full"
                        >
                            {tiposHonorarios.map(tipo => (
                                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                            Valor Pactuado (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.valorPactuado}
                            onChange={(e) => setFormData({ ...formData, valorPactuado: parseFloat(e.target.value) || 0 })}
                            className="input-premium w-full"
                            placeholder="0,00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                            Condições do Contrato
                        </label>
                        <textarea
                            rows={3}
                            value={formData.condicoes}
                            onChange={(e) => setFormData({ ...formData, condicoes: e.target.value })}
                            className="input-premium w-full resize-none"
                            placeholder="Descreva as condições contratuais..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                                Data Início
                            </label>
                            <input
                                type="date"
                                value={formData.dataInicio || ''}
                                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                                className="input-premium w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                                Data Fim
                            </label>
                            <input
                                type="date"
                                value={formData.dataFim || ''}
                                onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                                className="input-premium w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                            Observações
                        </label>
                        <textarea
                            rows={2}
                            value={formData.observacoes || ''}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            className="input-premium w-full resize-none"
                            placeholder="Observações adicionais..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-[rgb(var(--border-subtle))]">
                        <button
                            onClick={handleSave}
                            className="btn-premium flex items-center gap-2 flex-1"
                        >
                            <Save size={18} />
                            Salvar
                        </button>
                        {honorarios && (
                            <button
                                onClick={() => {
                                    setFormData(honorarios);
                                    setIsEditing(false);
                                }}
                                className="btn-secondary-premium flex items-center gap-2"
                            >
                                <X size={18} />
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-[rgb(var(--text-tertiary))] mb-1">Tipo</p>
                            <p className="text-sm font-bold text-[rgb(var(--text-primary))]">
                                {tiposHonorarios.find(t => t.value === formData.tipo)?.label}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-[rgb(var(--text-tertiary))] mb-1">Valor Pactuado</p>
                            <p className="text-sm font-bold text-[rgb(var(--accent-primary))]">
                                {formatCurrency(formData.valorPactuado)}
                            </p>
                        </div>
                    </div>

                    {formData.condicoes && (
                        <div>
                            <p className="text-xs text-[rgb(var(--text-tertiary))] mb-1">Condições</p>
                            <p className="text-sm text-[rgb(var(--text-secondary))]">{formData.condicoes}</p>
                        </div>
                    )}

                    {(formData.dataInicio || formData.dataFim) && (
                        <div className="grid grid-cols-2 gap-4">
                            {formData.dataInicio && (
                                <div>
                                    <p className="text-xs text-[rgb(var(--text-tertiary))] mb-1">Data Início</p>
                                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                                        {new Date(formData.dataInicio).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            )}
                            {formData.dataFim && (
                                <div>
                                    <p className="text-xs text-[rgb(var(--text-tertiary))] mb-1">Data Fim</p>
                                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                                        {new Date(formData.dataFim).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {formData.observacoes && (
                        <div>
                            <p className="text-xs text-[rgb(var(--text-tertiary))] mb-1">Observações</p>
                            <p className="text-sm text-[rgb(var(--text-secondary))]">{formData.observacoes}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
