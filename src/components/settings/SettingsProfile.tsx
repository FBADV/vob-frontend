import React, { useState } from 'react';
import { User, Save } from 'lucide-react';
import { useGlobalData } from '../../context/GlobalDataContext';
import { AvatarUpload } from '../AvatarUpload';

export const SettingsProfile: React.FC = () => {
    const { user, updateUser } = useGlobalData();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        oab: user?.oab || '',
        cpf: user?.cpf || '',
        photoUrl: user?.photoUrl || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            updateUser({ ...user, ...formData });
            // In a real app, we would upload the photo to storage here
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erro ao atualizar perfil.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="card-premium p-6 animate-fade-in">
            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-2">
                <User className="text-[rgb(var(--accent-primary))]" size={24} />
                Dados do Perfil
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload Section */}
                <div className="flex flex-col items-center sm:flex-row gap-6 mb-8">
                    <AvatarUpload
                        currentAvatarUrl={formData.photoUrl}
                        userName={formData.name}
                        onImageChange={(file) => {
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
                                };
                                reader.readAsDataURL(file);
                            } else {
                                setFormData(prev => ({ ...prev, photoUrl: '' }));
                            }
                        }}
                    />
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-lg text-[rgb(var(--text-primary))]">{formData.name || 'Usuário'}</h3>
                        <p className="text-sm text-[rgb(var(--text-secondary))]">Advogado(a)</p>
                        <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">Clique na foto para alterar</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Nome Completo</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="input-premium w-full px-4"
                            placeholder="Seu nome completo"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input-premium w-full px-4"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Telefone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input-premium w-full px-4"
                            placeholder="(00) 00000-0000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">CPF</label>
                        <input
                            type="text"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            className="input-premium w-full px-4"
                            placeholder="000.000.000-00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Número da OAB</label>
                        <input
                            type="text"
                            name="oab"
                            value={formData.oab}
                            onChange={handleChange}
                            className="input-premium w-full px-4"
                            placeholder="UF000000"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-premium flex items-center gap-2"
                    >
                        <Save size={18} />
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};
