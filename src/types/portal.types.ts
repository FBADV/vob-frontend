/**
 * Client Portal Type Definitions
 * Defines all types for the client portal system
 */

// ================================================
// CLIENT PORTAL ACCESS
// ================================================

export interface ClientPortalAccess {
    id: string;
    clientId: string;
    enabled: boolean;
    activationCode: string | null;
    passwordHash: string | null;
    firstAccessCompleted: boolean;
    lastLoginAt: string | null;
    loginAttempts: number;
    lockedUntil: string | null;
    passwordResetToken: string | null;
    passwordResetExpires: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePortalAccessInput {
    clientId: string;
    activationCode: string;
    passwordHash: string;
    enabled?: boolean;
}

export interface UpdatePortalAccessInput {
    enabled?: boolean;
    passwordHash?: string;
    firstAccessCompleted?: boolean;
    lastLoginAt?: string;
    loginAttempts?: number;
    lockedUntil?: string | null;
    passwordResetToken?: string | null;
    passwordResetExpires?: string | null;
}

// ================================================
// PORTAL AUTHENTICATION
// ================================================

export interface PortalLoginCredentials {
    cpf: string; // CPF without formatting
    password: string;
}

export interface PortalAuthResponse {
    success: boolean;
    requirePasswordChange?: boolean;
    accessToken?: string;
    refreshToken?: string;
    client?: {
        id: string;
        name: string;
        email: string;
        cpf: string;
    };
    error?: string;
}

export interface PortalAuthState {
    isAuthenticated: boolean;
    client: {
        id: string;
        name: string;
        email: string;
        cpf: string;
    } | null;
    accessToken: string | null;
}

// ================================================
// CLIENT MESSAGES
// ================================================

export type MessageSenderType = 'client' | 'office';

export interface ClientMessage {
    id: string;
    clientId: string;
    senderType: MessageSenderType;
    senderId: string | null;
    senderName: string | null;
    subject: string | null;
    message: string;
    read: boolean;
    readAt: string | null;
    repliedTo: string | null; // ID of message being replied to
    createdAt: string;
}

export interface CreateMessageInput {
    clientId: string;
    senderType: MessageSenderType;
    senderId?: string;
    senderName?: string;
    subject?: string;
    message: string;
    repliedTo?: string;
}

export interface MessageThread {
    original: ClientMessage;
    replies: ClientMessage[];
}

// ================================================
// CLIENT NOTIFICATIONS
// ================================================

export type NotificationType =
    | 'process_update'
    | 'new_document'
    | 'hearing'
    | 'message'
    | 'system';

export interface ClientNotification {
    id: string;
    clientId: string;
    type: NotificationType;
    title: string;
    description: string | null;
    link: string | null;
    metadata: Record<string, any> | null;
    read: boolean;
    readAt: string | null;
    createdAt: string;
}

export interface CreateNotificationInput {
    clientId: string;
    type: NotificationType;
    title: string;
    description?: string;
    link?: string;
    metadata?: Record<string, any>;
}

// ================================================
// PORTAL DASHBOARD
// ================================================

export interface PortalDashboardData {
    client: {
        id: string;
        name: string;
        email: string;
        cpf: string;
    };
    stats: {
        totalProcesses: number;
        activeProcesses: number;
        recentUpdates: number;
        upcomingHearings: number;
        unreadMessages: number;
        unreadNotifications: number;
    };
    recentProcesses: Array<{
        id: string;
        number: string;
        title: string;
        status: string;
        lastUpdate: string;
    }>;
    upcomingEvents: Array<{
        id: string;
        type: string;
        title: string;
        date: string;
        processNumber: string;
    }>;
    recentNotifications: ClientNotification[];
}

// ================================================
// ACTIVATION
// ================================================

export interface ActivationRequest {
    clientId: string;
    sendSMS?: boolean;
}

export interface ActivationResponse {
    success: boolean;
    activationCode?: string;
    temporaryPassword?: string;
    emailSent: boolean;
    smsSent: boolean;
    error?: string;
}

// ================================================
// PASSWORD MANAGEMENT
// ================================================

export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface PasswordResetRequest {
    cpf: string;
}

export interface PasswordResetConfirm {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface PasswordRequirements {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSpecial: boolean;
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true
};

// ================================================
// PORTAL PREFERENCES
// ================================================

export interface PortalPreferences {
    emailNotifications: boolean;
    smsNotifications: boolean;
    notifyOnProcessUpdate: boolean;
    notifyOnNewDocument: boolean;
    notifyOnHearing: boolean;
    notifyOnMessage: boolean;
}
