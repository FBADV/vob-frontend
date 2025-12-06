import React from 'react';
import { useGamification } from '../../context/GamificationContext';
import { Target, Clock } from 'lucide-react';

export const GoalsWidget: React.FC = () => {
    const { goals, isLoading } = useGamification();

    if (isLoading) return <div className="animate-pulse h-64 bg-slate-800/50 rounded-2xl"></div>;

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Target className="text-blue-500" size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Metas da Semana</h3>
                    <p className="text-xs text-slate-400">Complete para ganhar XP extra</p>
                </div>
            </div>

            <div className="space-y-4">
                {goals.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        Nenhuma meta ativa no momento
                    </div>
                ) : (
                    goals.map((goal) => {
                        const progress = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
                        const isCompleted = goal.status === 'completed';

                        return (
                            <div key={goal.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-medium text-slate-200">{goal.description}</h4>
                                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                                        +{goal.rewardXp} XP
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                    <span>{goal.currentValue} / {goal.targetValue}</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>

                                <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-500">
                                    <Clock size={12} />
                                    <span>Expira em {new Date(goal.endDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
