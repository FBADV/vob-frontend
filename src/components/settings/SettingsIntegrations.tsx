import React, { useState } from 'react';
import { Calendar, MessageCircle, Save, Scale, CheckCircle, AlertCircle } from 'lucide-react';
import { useGlobalData } from '../../context/GlobalDataContext';
import { SettingsJudicial } from './SettingsJudicial';
// import { CourtConnectivityCard } from './CourtConnectivityCard';

export const SettingsIntegrations: React.FC = () => {
    const { settings, updateSettings } = useGlobalData();
    const [googleConfig, setGoogleConfig] = useState({
        clientId: settings?.integrations?.googleClientId || '',
        apiKey: settings?.integrations?.googleApiKey || '',
        calendarId: settings?.integrations?.googleCalendarId || ''
    });
    const [whatsappConfig, setWhatsappConfig] = useState({
        messageTemplate: settings?.integrations?.whatsappTemplate || 'Olá {cliente}, segue atualização do processo {processo}: {movimentacao}'
    });

    const handleGoogleSave = () => {
        if (!settings) return;
        updateSettings({
            ...settings,
            integrations: {
                ...(settings.integrations || {
                    emailSync: false,
                    calendarSync: false
                }),
                googleClientId: googleConfig.clientId,
                googleApiKey: googleConfig.apiKey,
                googleCalendarId: googleConfig.calendarId,
                calendarSync: true
            }
        });
        alert('Configurações do Google Calendar salvas!');
    };

    const handleWhatsappSave = () => {
        if (!settings) return;
        updateSettings({
            ...settings,
            integrations: {
                ...(settings.integrations || {
                    emailSync: false,
                    calendarSync: false
                }),
                whatsappTemplate: whatsappConfig.messageTemplate
            }
        });
        alert('Modelo de mensagem do WhatsApp salvo!');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Unified Court Connectivity Card - REMOVED per user request */}
            {/* <div className="relative">
                <CourtConnectivityCard />
            </div> */}

            {/* Google Calendar */}
            <div className="card-premium p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Google Calendar</h2>
                            <p className="text-sm text-[rgb(var(--text-secondary))]">Sincronize sua agenda automaticamente</p>
                        </div>
                    </div>
                    {settings?.integrations?.calendarSync ? (
                        <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                            <CheckCircle size={14} /> Conectado
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-sm font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">
                            <AlertCircle size={14} /> Não Configurado
                        </span>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Client ID</label>
                        <input
                            type="text"
                            value={googleConfig.clientId}
                            onChange={(e) => setGoogleConfig({ ...googleConfig, clientId: e.target.value })}
                            className="input-premium w-full font-mono text-sm"
                            placeholder="apps.googleusercontent.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">API Key</label>
                        <input
                            type="password"
                            value={googleConfig.apiKey}
                            onChange={(e) => setGoogleConfig({ ...googleConfig, apiKey: e.target.value })}
                            className="input-premium w-full font-mono text-sm"
                            placeholder="AIzaSy..."
                        />
                    </div>
                    <div className="flex justify-end">
                        <button onClick={handleGoogleSave} className="btn-premium flex items-center gap-2">
                            <Save size={18} />
                            Salvar Configuração
                        </button>
                    </div>
                </div>
            </div>

            {/* WhatsApp Configuration */}
            <div className="card-premium p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                            <MessageCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">WhatsApp Business</h2>
                            <p className="text-sm text-[rgb(var(--text-secondary))]">Configuração de mensagens e compartilhamento</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">Modelo de Mensagem Padrão</label>
                        <p className="text-xs text-[rgb(var(--text-tertiary))] mb-2">
                            Variáveis disponíveis: {'{cliente}'}, {'{processo}'}, {'{movimentacao}'}, {'{data}'}
                        </p>
                        <textarea
                            value={whatsappConfig.messageTemplate}
                            onChange={(e) => setWhatsappConfig({ ...whatsappConfig, messageTemplate: e.target.value })}
                            className="input-premium w-full font-mono text-sm h-32 resize-none"
                            placeholder="Digite o modelo da mensagem..."
                        />
                    </div>
                    <div className="flex justify-end">
                        <button onClick={handleWhatsappSave} className="btn-premium flex items-center gap-2">
                            <Save size={18} />
                            Salvar Modelo
                        </button>
                    </div>
                </div>
            </div>

            {/* Integração Judicial - PJE/JUS.br */}
            <div className="card-premium p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/20">
                            <Scale className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">PJE / JUS.br</h2>
                            <p className="text-sm text-blue-50">Integração com certificado digital A1</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <SettingsJudicial />
                </div>
            </div>
        </div>
    );
};
