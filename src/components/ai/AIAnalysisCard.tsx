import React from 'react';
import { Brain, AlertTriangle, Shield, Lightbulb, CheckCircle2 } from 'lucide-react';
import type { AIAnalysisResult } from '../../services/ai.service';

interface AIAnalysisCardProps {
    analysis: AIAnalysisResult | null;
    isLoading: boolean;
    error?: string | null;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ analysis, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-indigo-200 rounded-full"></div>
                    <div className="h-6 bg-indigo-200 rounded w-1/3"></div>
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-indigo-100 rounded w-full"></div>
                    <div className="h-4 bg-indigo-100 rounded w-5/6"></div>
                    <div className="h-4 bg-indigo-100 rounded w-4/6"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-semibold">Erro na Análise</h3>
                </div>
                <p>{error}</p>
            </div>
        );
    }

    if (!analysis) return null;

    const getRiskColor = (risk: string) => {
        switch (risk.toLowerCase()) {
            case 'alto': return 'text-red-600 bg-red-50 border-red-200';
            case 'médio': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'baixo': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    <h3 className="font-semibold">Análise Jurídica IA</h3>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm`}>
                        Complexidade: {analysis.complexity}
                    </span>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Summary */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Resumo do Caso</h4>
                    <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Risk Assessment */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Avaliação de Risco</h4>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getRiskColor(analysis.risk_level)}`}>
                        <Shield className="w-4 h-4" />
                        <span className="font-medium">Risco {analysis.risk_level}</span>
                    </div>
                </div>

                {/* Strategies */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            Estratégias Sugeridas
                        </h4>
                        <ul className="space-y-2">
                            {analysis.strategies.map((strategy, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                    {strategy}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Teses Aplicáveis
                        </h4>
                        <ul className="space-y-2">
                            {analysis.theses.map((thesis, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                    {thesis}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
