import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Share2, X } from 'lucide-react';
import type { Process, ProcessMovement } from '../types';
import { formatCNJNumber } from '../utils/formatters';
import { useGlobalData } from '../context/GlobalDataContext';

interface WhatsAppShareButtonProps {
    process: Process;
    movement: ProcessMovement;
}

export const WhatsAppShareButton: React.FC<WhatsAppShareButtonProps> = ({ process, movement }) => {
    const { settings } = useGlobalData();
    const [showModal, setShowModal] = useState(false);
    const [customMessage, setCustomMessage] = useState('');

    const formatMessage = (template: string) => {
        return template
            .replace(/{cliente}/g, process.clientName || 'Cliente')
            .replace(/{processo}/g, formatCNJNumber(process.number))
            .replace(/{movimentacao}/g, movement.title)
            .replace(/{descricao}/g, movement.description || 'Sem detalhes adicionais.')
            .replace(/{data}/g, new Date(movement.date).toLocaleDateString('pt-BR'));
    };

    const defaultTemplate = settings?.integrations?.whatsappTemplate ||
        `Olá, {cliente}.\n\nAtualização do seu processo: {processo}\n\n📅 Data: {data}\n📝 Movimentação: {movimentacao}\n\nℹ️ Detalhes: {descricao}\n\nAtenciosamente,\n[Seu Nome/Escritório]`;

    useEffect(() => {
        if (showModal) {
            setCustomMessage(formatMessage(defaultTemplate));
        }
    }, [showModal, defaultTemplate, process, movement]);

    const handleShare = () => {
        const messageToSend = customMessage;
        const encodedMessage = encodeURIComponent(messageToSend);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
        setShowModal(false);
        setCustomMessage('');
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="p-1.5 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="Compartilhar via WhatsApp"
            >
                <Share2 size={14} />
            </button>

            {showModal && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-[rgb(var(--bg-secondary))] rounded-2xl shadow-2xl w-full max-w-md p-6 border border-[rgb(var(--border-subtle))] animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                                <Share2 size={20} className="text-green-600" />
                                Compartilhar via WhatsApp
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setCustomMessage('');
                                }}
                                className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-full text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                                Mensagem (opcional - deixe em branco para usar padrão)
                            </label>
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder={formatMessage(defaultTemplate)}
                                rows={8}
                                className="input-premium w-full resize-none text-sm font-mono"
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setCustomMessage('');
                                }}
                                className="px-4 py-2 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleShare}
                                className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-green-600/20"
                            >
                                <Share2 size={18} />
                                Compartilhar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
