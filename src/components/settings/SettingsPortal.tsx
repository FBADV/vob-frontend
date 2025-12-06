import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Key, RefreshCw, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { clientPortalService } from '../../services/clientPortal.service';
import toast from 'react-hot-toast';

interface ClientWithAccess {
    id: string;
    name: string;
    document: string;
    email: string;
    portal_access?: {
        id: string;
        enabled: boolean;
        activation_code: string | null;
        first_access_completed: boolean;
        last_login_at: string | null;
    } | null;
}

export const SettingsPortal: React.FC = () => {
    const [clients, setClients] = useState<ClientWithAccess[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            // Fetch clients and their portal access
            // Note: Supabase join syntax
            const { data, error } = await supabase
                .from('clients')
                .select(`
                    id, name, document, email,
                    portal_access:client_portal_access(
                        id, enabled, activation_code, first_access_completed, last_login_at
                    )
                `)
                .order('name');

            if (error) throw error;

            // Transform data to handle the array/object nature of the join
            const transformed = (data || []).map((client: any) => ({
                ...client,
                portal_access: Array.isArray(client.portal_access) && client.portal_access.length > 0
                    ? client.portal_access[0]
                    : client.portal_access // Could be object or null depending on query
            }));

            setClients(transformed);
        } catch (err) {
            console.error('Error fetching clients:', err);
            toast.error('Erro ao carregar clientes');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAccess = async (client: ClientWithAccess) => {
        if (!client.document || !client.email) {
            toast.error('Cliente precisa ter CPF e E-mail cadastrados');
            return;
        }

        setProcessingId(client.id);
        try {
            const response = await clientPortalService.activatePortalAccess({
                clientId: client.id,
                sendSMS: false
            });

            if (response.success) {
                toast.success('Acesso gerado com sucesso!');
                await fetchClients();
            } else {
                toast.error(response.error || 'Erro ao gerar acesso');
            }
        } catch (err) {
            toast.error('Erro inesperado');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRevokeAccess = async (client: ClientWithAccess) => {
        if (!confirm(`Tem certeza que deseja revogar o acesso de ${client.name}?`)) return;

        setProcessingId(client.id);
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { error } = await supabase
                .from('client_portal_access')
                // @ts-ignore
                .update({ enabled: false })
                .eq('client_id', client.id);

            if (error) throw error;

            toast.success('Acesso revogado');
            await fetchClients();
        } catch (err) {
            toast.error('Erro ao revogar acesso');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReactivateAccess = async (client: ClientWithAccess) => {
        setProcessingId(client.id);
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { error } = await supabase
                .from('client_portal_access')
                // @ts-ignore
                .update({ enabled: true })
                .eq('client_id', client.id);

            if (error) throw error;

            toast.success('Acesso reativado');
            await fetchClients();
        } catch (err) {
            toast.error('Erro ao reativar acesso');
        } finally {
            setProcessingId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copiado!');
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.document?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Acesso do Cliente</h2>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Gerencie o acesso dos clientes ao portal</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--bg-tertiary))] border border-[rgb(var(--border-primary))] rounded-xl text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                    />
                </div>
            </div>

            <div className="card-premium overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-tertiary))]/50">
                                <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">Documento / Email</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">Código de Ativação</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--border-primary))]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-[rgb(var(--text-secondary))]">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-[rgb(var(--text-secondary))]">
                                        Nenhum cliente encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map(client => {
                                    const hasAccess = !!client.portal_access;
                                    const isEnabled = client.portal_access?.enabled;
                                    const isActivated = client.portal_access?.first_access_completed;
                                    const activationCode = client.portal_access?.activation_code;

                                    return (
                                        <tr key={client.id} className="hover:bg-[rgb(var(--bg-tertiary))]/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-[rgb(var(--text-primary))]">{client.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-[rgb(var(--text-primary))]">{client.document || '-'}</span>
                                                    <span className="text-xs text-[rgb(var(--text-secondary))]">{client.email || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {hasAccess ? (
                                                    isEnabled ? (
                                                        isActivated ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                                <UserCheck size={12} className="mr-1" />
                                                                Ativo
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                                <RefreshCw size={12} className="mr-1" />
                                                                Pendente
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                            <UserX size={12} className="mr-1" />
                                                            Desativado
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                                                        Sem Acesso
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {activationCode && !isActivated ? (
                                                    <div className="flex items-center gap-2">
                                                        <code className="px-2 py-1 bg-[rgb(var(--bg-tertiary))] rounded text-sm font-mono text-[rgb(var(--accent-primary))]">
                                                            {activationCode}
                                                        </code>
                                                        <button
                                                            onClick={() => copyToClipboard(activationCode)}
                                                            className="p-1 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                                                            title="Copiar código"
                                                        >
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-[rgb(var(--text-tertiary))]">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    {!hasAccess ? (
                                                        <button
                                                            onClick={() => handleGenerateAccess(client)}
                                                            disabled={processingId === client.id || !client.document || !client.email}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-[rgb(var(--accent-primary))] text-white rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs"
                                                        >
                                                            {processingId === client.id ? <RefreshCw size={14} className="animate-spin" /> : <Key size={14} />}
                                                            Gerar Acesso
                                                        </button>
                                                    ) : (
                                                        <>
                                                            {isEnabled ? (
                                                                <button
                                                                    onClick={() => handleRevokeAccess(client)}
                                                                    disabled={processingId === client.id}
                                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs"
                                                                >
                                                                    {processingId === client.id ? <RefreshCw size={14} className="animate-spin" /> : <UserX size={14} />}
                                                                    Revogar
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleReactivateAccess(client)}
                                                                    disabled={processingId === client.id}
                                                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs"
                                                                >
                                                                    {processingId === client.id ? <RefreshCw size={14} className="animate-spin" /> : <UserCheck size={14} />}
                                                                    Reativar
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
