export type GamificationProfile = {
    userId: string;
    currentLevel: number;
    currentXp: number;
    totalPointsAllTime: number;
    totalPointsYear: number;
    streakDays: number;
    lastActivityDate: string | null;
    createdAt: string;
    updatedAt: string;
};

export type GamificationEvent = {
    id: string;
    userId: string;
    eventType: EventType;
    points: number;
    metadata: Record<string, any> | null;
    createdAt: string;
};

export type Medal = {
    id: string;
    code: string;
    name: string;
    description: string;
    iconName: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xpReward: number;
    createdAt: string;
};

export type UserMedal = {
    id: string;
    userId: string;
    medalId: string;
    earnedAt: string;
    medal?: Medal; // Joined data
};

export type Goal = {
    id: string;
    userId: string;
    goalType: 'weekly' | 'monthly';
    description: string;
    targetValue: number;
    currentValue: number;
    status: 'active' | 'completed' | 'failed';
    startDate: string;
    endDate: string;
    rewardXp: number;
    createdAt: string;
    updatedAt: string;
};

export type EventType =
    | 'PROCESS_CREATED'
    | 'PROCESS_UPDATED'
    | 'PROCESS_DELETED'
    | 'TASK_COMPLETED'
    | 'HEARING_ATTENDED'
    | 'CLIENT_REGISTERED'
    | 'FINANCIAL_ENTRY'
    | 'DOCUMENT_UPLOADED'
    | 'GOAL_COMPLETED'
    | 'STREAK_BONUS'
    | 'SERVICE_CREATED'
    | 'LEAD_WON'
    | 'REVENUE_REGISTERED';

export const LEVEL_THRESHOLDS = {
    1: 0,
    2: 1000,
    3: 2500,
    4: 5000,
    5: 10000,
    6: 20000,
    7: 35000,
    8: 50000,
    9: 75000,
    10: 100000
};

export const POINTS_TABLE: Record<EventType, number> = {
    PROCESS_CREATED: 100,
    PROCESS_UPDATED: 20,
    PROCESS_DELETED: 0,
    TASK_COMPLETED: 50,
    HEARING_ATTENDED: 150,
    CLIENT_REGISTERED: 80,
    FINANCIAL_ENTRY: 30,
    DOCUMENT_UPLOADED: 10,
    GOAL_COMPLETED: 500,
    STREAK_BONUS: 100,
    SERVICE_CREATED: 120,
    LEAD_WON: 200,
    REVENUE_REGISTERED: 50
};
