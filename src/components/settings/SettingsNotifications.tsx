import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationSettings {
    emailEnabled: boolean;
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    dailyDigest: boolean;
    newProcessAlert: boolean;
    movementAlert: boolean;
}

export const SettingsNotifications: React.FC = () => {
    const [settings, setSettings] = useState<NotificationSettings>({
        emailEnabled: true,
        smsEnabled: false,
        whatsappEnabled: true,
        dailyDigest: true,
        newProcessAlert: true,
        movementAlert: true
    });

    useEffect(() => {
        const saved = localStorage.getItem('vob_notification_settings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error('Error parsing notification settings', e);
            }
        }
    }, []);

    const handleToggle = (key: keyof NotificationSettings) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        localStorage.setItem('vob_notification_settings', JSON.stringify(newSettings));
        toast.success('Preferência atualizada');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="card-premium p-6">
                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-2">
                    <Bell className="text-[rgb(var(--accent-primary))]" size={24} />
                    Notificações
                </h2>

                <div className="space-y-8">
                    {/* Channels */}
                    <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Canais de Comunicação</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--bg-tertiary))]/30 border border-[rgb(var(--border-subtle))]">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-[rgb(var(--text-primary))]">E-mail</h4>
                                        <p className="text-sm text-[rgb(var(--text-secondary))]">Receber atualizações por e-mail</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.emailEnabled}
                                        onChange={() => handleToggle('emailEnabled')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[rgb(var(--accent-primary))]"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--bg-tertiary))]/30 border border-[rgb(var(--border-subtle))]">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-[rgb(var(--text-primary))]">WhatsApp</h4>
                                        <p className="text-sm text-[rgb(var(--text-secondary))]">Receber alertas via WhatsApp</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.whatsappEnabled}
                                        onChange={() => handleToggle('whatsappEnabled')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[rgb(var(--accent-primary))]"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-[rgb(var(--bg-tertiary))]/30 border border-[rgb(var(--border-subtle))]">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-[rgb(var(--text-primary))]">SMS</h4>
                                        <p className="text-sm text-[rgb(var(--text-secondary))]">Receber mensagens de texto (custo adicional)</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.smsEnabled}
                                        onChange={() => handleToggle('smsEnabled')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[rgb(var(--accent-primary))]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-[rgb(var(--border-subtle))]" />

                    {/* Triggers */}
                    <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Gatilhos de Alerta</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.newProcessAlert ? 'bg-[rgb(var(--accent-primary))] border-[rgb(var(--accent-primary))]' : 'border-[rgb(var(--text-tertiary))] bg-transparent'}`}>
                                    {settings.newProcessAlert && <Check size={14} className="text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={settings.newProcessAlert}
                                    onChange={() => handleToggle('newProcessAlert')}
                                />
                                <span className="text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                                    Novos processos cadastrados
                                </span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.movementAlert ? 'bg-[rgb(var(--accent-primary))] border-[rgb(var(--accent-primary))]' : 'border-[rgb(var(--text-tertiary))] bg-transparent'}`}>
                                    {settings.movementAlert && <Check size={14} className="text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={settings.movementAlert}
                                    onChange={() => handleToggle('movementAlert')}
                                />
                                <span className="text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                                    Novas movimentações processuais
                                </span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.dailyDigest ? 'bg-[rgb(var(--accent-primary))] border-[rgb(var(--accent-primary))]' : 'border-[rgb(var(--text-tertiary))] bg-transparent'}`}>
                                    {settings.dailyDigest && <Check size={14} className="text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={settings.dailyDigest}
                                    onChange={() => handleToggle('dailyDigest')}
                                />
                                <span className="text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                                    Resumo diário (Daily Digest)
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
