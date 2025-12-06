import React, { useState } from 'react';
import { X, Save, User, Building2, AlertCircle } from 'lucide-react';
import type { Client } from '../types';
import { useToast } from '../context/ToastContext';
import { generateUUID } from '../services/database.service';

import { formatCPF, formatCNPJ, formatPhone } from '../utils/formatters';

interface QuickClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClientCreated: (client: Client) => void;
    initialName?: string;
}

export const QuickClientModal: React.FC<QuickClientModalProps> = ({
    isOpen,
    onClose,
    onClientCreated,
    initialName = ''
}) => {
    const toast = useToast();
    const [formData, setFormData] = useState({
        name: initialName,
        type: 'individual' as 'individual' | 'company',
        document: '',
        email: '',
        phone: '',
        whatsapp: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!isOpen) return null;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        }

        if (!formData.document.trim()) {
            newErrors.document = 'CPF/CNPJ é obrigatório';
        } else {
            // Basic CPF/CNPJ validation
            const numbers = formData.document.replace(/\D/g, '');
            if (formData.type === 'individual' && numbers.length !== 11) {
                newErrors.document = 'CPF deve ter 11 dígitos';
            } else if (formData.type === 'company' && numbers.length !== 14) {
                newErrors.document = 'CNPJ deve ter 14 dígitos';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Validação', 'Por favor, corrija os erros antes de salvar.');
            return;
        }

        const newClient: Client = {
            id: generateUUID(),
            name: formData.name.trim(),
            type: formData.type,
            document: formData.document.replace(/\D/g, ''),
            cpfCnpj: formData.document.replace(/\D/g, ''),
            status: 'active',
            email: formData.email.trim() || '',
            phone: formData.phone.replace(/\D/g, '') || '',
            address: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        onClientCreated(newClient);
        toast.success('Cliente Criado', `${newClient.name} foi cadastrado com sucesso!`);
        onClose();
    };

    const handleDocumentChange = (value: string) => {
        const formatted = formData.type === 'individual' ? formatCPF(value) : formatCNPJ(value);
        setFormData({ ...formData, document: formatted });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] animate-fade-in p-4 backdrop-blur-sm">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-[rgb(var(--border-subtle))]">
                <div className="px-8 py-6 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                                Novo Cliente
                            </h3>
                            <p className="text-xs text-[rgb(var(--text-tertiary))]">Cadastro rápido</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Client Type */}
                    <div>
                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-3">
                            Tipo de Cliente *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'individual', document: '' })}
                                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${formData.type === 'individual'
                                    ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/10'
                                    : 'border-[rgb(var(--border-default))] hover:bg-[rgb(var(--bg-tertiary))]'
                                    }`}
                            >
                                <User size={20} className={formData.type === 'individual' ? 'text-[rgb(var(--accent-primary))]' : 'text-[rgb(var(--text-tertiary))]'} />
                                <span className="font-medium text-sm">Pessoa Física</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'company', document: '' })}
                                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${formData.type === 'company'
                                    ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/10'
                                    : 'border-[rgb(var(--border-default))] hover:bg-[rgb(var(--bg-tertiary))]'
                                    }`}
                            >
                                <Building2 size={20} className={formData.type === 'company' ? 'text-[rgb(var(--accent-primary))]' : 'text-[rgb(var(--text-tertiary))]'} />
                                <span className="font-medium text-sm">Pessoa Jurídica</span>
                            </button>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                            {formData.type === 'individual' ? 'Nome Completo' : 'Razão Social'} *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`input-premium w-full px-4 ${errors.name ? 'border-red-500' : ''}`}
                            placeholder={formData.type === 'individual' ? 'Ex: João da Silva' : 'Ex: Empresa LTDA'}
                        />
                        {errors.name && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Document */}
                    <div>
                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                            {formData.type === 'individual' ? 'CPF' : 'CNPJ'} *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.document}
                            onChange={(e) => handleDocumentChange(e.target.value)}
                            className={`input-premium w-full px-4 ${errors.document ? 'border-red-500' : ''}`}
                            placeholder={formData.type === 'individual' ? '000.000.000-00' : '00.000.000/0000-00'}
                        />
                        {errors.document && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {errors.document}
                            </p>
                        )}
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                                E-mail
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-premium w-full px-4"
                                placeholder="email@exemplo.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                                Telefone
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                                className="input-premium w-full px-4"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>

                    {/* WhatsApp */}
                    <div>
                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                            WhatsApp
                        </label>
                        <input
                            type="tel"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                            className="input-premium w-full px-4"
                            placeholder="(00) 00000-0000"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border-subtle))]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-premium py-2.5 px-6 flex items-center gap-2"
                        >
                            <Save size={18} />
                            Salvar Cliente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
