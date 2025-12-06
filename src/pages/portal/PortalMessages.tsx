import React, { useState, useEffect } from 'react';
import { Send, Inbox, MessageSquare, Clock, Mail } from 'lucide-react';
import { usePortalAuth } from '../../hooks/usePortalAuth';
import { portalDataService } from '../../services/portalData.service';
import toast from 'react-hot-toast';

interface Message {
    id: string;
    title: string;
    message: string;
    direction: 'from_client' | 'to_client';
    read: boolean;
    createdAt: string;
}

export const PortalMessages: React.FC = () => {
    const { client } = usePortalAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
    const [composing, setComposing] = useState(false);

    // Compose form
    const [newTitle, setNewTitle] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (client) {
            fetchMessages();
        }
    }, [client]);

    const fetchMessages = async () => {
        if (!client) return;

        setLoading(true);
        try {
            const data = await portalDataService.getClientMessages(client.id);
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Erro ao carregar mensagens');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!client || !newTitle.trim() || !newMessage.trim()) return;

        setSending(true);
        try {
            await portalDataService.sendMessage(client.id, {
                title: newTitle,
                message: newMessage
            });

            toast.success('Mensagem enviada com sucesso!');
            setNewTitle('');
            setNewMessage('');
            setComposing(false);
            await fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Erro ao enviar mensagem');
        } finally {
            setSending(false);
        }
    };

    const handleMarkAsRead = async (messageId: string) => {
        try {
            await portalDataService.markMessageRead(messageId);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId ? { ...msg, read: true } : msg
                )
            );
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (days === 1) {
            return `Ontem às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (days < 7) {
            return `${days} dias atrás`;
        } else {
            return date.toLocaleDateString('pt-BR');
        }
    };

    const receivedMessages = messages.filter(m => m.direction === 'to_client');
    const sentMessages = messages.filter(m => m.direction === 'from_client');
    const unreadCount = receivedMessages.filter(m => !m.read).length;

    const displayMessages = activeTab === 'received' ? receivedMessages : sentMessages;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--accent-primary))] mx-auto mb-4"></div>
                    <p className="text-[rgb(var(--text-secondary))]">Carregando mensagens...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Mensagens</h1>
                    <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                        Sua comunicação com o escritório
                    </p>
                </div>

                <button
                    onClick={() => setComposing(!composing)}
                    className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--accent-primary))] text-white rounded-lg hover:brightness-110 transition-all"
                >
                    <Send size={18} />
                    Nova Mensagem
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-[rgb(var(--border-primary))]">
                <button
                    onClick={() => setActiveTab('received')}
                    className={`pb-3 px-4 border-b-2 transition-all ${activeTab === 'received'
                            ? 'border-[rgb(var(--accent-primary))] text-[rgb(var(--accent-primary))] font-semibold'
                            : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Inbox size={18} />
                        Recebidas
                        {unreadCount > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-[rgb(var(--accent-primary))] text-white text-xs rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </button>

                <button
                    onClick={() => setActiveTab('sent')}
                    className={`pb-3 px-4 border-b-2 transition-all ${activeTab === 'sent'
                            ? 'border-[rgb(var(--accent-primary))] text-[rgb(var(--accent-primary))] font-semibold'
                            : 'border-transparent text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Send size={18} />
                        Enviadas
                    </div>
                </button>
            </div>

            {/* Compose Message Form */}
            {composing && (
                <div className="card-premium">
                    <form onSubmit={handleSendMessage} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                Assunto
                            </label>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Digite o assunto..."
                                className="w-full px-4 py-2 bg-[rgb(var(--bg-tertiary))] border border-[rgb(var(--border-primary))] rounded-lg text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                Mensagem
                            </label>
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                rows={6}
                                className="w-full px-4 py-2 bg-[rgb(var(--bg-tertiary))] border border-[rgb(var(--border-primary))] rounded-lg text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] resize-none"
                                required
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setComposing(false)}
                                className="px-4 py-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                                disabled={sending}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={sending || !newTitle.trim() || !newMessage.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--accent-primary))] text-white rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {sending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Enviar
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Messages List */}
            <div className="space-y-3">
                {displayMessages.length === 0 ? (
                    <div className="card-premium text-center py-12">
                        <MessageSquare className="mx-auto text-[rgb(var(--text-tertiary))] mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">
                            {activeTab === 'received' ? 'Nenhuma mensagem recebida' : 'Nenhuma mensagem enviada'}
                        </h3>
                        <p className="text-sm text-[rgb(var(--text-secondary))]">
                            {activeTab === 'received'
                                ? 'Mensagens do escritório aparecerão aqui'
                                : 'Suas mensagens enviadas aparecerão aqui'}
                        </p>
                    </div>
                ) : (
                    displayMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`card-premium cursor-pointer transition-all ${!msg.read && msg.direction === 'to_client'
                                    ? 'border-2 border-[rgb(var(--accent-primary))]'
                                    : ''
                                }`}
                            onClick={() => {
                                if (!msg.read && msg.direction === 'to_client') {
                                    handleMarkAsRead(msg.id);
                                }
                            }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className={`p-3 rounded-lg ${msg.direction === 'to_client'
                                            ? 'bg-[rgb(var(--accent-primary))]/10'
                                            : 'bg-[rgb(var(--bg-tertiary))]'
                                        }`}>
                                        <Mail
                                            className={msg.direction === 'to_client'
                                                ? 'text-[rgb(var(--accent-primary))]'
                                                : 'text-[rgb(var(--text-tertiary))]'
                                            }
                                            size={20}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-base font-semibold text-[rgb(var(--text-primary))] truncate">
                                                {msg.title}
                                            </h3>
                                            {!msg.read && msg.direction === 'to_client' && (
                                                <span className="px-2 py-0.5 bg-[rgb(var(--accent-primary))] text-white text-xs rounded-full">
                                                    Nova
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[rgb(var(--text-secondary))] line-clamp-2">
                                            {msg.message}
                                        </p>
                                        <div className="flex items-center gap-1 mt-2 text-xs text-[rgb(var(--text-tertiary))]">
                                            <Clock size={12} />
                                            {formatDate(msg.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
