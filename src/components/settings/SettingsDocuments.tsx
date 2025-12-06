import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Edit2, Check, X, File, Code } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../../services/database.service';
import type { DocumentTemplate } from '../../types';

export const SettingsDocuments: React.FC = () => {
    const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load Data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const loadedTemplates = await db.documentTemplates.getAll();
            setTemplates(loadedTemplates);
        } catch (error) {
            console.error('Error loading templates:', error);
            toast.error('Erro ao carregar modelos');
        } finally {
            setIsLoading(false);
        }
    };

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<DocumentTemplate | null>(null);
    const [formData, setFormData] = useState<Partial<DocumentTemplate>>({
        name: '',
        type: 'contract',
        description: '',
        content: ''
    });

    const handleOpenModal = (item?: DocumentTemplate) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                type: 'contract',
                description: '',
                content: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingItem) {
                const updated = await db.documentTemplates.update(editingItem.id, formData);
                setTemplates(templates.map(t => t.id === editingItem.id ? updated : t));
            } else {
                const created = await db.documentTemplates.create(formData as DocumentTemplate);
                setTemplates([...templates, created]);
            }
            setIsModalOpen(false);
            toast.success('Modelo salvo com sucesso!');
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error('Erro ao salvar modelo');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este modelo?')) {
            try {
                await db.documentTemplates.delete(id);
                setTemplates(templates.filter(t => t.id !== id));
                toast.success('Modelo excluído com sucesso!');
            } catch (error) {
                console.error('Error deleting template:', error);
                toast.error('Erro ao excluir modelo');
            }
        }
    };

    const insertVariable = (variable: string) => {
        setFormData(prev => ({
            ...prev,
            content: (prev.content || '') + ` {{${variable}}} `
        }));
    };

    if (isLoading) {
        return <div className="p-8 text-center text-[rgb(var(--text-secondary))]">Carregando...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="card-premium p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                            <FileText className="text-[rgb(var(--accent-primary))]" size={24} />
                            Modelos de Documentos
                        </h2>
                        <p className="text-sm text-[rgb(var(--text-secondary))]">Gerencie seus modelos padrão</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn-premium px-4 py-2 flex items-center gap-2 text-sm"
                    >
                        <Plus size={16} />
                        Novo Modelo
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {templates.length === 0 ? (
                        <div className="text-center py-8 text-[rgb(var(--text-secondary))]">
                            Nenhum modelo cadastrado.
                        </div>
                    ) : (
                        templates.map(template => (
                            <div key={template.id} className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--bg-tertiary))]/30 border border-[rgb(var(--border-subtle))] group hover:border-[rgb(var(--accent-primary))]/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <File size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-[rgb(var(--text-primary))]">{template.name}</h3>
                                        <p className="text-sm text-[rgb(var(--text-secondary))]">{template.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] border border-[rgb(var(--border-subtle))]">
                                                {template.type === 'contract' ? 'Contrato' :
                                                    template.type === 'petition' ? 'Petição' :
                                                        template.type === 'procuration' ? 'Procuração' : 'Outro'}
                                            </span>
                                            <span className="text-xs text-[rgb(var(--text-tertiary))]">
                                                Modificado em: {new Date(template.lastModified).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(template)} className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))]">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(template.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[rgb(var(--bg-primary))] rounded-2xl shadow-2xl w-full max-w-2xl p-6 m-4 border border-[rgb(var(--border-subtle))] max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                                {editingItem ? 'Editar Modelo' : 'Novo Modelo'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))]">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Nome do Modelo</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-premium w-full"
                                        placeholder="Ex: Procuração Padrão"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Tipo</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="input-premium w-full"
                                    >
                                        <option value="contract">Contrato</option>
                                        <option value="petition">Petição</option>
                                        <option value="procuration">Procuração</option>
                                        <option value="other">Outro</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Descrição</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-premium w-full"
                                    placeholder="Breve descrição do modelo..."
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))]">Conteúdo do Modelo</label>
                                    <div className="relative group">
                                        <button className="text-xs flex items-center gap-1 text-[rgb(var(--accent-primary))] hover:underline">
                                            <Code size={12} />
                                            Inserir Variável
                                        </button>
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-subtle))] rounded-lg shadow-lg hidden group-hover:block z-10">
                                            <div className="p-1">
                                                {['client_name', 'client_cpf', 'client_address', 'process_number', 'today_date'].map(v => (
                                                    <button
                                                        key={v}
                                                        onClick={() => insertVariable(v)}
                                                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-[rgb(var(--bg-tertiary))] rounded-md text-[rgb(var(--text-primary))]"
                                                    >
                                                        {`{{${v}}}`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <textarea
                                    value={formData.content || ''}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="input-premium w-full h-64 font-mono text-sm"
                                    placeholder="Digite o conteúdo do documento aqui..."
                                />
                                <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">
                                    Use variáveis como {'{{client_name}}'} para preenchimento automático.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-[rgb(var(--border-default))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 btn-premium px-4 py-2.5 flex items-center justify-center gap-2"
                            >
                                <Check size={18} />
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
