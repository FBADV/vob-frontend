import React, { useState } from 'react';
import { MoreVertical, Trash2, Archive, Link as LinkIcon, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useGlobalData } from '../../context/GlobalDataContext';

interface ChatHeaderActionsProps {
    conversationId: string;
}

export const ChatHeaderActions: React.FC<ChatHeaderActionsProps> = ({ conversationId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const { deleteConversation, archiveConversation, linkConversation } = useChat();
    const { processes, clients } = useGlobalData();

    const handleDelete = () => {
        if (window.confirm('Tem certeza que deseja excluir esta conversa?')) {
            deleteConversation(conversationId);
        }
        setIsOpen(false);
    };

    const handleArchive = () => {
        archiveConversation(conversationId);
        setIsOpen(false);
    };

    const handleLink = (type: 'process' | 'client', id: string, name: string) => {
        linkConversation(conversationId, { type, id, name });
        setShowLinkModal(false);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
            >
                <MoreVertical size={20} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[rgb(var(--bg-secondary))] rounded-xl shadow-lg border border-[rgb(var(--border-subtle))] z-20 overflow-hidden animate-scale-in">
                        <button
                            onClick={() => setShowLinkModal(true)}
                            className="w-full px-4 py-3 text-left text-sm text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] flex items-center gap-2"
                        >
                            <LinkIcon size={16} />
                            Vincular a...
                        </button>
                        <button
                            onClick={handleArchive}
                            className="w-full px-4 py-3 text-left text-sm text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] flex items-center gap-2"
                        >
                            <Archive size={16} />
                            Arquivar
                        </button>
                        <div className="h-px bg-[rgb(var(--border-subtle))]" />
                        <button
                            onClick={handleDelete}
                            className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Excluir
                        </button>
                    </div>
                </>
            )}

            {showLinkModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-[rgb(var(--bg-secondary))] rounded-2xl w-full max-w-md shadow-2xl border border-[rgb(var(--border-subtle))] p-6 animate-scale-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Vincular Conversa</h3>
                            <button onClick={() => setShowLinkModal(false)} className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))]">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            <div>
                                <h4 className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase mb-2">Processos Recentes</h4>
                                <div className="space-y-2">
                                    {processes.slice(0, 3).map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleLink('process', p.id, p.title)}
                                            className="w-full p-3 rounded-lg bg-[rgb(var(--bg-primary))] hover:bg-[rgb(var(--bg-tertiary))] text-left transition-colors border border-[rgb(var(--border-subtle))]"
                                        >
                                            <p className="font-medium text-[rgb(var(--text-primary))] truncate">{p.title}</p>
                                            <p className="text-xs text-[rgb(var(--text-secondary))]">{p.number}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-[rgb(var(--text-tertiary))] uppercase mb-2">Clientes Recentes</h4>
                                <div className="space-y-2">
                                    {clients.slice(0, 3).map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleLink('client', c.id, c.name)}
                                            className="w-full p-3 rounded-lg bg-[rgb(var(--bg-primary))] hover:bg-[rgb(var(--bg-tertiary))] text-left transition-colors border border-[rgb(var(--border-subtle))]"
                                        >
                                            <p className="font-medium text-[rgb(var(--text-primary))] truncate">{c.name}</p>
                                            <p className="text-xs text-[rgb(var(--text-secondary))]">{c.email}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
