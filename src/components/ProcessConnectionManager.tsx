import React, { useState, useEffect } from 'react';
import { useGlobalData } from '../context/GlobalDataContext';

import type { ProcessConnection } from '../types/connectivity.types';
import { Building2, Link as LinkIcon, Unlink, Check, X, AlertCircle, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProcessConnectionManagerProps {
    processId: string;
    processNumber: string;
}

export const ProcessConnectionManager: React.FC<ProcessConnectionManagerProps> = ({ processId, processNumber }) => {
    const { offices, sendConnectionRequest, disconnectProcess, user, processConnections } = useGlobalData();
    const [connections, setConnections] = useState<ProcessConnection[]>([]);

    const [showConnectModal, setShowConnectModal] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const filtered = processConnections.filter(c => c.processId === processId);
        setConnections(filtered);
    }, [processId, processConnections]);

    const handleConnect = async () => {
        if (!selectedOffice) return;

        const office = offices.find(o => o.id === selectedOffice);
        if (!office) return;

        setIsSubmitting(true);
        try {
            await sendConnectionRequest(office, processId, processNumber);
            toast.success(`Solicitação enviada para ${office.name}`);
            setShowConnectModal(false);
            setSelectedOffice('');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao enviar solicitação');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDisconnect = async (connectionId: string) => {
        if (!window.confirm('Tem certeza que deseja desvincular este processo? A sincronização será interrompida.')) {
            return;
        }

        try {
            await disconnectProcess(connectionId);
            toast.success('Processo desvinculado');
        } catch (error) {
            toast.error('Erro ao desvincular processo');
        }
    };

    const getStatusBadge = (status: ProcessConnection['status']) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1"><Check size={12} /> Ativo</span>;
            case 'pending':
                return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Pendente</span>;
            case 'rejected':
                return <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1"><X size={12} /> Recusado</span>;
            case 'disconnected':
                return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1"><Unlink size={12} /> Desconectado</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                    <LinkIcon size={20} className="text-[rgb(var(--accent-primary))]" />
                    Conexões Externas
                </h3>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setShowConnectModal(true)}
                        className="px-3 py-1.5 bg-[rgb(var(--accent-primary))] text-white text-sm rounded-lg hover:bg-[rgb(var(--accent-primary))]/90 transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Conectar
                    </button>
                )}
            </div>

            {connections.length === 0 ? (
                <div className="text-center py-8 bg-[rgb(var(--bg-tertiary))]/30 rounded-xl border border-dashed border-[rgb(var(--border-subtle))]">
                    <LinkIcon size={32} className="mx-auto mb-3 text-[rgb(var(--text-tertiary))]" />
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Este processo não está conectado a nenhum escritório parceiro.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {connections.map(conn => {
                        const office = offices.find(o => o.id === conn.officeId);
                        return (
                            <div key={conn.id} className="flex items-center justify-between p-4 bg-[rgb(var(--bg-secondary))] rounded-xl border border-[rgb(var(--border-subtle))]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))]">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[rgb(var(--text-primary))]">{office?.name || 'Escritório Desconhecido'}</p>
                                        <p className="text-xs text-[rgb(var(--text-secondary))]">ID Remoto: {conn.remoteProcessId || 'Pendente'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(conn.status)}
                                    {conn.status === 'active' && (
                                        <button
                                            onClick={() => handleDisconnect(conn.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Desvincular"
                                        >
                                            <Unlink size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showConnectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-[rgb(var(--bg-secondary))] rounded-2xl w-full max-w-md shadow-2xl border border-[rgb(var(--border-subtle))] p-6 animate-scale-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Conectar Processo</h3>
                            <button onClick={() => setShowConnectModal(false)} className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))]">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                                    Selecione o Escritório Parceiro
                                </label>
                                <select
                                    value={selectedOffice}
                                    onChange={e => setSelectedOffice(e.target.value)}
                                    className="w-full p-2 rounded-xl bg-[rgb(var(--bg-tertiary))] border border-[rgb(var(--border-subtle))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                                >
                                    <option value="">Selecione...</option>
                                    {offices.filter(o => o.status === 'active').map(o => (
                                        <option key={o.id} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-2 text-sm text-blue-700 dark:text-blue-300">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <p>Ao conectar, as movimentações deste processo serão sincronizadas automaticamente com o escritório parceiro.</p>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setShowConnectModal(false)}
                                    className="px-4 py-2 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConnect}
                                    disabled={!selectedOffice || isSubmitting}
                                    className="px-6 py-2 bg-[rgb(var(--accent-primary))] text-white rounded-xl hover:bg-[rgb(var(--accent-primary))]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                    Enviar Solicitação
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


