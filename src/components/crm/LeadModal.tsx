import React, { useState, useEffect } from 'react';
import type { Lead } from '../../types';
import { X, Save, User, Mail, Phone, DollarSign, FileText, Tag, Brain, Sparkles, Target, TrendingUp, UserCheck, MessageSquare } from 'lucide-react';
import { aiService } from '../../services/ai.service';

interface LeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (lead: Partial<Lead>) => void;
    lead?: Lead | null;
}

import { ClientAutocomplete } from '../ClientAutocomplete';
import { useGlobalData } from '../../context/GlobalDataContext';
import { formatPhone } from '../../utils/formatters';

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, onSave, lead }) => {
    const { clients } = useGlobalData();
    const [formData, setFormData] = useState<Partial<Lead>>({
        name: '',
        email: '',
        phone: '',
        source: 'indication',
        status: 'new',
        value: 0,
        notes: ''
    });

    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

    const handleClientSelect = (clientId: string | null) => {
        setSelectedClientId(clientId);
        if (clientId) {
            const client = clients.find(c => c.id === clientId);
            if (client) {
                setFormData(prev => ({
                    ...prev,
                    name: client.name,
                    email: client.email || prev.email,
                    phone: client.phone || prev.phone
                }));
            }
        }
    };

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    useEffect(() => {
        if (lead) {
            setFormData(lead);
            setAnalysisResult(null);
            setSelectedClientId(null); // Reset client selection on edit
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                source: 'indication',
                status: 'new',
                value: 0,
                notes: ''
            });
            setAnalysisResult(null);
            setSelectedClientId(null);
        }
    }, [lead, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const handleAnalyze = async () => {
        if (!formData.name) return;

        setIsAnalyzing(true);
        try {
            const result = await aiService.analyzeLead(formData);
            setAnalysisResult(result);
        } catch (error) {
            console.error('Error analyzing lead:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl m-4 border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {lead ? 'Editar Lead' : 'Novo Lead'}
                        </h3>
                        <button
                            type="button"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !formData.name}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                        >
                            {isAnalyzing ? (
                                <Sparkles size={16} className="animate-spin" />
                            ) : (
                                <Brain size={16} />
                            )}
                            {isAnalyzing ? 'Analisando...' : 'Analisar com IA'}
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    {analysisResult && (
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-purple-100 dark:border-purple-800 animate-fade-in">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="text-purple-600 dark:text-purple-400" size={20} />
                                <h4 className="font-semibold text-purple-900 dark:text-purple-100">Análise de Oportunidade</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                                        <Target size={14} /> Probabilidade
                                    </div>
                                    <div className="text-lg font-bold text-gray-800 dark:text-white">
                                        {analysisResult.closing_probability}%
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2">
                                        <div
                                            className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000"
                                            style={{ width: `${analysisResult.closing_probability}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                                        <UserCheck size={14} /> Perfil
                                    </div>
                                    <div className="text-sm font-medium text-gray-800 dark:text-white">
                                        {analysisResult.client_profile}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <TrendingUp size={14} /> Próximos Passos
                                    </div>
                                    <ul className="space-y-1">
                                        {analysisResult.next_steps?.map((step: string, i: number) => (
                                            <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                                <span className="text-purple-500 mt-1">•</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <MessageSquare size={14} /> Argumentos Chave
                                    </div>
                                    <ul className="space-y-1">
                                        {analysisResult.talking_points?.map((point: string, i: number) => (
                                            <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                                <span className="text-indigo-500 mt-1">•</span>
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {!lead && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">Vincular Cliente Existente (Opcional)</label>
                                    <ClientAutocomplete
                                        value={selectedClientId}
                                        onChange={handleClientSelect}
                                        placeholder="Buscar cliente para preencher dados..."
                                        className="w-full"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-premium pl-10 w-full"
                                        placeholder="Nome do cliente potencial"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input-premium pl-10 w-full"
                                        placeholder="email@exemplo.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">Telefone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                                        className="input-premium pl-10 w-full"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">Origem</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <select
                                        value={formData.source}
                                        onChange={(e) => setFormData({ ...formData, source: e.target.value as Lead['source'] })}
                                        className="input-premium pl-10 w-full appearance-none"
                                    >
                                        <option value="indication">Indicação</option>
                                        <option value="website">Site</option>
                                        <option value="social_media">Redes Sociais</option>
                                        <option value="google">Google Ads</option>
                                        <option value="other">Outro</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">Valor Estimado</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                                        className="input-premium pl-10 w-full"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">Status Inicial</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
                                    className="input-premium w-full"
                                >
                                    <option value="new">Novo Lead</option>
                                    <option value="contacted">Contatado</option>
                                    <option value="meeting">Reunião Agendada</option>
                                    <option value="proposal">Proposta Enviada</option>
                                    <option value="won">Ganho (Cliente)</option>
                                    <option value="lost">Perdido</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">Observações</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="input-premium pl-10 w-full min-h-[100px] py-3"
                                placeholder="Detalhes sobre o caso ou necessidade do cliente..."
                            />
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn-premium px-6 py-2.5 flex items-center gap-2"
                    >
                        <Save size={18} />
                        Salvar Lead
                    </button>
                </div>
            </div>
        </div>
    );
};
