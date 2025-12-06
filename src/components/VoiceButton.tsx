import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Type declarations for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface VoiceButtonProps {
    onOpenModal?: (modalType: 'process' | 'client' | 'service' | 'event') => void;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ onOpenModal }) => {
    const [listening, setListening] = useState(false);
    const [recognition, setRecognition] = useState<any | null>(null);
    const [supported, setSupported] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for Speech Recognition API support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSupported(false);
            return;
        }

        const recognizer = new SpeechRecognition();
        recognizer.lang = 'pt-BR';
        recognizer.interimResults = false;
        recognizer.maxAlternatives = 1;
        recognizer.continuous = false;

        recognizer.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript.trim().toLowerCase();
            console.log('Voice command:', transcript);
            handleCommand(transcript);
        };

        recognizer.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setListening(false);

            if (event.error === 'not-allowed') {
                toast.error('Permissão de microfone negada');
            } else if (event.error === 'no-speech') {
                toast.error('Nenhum comando detectado');
            } else {
                toast.error('Erro ao processar comando');
            }
        };

        recognizer.onend = () => {
            setListening(false);
        };

        setRecognition(recognizer);

        return () => {
            if (recognizer) {
                recognizer.abort();
            }
        };
    }, []);

    const handleCommand = useCallback((text: string) => {
        // Navigation commands
        if (text.includes('dashboard') || text.includes('painel')) {
            navigate('/dashboard');
            toast.success('Abrindo Dashboard');
        } else if (text.includes('processo')) {
            if (text.includes('novo') || text.includes('criar')) {
                onOpenModal?.('process');
                toast.success('Abrindo cadastro de processo');
            } else {
                navigate('/processes');
                toast.success('Abrindo Processos');
            }
        } else if (text.includes('cliente')) {
            if (text.includes('novo') || text.includes('criar')) {
                onOpenModal?.('client');
                toast.success('Abrindo cadastro de cliente');
            } else {
                navigate('/clients');
                toast.success('Abrindo Clientes');
            }
        } else if (text.includes('atendimento') || text.includes('serviço')) {
            if (text.includes('novo') || text.includes('criar')) {
                onOpenModal?.('service');
                toast.success('Abrindo cadastro de atendimento');
            } else {
                navigate('/services');
                toast.success('Abrindo Atendimentos');
            }
        } else if (text.includes('agenda') || text.includes('calendário')) {
            if (text.includes('novo') || text.includes('criar') || text.includes('evento')) {
                onOpenModal?.('event');
                toast.success('Abrindo novo evento');
            } else {
                navigate('/agenda');
                toast.success('Abrindo Agenda');
            }
        } else if (text.includes('financeiro') || text.includes('finanças')) {
            navigate('/financial');
            toast.success('Abrindo Financeiro');
        } else if (text.includes('configurações') || text.includes('configuração')) {
            navigate('/settings');
            toast.success('Abrindo Configurações');
        } else if (text.includes('ajuda') || text.includes('help')) {
            toast.success('Comandos disponíveis: "abrir processos", "novo cliente", "abrir agenda"');
        } else {
            toast.error('Comando não reconhecido. Tente: "abrir processos" ou "novo cliente"');
        }
    }, [navigate, onOpenModal]);

    const startListening = async () => {
        if (!recognition || !supported) {
            toast.error('Comando por voz não suportado neste navegador');
            return;
        }

        try {
            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true });
            setListening(true);
            recognition.start();
            toast.success('Ouvindo... Fale seu comando');
        } catch (err) {
            console.error('Microphone permission error:', err);
            toast.error('Permissão de microfone negada');
        }
    };

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
            setListening(false);
        }
    };

    if (!supported) {
        return (
            <button
                className="p-2 text-gray-300 cursor-not-allowed opacity-50"
                title="Comando de voz não suportado neste navegador"
            >
                <MicOff size={20} />
            </button>
        );
    }

    return (
        <button
            onClick={() => {
                console.log('Voice button clicked. Listening:', listening);
                listening ? stopListening() : startListening();
            }}
            className={`p-2 rounded-lg transition-all ${listening
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                : 'hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'
                }`}
            title={listening ? 'Ouvindo... Clique para parar' : 'Comando por voz (Clique para falar)'}
            aria-label={listening ? 'Parar comando por voz' : 'Iniciar comando por voz'}
        >
            <Mic size={20} className={listening ? 'animate-bounce' : ''} />
        </button>
    );
};
