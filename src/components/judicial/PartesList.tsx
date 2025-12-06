import React, { useState } from 'react';
import { Users, CheckCircle, ChevronRight } from 'lucide-react';

interface Parte {
    id: string;
    nomeParte: string;
    tipoParte: string;
    polo: string;
    documento?: string;
    advogados?: string[];
    isCliente: boolean;
}

interface PartesListProps {
    processoId: string;
    numeroProcesso: string;
    advogadoId: string;
    onClientesDefinidos?: (clientesIds: string[]) => void;
}

/**
 * Component para listar partes de processo e selecionar clientes.
 * 
 * Usado no fluxo de onboarding após sincronização de processos.
 */
export const PartesList: React.FC<PartesListProps> = ({
    processoId,
    numeroProcesso,
    advogadoId,
    onClientesDefinidos
}) => {
    const [partes, setPartes] = useState<Parte[]>([]);
    const [selectedPartes, setSelectedPartes] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Carregar partes ao montar
    React.useEffect(() => {
        loadPartes();
    }, [processoId, advogadoId]);

    const loadPartes = async () => {
        try {
            const response = await fetch(
                `http://localhost:3001/api/judicial/processos/${processoId}/partes?advogadoId=${advogadoId}`
            );
            const data = await response.json();

            if (response.ok) {
                setPartes(data.partes);
            } else {
                setError(data.error || 'Erro ao carregar partes');
            }
        } catch (err) {
            setError('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    const toggleParte = (parteId: string) => {
        const newSelected = new Set(selectedPartes);
        if (newSelected.has(parteId)) {
            newSelected.delete(parteId);
        } else {
            newSelected.add(parteId);
        }
        setSelectedPartes(newSelected);
    };

    const handleDefinirClientes = async () => {
        if (selectedPartes.size === 0) {
            setError('Selecione pelo menos uma parte como cliente');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch(
                `http://localhost:3001/api/judicial/processos/${processoId}/definir-clientes`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        advogadoId,
                        partesIds: Array.from(selectedPartes)
                    })
                }
            );

            const result = await response.json();

            if (result.success) {
                if (onClientesDefinidos) {
                    onClientesDefinidos(result.clientesVinculados);
                }
            } else {
                setError(result.error || 'Erro ao definir clientes');
            }
        } catch (err) {
            setError('Erro de conexão');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Selecione seus Clientes
                    </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Processo: <span className="font-mono">{numeroProcesso}</span>
                </p>
            </div>

            {/* Lista de Partes */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {partes.map((parte) => (
                    <div
                        key={parte.id}
                        className={`p-4 cursor-pointer transition-colors ${selectedPartes.has(parte.id)
                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        onClick={() => toggleParte(parte.id)}
                    >
                        <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <div className="mt-1">
                                <div
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedPartes.has(parte.id)
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                >
                                    {selectedPartes.has(parte.id) && (
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    )}
                                </div>
                            </div>

                            {/* Info da Parte */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {parte.nomeParte}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${parte.polo === 'ativo'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                        }`}>
                                        {parte.tipoParte}
                                    </span>
                                </div>
                                {parte.documento && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {parte.documento}
                                    </p>
                                )}
                                {parte.advogados && parte.advogados.length > 0 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        Advogados: {parte.advogados.join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer com Ações */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedPartes.size} {selectedPartes.size === 1 ? 'parte selecionada' : 'partes selecionadas'}
                    </p>
                    <button
                        onClick={handleDefinirClientes}
                        disabled={submitting || selectedPartes.size === 0}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Criando Clientes...
                            </>
                        ) : (
                            <>
                                Definir como Clientes
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
