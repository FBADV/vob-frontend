import React, { useState } from 'react';
import { useGlobalData } from '../context/GlobalDataContext';
import { ModuleHeader } from '../components/ModuleHeader';
import { Settings as SettingsIcon, User, Monitor, Link as LinkIcon, Shield, Users, Database, Building2, DollarSign, FileText, Bell, GitMerge } from 'lucide-react';
import { SettingsProfile } from '../components/settings/SettingsProfile';
import { SettingsPreferences } from '../components/settings/SettingsPreferences';
import { SettingsIntegrations } from '../components/settings/SettingsIntegrations';
import { SettingsOffices } from '../components/settings/SettingsOffices';
import { SettingsUsers } from '../components/settings/SettingsUsers';
import { SettingsDataJud } from '../components/settings/SettingsDataJud';
import { SettingsSystem } from '../components/settings/SettingsSystem';
import { SettingsPortal } from '../components/settings/SettingsPortal';
import { SettingsGeneral } from '../components/settings/SettingsGeneral';
import { SettingsFinancial } from '../components/settings/SettingsFinancial';
import { SettingsDocuments } from '../components/settings/SettingsDocuments';
import { SettingsNotifications } from '../components/settings/SettingsNotifications';
import { SettingsFlowchart } from '../components/settings/SettingsFlowchart';

type SettingsTab = 'profile' | 'general' | 'preferences' | 'financial' | 'documents' | 'integrations' | 'offices' | 'users' | 'datajud' | 'notifications' | 'system' | 'portal' | 'flowchart';

export const Settings: React.FC = () => {
    const { user } = useGlobalData();
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

    const allTabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'general', label: 'Geral', icon: Building2 },
        { id: 'preferences', label: 'Preferências', icon: Monitor },
        { id: 'financial', label: 'Financeiro', icon: DollarSign },
        { id: 'documents', label: 'Modelos', icon: FileText },
        { id: 'flowchart', label: 'Fluxograma', icon: GitMerge, adminOnly: true },
        { id: 'integrations', label: 'Integrações', icon: LinkIcon },
        { id: 'notifications', label: 'Notificações', icon: Bell },
        { id: 'portal', label: 'Acesso do Cliente', icon: Shield, adminOnly: true },
        { id: 'users', label: 'Usuários', icon: Users, adminOnly: true },
        { id: 'datajud', label: 'DataJud', icon: Database, adminOnly: true },
        { id: 'system', label: 'Sistema', icon: Shield, adminOnly: true },
    ];

    const tabs = allTabs.filter(tab => !tab.adminOnly || user?.role === 'admin');

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <SettingsProfile />;
            case 'general':
                return <SettingsGeneral />;
            case 'preferences':
                return <SettingsPreferences />;
            case 'financial':
                return <SettingsFinancial />;
            case 'documents':
                return <SettingsDocuments />;
            case 'flowchart':
                return <SettingsFlowchart />;
            case 'integrations':
                return <SettingsIntegrations />;
            case 'notifications':
                return <SettingsNotifications />;
            case 'portal':
                return <SettingsPortal />;
            case 'offices':
                return <SettingsOffices />;
            case 'users':
                return <SettingsUsers />;
            case 'datajud':
                return <SettingsDataJud />;
            case 'system':
                return <SettingsSystem />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <ModuleHeader
                icon={SettingsIcon}
                title="Configurações"
                subtitle="Gerencie suas preferências e integrações"
            />

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:w-64 flex-shrink-0">
                    <nav className="card-premium p-2 space-y-1">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-[rgb(var(--accent-primary))] text-white shadow-md'
                                        : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] hover:text-[rgb(var(--text-primary))]'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
