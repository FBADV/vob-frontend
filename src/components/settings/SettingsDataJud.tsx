import React, { useState } from 'react';
// import { useGlobalData } from '../../context/GlobalDataContext';
import { Save, Search, AlertCircle, CheckCircle2, Database } from 'lucide-react';
import { TRIBUNALS } from "../../services/DataJudService";

export const SettingsDataJud: React.FC = () => {
    // const { settings, updateSettings } = useGlobalData(); // Not used yet
    const [apiKey, setApiKey] = useState('****************************'); // Mocked hidden key
    const [isEditingKey, setIsEditingKey] = useState(false);
    const [selectedTribunals, setSelectedTribunals] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTribunals = TRIBUNALS.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.acronym.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleTribunal = (id: string) => {
        if (selectedTribunals.includes(id)) {
            setSelectedTribunals(selectedTribunals.filter(t => t !== id));
        } else {
            setSelectedTribunals([...selectedTribunals, id]);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                    <Database size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">Configuração DataJud</h2>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Gerencie a conexão com a base de dados do CNJ</p>
                </div>
            </div>

            {/* API Key Section */}
            <div className="card-premium p-6">
                <h3 className="text-base font-semibold text-[rgb(var(--text-primary))] mb-4">Chave de API Pública</h3>
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <input
                            type={isEditingKey ? "text" : "password"}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            disabled={!isEditingKey}
                            className="input-premium w-full pr-10 font-mono text-sm"
                        />
                        {!isEditingKey && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                <CheckCircle2 size={18} />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsEditingKey(!isEditingKey)}
                        className={`px-4 py-2 rounded-xl border font-medium transition-all ${isEditingKey
                            ? 'bg-[rgb(var(--accent-primary))] text-white border-transparent'
                            : 'border-[rgb(var(--border-default))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))]'
                            }`}
                    >
                        {isEditingKey ? 'Salvar' : 'Alterar'}
                    </button>
                </div>
                <p className="mt-2 text-xs text-[rgb(var(--text-secondary))] flex items-center gap-1">
                    <AlertCircle size={12} />
                    A chave de API é necessária para realizar consultas processuais.
                </p>
            </div>

            {/* Tribunals Selection */}
            <div className="card-premium p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-[rgb(var(--text-primary))]">Tribunais Monitorados</h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar tribunal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-premium pl-9 py-1.5 text-sm w-full"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredTribunals.map(tribunal => (
                        <label
                            key={tribunal.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedTribunals.includes(tribunal.id)
                                ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/5'
                                : 'border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--border-default))] hover:bg-[rgb(var(--bg-tertiary))]'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedTribunals.includes(tribunal.id)}
                                onChange={() => toggleTribunal(tribunal.id)}
                                className="w-4 h-4 rounded border-gray-300 text-[rgb(var(--accent-primary))] focus:ring-[rgb(var(--accent-primary))]"
                            />
                            <div>
                                <p className="font-semibold text-sm text-[rgb(var(--text-primary))]">{tribunal.acronym}</p>
                                <p className="text-xs text-[rgb(var(--text-secondary))] truncate max-w-[200px]" title={tribunal.name}>
                                    {tribunal.name}
                                </p>
                            </div>
                        </label>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-[rgb(var(--border-subtle))] flex justify-between items-center">
                    <span className="text-sm text-[rgb(var(--text-secondary))]">
                        {selectedTribunals.length} tribunais selecionados
                    </span>
                    <button className="btn-premium px-6 py-2 flex items-center gap-2">
                        <Save size={18} />
                        Salvar Configurações
                    </button>
                </div>
            </div>
        </div>
    );
};
