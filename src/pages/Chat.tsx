import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useGlobalData } from '../context/GlobalDataContext';
import { ChatMessageInput } from '../components/chat/ChatMessageInput';
import { ChatHeaderActions } from '../components/chat/ChatHeaderActions';
import { Search, Plus, Phone, Video, Info, ArrowLeft, CheckCheck, Check, MessageCircle, Send } from 'lucide-react';

export const Chat: React.FC = () => {
    const { state, sendMessage, selectConversation, createConversation, receiveMessage } = useChat();
    const { user } = useGlobalData();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeConversation = state.conversations.find(c => c.id === state.activeConversationId);
    const messages = state.activeConversationId ? state.messages[state.activeConversationId] || [] : [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleCreateNew = async () => {
        // Mock creating a new conversation
        // In real app, would open a user selector modal
        const title = prompt('Nome do grupo (opcional):');
        await createConversation([], title || undefined);
    };

    const handleSimulateReply = () => {
        if (!activeConversation) return;

        // Simulate incoming message
        const responses = [
            "Olá! Tudo bem?",
            "Pode me enviar o contrato?",
            "Combinado, obrigado!",
            "Vou verificar e te retorno.",
            "Ok, aguardo."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        receiveMessage(activeConversation.id, randomResponse, activeConversation.title || 'Cliente');
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-4 animate-fade-in">
            {/* Sidebar (Conversations List) */}
            <div className={`w-full md:w-80 flex flex-col bg-[rgb(var(--card-bg))] rounded-2xl border border-[rgb(var(--border-subtle))] overflow-hidden ${state.activeConversationId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-[rgb(var(--border-subtle))]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Conversas</h2>
                    </div>
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar conversas..."
                            className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--bg-secondary))] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/20 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleCreateNew}
                        className="w-full py-2.5 bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/90 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium text-sm shadow-lg shadow-[rgb(var(--accent-primary))]/20 active:scale-95"
                    >
                        <Plus size={18} />
                        Nova Conversa
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {state.conversations.map(convo => (
                        <button
                            key={convo.id}
                            onClick={() => selectConversation(convo.id)}
                            className={`w-full p-4 flex items-center gap-3 hover:bg-[rgb(var(--bg-secondary))] transition-colors border-b border-[rgb(var(--border-subtle))] text-left ${state.activeConversationId === convo.id ? 'bg-[rgb(var(--bg-secondary))] border-l-4 border-l-[rgb(var(--accent-primary))]' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                {convo.title ? convo.title[0] : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-semibold text-[rgb(var(--text-primary))] truncate flex items-center gap-1">
                                        {convo.channel === 'whatsapp' && <MessageCircle size={14} className="text-green-500" />}
                                        {convo.title || 'Usuário'}
                                    </h3>
                                    <span className="text-xs text-[rgb(var(--text-tertiary))]">
                                        {convo.lastMessage ? formatTime(convo.lastMessage.timestamp) : ''}
                                    </span>
                                </div>
                                <p className="text-sm text-[rgb(var(--text-secondary))] truncate">
                                    {convo.lastMessage?.content || 'Nova conversa'}
                                </p>
                            </div>
                            {convo.unreadCount ? (
                                <div className="w-5 h-5 rounded-full bg-[rgb(var(--accent-primary))] text-white text-xs flex items-center justify-center font-bold">
                                    {convo.unreadCount}
                                </div>
                            ) : null}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-[rgb(var(--card-bg))] rounded-2xl border border-[rgb(var(--border-subtle))] overflow-hidden ${!state.activeConversationId ? 'hidden md:flex' : 'flex'}`}>
                {state.activeConversationId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center bg-[rgb(var(--bg-secondary))]/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => selectConversation('')} // Deselect (hacky but works for now if selectConversation handles empty string or we add deselect)
                                    className="md:hidden p-2 -ml-2 text-[rgb(var(--text-secondary))]"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                    {activeConversation?.title ? activeConversation.title[0] : 'U'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                                        {activeConversation?.title || 'Usuário'}
                                        {activeConversation?.channel === 'whatsapp' && (
                                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide border border-green-200">
                                                WhatsApp
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-xs text-[rgb(var(--text-secondary))] flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleSimulateReply}
                                className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
                                title="Simular Resposta"
                            >
                                <Send size={20} className="rotate-180" />
                            </button>
                            <button className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors">
                                <Phone size={20} />
                            </button>
                            <button className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors">
                                <Video size={20} />
                            </button>
                            <button className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors">
                                <Info size={20} />
                            </button>
                            {activeConversation && <ChatHeaderActions conversationId={activeConversation.id} />}
                        </div>


                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[rgb(var(--bg-tertiary))]/30">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${isMe
                                            ? 'bg-[rgb(var(--accent-primary))] text-white rounded-tr-none'
                                            : 'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border-subtle))] rounded-tl-none'
                                            }`}>
                                            {!isMe && <p className="text-xs font-bold mb-1 opacity-70">{msg.senderName}</p>}

                                            {msg.type === 'audio' ? (
                                                <div className="min-w-[200px]">
                                                    <audio controls src={msg.content} className="w-full h-8" />
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            )}

                                            <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-white/70' : 'text-[rgb(var(--text-tertiary))]'}`}>
                                                <span>{formatTime(msg.timestamp)}</span>
                                                {isMe && (
                                                    msg.status === 'read' ? <CheckCheck size={14} className="text-blue-200" /> :
                                                        msg.status === 'delivered' ? <CheckCheck size={14} /> :
                                                            <Check size={14} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <ChatMessageInput
                            onSend={(content, type) => {
                                if (activeConversation) {
                                    sendMessage(activeConversation.id, content, type);
                                }
                            }}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[rgb(var(--text-tertiary))]">
                        <div className="w-24 h-24 rounded-full bg-[rgb(var(--bg-secondary))] flex items-center justify-center mb-4">
                            <Search size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">Selecione uma conversa</h3>
                        <p>Escolha um contato ou grupo para começar a conversar</p>
                    </div>
                )}
            </div>
        </div >
    );
};
