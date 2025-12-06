import React from 'react';
import {
    FileText,
    Users,
    Briefcase,
    Calendar,
    DollarSign,
    Search,
    Inbox,
    FolderOpen,
    MessageSquare,
    Bell,
    TrendingUp,
    type LucideIcon
} from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon = Inbox,
    title,
    description,
    action,
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
            {/* Animated Icon Container */}
            <div className="relative mb-6">
                {/* Outer glow ring */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse" />

                {/* Icon container */}
                <div className="relative bg-gradient-to-br from-[rgb(var(--bg-secondary))] to-[rgb(var(--bg-tertiary))] p-8 rounded-full border border-[rgb(var(--border-subtle))] shadow-lg">
                    <Icon className="w-16 h-16 text-[rgb(var(--text-tertiary))]" strokeWidth={1.5} />
                </div>
            </div>

            {/* Content */}
            <div className="text-center max-w-md">
                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">
                    {title}
                </h3>
                <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed mb-6">
                    {description}
                </p>

                {/* Action Button */}
                {action && (
                    <button
                        onClick={action.onClick}
                        className="
                            btn-premium
                            bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-tertiary))]
                            text-white px-6 py-3 rounded-xl font-semibold
                            shadow-lg hover:shadow-xl
                            transform hover:scale-105
                            transition-all duration-200
                        "
                    >
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
};

// Specialized Empty States

export const EmptyProcesses: React.FC<{ onCreateProcess: () => void }> = ({ onCreateProcess }) => (
    <EmptyState
        icon={Briefcase}
        title="Nenhum processo cadastrado"
        description="Comece adicionando seu primeiro processo judicial para organizar e acompanhar seus casos."
        action={{
            label: 'Criar Primeiro Processo',
            onClick: onCreateProcess
        }}
    />
);

export const EmptyClients: React.FC<{ onCreateClient: () => void }> = ({ onCreateClient }) => (
    <EmptyState
        icon={Users}
        title="Nenhum cliente cadastrado"
        description="Adicione clientes para gerenciar seus contatos e processos de forma organizada."
        action={{
            label: 'Adicionar Primeiro Cliente',
            onClick: onCreateClient
        }}
    />
);

export const EmptyServices: React.FC<{ onCreateService: () => void }> = ({ onCreateService }) => (
    <EmptyState
        icon={FileText}
        title="Nenhum atendimento registrado"
        description="Registre atendimentos para manter um histórico completo de todas as interações com seus clientes."
        action={{
            label: 'Registrar Primeiro Atendimento',
            onClick: onCreateService
        }}
    />
);

export const EmptyAgenda: React.FC<{ onCreateEvent: () => void }> = ({ onCreateEvent }) => (
    <EmptyState
        icon={Calendar}
        title="Agenda vazia"
        description="Adicione eventos, audiências e prazos para organizar sua rotina e não perder compromissos importantes."
        action={{
            label: 'Criar Primeiro Evento',
            onClick: onCreateEvent
        }}
    />
);

export const EmptyFinancial: React.FC<{ onCreateTransaction: () => void }> = ({ onCreateTransaction }) => (
    <EmptyState
        icon={DollarSign}
        title="Nenhuma movimentação financeira"
        description="Registre receitas e despesas para ter controle total sobre as finanças do seu escritório."
        action={{
            label: 'Adicionar Movimentação',
            onClick: onCreateTransaction
        }}
    />
);

export const EmptySearch: React.FC = () => (
    <EmptyState
        icon={Search}
        title="Nenhum resultado encontrado"
        description="Tente ajustar os filtros ou usar termos de busca diferentes para encontrar o que procura."
    />
);

export const EmptyNotifications: React.FC = () => (
    <EmptyState
        icon={Bell}
        title="Nenhuma notificação"
        description="Você está em dia! Não há notificações pendentes no momento."
    />
);

export const EmptyMessages: React.FC = () => (
    <EmptyState
        icon={MessageSquare}
        title="Nenhuma mensagem"
        description="Inicie uma conversa para colaborar com sua equipe e compartilhar informações importantes."
    />
);

export const EmptyReports: React.FC = () => (
    <EmptyState
        icon={TrendingUp}
        title="Sem dados para exibir"
        description="Não há dados suficientes para gerar relatórios no período selecionado. Tente ajustar o filtro de datas."
    />
);

export const EmptyFolder: React.FC = () => (
    <EmptyState
        icon={FolderOpen}
        title="Pasta vazia"
        description="Esta pasta não contém nenhum documento ou arquivo no momento."
    />
);

// Empty State with Illustration (for larger areas)
interface EmptyStateIllustratedProps {
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    illustration?: 'processes' | 'clients' | 'search' | 'data';
}

export const EmptyStateIllustrated: React.FC<EmptyStateIllustratedProps> = ({
    title,
    description,
    action,
    illustration = 'data'
}) => {
    const getIllustration = () => {
        // Simple SVG illustrations
        const baseClass = "w-64 h-64 text-[rgb(var(--text-tertiary))]/20";

        switch (illustration) {
            case 'processes':
                return (
                    <svg className={baseClass} viewBox="0 0 200 200" fill="none">
                        <rect x="40" y="40" width="120" height="120" rx="8" stroke="currentColor" strokeWidth="2" />
                        <line x1="60" y1="70" x2="140" y2="70" stroke="currentColor" strokeWidth="2" />
                        <line x1="60" y1="90" x2="140" y2="90" stroke="currentColor" strokeWidth="2" />
                        <line x1="60" y1="110" x2="110" y2="110" stroke="currentColor" strokeWidth="2" />
                    </svg>
                );
            case 'clients':
                return (
                    <svg className={baseClass} viewBox="0 0 200 200" fill="none">
                        <circle cx="100" cy="80" r="30" stroke="currentColor" strokeWidth="2" />
                        <path d="M60 160 Q100 140 140 160" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                );
            case 'search':
                return (
                    <svg className={baseClass} viewBox="0 0 200 200" fill="none">
                        <circle cx="90" cy="90" r="40" stroke="currentColor" strokeWidth="2" />
                        <line x1="120" y1="120" x2="150" y2="150" stroke="currentColor" strokeWidth="2" />
                    </svg>
                );
            default:
                return (
                    <svg className={baseClass} viewBox="0 0 200 200" fill="none">
                        <rect x="50" y="80" width="30" height="80" rx="4" stroke="currentColor" strokeWidth="2" />
                        <rect x="90" y="60" width="30" height="100" rx="4" stroke="currentColor" strokeWidth="2" />
                        <rect x="130" y="40" width="30" height="120" rx="4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                );
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
            {/* Illustration */}
            <div className="mb-8 opacity-50">
                {getIllustration()}
            </div>

            {/* Content */}
            <div className="text-center max-w-lg">
                <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-3">
                    {title}
                </h2>
                <p className="text-base text-[rgb(var(--text-secondary))] leading-relaxed mb-8">
                    {description}
                </p>

                {/* Action Button */}
                {action && (
                    <button
                        onClick={action.onClick}
                        className="
                            bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-tertiary))]
                            text-white px-8 py-4 rounded-xl font-bold text-lg
                            shadow-xl hover:shadow-2xl
                            transform hover:scale-105
                            transition-all duration-300
                        "
                    >
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
};
