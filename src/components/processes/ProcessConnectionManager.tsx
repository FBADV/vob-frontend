import React, { useState } from 'react';
import { useGlobalData } from '../../context/GlobalDataContext';
import { Share2, RefreshCw, CheckCircle, XCircle, Clock, Building2, AlertCircle } from 'lucide-react';
import type { Process } from '../../types';
import toast from 'react-hot-toast';

interface ProcessConnectionManagerProps {
    process: Process;
}

export const ProcessConnectionManager: React.FC<ProcessConnectionManagerProps> = ({ process }) => {
    const { offices, processConnections, sendConnectionRequest, disconnectProcess, user } = useGlobalData();
    const [isConnecting, setIsConnecting] = useState(false);
    const [selectedOfficeId, setSelectedOfficeId] = useState('');
    const [isSyncing, setIsSyncing] = useState<string | null>(null);

    // Filter connections for this process
    const connections = processConnections.filter(c => c.processId === process.id);

    // Filter offices that are not yet connected
    const availableOffices = offices.filter(
        o => !connections.some(c => c.officeId === o.id) && o.status === 'active'
    );

    const handleConnect = async () => {
        if (!selectedOfficeId) return;

        const office = offices.find(o => o.id === selectedOfficeId);
        if (!office) return;

        setIsConnecting(true);
        try {
            await sendConnectionRequest(office, process.id, process.number);
            toast.success(`Solicitação enviada para ${office.name}`);
            setSelectedOfficeId('');
        } catch (error) {
            toast.error('Erro ao enviar solicitação');
            console.error(error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSync = async (connectionId: string) => {
        setIsSyncing(connectionId);
        // Simulate sync delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Sincronização realizada com sucesso');
        setIsSyncing(null);
    };

    const handleDisconnect = async (connectionId: string) => {
        if (confirm('Tem certeza que deseja desconectar este processo? A sincronização será interrompida.')) {
            await disconnectProcess(connectionId);
            toast.success('Processo desconectado');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        <CheckCircle size={12} /> Ativo
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                        <Clock size={12} /> Pendente
                    </span>
                );
            case 'rejected':
                return (
                    <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                        <XCircle size={12} /> Rejeitado
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        <AlertCircle size={12} /> Desconhecido
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-[rgb(var(--bg-secondary))] p-4 rounded-xl border border-[rgb(var(--border-subtle))]">
                <h3 className="text-sm font-bold text-[rgb(var(--text-primary))] mb-3 flex items-center gap-2">
                    <Share2 size={16} className="text-[rgb(var(--accent-primary))]" />
                    Nova Conexão
                </h3>

                {user?.role !== 'admin' ? (
                    <p className="text-sm text-[rgb(var(--text-secondary))] italic">
                        Apenas administradores podem iniciar novas conexões.
                    </p>
                ) : availableOffices.length > 0 ? (
                    <div className="flex gap-2">
                        <select
                            value={selectedOfficeId}
                            onChange={(e) => setSelectedOfficeId(e.target.value)}
                            className="flex-1 bg-[rgb(var(--bg-tertiary))] border border-[rgb(var(--border-subtle))] rounded-lg px-3 py-2 text-sm text-[rgb(var(--text-primary))] outline-none focus:border-[rgb(var(--accent-primary))]"
                        >
                            <option value="">Selecione um escritório parceiro...</option>
                            {availableOffices.map(office => (
                                <option key={office.id} value={office.id}>
                                    {office.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleConnect}
                            disabled={!selectedOfficeId || isConnecting}
                            className="btn-premium px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isConnecting ? <RefreshCw size={16} className="animate-spin" /> : <Share2 size={16} />}
                            Conectar
                        </button>
                    </div>
                ) : (
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                        {offices.length === 0
                            ? "Nenhum escritório parceiro cadastrado. Vá em Configurações > Escritórios."
                            : "Este processo já está conectado a todos os escritórios disponíveis."}
                    </p>
                )}
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-bold text-[rgb(var(--text-primary))]">Conexões Ativas</h3>

                {connections.length === 0 ? (
                    <div className="text-center py-8 text-[rgb(var(--text-tertiary))] bg-[rgb(var(--bg-tertiary))]/30 rounded-xl border border-dashed border-[rgb(var(--border-subtle))]">
                        <Share2 size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Nenhuma conexão ativa para este processo.</p>
                    </div>
                ) : (
                    connections.map(connection => {
                        const office = offices.find(o => o.id === connection.officeId);
                        return (
                            <div key={connection.id} className="flex items-center justify-between p-4 bg-[rgb(var(--bg-secondary))] rounded-xl border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent-primary))]/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))]">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-[rgb(var(--text-primary))]">
                                            {office?.name || 'Escritório Desconhecido'}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getStatusBadge(connection.status)}
                                            {connection.lastSync && (
                                                <span className="text-xs text-[rgb(var(--text-tertiary))] flex items-center gap-1">
                                                    <RefreshCw size={10} />
                                                    {new Date(connection.lastSync).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {connection.status === 'active' && (
                                        <button
                                            onClick={() => handleSync(connection.id)}
                                            disabled={isSyncing === connection.id}
                                            className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
                                            title="Sincronizar agora"
                                        >
                                            <RefreshCw size={18} className={isSyncing === connection.id ? "animate-spin" : ""} />
                                        </button>
                                    )}
                                    {user?.role === 'admin' && (
                                        <button
                                            onClick={() => handleDisconnect(connection.id)}
                                            className="p-2 text-[rgb(var(--text-secondary))] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Desconectar"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
