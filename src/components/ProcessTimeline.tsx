import React, { useMemo } from 'react';
import {
    Gavel,
    FileText,
    CheckCircle,
    Clock,
    Scale
} from 'lucide-react';
import type { Process } from '../types';

interface ProcessTimelineProps {
    process: Process;
}

interface TimelineStep {
    id: string;
    label: string;
    date?: string;
    status: 'completed' | 'current' | 'future';
    icon: React.ElementType;
    description?: string;
}

export const ProcessTimeline: React.FC<ProcessTimelineProps> = ({ process }) => {
    const steps = useMemo(() => {
        const timeline: TimelineStep[] = [];

        // 1. Distribution (Always present if basic data exists)
        const distributionDate = process.folder.basicData.distributionDate;
        timeline.push({
            id: 'distribution',
            label: 'Distribuição',
            date: distributionDate,
            status: 'completed',
            icon: FileText,
            description: 'Processo distribuído'
        });

        // 2. Hearings (Check movements or agenda)
        // Find the most recent past hearing or upcoming hearing
        // For simplicity in this visualization, we'll check if any hearing happened
        const hearings = process.folder.movements.filter(m =>
            m.type === 'audiencia' || m.title.toLowerCase().includes('audiência')
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (hearings.length > 0) {
            hearings.forEach((hearing, index) => {
                timeline.push({
                    id: `hearing - ${index} `,
                    label: 'Audiência',
                    date: hearing.date,
                    status: 'completed',
                    icon: Gavel,
                    description: hearing.title
                });
            });
        }

        // 3. Sentence/Decision
        const sentence = process.folder.movements.find(m =>
            (m.type as string) === 'sentenca' ||
            m.type === 'decisao' ||
            m.title.toLowerCase().includes('sentença') ||
            m.title.toLowerCase().includes('decisão')
        );

        if (sentence) {
            timeline.push({
                id: 'sentence',
                label: 'Sentença / Decisão',
                date: sentence.date,
                status: 'completed',
                icon: Scale, // Using Scale icon implicitly imported or defined? Need to import Scale.
                description: sentence.title
            });
        } else if (process.status !== 'finished' && process.status !== 'archived') {
            // If no sentence yet and not finished, this is likely the next major step or current phase
            // We can add a placeholder for "Aguardando Sentença" if we are in that phase, 
            // but simpler to just show "Em Andamento" as current if no specific milestone is active.
        }

        // 4. Conclusion / Current Status
        if (process.status === 'finished' || process.status === 'archived') {
            timeline.push({
                id: 'conclusion',
                label: process.status === 'finished' ? 'Finalizado' : 'Arquivado',
                date: process.updatedAt, // Or a specific closing date if available
                status: 'completed',
                icon: CheckCircle,
                description: process.status === 'finished' ? 'Processo encerrado' : 'Processo arquivado'
            });
        } else {
            // Current State
            timeline.push({
                id: 'current',
                label: 'Em Andamento',
                status: 'current',
                icon: Clock,
                description: 'Aguardando próximas movimentações'
            });
        }

        return timeline;
    }, [process]);

    return (
        <div className="w-full overflow-x-auto pb-4 pt-2 px-2 no-scrollbar">
            <div className="flex items-center min-w-max">
                {steps.map((step, index) => {
                    const isLast = index === steps.length - 1;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex items-center">
                            {/* Step Node */}
                            <div className="flex flex-col items-center relative group">
                                <div
                                    className={`
w - 12 h - 12 rounded - full flex items - center justify - center border - 4 transition - all duration - 300 z - 10
                                        ${step.status === 'completed'
                                            ? 'bg-green-100 border-green-500 text-green-600 dark:bg-green-900/30 dark:border-green-500 dark:text-green-400'
                                            : step.status === 'current'
                                                ? 'bg-blue-100 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400 animate-pulse'
                                                : 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600'
                                        }
`}
                                >
                                    <Icon size={20} strokeWidth={2.5} />
                                </div>

                                {/* Tooltip / Label */}
                                <div className="absolute top-14 flex flex-col items-center w-32 text-center">
                                    <span className={`text - sm font - bold ${step.status === 'completed' ? 'text-green-700 dark:text-green-300' :
                                            step.status === 'current' ? 'text-blue-700 dark:text-blue-300' :
                                                'text-gray-500 dark:text-gray-400'
                                        } `}>
                                        {step.label}
                                    </span>
                                    {step.date && (
                                        <span className="text-xs text-[rgb(var(--text-tertiary))] font-mono mt-0.5">
                                            {new Date(step.date).toLocaleDateString('pt-BR')}
                                        </span>
                                    )}
                                </div>

                                {/* Hover Details */}
                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap z-20">
                                    {step.description}
                                </div>
                            </div>

                            {/* Connector Line */}
                            {!isLast && (
                                <div className={`h - 1 w - 16 sm: w - 24 mx - 2 rounded - full ${step.status === 'completed'
                                        ? 'bg-green-500/50'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                    } `} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
