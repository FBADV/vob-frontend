import React from 'react';
import { X, Calendar, Clock, Users, FileText, AlertCircle, DollarSign, Edit2, Briefcase, Trash2, CheckCircle } from 'lucide-react';
import type { Service } from '../../types';

interface AttendanceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    attendance: Service;
    onEdit: () => void;
    onDelete: () => void;
    onConvertToProcess: () => void;
}

export const AttendanceDetailsModal: React.FC<AttendanceDetailsModalProps> = ({
    isOpen,
    onClose,
    attendance,
    onEdit,
    onDelete,
    onConvertToProcess
}) => {
    if (!isOpen) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'in_progress': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            case 'completed': return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'canceled': return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
            default: return 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'scheduled': return 'Agendado';
            case 'in_progress': return 'Em Andamento';
            case 'completed': return 'Concluído';
            case 'canceled': return 'Cancelado';
            default: return status;
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-[rgb(var(--border-subtle))] animate-scale-in">

                {/* Header */}
                <div className="h-32 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-[rgb(var(--bg-primary))]/50">
                    <div className="px-8 pb-8">

                        {/* Title Section */}
                        <div className="relative -mt-8 mb-6">
                            <div className="card-premium p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                                            <Calendar size={32} />
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
                                                {attendance.title}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(attendance.status)}`}>
                                                    {getStatusLabel(attendance.status)}
                                                </span>
                                                {attendance.convertedToProcessId && (
                                                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold border border-green-200 dark:border-green-800">
                                                        <CheckCircle size={14} />
                                                        Processo Gerado
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={onEdit}
                                            className="btn-premium px-4 py-2 flex items-center gap-2"
                                        >
                                            <Edit2 size={18} />
                                            Editar
                                        </button>
                                        {!attendance.convertedToProcessId && (
                                            <button
                                                onClick={onConvertToProcess}
                                                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium flex items-center gap-2 border border-blue-200 dark:border-blue-800"
                                            >
                                                <Briefcase size={18} />
                                                Converter
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left Column - Main Info */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Card 1: Informações Básicas */}
                                <div className="card-premium p-6">
                                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                                        <Users size={20} className="text-[rgb(var(--accent-primary))]" />
                                        Informações Básicas
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wide mb-1 block">Cliente</label>
                                            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                                {attendance.clientName || 'Não vinculado'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wide mb-1 block">Pessoa Atendida</label>
                                            <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                                {attendance.personServed || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wide mb-1 block">Data</label>
                                            <p className="text-sm font-medium text-[rgb(var(--text-primary))] flex items-center gap-2">
                                                <Calendar size={14} className="text-[rgb(var(--text-tertiary))]" />
                                                {new Date(attendance.date).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wide mb-1 block">Horário</label>
                                            <p className="text-sm font-medium text-[rgb(var(--text-primary))] flex items-center gap-2">
                                                <Clock size={14} className="text-[rgb(var(--text-tertiary))]" />
                                                {attendance.time}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Types */}
                                    {attendance.types && attendance.types.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-[rgb(var(--border-subtle))]">
                                            <label className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wide mb-2 block">Tipos de Situação</label>
                                            <div className="flex flex-wrap gap-2">
                                                {attendance.types.map((type, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-xs bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] px-3 py-1.5 rounded-lg border border-[rgb(var(--border-subtle))] font-medium"
                                                    >
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Card 2: Descrição/Conteúdo */}
                                <div className="card-premium p-6">
                                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                                        <FileText size={20} className="text-[rgb(var(--accent-primary))]" />
                                        Descrição / Anotações
                                    </h3>
                                    <div className="bg-[rgb(var(--bg-tertiary))]/30 rounded-xl p-4 border border-[rgb(var(--border-subtle))]">
                                        <p className="text-sm text-[rgb(var(--text-secondary))] whitespace-pre-wrap">
                                            {attendance.description || 'Nenhuma descrição fornecida.'}
                                        </p>
                                    </div>
                                </div>

                            </div>

                            {/* Right Column - Prazos e Honorários */}
                            <div className="space-y-6">

                                {/* Card 3: Prazos e Entregas */}
                                <div className="card-premium p-6">
                                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                                        <AlertCircle size={20} className="text-amber-500" />
                                        Prazos
                                    </h3>

                                    {attendance.deadlines && attendance.deadlines.length > 0 ? (
                                        <div className="space-y-3">
                                            {attendance.deadlines.map((deadline, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-[rgb(var(--bg-tertiary))]/30 p-3 rounded-xl border border-[rgb(var(--border-subtle))]"
                                                >
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <span className="text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2.5 py-1 rounded-lg">
                                                            {new Date(deadline.date).toLocaleDateString('pt-BR')}
                                                        </span>
                                                        {deadline.completed && (
                                                            <CheckCircle size={16} className="text-green-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                                        {deadline.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-[rgb(var(--text-tertiary))] italic text-center py-4">
                                            Nenhum prazo definido
                                        </p>
                                    )}
                                </div>

                                {/* Card 4: Honorários */}
                                <div className="card-premium p-6">
                                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
                                        <DollarSign size={20} className="text-green-600 dark:text-green-400" />
                                        Honorários
                                    </h3>

                                    {attendance.feeAgreement?.closed ? (
                                        <div className="space-y-3">
                                            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                                <label className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1 block">
                                                    Valor Pactuado
                                                </label>
                                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                    {formatCurrency(attendance.feeAgreement.value || 0)}
                                                </p>
                                            </div>

                                            {attendance.feeAgreement.notes && (
                                                <div className="bg-[rgb(var(--bg-tertiary))]/30 p-3 rounded-xl border border-[rgb(var(--border-subtle))]">
                                                    <label className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase tracking-wide mb-1 block">
                                                        Observações
                                                    </label>
                                                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                                                        {attendance.feeAgreement.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-[rgb(var(--text-tertiary))] italic text-center py-4">
                                            Honorários não fechados
                                        </p>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-6 pt-6 border-t border-[rgb(var(--border-subtle))] flex justify-between items-center">
                            <button
                                onClick={onDelete}
                                className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium flex items-center gap-2"
                            >
                                <Trash2 size={18} />
                                Excluir Atendimento
                            </button>

                            <div className="text-xs text-[rgb(var(--text-tertiary))]">
                                Criado em {new Date(attendance.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
