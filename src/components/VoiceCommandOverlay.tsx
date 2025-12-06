import React, { useEffect, useState } from 'react';
import { Mic, X, Command, CheckCircle, AlertCircle } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useCommandParser } from '../hooks/useCommandParser';

interface VoiceCommandOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export const VoiceCommandOverlay: React.FC<VoiceCommandOverlayProps> = ({ isOpen, onClose }) => {
    const { transcript, interimTranscript, startListening, stopListening, resetTranscript, error } = useVoiceRecognition();
    const { processCommand } = useCommandParser();
    const [status, setStatus] = useState<'listening' | 'success' | 'error'>('listening');
    const [feedbackMessage, setFeedbackMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            startListening();
            setStatus('listening');
            setFeedbackMessage('');
        } else {
            stopListening();
            resetTranscript();
        }
    }, [isOpen, startListening, stopListening, resetTranscript]);

    // Process transcript
    useEffect(() => {
        if (!transcript || status !== 'listening') return;

        // Debounce or check immediately?
        // Since we want fast response, let's check immediately.
        // The parser checks if the transcript *contains* the keyword.
        // If we have "novo processo", it executes.

        const result = processCommand(transcript);
        if (result.executed) {
            setStatus('success');
            setFeedbackMessage(`Comando reconhecido: ${result.command}`);
            stopListening();

            // Close after delay
            setTimeout(() => {
                onClose();
            }, 1500);
        }
    }, [transcript, processCommand, status, stopListening, onClose]);

    // Auto-close on silence or specific commands could be implemented here
    // For now, we just show the transcript

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg mx-4">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl overflow-hidden border border-[rgb(var(--accent-primary))]/30">
                    {/* Header */}
                    <div className={`p-6 text-white text-center relative overflow-hidden transition-colors duration-500 ${status === 'success' ? 'bg-green-500' :
                        status === 'error' ? 'bg-red-500' :
                            'bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))]'
                        }`}>
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className={`p-4 rounded-full bg-white/20 backdrop-blur-md ${status === 'listening' ? 'animate-pulse-ring' : ''}`}>
                                {status === 'success' ? <CheckCircle size={32} className="text-white" /> :
                                    status === 'error' ? <AlertCircle size={32} className="text-white" /> :
                                        <Mic size={32} className="text-white" />}
                            </div>
                            <h3 className="text-xl font-bold">
                                {status === 'success' ? 'Sucesso!' :
                                    status === 'error' ? 'Erro' :
                                        'Comando de Voz'}
                            </h3>
                            <p className="text-white/80 text-sm">
                                {status === 'success' ? 'Executando ação...' : 'Diga um comando, ex: "Novo Processo"'}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 min-h-[200px] flex flex-col items-center justify-center text-center">
                        {error ? (
                            <div className="text-red-500 font-medium flex items-center gap-2">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        ) : status === 'success' ? (
                            <div className="text-green-600 dark:text-green-400 font-bold text-lg animate-scale-in">
                                {feedbackMessage}
                            </div>
                        ) : (
                            <div className="space-y-4 w-full">
                                <div className="text-2xl font-medium text-[rgb(var(--text-primary))] min-h-[40px]">
                                    {transcript || interimTranscript || "Ouvindo..."}
                                </div>

                                {interimTranscript && (
                                    <div className="text-[rgb(var(--text-tertiary))] text-sm animate-pulse">
                                        {interimTranscript}
                                    </div>
                                )}

                                {!transcript && !interimTranscript && (
                                    <div className="flex justify-center gap-1 mt-4">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className="w-1.5 bg-[rgb(var(--accent-primary))] rounded-full animate-wave"
                                                style={{
                                                    height: '24px',
                                                    animationDelay: `${i * 0.1}s`
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Suggestions */}
                    <div className="bg-[rgb(var(--bg-tertiary))] p-4 border-t border-[rgb(var(--border-subtle))]">
                        <div className="flex flex-wrap justify-center gap-2">
                            {['Ir para Dashboard', 'Novo Cliente', 'Novo Processo', 'Buscar Cliente'].map((cmd) => (
                                <span key={cmd} className="px-3 py-1.5 rounded-lg bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] text-xs font-medium text-[rgb(var(--text-secondary))] flex items-center gap-1.5">
                                    <Command size={10} />
                                    {cmd}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes wave {
                    0%, 100% { height: 10px; opacity: 0.5; }
                    50% { height: 24px; opacity: 1; }
                }
                .animate-wave {
                    animation: wave 1s ease-in-out infinite;
                }
                .animate-pulse-ring {
                    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
                    animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse-ring {
                    0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
                    70% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
                }
            `}</style>
        </div>
    );
};
