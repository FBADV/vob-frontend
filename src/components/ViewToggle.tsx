import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
    view: 'list' | 'grid';
    onViewChange: (view: 'list' | 'grid') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
    return (
        <div className="flex items-center gap-1 bg-[rgb(var(--bg-tertiary))] p-1 rounded-xl border border-[rgb(var(--border-subtle))]">
            <button
                onClick={() => onViewChange('grid')}
                className={`p-2 rounded-lg transition-all ${view === 'grid'
                        ? 'bg-[rgb(var(--accent-primary))] text-white shadow-md'
                        : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-secondary))] hover:text-[rgb(var(--text-primary))]'
                    }`}
                title="Visualização em Cards"
            >
                <LayoutGrid size={18} />
            </button>
            <button
                onClick={() => onViewChange('list')}
                className={`p-2 rounded-lg transition-all ${view === 'list'
                        ? 'bg-[rgb(var(--accent-primary))] text-white shadow-md'
                        : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-secondary))] hover:text-[rgb(var(--text-primary))]'
                    }`}
                title="Visualização em Lista"
            >
                <List size={18} />
            </button>
        </div>
    );
};
