import React, { useState, useEffect } from 'react';
import { X, FileText, Loader, CheckCircle, AlertCircle, Building2, Calendar, Users, Tag } from 'lucide-react';
import {
    formatProcessNumber,
    isValidProcessNumber,
    getTribunalFromProcessNumber,
    getJusticeSegmentName
} from '../services/processNumber.service';
import { getTribunalById, searchInTribunal } from '../services/DataJudService';
import type { DataJudProcess, DataJudQuery, Client } from '../types';

interface AddProcessModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (process: Partial<DataJudProcess>, clientId?: string) => void;
    clients: Client[];
}

type LoadingState = 'idle' | 'validating' | 'fetching' | 'success' | 'error';

export const AddProcessModal: React.FC<AddProcessModalProps> = ({
    isOpen,
    onClose,
    onSave,
    clients
}) => {
    const [processNumber, setProcessNumber] = useState('');
    const [loadingState, setLoadingState] = useState<LoadingState>('idle');
    const [processData, setProcessData] = useState<DataJudProcess | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [tribunalInfo, setTribunalInfo] = useState<{ id: string; name: string } | null>(null);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setProcessNumber('');
            setLoadingState('idle');
            setProcessData(null);
            setSelectedClientId('');
            setError(null);
            setTribunalInfo(null);
        }
    }, [isOpen]);

    // Auto-fetch when process number is valid
    useEffect(() => {
        const fetchProcessData = async () => {
            if (!isValidProcessNumber(processNumber)) {
                setProcessData(null);
                setTribunalInfo(null);
                return;
            }

            const tribunalId = getTribunalFromProcessNumber(processNumber);
            if (!tribunalId) {
                setError('Não foi possível identificar o tribunal a partir do número do processo.');
                return;
            }

            const tribunal = getTribunalById(tribunalId);
            if (!tribunal) {
                setError(`Tribunal não encontrado: ${tribunalId}`);
                return;
            }

            setTribunalInfo({ id: tribunalId, name: tribunal.acronym });
            setLoadingState('fetching');
            setError(null);

            try {
                const cleanNumber = processNumber.replace(/[^\d]/g, '');

                console.log('🔍 Buscando processo:', {
                    processNumber,
                    cleanNumber,
                    tribunalId,
                    tribunal: tribunal.acronym,
                    endpoint: tribunal.endpoint
                });

                const query: DataJudQuery = {
                    size: 1,
                    query: {
                        match: {
                            numeroProcesso: cleanNumber
                        }
                    }
                };

                const response = await searchInTribunal(tribunalId, query);

                console.log('✅ Resposta da API:', response);

                if (response.hits.hits.length > 0) {
                    const fetchedProcess = response.hits.hits[0]._source;
                    setProcessData(fetchedProcess);
                    setLoadingState('success');
                } else {
                    console.warn('⚠️ Nenhum resultado encontrado');
                    setError('Processo não encontrado no tribunal. Verifique o número digitado.');
                    setLoadingState('error');
                }
            } catch (err: any) {
                console.error('❌ Erro detalhado:', {
                    error: err,
                    message: err?.message,
                    stack: err?.stack,
                    response: err?.response
                });

                let errorMessage = 'Erro ao buscar informações do processo. ';

                if (err?.message?.includes('Failed to fetch')) {
                    errorMessage += 'Problema de conexão com a API DataJud. Verifique CORS ou conectividade.';
                } else if (err?.message?.includes('401') || err?.message?.includes('403')) {
                    errorMessage += 'Erro de autenticação. Verifique a APIKey.';
                } else if (err?.message) {
                    errorMessage += err.message;
                } else {
                    errorMessage += 'Tente novamente.';
                }

                setError(errorMessage);
                setLoadingState('error');
            }
        };

        const timeoutId = setTimeout(() => {
            if (processNumber.replace(/[^\d]/g, '').length === 20) {
                fetchProcessData();
            }
        }, 500); // Debounce de 500ms

        return () => clearTimeout(timeoutId);
    }, [processNumber]);

    const handleProcessNumberChange = (value: string) => {
        const formatted = formatProcessNumber(value);
        setProcessNumber(formatted);

        if (loadingState === 'success' || loadingState === 'error') {
            setLoadingState('idle');
            setProcessData(null);
            setError(null);
        }
    };

    const handleSave = () => {
        if (!processData) {
            setError('Aguarde o carregamento dos dados do processo.');
            return;
        }

        onSave(processData, selectedClientId || undefined);
        onClose();
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch {
            return dateString;
        }
    };

    if (!isOpen) return null;

    const isComplete = processNumber.replace(/[^\d]/g, '').length === 20;
    const isValid = isValidProcessNumber(processNumber);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-[rgb(var(--border-subtle))]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center flex-shrink-0 bg-[rgb(var(--bg-secondary))]">
                    <div>
                        <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">Adicionar Processo</h3>
                        <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                            Digite o número do processo para buscar automaticamente
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1 space-y-6">
                    {/* Process Number Input */}
                    <div>
                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                            Número do Processo *
                        </label>
                        <div className="relative">
                            <FileText size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" />
                            <input
                                type="text"
                                value={processNumber}
                                onChange={(e) => handleProcessNumberChange(e.target.value)}
                                placeholder="0000000-00.0000.0.00.0000"
                                className="input-premium w-full pl-12 font-mono text-lg"
                                maxLength={25}
                                autoFocus
                            />
                            {loadingState === 'fetching' && (
                                <Loader size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgb(var(--accent-primary))] animate-spin" />
                            )}
                            {loadingState === 'success' && (
                                <CheckCircle size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                            )}
                            {loadingState === 'error' && (
                                <AlertCircle size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />
                            )}
                        </div>

                        {/* Validation Info */}
                        {isComplete && (
                            <div className="mt-3 flex items-start gap-2 text-sm">
                                {isValid ? (
                                    <>
                                        <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-green-600 dark:text-green-400">
                                            <div className="font-bold">Número válido</div>
                                            {tribunalInfo && (
                                                <div className="flex items-center gap-2 mt-1 font-medium">
                                                    <Building2 size={14} />
                                                    <span>Tribunal: {tribunalInfo.name}</span>
                                                    <span className="text-[rgb(var(--text-tertiary))]">•</span>
                                                    <span>{getJusticeSegmentName(processNumber)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-red-600 dark:text-red-400 font-bold">
                                            Número de processo inválido. Verifique a digitação.
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800 dark:text-red-300 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Loading State */}
                    {loadingState === 'fetching' && (
                        <div className="p-12 text-center">
                            <Loader size={48} className="mx-auto text-[rgb(var(--accent-primary))] animate-spin mb-4" />
                            <p className="text-[rgb(var(--text-secondary))] font-medium">Buscando informações do processo...</p>
                        </div>
                    )}

                    {/* Process Data */}
                    {loadingState === 'success' && processData && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
                                <div className="flex items-center gap-2 text-green-800 dark:text-green-300 font-bold mb-4 text-lg">
                                    <CheckCircle size={24} />
                                    Processo encontrado no {tribunalInfo?.name}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {processData.classe && (
                                        <div>
                                            <div className="text-xs text-green-700 dark:text-green-400 mb-1 font-bold uppercase tracking-wider">Classe</div>
                                            <div className="text-base font-bold text-green-900 dark:text-green-100">
                                                {processData.classe.nome}
                                            </div>
                                        </div>
                                    )}

                                    {processData.dataAjuizamento && (
                                        <div>
                                            <div className="text-xs text-green-700 dark:text-green-400 mb-1 font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Calendar size={12} />
                                                Data de Ajuizamento
                                            </div>
                                            <div className="text-base font-bold text-green-900 dark:text-green-100">
                                                {formatDate(processData.dataAjuizamento)}
                                            </div>
                                        </div>
                                    )}

                                    {processData.orgaoJulgador && (
                                        <div className="col-span-2">
                                            <div className="text-xs text-green-700 dark:text-green-400 mb-1 font-bold uppercase tracking-wider">Órgão Julgador</div>
                                            <div className="text-base font-bold text-green-900 dark:text-green-100">
                                                {processData.orgaoJulgador.nome}
                                            </div>
                                        </div>
                                    )}

                                    {processData.assuntos && processData.assuntos.length > 0 && (
                                        <div className="col-span-2">
                                            <div className="text-xs text-green-700 dark:text-green-400 mb-2 font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Tag size={12} />
                                                Assuntos
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {processData.assuntos.slice(0, 5).map((assunto, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 bg-white dark:bg-green-900/40 text-green-800 dark:text-green-200 rounded-lg text-xs font-medium border border-green-100 dark:border-green-800"
                                                    >
                                                        {assunto.nome}
                                                    </span>
                                                ))}
                                                {processData.assuntos.length > 5 && (
                                                    <span className="text-xs text-green-700 dark:text-green-400 py-1 font-medium">
                                                        +{processData.assuntos.length - 5} mais
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Client Selection */}
                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2 flex items-center gap-2">
                                    <Users size={18} className="text-[rgb(var(--accent-primary))]" />
                                    Vincular a Cliente (opcional)
                                </label>
                                <select
                                    value={selectedClientId}
                                    onChange={(e) => setSelectedClientId(e.target.value)}
                                    className="input-premium w-full"
                                >
                                    <option value="">Sem vínculo</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} - {client.document}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-[rgb(var(--border-subtle))] flex justify-end gap-4 flex-shrink-0 bg-[rgb(var(--bg-tertiary))]/30">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl border border-[rgb(var(--border-default))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loadingState !== 'success' || !processData}
                        className="btn-premium py-3 px-8 flex items-center gap-2"
                    >
                        <CheckCircle size={20} />
                        Adicionar Processo
                    </button>
                </div>
            </div>
        </div>
    );
};
