import React, { useState } from 'react';
import { useGlobalData } from '../../context/GlobalDataContext';
import type { Office } from '../../types/connectivity.types';
import { Plus, Trash2, Edit2, Building2, Globe, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsOffices: React.FC = () => {
    const { offices, addOffice, updateOffice, deleteOffice, user } = useGlobalData();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Office>>({
        name: '',
        apiUrl: '',
        apiKey: '',
        status: 'active'
    });

    if (user?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full text-red-600 dark:text-red-400 mb-4">
                    <Key size={32} />
                </div>
                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Acesso Restrito</h3>
                <p className="text-[rgb(var(--text-secondary))] max-w-md mt-2">
                    Apenas administradores podem gerenciar as conexões com escritórios parceiros.
                </p>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.apiUrl || !formData.apiKey) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }

        if (editingId) {
            updateOffice(editingId, formData);
            toast.success('Escritório atualizado com sucesso');
            setEditingId(null);
        } else {
            addOffice({
                id: Math.random().toString(36).substr(2, 9),
                name: formData.name,
                apiUrl: formData.apiUrl,
                apiKey: formData.apiKey,
                status: 'active'
            } as Office);
            toast.success('Escritório adicionado com sucesso');
            setIsAdding(false);
        }
        setFormData({ name: '', apiUrl: '', apiKey: '', status: 'active' });
    };

    const handleEdit = (office: Office) => {
        setEditingId(office.id);
        setFormData(office);
        setIsAdding(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este escritório?')) {
            deleteOffice(id);
            toast.success('Escritório removido');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Escritórios Parceiros</h2>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Gerencie as conexões com outros escritórios VOB</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--accent-primary))] text-white rounded-xl hover:bg-[rgb(var(--accent-primary))]/90 transition-colors"
                    >
                        <Plus size={18} />
                        Adicionar Escritório
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-[rgb(var(--bg-secondary))] p-6 rounded-2xl border border-[rgb(var(--border-subtle))] animate-fade-in">
                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-4">
                        {editingId ? 'Editar Escritório' : 'Novo Escritório'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                                    Nome do Escritório
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[rgb(var(--bg-tertiary))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                                        placeholder="Ex: Escritório Silva & Associados"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                                    URL da API
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                    <input
                                        type="text"
                                        value={formData.apiUrl}
                                        onChange={e => setFormData({ ...formData, apiUrl: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[rgb(var(--bg-tertiary))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                                        placeholder="https://api.vob.com.br/office-id"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                                    Chave de API (API Key)
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                    <input
                                        type="password"
                                        value={formData.apiKey}
                                        onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[rgb(var(--bg-tertiary))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                                        placeholder="Cole a chave de API fornecida pelo escritório parceiro"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAdding(false);
                                    setEditingId(null);
                                    setFormData({ name: '', apiUrl: '', apiKey: '', status: 'active' });
                                }}
                                className="px-4 py-2 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-[rgb(var(--accent-primary))] text-white rounded-xl hover:bg-[rgb(var(--accent-primary))]/90 transition-colors font-medium"
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offices.map(office => (
                    <div key={office.id} className="bg-[rgb(var(--bg-secondary))] p-5 rounded-2xl border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent-primary))]/50 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2 bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--accent-primary))]">
                                <Building2 size={24} />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(office)}
                                    className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(office.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <h3 className="font-bold text-[rgb(var(--text-primary))] mb-1">{office.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-[rgb(var(--text-secondary))] mb-3">
                            <div className={`w-2 h-2 rounded-full ${office.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                            {office.status === 'active' ? 'Conectado' : 'Inativo'}
                        </div>
                        <div className="text-xs text-[rgb(var(--text-tertiary))] truncate font-mono bg-[rgb(var(--bg-tertiary))] p-2 rounded-lg">
                            {office.apiUrl}
                        </div>
                    </div>
                ))}

                {offices.length === 0 && !isAdding && (
                    <div className="col-span-full py-12 text-center text-[rgb(var(--text-tertiary))] bg-[rgb(var(--bg-secondary))]/50 rounded-2xl border border-dashed border-[rgb(var(--border-subtle))]">
                        <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Nenhum escritório parceiro cadastrado.</p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="mt-4 text-[rgb(var(--accent-primary))] hover:underline font-medium"
                        >
                            Cadastrar primeiro escritório
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
