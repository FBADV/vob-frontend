import { supabase } from '../lib/supabase';
import type {
    // ClientPortalAccess,
    ActivationRequest,
    ActivationResponse,
    PortalLoginCredentials,
    PortalAuthResponse,
    PasswordChangeRequest
} from '../types/portal.types';

/**
 * Client Portal Service
 * Handles portal authentication via Supabase Auth and RPCs
 */
class ClientPortalService {

    /**
     * Generate random activation code (8 chars, uppercase + numbers)
     */
    generateActivationCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * Normalize CPF (remove formatting)
     */
    normalizeCPF(cpf: string): string {
        return cpf.replace(/\D/g, '');
    }

    /**
     * Format virtual email for Supabase Auth
     */
    getVirtualEmail(cpf: string): string {
        return `${this.normalizeCPF(cpf)}@portal.vob.internal`;
    }

    /**
     * Activate portal access for a client (Admin side)
     */
    async activatePortalAccess(request: ActivationRequest): Promise<ActivationResponse> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            // Get client info
            const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .select('id, name, email, document')
                .eq('id', request.clientId)
                .single();

            const client = clientData as any;

            if (clientError || !client) {
                return { success: false, error: 'Cliente não encontrado', emailSent: false, smsSent: false };
            }

            if (!client.document) return { success: false, error: 'Cliente sem CPF cadastrado', emailSent: false, smsSent: false };
            if (!client.email) return { success: false, error: 'Cliente sem e-mail cadastrado', emailSent: false, smsSent: false };

            const activationCode = this.generateActivationCode();

            // Create or update portal access
            const { error: insertError } = await supabase
                .from('client_portal_access')
                .upsert({
                    client_id: request.clientId,
                    enabled: true,
                    activation_code: activationCode,
                    first_access_completed: false,
                    login_attempts: 0,
                    locked_until: null
                } as any);

            if (insertError) throw insertError;

            // Mock sending email/SMS
            return {
                success: true,
                activationCode,
                emailSent: true,
                smsSent: request.sendSMS || false
            };

        } catch (err: any) {
            console.error('Activation error:', err);
            return { success: false, error: err.message || 'Erro ao ativar portal', emailSent: false, smsSent: false };
        }
    }

    /**
     * Verify Activation Code (Client side - First Access)
     */
    async verifyActivationCode(cpf: string, code: string): Promise<boolean> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .rpc('verify_activation_code', {
                p_cpf: this.normalizeCPF(cpf),
                p_code: code
            } as any);

        if (error) throw error;
        return !!data;
    }

    /**
     * Complete First Access (Client side)
     * Signs up the user in Supabase Auth and updates DB
     */
    async completeFirstAccess(cpf: string, code: string, password: string): Promise<{ success: boolean; error?: string }> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            // 1. Verify code again
            const isValid = await this.verifyActivationCode(cpf, code);
            if (!isValid) return { success: false, error: 'Código inválido ou expirado' };

            // 2. Sign Up in Supabase Auth
            const email = this.getVirtualEmail(cpf);
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        cpf: this.normalizeCPF(cpf),
                        role: 'client'
                    }
                }
            });

            if (error) throw error;

            // 3. Mark activation as complete via RPC
            const { error: rpcError } = await supabase
                .rpc('complete_activation', { p_cpf: this.normalizeCPF(cpf) } as any);

            if (rpcError) throw rpcError;

            return { success: true };

        } catch (err: any) {
            console.error('First access error:', err);
            return { success: false, error: err.message || 'Erro ao concluir cadastro' };
        }
    }

    /**
     * Portal Login (Client side)
     */
    async login(credentials: PortalLoginCredentials): Promise<PortalAuthResponse> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const email = this.getVirtualEmail(credentials.cpf);

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: credentials.password
            });

            if (error) throw error;

            // Fetch client data
            const { data: clientData } = await supabase
                .from('clients')
                .select('id, name, email, document')
                .eq('document', this.normalizeCPF(credentials.cpf))
                .single();

            const client = clientData as any;

            return {
                success: true,
                requirePasswordChange: false,
                client: client ? {
                    id: client.id,
                    name: client.name,
                    email: client.email,
                    cpf: client.document
                } : undefined,
                accessToken: data.session?.access_token
            };

        } catch (err: any) {
            console.error('Login error:', err);
            return { success: false, error: 'CPF ou senha inválidos' };
        }
    }

    /**
     * Change Password
     */
    async changePassword(_clientId: string, request: PasswordChangeRequest): Promise<{ success: boolean; error?: string }> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            if (request.newPassword !== request.confirmPassword) {
                return { success: false, error: 'As senhas não coincidem' };
            }

            const { error } = await supabase.auth.updateUser({
                password: request.newPassword
            });

            if (error) throw error;

            return { success: true };

        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
}

export const clientPortalService = new ClientPortalService();
