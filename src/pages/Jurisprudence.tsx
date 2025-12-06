import React, { useState } from 'react';
import { ModuleHeader } from '../components/ModuleHeader';
import { BookOpen, Search, Bookmark, ExternalLink, Scale } from 'lucide-react';
import { useGlobalData } from '../context/GlobalDataContext';

export const Jurisprudence: React.FC = () => {
    const { jurisprudence, toggleJurisprudenceFavorite } = useGlobalData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'favorites'>('all');

    const filteredItems = jurisprudence.filter(item => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.tribunal.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filter === 'all' || (filter === 'favorites' && item.isFavorite);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <ModuleHeader
                icon={BookOpen}
                title="Jurisprudência"
                subtitle="Pesquise e organize decisões judiciais"
                action={
                    <button className="btn-premium flex items-center gap-2">
                        <Search size={18} />
                        Nova Pesquisa
                    </button>
                }
            />

            {/* Search and Filters */}
            <div className="card-premium p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] pointer-events-none" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por palavras-chave, tribunal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-premium w-full pl-16 pr-4"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                ? 'bg-[rgb(var(--accent-primary))] text-white shadow-md'
                                : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-secondary))]'
                                }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('favorites')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filter === 'favorites'
                                ? 'bg-[rgb(var(--accent-primary))] text-white shadow-md'
                                : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-secondary))]'
                                }`}
                        >
                            <Bookmark size={16} />
                            Favoritas
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <div key={item.id} className="card-premium p-6 hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                            {item.tribunal}
                                        </span>
                                        <span className="text-xs text-[rgb(var(--text-tertiary))]">{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-2 group-hover:text-[rgb(var(--accent-primary))] transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-[rgb(var(--text-secondary))] mb-4 line-clamp-3">
                                        {item.summary}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {item.keywords.map((keyword, idx) => (
                                            <span key={idx} className="text-xs px-2 py-1 rounded-full bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] border border-[rgb(var(--border-subtle))]">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => toggleJurisprudenceFavorite(item.id)}
                                        className={`p-2 rounded-lg transition-colors ${item.isFavorite
                                            ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                            : 'text-[rgb(var(--text-tertiary))] hover:bg-[rgb(var(--bg-tertiary))] hover:text-[rgb(var(--text-primary))]'
                                            }`}
                                        title={item.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                    >
                                        <Bookmark size={20} fill={item.isFavorite ? "currentColor" : "none"} />
                                    </button>
                                    <button className="p-2 text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors">
                                        <ExternalLink size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-[rgb(var(--text-tertiary))]">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[rgb(var(--bg-tertiary))] mb-4 border border-[rgb(var(--border-subtle))]">
                            <Scale size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-[rgb(var(--text-primary))]">Nenhuma jurisprudência encontrada</h3>
                        <p className="text-sm mt-1">Tente ajustar seus filtros ou faça uma nova pesquisa.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
