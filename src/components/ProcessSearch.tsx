
import React, { useState } from 'react';
import { Search, Loader, AlertCircle, FileText, Calendar, Building2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { TribunalSelector } from './TribunalSelector';
import { searchByProcessNumber, getTribunalById } from '../services/DataJudService';
import type { DataJudResponse, DataJudProcess } from '../types';

interface ProcessSearchProps {
    onImport?: (process: DataJudProcess, tribunal: string) => void;
    showImportButton?: boolean;
}

export const ProcessSearch: React.FC<ProcessSearchProps> = ({
    onImport,
    showImportButton = true
}) => {
    const [selectedTribunals, setSelectedTribunals] = useState<string[]>([]);
    const [processNumber, setProcessNumber] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<Map<string, DataJudResponse>>(new Map());
    const [error, setError] = useState<string | null>(null);
    const [expandedProcess, setExpandedProcess] = useState<string | null>(null);

    const formatProcessNumber = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 20) {
            return numbers
                .replace(/(\d{7})(\d)/, '$1-$2')
                .replace(/(\d{7}-\d{2})(\d)/, '$1.$2')
                .replace(/(\d{7}-\d{2}\.\d{4})(\d)/, '$1.$2')
                .replace(/(\d{7}-\d{2}\.\d{4}\.\d{1})(\d)/, '$1.$2')
                .replace(/(\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2})(\d)/, '$1.$2');
        }
        return value;
    };

    const handleProcessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatProcessNumber(e.target.value);
        setProcessNumber(formatted);
    };

    const handleSearch = async () => {
        if (!processNumber) {
            setError('Por favor, informe o número do processo.');
            return;
        }

        setIsSearching(true);
        setError(null);
        setResults(new Map());

        try {
            const result = await searchByProcessNumber(processNumber);

            if (result) {
                const newResults = new Map<string, DataJudResponse>();
                newResults.set(result.tribunal.id, result.data);
                setResults(newResults);
            } else {
                setError('Nenhum resultado encontrado.');
            }
        } catch (err) {
            setError('Erro ao realizar a busca. Tente novamente.');
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const getTotalResults = (): number => {
        let total = 0;
        results.forEach(result => {
            total += result.hits.hits.length;
        });
        return total;
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-6">
            {/* Search Form */}
            <div className="card-premium p-6">
                <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-2">
                    <Search size={20} className="text-[rgb(var(--accent-primary))]" />
                    Buscar Processo no DataJud
                </h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                            Número do Processo
                        </label>
                        <div className="relative">
                            <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" />
                            <input
                                type="text"
                                value={processNumber}
                                onChange={handleProcessNumberChange}
                                onKeyPress={handleKeyPress}
                                placeholder="0000000-00.0000.0.00.0000"
                                className="input-premium w-full pl-12 font-mono text-lg"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                            Tribunais
                        </label>
                        <TribunalSelector
                            selectedTribunals={selectedTribunals}
                            onSelectionChange={setSelectedTribunals}
                        />
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={isSearching || !processNumber || selectedTribunals.length === 0}
                        className="btn-premium w-full py-3 flex items-center justify-center gap-2"
                    >
                        {isSearching ? (
                            <>
                                <Loader size={20} className="animate-spin" />
                                Buscando...
                            </>
                        ) : (
                            <>
                                <Search size={20} />
                                Buscar Processo
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                    </div>
                )}
            </div>

            {/* Results */}
            {results.size > 0 && (
                <div className="card-premium overflow-hidden p-0">
                    <div className="px-6 py-4 border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-secondary))]">
                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">
                            Resultados da Busca
                        </h3>
                        <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                            {getTotalResults()} processo(s) encontrado(s) em {results.size} tribunal(is)
                        </p>
                    </div>

                    <div className="divide-y divide-[rgb(var(--border-subtle))]">
                        {Array.from(results.entries()).map(([tribunalId, response]) => {
                            const tribunal = getTribunalById(tribunalId);
                            if (!tribunal || response.hits.hits.length === 0) return null;

                            return (
                                <div key={tribunalId} className="p-6 bg-[rgb(var(--bg-primary))]/30">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Building2 size={18} className="text-[rgb(var(--accent-primary))]" />
                                        <h4 className="font-bold text-[rgb(var(--text-primary))]">
                                            {tribunal.acronym} - {tribunal.name}
                                        </h4>
                                        <span className="ml-auto text-sm font-medium text-[rgb(var(--text-tertiary))] bg-[rgb(var(--bg-tertiary))] px-2 py-1 rounded-lg">
                                            {response.hits.hits.length} resultado(s)
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {response.hits.hits.map((hit) => {
                                            const process = hit._source;
                                            const processId = `${tribunalId} -${process.numeroProcesso} `;
                                            const isExpanded = expandedProcess === processId;

                                            return (
                                                <div
                                                    key={hit._id}
                                                    className="bg-[rgb(var(--bg-secondary))] rounded-xl p-5 border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent-primary))]/30 transition-all shadow-sm"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <h5 className="font-mono text-base font-bold text-[rgb(var(--text-primary))]">
                                                                    {process.numeroProcesso}
                                                                </h5>
                                                                {process.classe && (
                                                                    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-xs font-bold uppercase tracking-wide">
                                                                        {process.classe.nome}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                                                {process.dataAjuizamento && (
                                                                    <div className="flex items-center gap-2 text-[rgb(var(--text-secondary))]">
                                                                        <Calendar size={14} className="text-[rgb(var(--text-tertiary))]" />
                                                                        <span className="font-medium">Ajuizamento:</span> {formatDate(process.dataAjuizamento)}
                                                                    </div>
                                                                )}
                                                                {process.orgaoJulgador && (
                                                                    <div className="text-[rgb(var(--text-secondary))]">
                                                                        <span className="font-medium">Órgão:</span> {process.orgaoJulgador.nome}
                                                                    </div>
                                                                )}
                                                                {process.grau && (
                                                                    <div className="text-[rgb(var(--text-secondary))]">
                                                                        <span className="font-medium">Grau:</span> {process.grau}
                                                                    </div>
                                                                )}
                                                                {process.dataHoraUltimaAtualizacao && (
                                                                    <div className="text-[rgb(var(--text-secondary))]">
                                                                        <span className="font-medium">Última atualização:</span> {formatDate(process.dataHoraUltimaAtualizacao)}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {process.assuntos && process.assuntos.length > 0 && (
                                                                <div className="mt-3 flex flex-wrap gap-2">
                                                                    {process.assuntos.slice(0, 3).map((assunto, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="px-2.5 py-1 bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] rounded-lg text-xs font-medium border border-[rgb(var(--border-subtle))]"
                                                                        >
                                                                            {assunto.nome}
                                                                        </span>
                                                                    ))}
                                                                    {process.assuntos.length > 3 && (
                                                                        <span className="text-xs font-medium text-[rgb(var(--text-tertiary))] py-1">
                                                                            +{process.assuntos.length - 3} mais
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {isExpanded && process.movimentos && process.movimentos.length > 0 && (
                                                                <div className="mt-4 pt-4 border-t border-[rgb(var(--border-subtle))] animate-fade-in">
                                                                    <h6 className="text-sm font-bold text-[rgb(var(--text-primary))] mb-3 uppercase tracking-wider">
                                                                        Últimas Movimentações
                                                                    </h6>
                                                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                                        {process.movimentos.slice(0, 5).map((movimento, idx) => (
                                                                            <div key={idx} className="text-xs p-3 rounded-lg bg-[rgb(var(--bg-tertiary))]/30 border border-[rgb(var(--border-subtle))]">
                                                                                <div className="text-[rgb(var(--text-tertiary))] font-medium mb-1 flex items-center gap-1.5">
                                                                                    <Calendar size={12} />
                                                                                    {formatDate(movimento.dataHora)}
                                                                                </div>
                                                                                <div className="text-[rgb(var(--text-secondary))] font-medium leading-relaxed">
                                                                                    {movimento.nome}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col gap-2">
                                                            {showImportButton && onImport && (
                                                                <button
                                                                    onClick={() => onImport(process, tribunalId)}
                                                                    className="btn-premium py-2 px-4 text-xs flex items-center justify-center gap-1.5"
                                                                >
                                                                    <Plus size={14} />
                                                                    Importar
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => setExpandedProcess(isExpanded ? null : processId)}
                                                                className="py-2 px-4 bg-[rgb(var(--bg-tertiary))] hover:bg-[rgb(var(--bg-tertiary))]/80 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                                                            >
                                                                {isExpanded ? (
                                                                    <>
                                                                        <ChevronUp size={14} />
                                                                        Menos
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ChevronDown size={14} />
                                                                        Mais
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
