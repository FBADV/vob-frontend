import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
    type GamificationProfile,
    type EventType,
    POINTS_TABLE,
    LEVEL_THRESHOLDS,
    type Goal
} from '../types/gamification.types';

const STORAGE_KEYS = {
    profile: 'vob_gamification_profile',
    events: 'vob_gamification_events',
    goals: 'vob_gamification_goals',
    medals: 'vob_user_medals'
};

export const gamificationService = {
    /**
     * Get user's gamification profile
     */
    async getProfile(userId: string): Promise<GamificationProfile | null> {
        if (!isSupabaseConfigured()) {
            const profile = localStorage.getItem(STORAGE_KEYS.profile);
            return profile ? JSON.parse(profile) : this.createInitialProfile(userId);
        }

        const { data, error } = await supabase!
            .from('gamification_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create one
            return this.createProfile(userId);
        }

        if (error) throw error;
        return this.mapDbProfileToProfile(data);
    },

    /**
     * Register a new event and update user stats
     */
    async registerEvent(userId: string, eventType: EventType, metadata?: any): Promise<void> {
        const points = POINTS_TABLE[eventType];

        if (!isSupabaseConfigured()) {
            this.registerEventLocal(userId, eventType, points, metadata);
            return;
        }

        // 1. Log event
        await (supabase!
            .from('gamification_events') as any)
            .insert({
                user_id: userId,
                event_type: eventType,
                points,
                metadata
            });

        // 2. Update profile
        const { data: profileData } = await supabase!
            .from('gamification_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        const profile = profileData as any;

        if (profile) {
            const newXp = (profile.current_xp || 0) + points;
            const newTotal = (profile.total_points_all_time || 0) + points;
            const newLevel = this.calculateLevel(newTotal);

            await (supabase!
                .from('gamification_profiles') as any)
                .update({
                    current_xp: newXp,
                    total_points_all_time: newTotal,
                    current_level: newLevel,
                    last_activity_date: new Date().toISOString()
                })
                .eq('user_id', userId);
        }
    },

    /**
     * Create a new profile for a user
     */
    async createProfile(userId: string): Promise<GamificationProfile> {
        if (!isSupabaseConfigured()) {
            return this.createInitialProfile(userId);
        }

        const { data, error } = await (supabase!
            .from('gamification_profiles') as any)
            .insert({
                user_id: userId,
                current_level: 1,
                current_xp: 0,
                total_points_all_time: 0
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapDbProfileToProfile(data);
    },

    // ============================================================================
    // LOCAL STORAGE FALLBACKS
    // ============================================================================

    createInitialProfile(userId: string): GamificationProfile {
        const profile: GamificationProfile = {
            userId,
            currentLevel: 1,
            currentXp: 0,
            totalPointsAllTime: 0,
            totalPointsYear: 0,
            streakDays: 0,
            lastActivityDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
        return profile;
    },

    registerEventLocal(userId: string, eventType: EventType, points: number, metadata?: any) {
        // Get current profile
        const profileStr = localStorage.getItem(STORAGE_KEYS.profile);
        let profile = profileStr ? JSON.parse(profileStr) : this.createInitialProfile(userId);

        // Update stats
        profile.currentXp += points;
        profile.totalPointsAllTime += points;
        profile.currentLevel = this.calculateLevel(profile.totalPointsAllTime);
        profile.lastActivityDate = new Date().toISOString();

        // Save profile
        localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));

        // Save event
        const eventsStr = localStorage.getItem(STORAGE_KEYS.events);
        const events = eventsStr ? JSON.parse(eventsStr) : [];
        events.push({
            id: crypto.randomUUID(),
            userId,
            eventType,
            points,
            metadata,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
    },

    // ============================================================================
    // HELPERS
    // ============================================================================

    calculateLevel(totalPoints: number): number {
        let level = 1;
        for (const [lvl, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
            if (totalPoints >= threshold) {
                level = Number(lvl);
            } else {
                break;
            }
        }
        return level;
    },

    async getMedals(userId: string): Promise<any[]> {
        if (!isSupabaseConfigured()) return [];

        const { data, error } = await supabase!
            .from('user_medals')
            .select(`
                *,
                medal:medals(*)
            `)
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching medals:', error);
            return [];
        }

        return data || [];
    },

    async getGoals(userId: string): Promise<Goal[]> {
        if (!isSupabaseConfigured()) return [];

        const { data, error } = await supabase!
            .from('goals')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active');

        if (error) {
            console.error('Error fetching goals:', error);
            return [];
        }

        return data || [];
    },

    async getRanking(limit = 10): Promise<GamificationProfile[]> {
        if (!isSupabaseConfigured()) return [];

        const { data, error } = await supabase!
            .from('gamification_profiles')
            .select('*')
            .order('total_points_year', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching ranking:', error);
            return [];
        }

        return (data || []).map(this.mapDbProfileToProfile);
    },

    mapDbProfileToProfile(dbProfile: any): GamificationProfile {
        return {
            userId: dbProfile.user_id,
            currentLevel: dbProfile.current_level,
            currentXp: dbProfile.current_xp,
            totalPointsAllTime: dbProfile.total_points_all_time,
            totalPointsYear: dbProfile.total_points_year,
            streakDays: dbProfile.streak_days,
            lastActivityDate: dbProfile.last_activity_date,
            createdAt: dbProfile.created_at,
            updatedAt: dbProfile.updated_at
        };
    }
};
