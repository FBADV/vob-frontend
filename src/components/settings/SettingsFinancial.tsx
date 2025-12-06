import React, { useState, useEffect } from 'react';
import { Wallet, Tag, Plus, Trash2, Edit2, Check, X, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../../services/database.service';
import type { FinancialCategory, FinancialAccount } from '../../types';

export const SettingsFinancial: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'categories' | 'accounts'>('categories');
    const [isLoading, setIsLoading] = useState(true);

    // Data States
    const [categories, setCategories] = useState<FinancialCategory[]>([]);
    const [accounts, setAccounts] = useState<FinancialAccount[]>([]);

    // Load Data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [loadedCategories, loadedAccounts] = await Promise.all([
                db.financialCategories.getAll(),
                db.financialAccounts.getAll()
            ]);
            setCategories(loadedCategories);
            setAccounts(loadedAccounts);
        } catch (error) {
            console.error('Error loading financial settings:', error);
            toast.error('Erro ao carregar configurações');
        } finally {
            setIsLoading(false);
        }
    };

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData(activeTab === 'categories'
                ? { name: '', type: 'expense', color: '#EF4444' }
                : { name: '', bank: '', type: 'checking', initialBalance: 0 }
            );
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (activeTab === 'categories') {
                if (editingItem) {
                    const updated = await db.financialCategories.update(editingItem.id, formData);
                    setCategories(categories.map(c => c.id === editingItem.id ? updated : c));
                } else {
                    const created = await db.financialCategories.create(formData);
                    setCategories([...categories, created]);
                }
            } else {
                if (editingItem) {
                    const updated = await db.financialAccounts.update(editingItem.id, formData);
                    setAccounts(accounts.map(a => a.id === editingItem.id ? updated : a));
                } else {
                    const created = await db.financialAccounts.create(formData);
                    setAccounts([...accounts, created]);
                }
            }
            setIsModalOpen(false);
            toast.success('Salvo com sucesso!');
        } catch (error) {
            console.error('Error saving item:', error);
            toast.error('Erro ao salvar item');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir?')) {
            try {
                if (activeTab === 'categories') {
                    await db.financialCategories.delete(id);
                    setCategories(categories.filter(c => c.id !== id));
                } else {
                    await db.financialAccounts.delete(id);
                    setAccounts(accounts.filter(a => a.id !== id));
                }
                toast.success('Excluído com sucesso!');
            } catch (error) {
                console.error('Error deleting item:', error);
                toast.error('Erro ao excluir item');
            }
        }
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
                            <DollarSign className="text-[rgb(var(--accent-primary))]" size={24} />
                            Configurações Financeiras
                        </h2>
                        <p className="text-sm text-[rgb(var(--text-secondary))]">Gerencie categorias e contas</p>
                    </div>

                    <div className="flex bg-[rgb(var(--bg-tertiary))] p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'categories'
                                ? 'bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] shadow-sm'
                                : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                                }`}
                        >
                            Categorias
                        </button>
                        <button
                            onClick={() => setActiveTab('accounts')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'accounts'
                                ? 'bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] shadow-sm'
                                : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                                }`}
                        >
                            Contas Bancárias
                        </button>
                    </div>
                </div>

                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn-premium px-4 py-2 flex items-center gap-2 text-sm"
                    >
                        <Plus size={16} />
                        Adicionar {activeTab === 'categories' ? 'Categoria' : 'Conta'}
                    </button>
                </div>

                <div className="space-y-3">
                    {activeTab === 'categories' ? (
                        categories.length === 0 ? (
                            <div className="text-center py-8 text-[rgb(var(--text-secondary))]">
                                Nenhuma categoria cadastrada.
                            </div>
                        ) : (
                            categories.map(category => (
                                <div key={category.id} className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--bg-tertiary))]/30 border border-[rgb(var(--border-subtle))] group">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
                                            style={{ backgroundColor: category.color }}
                                        >
                                            <Tag size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-[rgb(var(--text-primary))]">{category.name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${category.type === 'income'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {category.type === 'income' ? 'Receita' : 'Despesa'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenModal(category)} className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))]">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(category.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        accounts.length === 0 ? (
                            <div className="text-center py-8 text-[rgb(var(--text-secondary))]">
                                Nenhuma conta cadastrada.
                            </div>
                        ) : (
                            accounts.map(account => (
                                <div key={account.id} className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--bg-tertiary))]/30 border border-[rgb(var(--border-subtle))] group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[rgb(var(--bg-primary))] flex items-center justify-center text-[rgb(var(--accent-primary))] border border-[rgb(var(--border-subtle))]">
                                            <Wallet size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-[rgb(var(--text-primary))]">{account.name}</h3>
                                            <p className="text-sm text-[rgb(var(--text-secondary))]">{account.bank} • {account.type === 'checking' ? 'Conta Corrente' : account.type === 'savings' ? 'Poupança' : account.type === 'investment' ? 'Investimento' : 'Caixa'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-medium text-[rgb(var(--text-primary))]">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.initialBalance)}
                                        </span>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(account)} className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))]">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(account.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[rgb(var(--bg-primary))] rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 border border-[rgb(var(--border-subtle))]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                                {editingItem ? 'Editar' : 'Adicionar'} {activeTab === 'categories' ? 'Categoria' : 'Conta'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))]">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {activeTab === 'categories' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Nome</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-premium w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Tipo</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="input-premium w-full"
                                        >
                                            <option value="income">Receita</option>
                                            <option value="expense">Despesa</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Cor</label>
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-full h-10 rounded-lg cursor-pointer"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Nome da Conta</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-premium w-full"
                                            placeholder="Ex: Conta Principal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Banco / Instituição</label>
                                        <input
                                            type="text"
                                            value={formData.bank}
                                            onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                                            className="input-premium w-full"
                                            placeholder="Ex: Nubank"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Tipo</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="input-premium w-full"
                                        >
                                            <option value="checking">Conta Corrente</option>
                                            <option value="savings">Poupança</option>
                                            <option value="investment">Investimento</option>
                                            <option value="cash">Caixa Físico</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Saldo Inicial</label>
                                        <input
                                            type="number"
                                            value={formData.initialBalance}
                                            onChange={(e) => setFormData({ ...formData, initialBalance: parseFloat(e.target.value) })}
                                            className="input-premium w-full"
                                        />
                                    </div>
                                </>
                            )}
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
