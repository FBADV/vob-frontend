import React, { useState, useRef } from 'react';
import { Send, Mic, Smile, Paperclip, StopCircle } from 'lucide-react';
import { LegalEmojiPicker } from './LegalEmojiPicker';

interface ChatMessageInputProps {
    onSend: (content: string, type: 'text' | 'audio' | 'voice-to-text') => void;
}

export const ChatMessageInput: React.FC<ChatMessageInputProps> = ({ onSend }) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const handleSend = () => {
        if (message.trim()) {
            onSend(message, 'text');
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    onSend(base64data, 'audio');
                };
                reader.readAsDataURL(blob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Erro ao acessar microfone. Verifique as permissões.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRecording(false);
            setRecordingTime(0);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-4 border-t border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-secondary))] relative">
            {showEmojiPicker && (
                <LegalEmojiPicker
                    onSelect={(emoji) => setMessage(prev => prev + emoji)}
                    onClose={() => setShowEmojiPicker(false)}
                />
            )}

            <div className="flex items-end gap-2">
                <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] transition-colors"
                >
                    <Smile size={24} />
                </button>

                <button className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--accent-primary))] transition-colors">
                    <Paperclip size={24} />
                </button>

                <div className="flex-1 bg-[rgb(var(--bg-primary))] rounded-xl border border-[rgb(var(--border-subtle))] focus-within:border-[rgb(var(--accent-primary))] transition-colors flex items-center px-3 py-2">
                    {isRecording ? (
                        <div className="flex-1 flex items-center gap-3 text-red-500 animate-pulse">
                            <Mic size={20} />
                            <span className="font-medium">Gravando... {formatTime(recordingTime)}</span>
                        </div>
                    ) : (
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite sua mensagem..."
                            className="w-full bg-transparent border-none outline-none resize-none max-h-32 min-h-[24px] text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))]"
                            rows={1}
                            style={{ height: 'auto', minHeight: '24px' }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = `${target.scrollHeight}px`;
                            }}
                        />
                    )}
                </div>

                {message.trim() ? (
                    <button
                        onClick={handleSend}
                        className="p-3 bg-[rgb(var(--accent-primary))] text-white rounded-xl hover:brightness-110 transition-all shadow-lg hover:shadow-[rgb(var(--accent-primary))]/20"
                    >
                        <Send size={20} />
                    </button>
                ) : (
                    <button
                        onClick={toggleRecording}
                        className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'}`}
                    >
                        {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                    </button>
                )}
            </div>
        </div>
    );
};
