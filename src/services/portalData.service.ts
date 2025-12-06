import { supabase } from '../lib/supabase';
import type { Process } from '../types';
import type { ClientNotification } from '../types/portal.types';
import { storageService } from './storage.service';

/**
 * Portal Data Service
 * Handles data fetching for client portal with RLS enforcement
 * All queries automatically filtered by authenticated client
 */

export interface PortalProcess {
    id: string;
    number: string;
    title: string;
    status: string;
    court: string;
    created_at: string;
    updated_at: string;
    client_name?: string;
}

export interface UpcomingHearing {
    id: string;
    process_number: string;
    process_title: string;
    date: string;
    type: string;
    location?: string;
}

export interface PortalDocument {
    id: string;
    name: string;
    type: string;
    size?: number;
    url?: string;
    processNumber: string;
    processTitle: string;
    uploadedAt: string;
}

class PortalDataService {
    /**
     * Get all processes for authenticated client
     * Respects RLS - only returns client's processes
     */
    async getClientProcesses(clientId: string): Promise<PortalProcess[]> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data, error } = await supabase
                .from('processes')
                .select(`
                    id,
                    number,
                    title,
                    status,
                    court,
                    created_at,
                    updated_at
                `)
                .contains('client_ids', [clientId])
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error: unknown) {
            console.error('Error fetching client processes:', error);
            throw new Error('Erro ao carregar processos');
        }
    }

    /**
     * Get process details
     * Validates client has access to this process
     */
    async getProcessDetails(processId: string, clientId: string): Promise<Process | null> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data, error } = await supabase
                .from('processes')
                .select('*')
                .eq('id', processId)
                .contains('client_ids', [clientId])
                .single();

            if (error) throw error;
            return data;
        } catch (error: unknown) {
            console.error('Error fetching process details:', error);
            return null;
        }
    }

    /**
     * Get client notifications
     * Returns unread and recent read notifications
     */
    async getClientNotifications(clientId: string): Promise<ClientNotification[]> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data, error } = await supabase
                .from('client_notifications')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return data || [];
        } catch (error: unknown) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    /**
     * Mark notification as read
     */
    async markNotificationAsRead(notificationId: string): Promise<boolean> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { error } = await supabase
                .from('client_notifications')
                .update({ read: true })
                .eq('id', notificationId);

            if (error) throw error;
            return true;
        } catch (error: unknown) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    /**
     * Get upcoming hearings for client
     */
    async getUpcomingHearings(clientId: string): Promise<UpcomingHearing[]> {
        try {
            // Get client's processes first
            const processes = await this.getClientProcesses(clientId);
            const processIds = processes.map(p => p.id);

            if (processIds.length === 0) return [];

            if (!supabase) throw new Error('Supabase client not initialized');

            // Get events for these processes
            const { data, error } = await supabase
                .from('events')
                .select(`
                    id,
                    title,
                    date,
                    type,
                    location,
                    process_id,
                    processes (
                        number,
                        title
                    )
                `)
                .in('process_id', processIds)
                .eq('type', 'hearing')
                .gte('date', new Date().toISOString())
                .order('date', { ascending: true })
                .limit(10);

            if (error) throw error;

            return (data || []).map((event: any) => ({
                id: event.id,
                process_number: event.processes?.number || '',
                process_title: event.processes?.title || event.title,
                date: event.date,
                type: event.type,
                location: event.location
            }));
        } catch (error: unknown) {
            console.error('Error fetching upcoming hearings:', error);
            return [];
        }
    }

    /**
     * Search processes by number or title
     */
    async searchProcesses(clientId: string, query: string): Promise<PortalProcess[]> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data, error } = await supabase
                .from('processes')
                .select(`
                    id,
                    number,
                    title,
                    status,
                    court,
                    created_at,
                    updated_at
                `)
                .contains('client_ids', [clientId])
                .or(`number.ilike.%${query}%,title.ilike.%${query}%`)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error: unknown) {
            console.error('Error searching processes:', error);
            return [];
        }
    }

    /**
     * Get process statistics for client
     */
    async getProcessStatistics(clientId: string) {
        try {
            const processes = await this.getClientProcesses(clientId);

            const stats = {
                total: processes.length,
                active: processes.filter(p =>
                    p.status === 'active' || p.status === 'in_progress'
                ).length,
                pending: processes.filter(p => p.status === 'pending').length,
                concluded: processes.filter(p => p.status === 'concluded').length
            };

            return stats;
        } catch (error: unknown) {
            console.error('Error calculating statistics:', error);
            return { total: 0, active: 0, pending: 0, concluded: 0 };
        }
    }

    /**
     * Get message thread for client
     * Phase 5: Messaging feature
     */
    async getClientMessages(clientId: string, direction?: 'from_client' | 'to_client') {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            let query = supabase
                .from('client_messages')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            if (direction) {
                query = query.eq('direction', direction);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error: unknown) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    /**
     * Mark message as read
     * Phase 5: Messaging feature
     */
    async markMessageRead(messageId: string): Promise<boolean> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { error } = await supabase
                .from('client_messages')
                .update({ read: true })
                .eq('id', messageId);

            if (error) throw error;
            return true;
        } catch (error: unknown) {
            console.error('Error marking message as read:', error);
            return false;
        }
    }

    /**
     * Get client documents from all their processes
     * Phase 5: Documents feature
     */
    async getClientDocuments(clientId: string): Promise<PortalDocument[]> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data, error } = await supabase
                .from('documents')
                .select(`
                    id,
                    title,
                    document_type,
                    file_url,
                    file_size,
                    uploaded_at,
                    process_id,
                    processes (
                        process_number,
                        class_name
                    )
                `)
                .eq('client_id', clientId)
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            const docs = await Promise.all((data || []).map(async (doc: any) => {
                let url = doc.file_url;
                if (url && !url.startsWith('http')) {
                    const signedUrl = await storageService.getSignedUrl(url);
                    if (signedUrl) url = signedUrl;
                }

                return {
                    id: doc.id,
                    name: doc.title,
                    type: doc.document_type,
                    size: doc.file_size,
                    url: url,
                    processNumber: doc.processes?.process_number || '',
                    processTitle: doc.processes?.class_name || 'Processo Judicial',
                    uploadedAt: doc.uploaded_at
                };
            }));

            return docs;
        } catch (error: unknown) {
            console.error('Error fetching documents:', error);
            return [];
        }
    }

    /**
     * Send message from client to office
     * Phase 5: Messaging feature
     */
    async sendMessage(clientId: string, message: { title: string; message: string }): Promise<boolean> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { error } = await supabase
                .from('client_messages')
                .insert({
                    client_id: clientId,
                    title: message.title,
                    message: message.message,
                    direction: 'from_client',
                    read: false
                });

            if (error) throw error;
            return true;
        } catch (error: unknown) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
}

export const portalDataService = new PortalDataService();
