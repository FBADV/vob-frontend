import React, { useState, useEffect } from 'react';
import { X, User, Building2, UserPlus, Trash2, Link as LinkIcon } from 'lucide-react';
import { useProcessParties } from '../hooks/useProcessParties';
import { useGlobalData } from '../context/GlobalDataContext';
import type { ProcessParty, CreateProcessPartyInput } from '../types/processParty.types';

interface ProcessPartiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    processId: string;
    processNumber: string;
}

export const ProcessPartiesModal: React.FC<ProcessPartiesModalProps> = ({
    isOpen,
    onClose,
    processId,
    processNumber
}) => {
    const { clients } = useGlobalData();
    const { groupedParties, clients: processClients, hasMultipleClients, isLoading, createParty, deleteParty, updateParty, reload } = useProcessParties(processId);

    const [isAddingParty, setIsAddingParty] = useState(false);
    const [newParty, setNewParty] = useState<Partial<CreateProcessPartyInput>>({
        processId,
        role: 'plaintiff',
        type: 'individual'
    });

    useEffect(() => {
        if (isOpen) {
            reload();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddParty = async () => {
        if (!newParty.name) {
            alert('Nome da parte é obrigatório');
            return;
        }

        const created = await createParty({
            processId,
            name: newParty.name,
            role: newParty.role || 'plaintiff',
            type: newParty.type || 'individual',
            document: newParty.document,
            isClient: newParty.isClient || false,
            clientId: newParty.clientId
        });

        if (created) {
            setIsAddingParty(false);
            setNewParty({ processId, role: 'plaintiff', type: 'individual' });
        }
    };

    const handleLinkClient = async (partyId: string, clientId: string) => {
        await updateParty(partyId, {
            isClient: true,
            clientId
        });
    };

    const handleUnlinkClient = async (partyId: string) => {
        await updateParty(partyId, {
            isClient: false,
            clientId: null
        });
    };

    const renderPartyCard = (party: ProcessParty) => {
        const linkedClient = party.clientId ? clients.find(c => c.id === party.clientId) : null;

        return (
            <div
                key={party.id}
                className={`p-4 rounded-xl border-2 transition-all ${party.isClient
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    }`}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${party.isClient
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                            {party.type === 'company' ? <Building2 size={20} /> : <User size={20} />}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-[rgb(var(--text-primary))]">{party.name}</h4>
                                {party.isClient && (
                                    <span className="text-xs font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded dark:bg-blue-700 dark:text-blue-200">
                                        Cliente
                                    </span>
                                )}
                                <span className={`text-xs px-2 py-0.5 rounded ${party.type === 'company'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    }`}>
                                    {party.type === 'company' ? 'PJ' : 'PF'}
                                </span>
                            </div>

                            {party.document && (
                                <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">
                                    {party.type === 'company' ? 'CNPJ' : 'CPF'}: {party.document}
                                </p>
                            )}

                            {linkedClient && (
                                <div className="mt-2 p-2 bg-blue-100/50 rounded-lg dark:bg-blue-900/20">
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        🏢 Vinculado ao cliente: <strong>{linkedClient.name}</strong>
                                    </p>
                                </div>
                            )}

                            {!party.isClient && (
                                <div className="mt-2">
                                    <button
                                        onClick={() => {
                                            const clientId = prompt('Digite o ID do cliente ou selecione da lista');
                                            if (clientId) handleLinkClient(party.id, clientId);
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 dark:text-blue-400"
                                    >
                                        <LinkIcon size={12} /> Vincular como Cliente
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {party.isClient && (
                            <button
                                onClick={() => handleUnlinkClient(party.id)}
                                className="p-1.5 hover:bg-gray-100 rounded dark:hover:bg-gray-700 text-gray-500"
                                title="Desvincular cliente"
                            >
                                <X size={16} />
                            </button>
                        )}
                        <button
                            onClick={() => deleteParty(party.id)}
                            className="p-1.5 hover:bg-red-100 rounded dark:hover:bg-red-900/30 text-red-500"
                            title="Remover parte"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                                Partes do Processo
                            </h2>
                            <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                                {processNumber}
                            </p>
                            {hasMultipleClients && (
                                <div className="mt-2 inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-lg text-sm dark:bg-amber-900/30 dark:text-amber-300">
                                    ⚠️ <strong>{processClients.length}</strong> cliente(s) neste processo
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-sm text-[rgb(var(--text-secondary))] mt-2">Carregando partes...</p>
                        </div>
                    ) : (
                        <>
                            {/* Polo Ativo (Plaintiffs) */}
                            <div>
                                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-3 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-green-500 rounded"></div>
                                    Polo Ativo (Autores)
                                    <span className="text-sm font-normal text-[rgb(var(--text-secondary))]">
                                        ({groupedParties?.plaintiffs.length || 0})
                                    </span>
                                </h3>
                                <div className="space-y-3">
                                    {groupedParties?.plaintiffs.map(renderPartyCard)}
                                    {(!groupedParties?.plaintiffs || groupedParties.plaintiffs.length === 0) && (
                                        <p className="text-sm text-[rgb(var(--text-secondary))] italic">Nenhuma parte no polo ativo</p>
                                    )}
                                </div>
                            </div>

                            {/* Polo Passivo (Defendants) */}
                            <div>
                                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-3 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-red-500 rounded"></div>
                                    Polo Passivo (Réus)
                                    <span className="text-sm font-normal text-[rgb(var(--text-secondary))]">
                                        ({groupedParties?.defendants.length || 0})
                                    </span>
                                </h3>
                                <div className="space-y-3">
                                    {groupedParties?.defendants.map(renderPartyCard)}
                                    {(!groupedParties?.defendants || groupedParties.defendants.length === 0) && (
                                        <p className="text-sm text-[rgb(var(--text-secondary))] italic">Nenhuma parte no polo passivo</p>
                                    )}
                                </div>
                            </div>

                            {/* Terceiros (Third Parties) */}
                            {groupedParties?.thirdParties && groupedParties.thirdParties.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-3 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-gray-500 rounded"></div>
                                        Terceiros Interessados
                                        <span className="text-sm font-normal text-[rgb(var(--text-secondary))]">
                                            ({groupedParties.thirdParties.length})
                                        </span>
                                    </h3>
                                    <div className="space-y-3">
                                        {groupedParties.thirdParties.map(renderPartyCard)}
                                    </div>
                                </div>
                            )}

                            {/* Add New Party */}
                            {!isAddingParty ? (
                                <button
                                    onClick={() => setIsAddingParty(true)}
                                    className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex items-center justify-center gap-2 text-[rgb(var(--text-secondary))] hover:text-blue-600"
                                >
                                    <UserPlus size={20} />
                                    Adicionar Parte
                                </button>
                            ) : (
                                <div className="p-4 border-2 border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 rounded-xl space-y-3">
                                    <h4 className="font-semibold text-[rgb(var(--text-primary))]">Nova Parte</h4>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                                                Polo
                                            </label>
                                            <select
                                                value={newParty.role}
                                                onChange={(e) => setNewParty({ ...newParty, role: e.target.value as any })}
                                                className="input-premium w-full"
                                            >
                                                <option value="plaintiff">Ativo (Autor)</option>
                                                <option value="defendant">Passivo (Réu)</option>
                                                <option value="third_party">Terceiro</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                                                Tipo
                                            </label>
                                            <select
                                                value={newParty.type}
                                                onChange={(e) => setNewParty({ ...newParty, type: e.target.value as any })}
                                                className="input-premium w-full"
                                            >
                                                <option value="individual">Pessoa Física</option>
                                                <option value="company">Pessoa Jurídica</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                                            Nome *
                                        </label>
                                        <input
                                            type="text"
                                            value={newParty.name || ''}
                                            onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                                            className="input-premium w-full"
                                            placeholder="Nome completo ou razão social"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                                            {newParty.type === 'company' ? 'CNPJ' : 'CPF'}
                                        </label>
                                        <input
                                            type="text"
                                            value={newParty.document || ''}
                                            onChange={(e) => setNewParty({ ...newParty, document: e.target.value })}
                                            className="input-premium w-full"
                                            placeholder={newParty.type === 'company' ? '00.000.000/0000-00' : '000.000.000-00'}
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={handleAddParty}
                                            className="btn-premium flex-1"
                                        >
                                            Adicionar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsAddingParty(false);
                                                setNewParty({ processId, role: 'plaintiff', type: 'individual' });
                                            }}
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="text-sm text-[rgb(var(--text-secondary))]">
                        <strong>{processClients.length}</strong> cliente(s) vinculado(s)
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-premium"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
