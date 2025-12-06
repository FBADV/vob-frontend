import { supabase } from '../lib/supabase';
import type {
    ProcessParty,
    CreateProcessPartyInput,
    UpdateProcessPartyInput,
    GroupedProcessParties,
    PartyClientMatch
} from '../types/processParty.types';
import { findMatchingClients } from '../utils/fuzzyMatch';
import type { Client } from '../types';

/**
 * Service for managing process parties (multi-client support)
 */
class ProcessPartiesService {
    /**
     * Get all parties for a specific process
     */
    async getProcessParties(processId: string): Promise<ProcessParty[]> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('process_parties')
            .select('*')
            .eq('process_id', processId)
            .order('role', { ascending: true });

        if (error) {
            console.error('Error fetching process parties:', error);
            throw error;
        }

        return this.mapToProcessParties(data || []);
    }

    /**
     * Get all parties grouped by role
     */
    async getGroupedParties(processId: string): Promise<GroupedProcessParties> {
        const parties = await this.getProcessParties(processId);

        return {
            plaintiffs: parties.filter(p => p.role === 'plaintiff'),
            defendants: parties.filter(p => p.role === 'defendant'),
            thirdParties: parties.filter(p => p.role === 'third_party')
        };
    }

    /**
     * Get all clients associated with a process
     */
    async getProcessClients(processId: string): Promise<ProcessParty[]> {
        const parties = await this.getProcessParties(processId);
        return parties.filter(p => p.isClient);
    }

    /**
     * Create a new process party
     */
    async createProcessParty(input: CreateProcessPartyInput): Promise<ProcessParty> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('process_parties')
            .insert({
                process_id: input.processId,
                name: input.name,
                role: input.role,
                type: input.type,
                document: input.document,
                is_client: input.isClient || false,
                client_id: input.clientId,
                lawyer_oab: input.lawyerOab,
                lawyer_name: input.lawyerName,
                email: input.email,
                phone: input.phone,
                address: input.address
            } as any)
            .select()
            .single();

        if (error) {
            console.error('Error creating process party:', error);
            throw error;
        }

        return this.mapToProcessParty(data);
    }

    /**
     * Create multiple parties at once
     */
    async createMultipleParties(parties: CreateProcessPartyInput[]): Promise<ProcessParty[]> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const rows = parties.map(p => ({
            process_id: p.processId,
            name: p.name,
            role: p.role,
            type: p.type,
            document: p.document,
            is_client: p.isClient || false,
            client_id: p.clientId,
            lawyer_oab: p.lawyerOab,
            lawyer_name: p.lawyerName,
            email: p.email,
            phone: p.phone,
            address: p.address
        }));

        const { data, error } = await supabase
            .from('process_parties')
            .insert(rows as any)
            .select();

        if (error) {
            console.error('Error creating multiple parties:', error);
            throw error;
        }

        return this.mapToProcessParties(data || []);
    }

    /**
     * Update a process party
     */
    async updateProcessParty(partyId: string, input: UpdateProcessPartyInput): Promise<ProcessParty> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const updateData: any = {};

        if (input.name !== undefined) updateData.name = input.name;
        if (input.document !== undefined) updateData.document = input.document;
        if (input.isClient !== undefined) updateData.is_client = input.isClient;
        if (input.clientId !== undefined) updateData.client_id = input.clientId;
        if (input.lawyerOab !== undefined) updateData.lawyer_oab = input.lawyerOab;
        if (input.lawyerName !== undefined) updateData.lawyer_name = input.lawyerName;
        if (input.email !== undefined) updateData.email = input.email;
        if (input.phone !== undefined) updateData.phone = input.phone;
        if (input.address !== undefined) updateData.address = input.address;

        const { data, error } = await supabase
            .from('process_parties')
            // @ts-ignore
            .update(updateData)
            .eq('id', partyId)
            .select()
            .single();

        if (error) {
            console.error('Error updating process party:', error);
            throw error;
        }

        return this.mapToProcessParty(data);
    }

    /**
     * Delete a process party
     */
    async deleteProcessParty(partyId: string): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { error } = await supabase
            .from('process_parties')
            .delete()
            .eq('id', partyId);

        if (error) {
            console.error('Error deleting process party:', error);
            throw error;
        }
    }

    /**
     * Identify which parties might be clients using fuzzy matching
     */
    async identifyClientParties(parties: CreateProcessPartyInput[], allClients: Client[]): Promise<PartyClientMatch[]> {
        const results: PartyClientMatch[] = [];

        for (const party of parties) {
            let matchedClient: { id: string; name: string; similarity: number } | undefined;
            let suggestedClients;

            //  Match exato por CPF/CNPJ
            if (party.document) {
                const exactMatch = allClients.find(c => c.document === party.document);
                if (exactMatch) {
                    matchedClient = {
                        id: exactMatch.id,
                        name: exactMatch.name,
                        similarity: 100
                    };
                }
            }

            // 2. Fuzzy match por nome se não encontrou por documento
            if (!matchedClient) {
                const matches = findMatchingClients(party.name, allClients);

                if (matches.length > 0) {
                    if (matches[0].isExact || matches[0].similarity >= 95) {
                        // Match muito alto - auto-select
                        matchedClient = {
                            id: matches[0].client.id,
                            name: matches[0].client.name,
                            similarity: matches[0].similarity
                        };
                    } else if (matches[0].similarity >= 80) {
                        // Sugestões para o usuário escolher
                        suggestedClients = matches.map(m => ({
                            id: m.client.id,
                            name: m.client.name,
                            similarity: m.similarity
                        }));
                    }
                }
            }

            // Criar party temporário para resultado
            const tempParty: ProcessParty = {
                id: crypto.randomUUID(),
                processId: party.processId,
                name: party.name,
                role: party.role,
                type: party.type,
                document: party.document,
                isClient: !!matchedClient,
                clientId: matchedClient?.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            results.push({
                party: tempParty,
                matchedClient,
                suggestedClients
            });
        }

        return results;
    }

    /**
     * Replace all parties for a process (used when syncing with external sources)
     */
    async replaceProcessParties(processId: string, newParties: CreateProcessPartyInput[]): Promise<ProcessParty[]> {
        if (!supabase) throw new Error('Supabase client not initialized');

        // Delete existing parties
        await supabase
            .from('process_parties')
            .delete()
            .eq('process_id', processId);

        // Insert new parties
        return this.createMultipleParties(newParties);
    }

    // Helper: Map database row to ProcessParty
    private mapToProcessParty(data: any): ProcessParty {
        return {
            id: data.id,
            processId: data.process_id,
            name: data.name,
            role: data.role,
            type: data.type,
            document: data.document,
            isClient: data.is_client,
            clientId: data.client_id,
            lawyerOab: data.lawyer_oab,
            lawyerName: data.lawyer_name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    }

    // Helper: Map array of database rows
    private mapToProcessParties(data: any[]): ProcessParty[] {
        return data.map(d => this.mapToProcessParty(d));
    }
}

export const processPartiesService = new ProcessPartiesService();
