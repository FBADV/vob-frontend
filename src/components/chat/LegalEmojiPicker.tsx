import React from 'react';

const LEGAL_EMOJIS = [
    '⚖️', '📜', '🔨', '📑', '✅', '❌', '⏳', '🏛️', '👨‍⚖️', '👩‍⚖️',
    '💼', '🖊️', '📅', '📊', '📈', '🤝', '🔒', '🔓', '📢', '💬',
    '📝', '🗂️', '📂', '📫', '🔔', '⚠️', '🛑', '🟢', '🔵', '🔴'
];

interface LegalEmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

export const LegalEmojiPicker: React.FC<LegalEmojiPickerProps> = ({ onSelect, onClose }) => {
    return (
        <div className="absolute bottom-full mb-2 left-0 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] rounded-xl shadow-xl p-3 w-64 animate-fade-in z-50">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-[rgb(var(--border-subtle))]">
                <span className="text-xs font-bold text-[rgb(var(--text-secondary))]">EMOJIS JURÍDICOS</span>
                <button onClick={onClose} className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] text-xs">
                    Fechar
                </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
                {LEGAL_EMOJIS.map((emoji, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            onSelect(emoji);
                            onClose();
                        }}
                        className="text-xl hover:bg-[rgb(var(--bg-tertiary))] rounded p-1 transition-colors"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};
