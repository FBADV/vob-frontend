import React, { useState, useMemo, useCallback } from 'react';
import { Mail, Phone, FileText, Building, User, MoreVertical, Edit2, Trash2, Eye, MessageCircle } from 'lucide-react';
import type { Client } from '../../types';
import { ClientAvatar } from '../ClientAvatar';
import { useGlobalData } from '../../context/GlobalDataContext';

interface ClientListItemProps {
    client: Client;
    onClick: () => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
    onWhatsApp: (e: React.MouseEvent) => void;
}

export const ClientListItem = React.memo<ClientListItemProps>(({
    client,
    onClick,
    onEdit,
    onDelete,
    onWhatsApp
}) => {
    const { clients } = useGlobalData();
    const [showActions, setShowActions] = useState(false);

    // Find representative if applicable
    const representative = useMemo(() => {
        if (client.type === 'company' && client.representativeId) {
            return clients.find(c => c.id === client.representativeId);
        }
        return null;
    }, [client.type, client.representativeId, clients]);

    // Memoizar documento formatado
    const formattedDocument = useMemo(() => {
        if (client.type === 'individual') {
            // CPF: 000.000.000-00
            return client.document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else {
            // CNPJ: 00.000.000/0000-00
            return client.document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
    }, [client.document, client.type]);

    // Memoizar label do tipo
    const typeLabel = useMemo(() => {
        return client.type === 'individual' ? 'Pessoa Física' : 'Pessoa Jurídica';
    }, [client.type]);

    // Callbacks estáveis
    const handleToggleActions = useCallback(() => {
        setShowActions(prev => !prev);
    }, []);

    const handleCloseActions = useCallback(() => {
        setShowActions(false);
    }, []);

    const handleView = useCallback(() => {
        onClick();
        setShowActions(false);
    }, [onClick]);

    const handleEditClick = useCallback((e: React.MouseEvent) => {
        onEdit(e);
        setShowActions(false);
    }, [onEdit]);

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        onDelete(e);
        setShowActions(false);
    }, [onDelete]);

    const handleWhatsAppClick = useCallback((e: React.MouseEvent) => {
        onWhatsApp(e);
        setShowActions(false);
    }, [onWhatsApp]);

    return (
        <tr
            className="hover:bg-[rgb(var(--bg-tertiary))]/50 transition-colors cursor-pointer group border-b border-[rgb(var(--border-subtle))]"
            onClick={onClick}
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <ClientAvatar
                        client={client}
                        size="md"
                        className="shadow-md"
                        representativeName={representative?.name}
                        representativePhotoUrl={representative?.photoUrl}
                    />
                    <div>
                        <h3 className="font-bold text-[rgb(var(--text-primary))] text-sm group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                            {client.name}
                        </h3>
                        <div className="flex flex-col gap-1 mt-0.5">
                            <p className="text-xs text-[rgb(var(--text-secondary))] flex items-center gap-1.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${client.type === 'individual'
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                                    : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30'
                                    }`}>
                                    {client.type === 'individual' ? <User size={10} /> : <Building size={10} />}
                                    {typeLabel}
                                </span>
                            </p>
                            {representative && (
                                <p className="text-[10px] text-[rgb(var(--text-tertiary))] flex items-center gap-1">
                                    <User size={10} />
                                    Rep: <span className="font-medium text-[rgb(var(--text-secondary))]">{representative.name}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
                    <Mail size={14} className="text-[rgb(var(--text-tertiary))]" />
                    <span className="font-medium truncate max-w-[200px]">
                        {client.email}
                    </span>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
                    <Phone size={14} className="text-[rgb(var(--text-tertiary))]" />
                    <span className="font-medium">
                        {client.phone}
                    </span>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--text-primary))]">
                    <FileText size={14} className="text-[rgb(var(--text-tertiary))]" />
                    {formattedDocument}
                </div>
            </td>

            <td className="px-6 py-4 text-right">
                <div className="relative flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={handleToggleActions}
                        className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {showActions && (
                        <>
                            {/* Backdrop to prevent click-through */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={handleCloseActions}
                            />
                            <div className="absolute right-0 top-full mt-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] rounded-xl shadow-xl z-50 min-w-[160px] animate-scale-in">
                                <button
                                    onClick={handleWhatsAppClick}
                                    className="w-full px-4 py-3 text-left hover:bg-[rgb(var(--bg-tertiary))] transition-colors flex items-center gap-2 text-sm font-medium text-green-600 first:rounded-t-xl"
                                >
                                    <MessageCircle size={16} />
                                    WhatsApp
                                </button>
                                <button
                                    onClick={handleView}
                                    className="w-full px-4 py-3 text-left hover:bg-[rgb(var(--bg-tertiary))] transition-colors flex items-center gap-2 text-sm font-medium text-[rgb(var(--text-primary))]"
                                >
                                    <Eye size={16} />
                                    Visualizar
                                </button>
                                <button
                                    onClick={handleEditClick}
                                    className="w-full px-4 py-3 text-left hover:bg-[rgb(var(--bg-tertiary))] transition-colors flex items-center gap-2 text-sm font-medium text-[rgb(var(--text-primary))]"
                                >
                                    <Edit2 size={16} />
                                    Editar
                                </button>
                                <button
                                    onClick={handleDeleteClick}
                                    className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 last:rounded-b-xl"
                                >
                                    <Trash2 size={16} />
                                    Excluir
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}, (prevProps, nextProps) => {
    // Comparação customizada
    return (
        prevProps.client.id === nextProps.client.id &&
        prevProps.client.name === nextProps.client.name &&
        prevProps.client.email === nextProps.client.email &&
        prevProps.client.phone === nextProps.client.phone &&
        prevProps.client.document === nextProps.client.document &&
        prevProps.client.type === nextProps.client.type &&
        prevProps.client.photoUrl === nextProps.client.photoUrl
    );
});

ClientListItem.displayName = 'ClientListItem';
