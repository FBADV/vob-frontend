export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    type: 'text' | 'audio' | 'voice-to-text' | 'image' | 'file';
    audioUrl?: string;
    fileUrl?: string;
    fileName?: string;
    timestamp: string;
    readBy: string[]; // Array of user IDs
    status?: 'sent' | 'delivered' | 'read' | 'failed';
    linkedTo?: {
        type: 'process' | 'client';
        id: string;
        name: string;
    };
    reactions?: {
        emoji: string;
        users: string[];
    }[];
}

export interface Conversation {
    id: string;
    participants: string[]; // User IDs
    type: 'direct' | 'group';
    channel?: 'internal' | 'whatsapp';
    phoneNumber?: string; // For WhatsApp conversations
    title?: string; // For groups
    avatar?: string; // For groups
    lastMessage?: ChatMessage;
    createdAt: string;
    updatedAt: string;
    unreadCount?: number; // Computed for current user
    linkedTo?: {
        type: 'process' | 'client';
        id: string;
        name: string;
    };
    status?: 'active' | 'archived';
}

export interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Record<string, ChatMessage[]>; // Keyed by conversationId
    isLoading: boolean;
    error: string | null;
}

export interface ChatContextType {
    state: ChatState;
    sendMessage: (conversationId: string, content: string, type?: ChatMessage['type'], metadata?: Partial<ChatMessage>) => Promise<void>;
    createConversation: (participantIds: string[], title?: string) => Promise<string>;
    selectConversation: (conversationId: string) => void;
    markAsRead: (conversationId: string) => void;
    linkConversation: (conversationId: string, linkData: { type: 'process' | 'client', id: string, name: string }) => void;
    deleteConversation: (conversationId: string) => void;
    archiveConversation: (conversationId: string) => void;
    startWhatsAppConversation: (
        client: { id: string; name: string; phone: string; photo?: string },
        linkedTo?: { type: 'process' | 'client'; id: string; name: string }
    ) => Promise<string>;
    receiveMessage: (conversationId: string, content: string, senderName?: string) => void;
}
