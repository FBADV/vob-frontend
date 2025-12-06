import React from 'react';
import { ModuleHeader } from '../components/ModuleHeader';
import { Trophy, Target, Medal, Star } from 'lucide-react';
import { GamificationHUD } from '../components/gamification/GamificationHUD';
import { RankingWidget } from '../components/gamification/RankingWidget';
import { GoalsWidget } from '../components/gamification/GoalsWidget';

export const Gamification: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <ModuleHeader
                icon={Trophy}
                title="Gamificação"
                subtitle="Acompanhe seu progresso, metas e ranking"
            />

            {/* HUD Section */}
            <div className="card-premium p-6">
                <GamificationHUD />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - 2 Columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Goals Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Target className="text-[rgb(var(--accent-primary))]" size={20} />
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Metas da Semana</h3>
                        </div>
                        <GoalsWidget />
                    </div>

                    {/* Achievements/Medals Placeholder */}
                    <div className="card-premium p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Medal className="text-yellow-500" size={20} />
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Conquistas</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((_, i) => (
                                <div key={i} className="flex flex-col items-center justify-center p-4 bg-[rgb(var(--bg-tertiary))] rounded-xl border border-[rgb(var(--border-subtle))] opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white mb-2 shadow-lg">
                                        <Star size={24} fill="currentColor" />
                                    </div>
                                    <span className="text-xs font-bold text-center">Mestre dos Processos</span>
                                    <span className="text-[10px] text-[rgb(var(--text-secondary))] text-center">Em breve</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar - 1 Column */}
                <div className="space-y-6">
                    {/* Ranking Widget */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Trophy className="text-yellow-500" size={20} />
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Ranking Geral</h3>
                        </div>
                        <RankingWidget />
                    </div>
                </div>
            </div>
        </div>
    );
};
