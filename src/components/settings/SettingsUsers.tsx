import React, { useState, useEffect } from 'react';
import { useGlobalData } from '../../context/GlobalDataContext';
import { Plus, Trash2, Edit2, Shield, Mail, Phone, Check, X } from 'lucide-react';
import { db } from '../../services/database.service';
import type { User as UserType } from '../../types';
import { ROLE_LABELS } from '../../types';
import toast from 'react-hot-toast';

export const SettingsUsers: React.FC = () => {
    const { user } = useGlobalData();
    const [users, setUsers] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data = await db.users.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Erro ao carregar usuários');
        } finally {
            setIsLoading(false);
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [formData, setFormData] = useState<Partial<UserType>>({
        name: '',
        email: '',
        role: 'intern',
        phone: '',
        oab: ''
    });

    const handleOpenModal = (userToEdit?: UserType) => {
        if (userToEdit) {
            setEditingUser(userToEdit);
            setFormData(userToEdit);
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                role: 'intern',
                phone: '',
                oab: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingUser) {
                const updated = await db.users.update(editingUser.id, formData);
                setUsers(users.map(u => u.id === editingUser.id ? updated : u));
                toast.success('Usuário atualizado com sucesso!');
            } else {
                const created = await db.users.create(formData as UserType);
                setUsers([...users, created]);
                toast.success('Usuário criado com sucesso!');
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error('Erro ao salvar usuário');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja remover este usuário?')) {
            try {
                await db.users.delete(id);
                setUsers(users.filter(u => u.id !== id));
                toast.success('Usuário removido com sucesso!');
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Erro ao remover usuário');
            }
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-[rgb(var(--text-secondary))]">Carregando...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">Gestão de Usuários</h2>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Gerencie o acesso ao sistema</p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn-premium flex items-center gap-2 px-4 py-2"
                    >
                        <Plus size={18} />
                        Novo Usuário
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {users.length === 0 ? (
                    <div className="text-center py-8 text-[rgb(var(--text-secondary))] bg-[rgb(var(--bg-tertiary))]/30 rounded-xl border border-[rgb(var(--border-subtle))]">
                        Nenhum usuário cadastrado além de você.
                    </div>
                ) : (
                    users.map((u) => (
                        <div key={u.id} className="card-premium p-4 flex items-center justify-between group hover:border-[rgb(var(--accent-primary))]/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[rgb(var(--accent-primary))] to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                                    {u.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                                        {u.name}
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' :
                                            u.role === 'controller' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' :
                                                u.role === 'associate' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' :
                                                    u.role === 'collaborator' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' :
                                                        'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                                            }`}>
                                            {u.role ? ROLE_LABELS[u.role] : 'Sem cargo'}
                                        </span>
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-[rgb(var(--text-secondary))] mt-1">
                                        <span className="flex items-center gap-1">
                                            <Mail size={14} />
                                            {u.email}
                                        </span>
                                        {u.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone size={14} />
                                                {u.phone}
                                            </span>
                                        )}
                                        {u.oab && (
                                            <span className="flex items-center gap-1">
                                                <Shield size={14} />
                                                {u.oab}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {user?.role === 'admin' && (
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(u)}
                                        className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    {u.id !== user?.id && (
                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-[rgb(var(--text-secondary))] hover:text-red-600 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[rgb(var(--bg-primary))] rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 border border-[rgb(var(--border-subtle))]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Nome Completo</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-premium w-full"
                                    placeholder="Ex: João da Silva"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-premium w-full"
                                    placeholder="Ex: joao@email.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Telefone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="input-premium w-full"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">OAB</label>
                                    <input
                                        type="text"
                                        value={formData.oab}
                                        onChange={(e) => setFormData({ ...formData, oab: e.target.value })}
                                        className="input-premium w-full"
                                        placeholder="000.000/UF"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Perfil / Hierarquia</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="input-premium w-full"
                                >
                                    <option value="admin">Administrador Master</option>
                                    <option value="controller">Controlador</option>
                                    <option value="associate">Advogado Associado</option>
                                    <option value="collaborator">Colaborador</option>
                                    <option value="intern">Estagiário</option>
                                </select>
                                <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1.5">
                                    {formData.role === 'admin' && 'Acesso total ao sistema'}
                                    {formData.role === 'controller' && 'Gestão + Relatórios (sem exclusão)'}
                                    {formData.role === 'associate' && 'Processos + Clientes (sem relatórios)'}
                                    {formData.role === 'collaborator' && 'Apenas edição (sem criação)'}
                                    {formData.role === 'intern' && 'Apenas visualização'}
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
