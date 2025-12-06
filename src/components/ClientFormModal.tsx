import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Building, Camera } from 'lucide-react';
import type { Client } from '../types';
import { useGlobalData } from '../context/GlobalDataContext';
import { ClientPhotoUpload } from './ClientPhotoUpload';

import { formatCPF, formatCNPJ, formatPhone, formatZipCode } from '../utils/formatters';

interface ClientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientToEdit?: Client | null;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, clientToEdit }) => {
    const { addClient, updateClient, clients } = useGlobalData();
    const [formData, setFormData] = useState<Partial<Client>>({
        type: 'individual',
        name: '',
        email: '',
        phone: '',
        document: ''
    });

    useEffect(() => {
        if (clientToEdit) {
            setFormData(clientToEdit);
        } else {
            setFormData({
                type: 'individual',
                name: '',
                email: '',
                phone: '',
                document: '',
                sex: 'male',
                socialName: '',
                zipCode: '',
                street: '',
                number: '',
                complement: '',
                neighborhood: '',
                city: '',
                state: '',
                representativeId: ''
            });
        }
    }, [clientToEdit, isOpen]);

    if (!isOpen) return null;

    const handleDocumentChange = (value: string) => {
        const formatted = formData.type === 'individual' ? formatCPF(value) : formatCNPJ(value);
        setFormData({ ...formData, document: formatted });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.email) {
            if (clientToEdit && clientToEdit.id) {
                updateClient(clientToEdit.id, formData);
            } else {
                addClient({
                    ...formData as Client,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4 backdrop-blur-sm">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto border border-[rgb(var(--border-subtle))]">
                <div className="px-8 py-6 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center sticky top-0 bg-[rgb(var(--bg-secondary))] z-10">
                    <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                        {clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8">
                    {/* Photo Upload Section */}
                    <div className="mb-10 flex justify-center">
                        {clientToEdit && clientToEdit.id ? (
                            <ClientPhotoUpload
                                clientId={clientToEdit.id}
                                currentPhotoUrl={formData.photoUrl}
                                onPhotoUploaded={(url) => setFormData(prev => ({ ...prev, photoUrl: url }))}
                                onPhotoRemoved={() => setFormData(prev => ({ ...prev, photoUrl: undefined }))}
                            />
                        ) : (
                            <div className="text-center p-6 border-2 border-dashed border-[rgb(var(--border-default))] rounded-2xl bg-[rgb(var(--bg-tertiary))]/30">
                                <div className="w-24 h-24 mx-auto bg-[rgb(var(--bg-tertiary))] rounded-full flex items-center justify-center mb-3">
                                    <Camera size={36} className="text-[rgb(var(--text-tertiary))]" />
                                </div>
                                <p className="text-sm text-[rgb(var(--text-secondary))] font-medium">Salve o cliente para adicionar uma foto</p>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-3">Tipo de Cliente</label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.type === 'individual'
                                        ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))]'
                                        : 'border-[rgb(var(--border-default))] hover:border-[rgb(var(--border-strong))] text-[rgb(var(--text-secondary))]'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="type"
                                            className="hidden"
                                            checked={formData.type === 'individual'}
                                            onChange={() => setFormData({ ...formData, type: 'individual', document: '' })}
                                        />
                                        <UserIcon size={20} />
                                        <span className="font-bold">Pessoa Física</span>
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.type === 'company'
                                        ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))]'
                                        : 'border-[rgb(var(--border-default))] hover:border-[rgb(var(--border-strong))] text-[rgb(var(--text-secondary))]'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="type"
                                            className="hidden"
                                            checked={formData.type === 'company'}
                                            onChange={() => setFormData({ ...formData, type: 'company', document: '' })}
                                        />
                                        <Building size={20} />
                                        <span className="font-bold">Pessoa Jurídica</span>
                                    </label>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                                    {formData.type === 'individual' ? 'Nome Completo' : 'Razão Social'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-premium w-full px-4"
                                    placeholder={formData.type === 'individual' ? 'Digite o nome completo' : 'Digite a razão social'}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                                    {formData.type === 'individual' ? 'Apelido / Nome Social (Opcional)' : 'Nome Fantasia (Opcional)'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.socialName || ''}
                                    onChange={(e) => setFormData({ ...formData, socialName: e.target.value })}
                                    className="input-premium w-full px-4"
                                    placeholder={formData.type === 'individual' ? 'Como o cliente prefere ser chamado' : 'Nome comercial da empresa'}
                                />
                            </div>

                            {formData.type === 'individual' && (
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-3">Sexo</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.sex === 'male'
                                            ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))]'
                                            : 'border-[rgb(var(--border-default))] hover:border-[rgb(var(--border-strong))] text-[rgb(var(--text-secondary))]'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="sex"
                                                className="hidden"
                                                checked={formData.sex === 'male'}
                                                onChange={() => setFormData({ ...formData, sex: 'male' })}
                                            />
                                            <span className="font-medium">Masculino</span>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.sex === 'female'
                                            ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))]'
                                            : 'border-[rgb(var(--border-default))] hover:border-[rgb(var(--border-strong))] text-[rgb(var(--text-secondary))]'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="sex"
                                                className="hidden"
                                                checked={formData.sex === 'female'}
                                                onChange={() => setFormData({ ...formData, sex: 'female' })}
                                            />
                                            <span className="font-medium">Feminino</span>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.sex === 'other'
                                            ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))]'
                                            : 'border-[rgb(var(--border-default))] hover:border-[rgb(var(--border-strong))] text-[rgb(var(--text-secondary))]'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="sex"
                                                className="hidden"
                                                checked={formData.sex === 'other'}
                                                onChange={() => setFormData({ ...formData, sex: 'other' })}
                                            />
                                            <span className="font-medium">Outro</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-premium w-full px-4"
                                    placeholder="exemplo@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Telefone / WhatsApp</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                                    className="input-premium w-full px-4"
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                                    {formData.type === 'individual' ? 'CPF' : 'CNPJ'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.document}
                                    onChange={(e) => handleDocumentChange(e.target.value)}
                                    className="input-premium w-full px-4"
                                    placeholder={formData.type === 'individual' ? '000.000.000-00' : '00.000.000/0000-00'}
                                    maxLength={formData.type === 'individual' ? 14 : 18}
                                />
                            </div>

                            {/* Address Section */}
                            <div className="col-span-1 md:col-span-2 border-t border-[rgb(var(--border-subtle))] pt-8 mt-4">
                                <h4 className="text-base font-bold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-2">
                                    <Building size={20} className="text-[rgb(var(--accent-primary))]" />
                                    Endereço
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] mb-2">CEP</label>
                                        <input
                                            type="text"
                                            value={formData.zipCode || ''}
                                            onChange={(e) => setFormData({ ...formData, zipCode: formatZipCode(e.target.value) })}
                                            className="input-premium w-full text-sm"
                                            placeholder="00000-000"
                                            maxLength={9}
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] mb-2">Rua / Logradouro</label>
                                        <input
                                            type="text"
                                            value={formData.street || ''}
                                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                            className="input-premium w-full text-sm"
                                            placeholder="Rua Exemplo"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] mb-2">Número</label>
                                        <input
                                            type="text"
                                            value={formData.number || ''}
                                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                            className="input-premium w-full text-sm"
                                            placeholder="123"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] mb-2">Complemento</label>
                                        <input
                                            type="text"
                                            value={formData.complement || ''}
                                            onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                                            className="input-premium w-full text-sm"
                                            placeholder="Apto 101"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] mb-2">Bairro</label>
                                        <input
                                            type="text"
                                            value={formData.neighborhood || ''}
                                            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                            className="input-premium w-full text-sm"
                                            placeholder="Centro"
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] mb-2">Cidade</label>
                                        <input
                                            type="text"
                                            value={formData.city || ''}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="input-premium w-full text-sm"
                                            placeholder="Cidade"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] mb-2">UF</label>
                                        <input
                                            type="text"
                                            value={formData.state || ''}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="input-premium w-full text-sm uppercase"
                                            placeholder="UF"
                                            maxLength={2}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Representative Section for Companies */}
                            {formData.type === 'company' && (
                                <div className="col-span-1 md:col-span-2 border-t border-[rgb(var(--border-subtle))] pt-8 mt-4">
                                    <h4 className="text-base font-bold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-2">
                                        <UserIcon size={20} className="text-[rgb(var(--accent-primary))]" />
                                        Representante Legal
                                    </h4>
                                    <div>
                                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">Selecione o Responsável</label>
                                        <select
                                            value={formData.representativeId || ''}
                                            onChange={(e) => setFormData({ ...formData, representativeId: e.target.value })}
                                            className="input-premium w-full px-4"
                                        >
                                            <option value="">Selecione um cliente pessoa física...</option>
                                            {clients
                                                .filter(c => c.type === 'individual' && c.id !== clientToEdit?.id)
                                                .map(client => (
                                                    <option key={client.id} value={client.id}>
                                                        {client.name} - {client.document}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                        <p className="text-xs text-[rgb(var(--text-tertiary))] mt-2">
                                            O responsável deve estar previamente cadastrado como cliente (Pessoa Física).
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t border-[rgb(var(--border-subtle))]">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn-premium py-3 px-8"
                            >
                                {clientToEdit ? 'Salvar Alterações' : 'Criar Cliente'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
