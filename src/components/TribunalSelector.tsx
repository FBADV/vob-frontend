import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, Star } from 'lucide-react';
import { TRIBUNALS, getTribunalsByCategory, searchTribunals } from '../services/DataJudService';
import type { Tribunal, TribunalCategory } from '../types';

interface TribunalSelectorProps {
    selectedTribunals: string[];
    onSelectionChange: (tribunals: string[]) => void;
    maxSelection?: number;
    showFavorites?: boolean;
}

export const TribunalSelector: React.FC<TribunalSelectorProps> = ({
    selectedTribunals,
    onSelectionChange,
    maxSelection,
    showFavorites = true
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<TribunalCategory | 'all'>('all');
    const [favorites, setFavorites] = useState<string[]>(['tjsp', 'tjrj', 'tjmg']); // Default favorites

    const categories: Array<{ id: TribunalCategory | 'all'; label: string }> = [
        { id: 'all', label: 'Todos' },
        { id: 'superior', label: 'Superiores' },
        { id: 'federal', label: 'Federal' },
        { id: 'estadual', label: 'Estadual' },
        { id: 'trabalho', label: 'Trabalho' },
        { id: 'eleitoral', label: 'Eleitoral' },
        { id: 'militar', label: 'Militar' },
    ];

    const filteredTribunals = useMemo(() => {
        let tribunals = TRIBUNALS;

        if (searchTerm) {
            tribunals = searchTribunals(searchTerm);
        } else if (activeCategory !== 'all') {
            tribunals = getTribunalsByCategory(activeCategory);
        }

        return tribunals;
    }, [searchTerm, activeCategory]);

    const favoriteTribunals = useMemo(() => {
        return TRIBUNALS.filter(t => favorites.includes(t.id));
    }, [favorites]);

    const handleToggleTribunal = (tribunalId: string) => {
        if (selectedTribunals.includes(tribunalId)) {
            onSelectionChange(selectedTribunals.filter(id => id !== tribunalId));
        } else {
            if (maxSelection && selectedTribunals.length >= maxSelection) {
                return;
            }
            onSelectionChange([...selectedTribunals, tribunalId]);
        }
    };

    const handleToggleFavorite = (tribunalId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (favorites.includes(tribunalId)) {
            setFavorites(favorites.filter(id => id !== tribunalId));
        } else {
            setFavorites([...favorites, tribunalId]);
        }
    };

    const handleSelectAll = () => {
        const currentList = searchTerm ? filteredTribunals :
            activeCategory !== 'all' ? getTribunalsByCategory(activeCategory) : TRIBUNALS;

        if (maxSelection) {
            onSelectionChange(currentList.slice(0, maxSelection).map(t => t.id));
        } else {
            onSelectionChange(currentList.map(t => t.id));
        }
    };

    const handleClearAll = () => {
        onSelectionChange([]);
    };

    const getSelectedNames = () => {
        if (selectedTribunals.length === 0) return 'Selecione tribunais';
        if (selectedTribunals.length === 1) {
            const tribunal = TRIBUNALS.find(t => t.id === selectedTribunals[0]);
            return tribunal?.acronym || 'Tribunal selecionado';
        }
        return `${selectedTribunals.length} tribunais selecionados`;
    };

    return (
        <div className="relative">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="input-premium flex items-center justify-between cursor-pointer hover:border-[rgb(var(--accent-primary))] transition-colors"
            >
                <span className="text-[rgb(var(--text-primary))] font-medium">{getSelectedNames()}</span>
                <ChevronDown size={20} className={`text-[rgb(var(--text-tertiary))] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-50 mt-2 w-full max-w-2xl bg-[rgb(var(--bg-secondary))] rounded-xl shadow-2xl border border-[rgb(var(--border-subtle))] max-h-[600px] overflow-hidden animate-scale-in">
                        {/* Header */}
                        <div className="p-4 border-b border-[rgb(var(--border-subtle))]">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex-1 relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar tribunal..."
                                        className="input-premium w-full pl-10 py-2 text-sm"
                                    />
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-[rgb(var(--accent-primary))] hover:underline font-medium"
                                    >
                                        Selecionar todos
                                    </button>
                                    <span className="text-[rgb(var(--text-tertiary))]">|</span>
                                    <button
                                        onClick={handleClearAll}
                                        className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:underline font-medium"
                                    >
                                        Limpar
                                    </button>
                                </div>
                                {maxSelection && (
                                    <span className="text-[rgb(var(--text-tertiary))]">
                                        {selectedTribunals.length}/{maxSelection}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Categories */}
                        {!searchTerm && (
                            <div className="px-4 py-3 border-b border-[rgb(var(--border-subtle))] flex gap-2 overflow-x-auto custom-scrollbar">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors uppercase tracking-wide ${activeCategory === cat.id
                                            ? 'bg-[rgb(var(--accent-primary))] text-white shadow-lg shadow-[rgb(var(--accent-primary))]/20'
                                            : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))]/80 hover:text-[rgb(var(--text-primary))]'
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Tribunals List */}
                        <div className="overflow-y-auto max-h-[400px] custom-scrollbar bg-[rgb(var(--bg-primary))]/30">
                            {/* Favorites */}
                            {showFavorites && !searchTerm && activeCategory === 'all' && favoriteTribunals.length > 0 && (
                                <div className="p-4 border-b border-[rgb(var(--border-subtle))]">
                                    <h4 className="text-xs font-bold text-[rgb(var(--text-tertiary))] mb-2 uppercase tracking-wider">
                                        Favoritos
                                    </h4>
                                    <div className="space-y-1">
                                        {favoriteTribunals.map(tribunal => (
                                            <TribunalItem
                                                key={tribunal.id}
                                                tribunal={tribunal}
                                                isSelected={selectedTribunals.includes(tribunal.id)}
                                                isFavorite={favorites.includes(tribunal.id)}
                                                onToggle={() => handleToggleTribunal(tribunal.id)}
                                                onToggleFavorite={(e) => handleToggleFavorite(tribunal.id, e)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Tribunals */}
                            <div className="p-4">
                                {filteredTribunals.length === 0 ? (
                                    <div className="text-center text-[rgb(var(--text-tertiary))] py-8 font-medium">
                                        Nenhum tribunal encontrado
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredTribunals.map(tribunal => (
                                            <TribunalItem
                                                key={tribunal.id}
                                                tribunal={tribunal}
                                                isSelected={selectedTribunals.includes(tribunal.id)}
                                                isFavorite={favorites.includes(tribunal.id)}
                                                onToggle={() => handleToggleTribunal(tribunal.id)}
                                                onToggleFavorite={(e) => handleToggleFavorite(tribunal.id, e)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

interface TribunalItemProps {
    tribunal: Tribunal;
    isSelected: boolean;
    isFavorite: boolean;
    onToggle: () => void;
    onToggleFavorite: (e: React.MouseEvent) => void;
}

const TribunalItem: React.FC<TribunalItemProps> = ({
    tribunal,
    isSelected,
    isFavorite,
    onToggle,
    onToggleFavorite
}) => {
    return (
        <div
            onClick={onToggle}
            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${isSelected
                ? 'bg-[rgb(var(--accent-primary))]/10 border border-[rgb(var(--accent-primary))] shadow-sm'
                : 'hover:bg-[rgb(var(--bg-tertiary))] border border-transparent'
                }`}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected
                    ? 'bg-[rgb(var(--accent-primary))] border-[rgb(var(--accent-primary))]'
                    : 'border-[rgb(var(--border-default))] bg-[rgb(var(--bg-primary))]'
                    }`}>
                    {isSelected && <Check size={14} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-[rgb(var(--text-primary))]">
                            {tribunal.acronym}
                        </span>
                        {tribunal.region && (
                            <span className="text-xs text-[rgb(var(--text-tertiary))] font-medium">
                                ({tribunal.region})
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-[rgb(var(--text-secondary))] truncate">
                        {tribunal.name}
                    </div>
                </div>
            </div>
            <button
                onClick={onToggleFavorite}
                className={`p-1.5 rounded-lg transition-colors ${isFavorite
                    ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'text-[rgb(var(--text-tertiary))] hover:text-yellow-500 hover:bg-[rgb(var(--bg-tertiary))]'
                    }`}
            >
                <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
        </div>
    );
};

import { Check } from 'lucide-react';
