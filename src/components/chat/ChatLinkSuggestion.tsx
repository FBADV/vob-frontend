import React from 'react';
import { MessageSquare, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useNavigate } from 'react-router-dom';

interface ChatLinkSuggestionProps {
    type: 'process' | 'client';
    id: string;
    name: string;
}

export const ChatLinkSuggestion: React.FC<ChatLinkSuggestionProps> = ({ type, id, name }) => {
    const { state, createConversation, linkConversation, selectConversation } = useChat();
    const navigate = useNavigate();

    // Check if there is already a linked conversation
    const linkedConversation = state.conversations.find(c =>
        c.linkedTo?.type === type && c.linkedTo?.id === id
    );

    const handleCreateOrOpen = async () => {
        if (linkedConversation) {
            selectConversation(linkedConversation.id);
            navigate('/chat');
        } else {
            // Create new conversation linked to this entity
            const newId = await createConversation([], `Chat: ${name}`);
            linkConversation(newId, { type, id, name });
            navigate('/chat');
        }
    };

    return (
        <div className="card-premium p-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-[rgb(var(--text-primary))] text-lg">
                        {linkedConversation ? 'Chat Vinculado' : 'Comunicação Interna'}
                    </h4>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                        {linkedConversation
                            ? 'Já existe um chat para este processo. Clique para abrir.'
                            : 'Crie um chat exclusivo para discutir este processo com a equipe.'}
                    </p>
                </div>
            </div>
            <button
                onClick={handleCreateOrOpen}
                className="btn-premium py-2.5 px-5 flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
                {linkedConversation ? (
                    <>
                        <ExternalLink size={18} />
                        Abrir Chat
                    </>
                ) : (
                    <>
                        <LinkIcon size={18} />
                        Criar Chat
                    </>
                )}
            </button>
        </div>
    );
};
