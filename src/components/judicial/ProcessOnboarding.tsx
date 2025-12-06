import React, { useState, useEffect } from 'react';
import {
    AlertCircle, RefreshCw, Calendar,
    Building2, Scale, DollarSign, User, CheckCircle2,
    ArrowRight, Info
} from 'lucide-react';
import { PartesList } from './PartesList';

interface ProcessoOnboardingProps {
    advogadoId: string;
}

interface Processo {
    id: string;
    numeroProcesso: string;
    classe: string;
    assunto: string;
    valorCausa?: number;
    tribunal: string;
    orgaoJulgador?: string;
    statusOnboarding: string;
    dataDistribuicao: string;
    grau?: string;
    situacao?: string;
}

/**
 * Componente PREMIUM para onboarding de processos
 * 
 * FEATURES:
 * - Cards visualmente organizados
 * - Cores por tribunal
 * - Ícones intuitivos
 * - Feedback claro de status
 * - Responsive design
 */
export const ProcessOnboarding: React.FC<ProcessoOnboardingProps> = ({ advogadoId }) => {
    const [loading, setLoading] = useState(true);
    const [processos, setProcessos] = useState<Processo[]>([]);
    const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProcessos();
    }, [advogadoId]);

    const loadProcessos = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `http://localhost:3001/api/judicial/advogados/${advogadoId}/processos`
            );

            if (!response.ok) {
                throw new Error('Erro ao carregar processos');
            }

            const data = await response.json();

            // Filtrar e ordenar
            const pending = data.processos
                .filter((p: Processo) => p.statusOnboarding === 'aguardando_definicao_cliente')
                .sort((a: Processo, b: Processo) => {
                    return new Date(b.dataDistribuicao).getTime() - new Date(a.dataDistribuicao).getTime();
                });

            setProcessos(pending);
        } catch (err) {
            console.error('[ProcessOnboarding] Erro:', err);
            setError('Erro ao carregar processos do DataJud. Verifique a API Key e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleClientesDefinidos = async (clientesIds: string[]) => {
        alert(`✅ ${clientesIds.length} cliente(s) vinculado(s)!`);
        setSelectedProcesso(null);
        await loadProcessos();
    };

    // Formata valor monetário
    const formatCurrency = (value?: number) => {
        if (!value) return 'Não informado';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    // Formata data brasileira
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch {
            return 'Data inválida';
        }
    };

    // Cores por tribunal
    const getTribunalColor = (tribunal: string) => {
        const colors: Record<string, string> = {
            'TJRN': 'from-blue-500 to-blue-700',
            'TJSP': 'from-purple-500 to-purple-700',
            'TJRJ': 'from-green-500 to-green-700',
            'TRF5': 'from-orange-500 to-orange-700',
            'TST': 'from-red-500 to-red-700',
        };
        return colors[tribunal] || 'from-gray-500 to-gray-700';
    };

    // Loading premium
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        Buscando processos no DataJud...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Consultando API oficial do CNJ
                    </p>
                </div>
            </div>
        );
    }

    // Error state premium
    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                            Erro na Captura
                        </h3>
                        <p className="text-red-700 dark:text-red-300 mb-4">
                            {error}
                        </p>
                        <button
                            onClick={loadProcessos}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state premium
    if (processos.length === 0) {
        return (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8">
                <div className="text-center max-w-md mx-auto">
                    <div className="inline-flex p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                        <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Nenhum Processo Aguardando
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 mb-4">
                        Todos os processos capturados já foram processados!
                    </p>
                    <button
                        onClick={loadProcessos}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Atualizar Lista
                    </button>
                </div>
            </div>
        );
    }

    // Vista de detalhes de processo
    if (selectedProcesso) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedProcesso(null)}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Voltar para lista
                </button>

                <PartesList
                    processoId={selectedProcesso.id}
                    numeroProcesso={selectedProcesso.numeroProcesso}
                    onClientesDefinidos={handleClientesDefinidos}
                    advogadoId={advogadoId}
                />
            </div>
        );
    }

    // Lista de processos PREMIUM
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 rounded-xl text-white">
                <div>
                    <h2 className="text-2xl font-bold">Processos Capturados</h2>
                    <p className="text-blue-100 mt-1">
                        {processos.length} processo{processos.length !== 1 ? 's' : ''} aguardando vínculo de cliente
                    </p>
                </div>
                <button
                    onClick={loadProcessos}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="Atualizar"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Grid de Cards Premium */}
            <div className="grid gap-6 md:grid-cols-2">
                {processos.map((processo) => (
                    <div
                        key={processo.id}
                        className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                        {/* Gradient Header */}
                        <div className={`h-2 bg-gradient-to-r ${getTribunalColor(processo.tribunal)}`} />

                        {/* Card Content */}
                        <div className="p-6 space-y-4">
                            {/* Número do Processo */}
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        Processo
                                    </span>
                                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-bold rounded-full">
                                        Pendente
                                    </span>
                                </div>
                                <h3 className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                                    {processo.numeroProcesso}
                                </h3>
                            </div>

                            {/* Informações em Grid */}
                            <div className="space-y-3">
                                {/* Tribunal */}
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 bg-gradient-to-br ${getTribunalColor(processo.tribunal)} rounded-lg`}>
                                        <Building2 className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Tribunal</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {processo.tribunal}
                                        </p>
                                    </div>
                                </div>

                                {/* Classe */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Classe</p>
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                            {processo.classe}
                                        </p>
                                    </div>
                                </div>

                                {/* Valor da Causa */}
                                {processo.valorCausa && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Valor da Causa</p>
                                            <p className="font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(processo.valorCausa)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Data de Distribuição */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Distribuição</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(processo.dataDistribuicao)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Assunto (Footer) */}
                            {processo.assunto && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assunto</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                        {processo.assunto}
                                    </p>
                                </div>
                            )}

                            {/* Botão de Ação */}
                            <button
                                onClick={() => setSelectedProcesso(processo)}
                                className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
                            >
                                <User className="w-4 h-4" />
                                Vincular Cliente
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Footer */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-semibold mb-1">Dados capturados do DataJud (CNJ)</p>
                    <p className="text-blue-600 dark:text-blue-400">
                        Os processos acima foram sincronizados automaticamente. Clique em "Vincular Cliente" para associar cada processo ao cliente correspondente.
                    </p>
                </div>
            </div>
        </div>
    );
};
