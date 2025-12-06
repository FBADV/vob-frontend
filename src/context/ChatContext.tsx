import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ChatContextType, ChatState, ChatMessage, Conversation } from '../types/chat.types';
import { useGlobalData } from './GlobalDataContext';
import toast from 'react-hot-toast';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const INITIAL_STATE: ChatState = {
    conversations: [],
    activeConversationId: null,
    messages: {},
    isLoading: false,
    error: null
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useGlobalData();
    const [state, setState] = useState<ChatState>(INITIAL_STATE);

    // Mock initial data
    useEffect(() => {
        if (user) {
            // Load from localStorage or mock
            const storedChat = localStorage.getItem('vob_chat_data');
            let loadedState: ChatState | null = null;

            if (storedChat) {
                try {
                    const parsed = JSON.parse(storedChat);
                    // Validate structure
                    if (parsed && Array.isArray(parsed.conversations) && typeof parsed.messages === 'object') {
                        loadedState = parsed;
                    }
                } catch (e) {
                    console.error('Failed to load chat data', e);
                }
            }

            if (loadedState) {
                setState(loadedState);
            } else {
                // Create some mock conversations
                const mockConvoId = generateId();
                const mockMessages: ChatMessage[] = [
                    {
                        id: generateId(),
                        conversationId: mockConvoId,
                        senderId: 'system',
                        senderName: 'VOB System',
                        content: 'Bem-vindo ao Chat Interno! Aqui você pode se comunicar com sua equipe.',
                        type: 'text',
                        timestamp: new Date().toISOString(),
                        readBy: []
                    }
                ];

                const mockConvo: Conversation = {
                    id: mockConvoId,
                    participants: [user.id, 'system'],
                    type: 'direct',
                    title: 'Suporte VOB',
                    lastMessage: mockMessages[0],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    unreadCount: 1
                };

                setState(prev => ({
                    ...prev,
                    conversations: [mockConvo],
                    messages: { [mockConvoId]: mockMessages }
                }));
            }
        }
    }, [user]);

    // Persist to localStorage
    useEffect(() => {
        if (state.conversations.length > 0) {
            localStorage.setItem('vob_chat_data', JSON.stringify(state));
        }
    }, [state]);

    const sendMessage = useCallback(async (conversationId: string, content: string, type: ChatMessage['type'] = 'text', metadata?: Partial<ChatMessage>) => {
        if (!user) return;

        const newMessage: ChatMessage = {
            id: generateId(),
            conversationId,
            senderId: user.id,
            senderName: user.name,
            senderAvatar: user.photoUrl,
            content,
            type,
            timestamp: new Date().toISOString(),
            readBy: [user.id],
            status: 'sent',
            ...metadata
        };

        setState(prev => {
            const updatedMessages = {
                ...prev.messages,
                [conversationId]: [...(prev.messages[conversationId] || []), newMessage]
            };

            const updatedConversations = prev.conversations.map(c =>
                c.id === conversationId
                    ? { ...c, lastMessage: newMessage, updatedAt: newMessage.timestamp }
                    : c
            );

            updatedConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

            return {
                ...prev,
                messages: updatedMessages,
                conversations: updatedConversations
            };
        });

        // Simulate network delay for status updates (WhatsApp style)
        const conversation = state.conversations.find(c => c.id === conversationId);
        if (conversation?.channel === 'whatsapp') {
            // Sent -> Delivered (1s)
            setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    messages: {
                        ...prev.messages,
                        [conversationId]: prev.messages[conversationId].map(m =>
                            m.id === newMessage.id ? { ...m, status: 'delivered' } : m
                        )
                    }
                }));
            }, 1000);

            // Delivered -> Read (3s)
            setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    messages: {
                        ...prev.messages,
                        [conversationId]: prev.messages[conversationId].map(m =>
                            m.id === newMessage.id ? { ...m, status: 'read' } : m
                        )
                    }
                }));
            }, 3000);
        }
    }, [user, state.conversations]);

    const createConversation = useCallback(async (participantIds: string[], title?: string) => {
        if (!user) throw new Error('User not logged in');

        const newConvoId = generateId();
        const newConvo: Conversation = {
            id: newConvoId,
            participants: [...participantIds, user.id],
            type: participantIds.length > 1 ? 'group' : 'direct',
            channel: 'internal',
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            unreadCount: 0
        };

        setState(prev => ({
            ...prev,
            conversations: [newConvo, ...prev.conversations],
            messages: { ...prev.messages, [newConvoId]: [] },
            activeConversationId: newConvoId
        }));

        return newConvoId;
    }, [user]);



    const markAsRead = useCallback((conversationId: string) => {
        if (!user) return;
        // In a real app, we would update the readBy array of messages
        setState(prev => ({
            ...prev,
            conversations: prev.conversations.map(c =>
                c.id === conversationId ? { ...c, unreadCount: 0 } : c
            )
        }));
    }, [user]);

    const selectConversation = useCallback((conversationId: string) => {
        setState(prev => ({ ...prev, activeConversationId: conversationId }));
        markAsRead(conversationId);
    }, [markAsRead]);

    const linkConversation = useCallback((conversationId: string, linkData: { type: 'process' | 'client', id: string, name: string }) => {
        setState(prev => ({
            ...prev,
            conversations: prev.conversations.map(c =>
                c.id === conversationId ? { ...c, linkedTo: linkData } : c
            )
        }));
        toast.success(`Conversa vinculada a ${linkData.name}`);
    }, []);

    const startWhatsAppConversation = useCallback(async (
        client: { id: string; name: string; phone: string; photo?: string },
        linkedTo?: { type: 'process' | 'client'; id: string; name: string }
    ) => {
        if (!user) throw new Error('User not logged in');

        // Check if conversation already exists
        const existingConvo = state.conversations.find(c =>
            c.channel === 'whatsapp' && c.phoneNumber === client.phone
        );

        if (existingConvo) {
            // If linking to a process, update the link
            if (linkedTo && existingConvo.linkedTo?.id !== linkedTo.id) {
                linkConversation(existingConvo.id, linkedTo);
            }
            selectConversation(existingConvo.id);
            return existingConvo.id;
        }

        // Create new WhatsApp conversation
        const newConvoId = generateId();
        const newConvo: Conversation = {
            id: newConvoId,
            participants: [user.id, 'whatsapp_user'], // 'whatsapp_user' is a placeholder for the client
            type: 'direct',
            channel: 'whatsapp',
            phoneNumber: client.phone,
            title: client.name,
            avatar: client.photo,
            linkedTo: linkedTo || {
                type: 'client',
                id: client.id,
                name: client.name
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            unreadCount: 0
        };

        setState(prev => ({
            ...prev,
            conversations: [newConvo, ...prev.conversations],
            messages: { ...prev.messages, [newConvoId]: [] },
            activeConversationId: newConvoId
        }));

        return newConvoId;
    }, [user, state.conversations, selectConversation]);





    const deleteConversation = useCallback((conversationId: string) => {
        setState(prev => ({
            ...prev,
            conversations: prev.conversations.filter(c => c.id !== conversationId),
            activeConversationId: prev.activeConversationId === conversationId ? null : prev.activeConversationId
        }));
        toast.success('Conversa removida');
    }, []);

    const archiveConversation = useCallback((conversationId: string) => {
        setState(prev => ({
            ...prev,
            conversations: prev.conversations.map(c =>
                c.id === conversationId ? { ...c, status: 'archived' as const } : c
            ).filter(c => c.status !== 'archived')
        }));
        toast.success('Conversa arquivada');
    }, []);

    const receiveMessage = useCallback((conversationId: string, content: string, senderName: string = 'Cliente') => {
        const newMessage: ChatMessage = {
            id: generateId(),
            conversationId,
            senderId: 'external_user',
            senderName: senderName,
            content,
            type: 'text',
            timestamp: new Date().toISOString(),
            readBy: [],
            status: 'delivered'
        };

        setState(prev => {
            const updatedMessages = {
                ...prev.messages,
                [conversationId]: [...(prev.messages[conversationId] || []), newMessage]
            };

            const updatedConversations = prev.conversations.map(c =>
                c.id === conversationId
                    ? {
                        ...c,
                        lastMessage: newMessage,
                        updatedAt: newMessage.timestamp,
                        unreadCount: c.id === prev.activeConversationId ? 0 : (c.unreadCount || 0) + 1
                    }
                    : c
            );

            updatedConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

            return {
                ...prev,
                messages: updatedMessages,
                conversations: updatedConversations
            };
        });
    }, []);

    return (
        <ChatContext.Provider value={{
            state,
            sendMessage,
            createConversation,
            selectConversation,
            markAsRead,
            linkConversation,
            deleteConversation,
            archiveConversation,
            startWhatsAppConversation,
            receiveMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
