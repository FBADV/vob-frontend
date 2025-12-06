import React from 'react';
import { useGamification } from '../../context/GamificationContext';
import { Trophy, Medal, User } from 'lucide-react';

export const RankingWidget: React.FC = () => {
    const { ranking, profile, isLoading } = useGamification();

    if (isLoading) return <div className="animate-pulse h-64 bg-slate-800/50 rounded-2xl"></div>;

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Trophy className="text-yellow-500" size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Ranking Anual</h3>
                    <p className="text-xs text-slate-400">Top advogados mais produtivos</p>
                </div>
            </div>

            <div className="space-y-3">
                {ranking.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        Nenhum dado de ranking disponível
                    </div>
                ) : (
                    ranking.map((user, index) => {
                        const isCurrentUser = user.userId === profile?.userId;
                        const rank = index + 1;

                        let rankIcon;
                        let rankColor;

                        if (rank === 1) {
                            rankIcon = <Trophy size={16} className="text-yellow-400" />;
                            rankColor = 'bg-yellow-500/20 border-yellow-500/30';
                        } else if (rank === 2) {
                            rankIcon = <Medal size={16} className="text-slate-300" />;
                            rankColor = 'bg-slate-500/20 border-slate-500/30';
                        } else if (rank === 3) {
                            rankIcon = <Medal size={16} className="text-amber-600" />;
                            rankColor = 'bg-amber-600/20 border-amber-600/30';
                        } else {
                            rankIcon = <span className="text-sm font-bold text-slate-500">#{rank}</span>;
                            rankColor = 'bg-white/5 border-white/10';
                        }

                        return (
                            <div
                                key={user.userId}
                                className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${rankColor} ${isCurrentUser ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' : ''}`}
                            >
                                <div className="w-8 h-8 flex items-center justify-center">
                                    {rankIcon}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                                            <User size={12} />
                                        </div>
                                        <span className={`text-sm font-medium ${isCurrentUser ? 'text-white' : 'text-slate-300'}`}>
                                            {isCurrentUser ? 'Você' : `Advogado ${user.userId.substring(0, 4)}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-sm font-bold text-white block">{user.totalPointsYear.toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Pontos</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
