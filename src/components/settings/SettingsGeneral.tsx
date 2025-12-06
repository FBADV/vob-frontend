import React, { useState } from 'react';
import { Building2, Upload, Save, MapPin, Phone, Mail, Globe, FileText } from 'lucide-react';

import toast from 'react-hot-toast';

export const SettingsGeneral: React.FC = () => {
    // const { user } = useGlobalData();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        officeName: '',
        cnpj: '',
        oab: '',
        phone: '',
        email: '',
        website: '',
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        toast.success('Configurações salvas com sucesso!');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="card-premium p-6">
                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-2">
                    <Building2 className="text-[rgb(var(--accent-primary))]" size={24} />
                    Dados do Escritório
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Logo Section */}
                    <div className="md:col-span-1 flex flex-col items-center space-y-4">
                        <div className="w-48 h-48 rounded-2xl bg-[rgb(var(--bg-tertiary))] border-2 border-dashed border-[rgb(var(--border-subtle))] flex items-center justify-center text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--accent-primary))] hover:text-[rgb(var(--accent-primary))] transition-all cursor-pointer group relative overflow-hidden">
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                <Upload size={32} className="group-hover:scale-110 transition-transform mb-2" />
                                <span className="text-sm font-medium">Carregar Logo</span>
                            </div>
                            {/* Preview would go here */}
                        </div>
                        <p className="text-xs text-[rgb(var(--text-secondary))] text-center max-w-[200px]">
                            Recomendado: PNG transparente, 512x512px. Max 2MB.
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Nome do Escritório</label>
                                <input
                                    type="text"
                                    name="officeName"
                                    value={formData.officeName}
                                    onChange={handleChange}
                                    className="input-premium w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">CNPJ</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                    <input
                                        type="text"
                                        name="cnpj"
                                        value={formData.cnpj}
                                        onChange={handleChange}
                                        className="input-premium w-full pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">OAB (Principal)</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                    <input
                                        type="text"
                                        name="oab"
                                        value={formData.oab}
                                        onChange={handleChange}
                                        className="input-premium w-full pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-[rgb(var(--border-subtle))]" />

                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
                            <Phone size={20} className="text-[rgb(var(--accent-primary))]" />
                            Contato
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Telefone / WhatsApp</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input-premium w-full pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">E-mail Oficial</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input-premium w-full pl-10"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                                    <input
                                        type="text"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="input-premium w-full pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-[rgb(var(--border-subtle))]" />

                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] flex items-center gap-2">
                            <MapPin size={20} className="text-[rgb(var(--accent-primary))]" />
                            Endereço
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">CEP</label>
                                <input
                                    type="text"
                                    name="cep"
                                    value={formData.cep}
                                    onChange={handleChange}
                                    className="input-premium w-full"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Rua</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    className="input-premium w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Número</label>
                                <input
                                    type="text"
                                    name="number"
                                    value={formData.number}
                                    onChange={handleChange}
                                    className="input-premium w-full"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Complemento</label>
                                <input
                                    type="text"
                                    name="complement"
                                    value={formData.complement}
                                    onChange={handleChange}
                                    className="input-premium w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Bairro</label>
                                <input
                                    type="text"
                                    name="neighborhood"
                                    value={formData.neighborhood}
                                    onChange={handleChange}
                                    className="input-premium w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Cidade</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="input-premium w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Estado</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="input-premium w-full"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="btn-premium px-6 py-2.5 flex items-center gap-2"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
