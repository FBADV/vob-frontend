import React from 'react';
import { useGamification } from '../../context/GamificationContext';
import { LEVEL_THRESHOLDS } from '../../types/gamification.types';
import { Flame, Star } from 'lucide-react';

export const GamificationHUD: React.FC = () => {
    const { profile, isLoading } = useGamification();

    if (isLoading || !profile) return null;

    const currentLevel = profile.currentLevel;
    const currentXp = profile.currentXp;
    const nextLevelXp = LEVEL_THRESHOLDS[(currentLevel + 1) as keyof typeof LEVEL_THRESHOLDS] || LEVEL_THRESHOLDS[10];
    const prevLevelXp = LEVEL_THRESHOLDS[currentLevel as keyof typeof LEVEL_THRESHOLDS] || 0;

    // Calculate progress percentage for the current level
    const levelProgress = Math.min(100, Math.max(0,
        ((currentXp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100
    ));

    return (
        <div className="flex items-center gap-4 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg">
            {/* Level Badge */}
            <div className="relative group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300">
                    <span className="text-white font-bold text-lg">{currentLevel}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-slate-900">
                    <Star size={10} className="text-slate-900 fill-slate-900" />
                </div>
            </div>

            {/* XP Progress */}
            <div className="flex flex-col gap-1 min-w-[120px]">
                <div className="flex justify-between text-xs font-medium text-slate-300">
                    <span>XP</span>
                    <span>{currentXp} / {nextLevelXp}</span>
                </div>
                <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${levelProgress}%` }}
                    />
                </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Flame size={16} className="fill-orange-400" />
                <span className="font-bold text-sm">{profile.streakDays}</span>
            </div>
        </div>
    );
};
