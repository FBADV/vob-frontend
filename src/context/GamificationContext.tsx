import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { gamificationService } from '../services/gamification.service';
import { useGlobalData } from './GlobalDataContext';
import type { GamificationProfile, UserMedal, Goal } from '../types/gamification.types';

interface GamificationContextType {
    profile: GamificationProfile | null;
    medals: UserMedal[];
    goals: Goal[];
    ranking: GamificationProfile[];
    isLoading: boolean;
    refreshGamification: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useGlobalData();
    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [medals, setMedals] = useState<UserMedal[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [ranking, setRanking] = useState<GamificationProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshGamification = useCallback(async () => {
        if (!user?.id) return;

        try {
            // Fetch profile
            const userProfile = await gamificationService.getProfile(user.id);
            setProfile(userProfile);

            // Fetch other data
            const [userMedals, userGoals, globalRanking] = await Promise.all([
                gamificationService.getMedals(user.id),
                gamificationService.getGoals(user.id),
                gamificationService.getRanking()
            ]);

            setMedals(userMedals);
            setGoals(userGoals);
            setRanking(globalRanking);

        } catch (error) {
            console.error('Error refreshing gamification data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshGamification();
    }, [refreshGamification]);

    return (
        <GamificationContext.Provider value={{
            profile,
            medals,
            goals,
            ranking,
            isLoading,
            refreshGamification
        }}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};
