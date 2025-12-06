import { supabase } from '../lib/supabase';
import type { Certificate, CertificateInfo } from '../types/certificate.types';
import { encryptData, decryptData, encryptedDataToStorable, storableToEncryptedData, type StorableEncryptedData } from '../utils/crypto.utils';

/**
 * Service for storing and retrieving encrypted certificates from Supabase
 */
class CertificateStorageService {
    // private readonly STORAGE_BUCKET = 'certificates';
    private readonly TABLE_NAME = 'user_certificates';

    /**
     * Store encrypted certificate in Supabase
     * @param userId - User ID who owns the certificate
     * @param certData - Raw certificate data (ArrayBuffer)
     * @param password - User's password for encryption
     * @param info - Certificate information
     * @returns Stored certificate record
     */
    async storeCertificate(
        userId: string,
        certData: ArrayBuffer,
        password: string,
        info: CertificateInfo
    ): Promise<Certificate> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            // 1. Encrypt certificate data
            const encrypted = await encryptData(certData, password);
            const storable = encryptedDataToStorable(encrypted);

            // 2. Create certificate record
            const certificate: Certificate = {
                id: crypto.randomUUID(),
                userId,
                info,
                encryptedData: JSON.stringify(storable),
                storedAt: new Date().toISOString(),
                lastUsedAt: new Date().toISOString()
            };

            // 3. Store in Supabase
            const { error } = await supabase
                .from(this.TABLE_NAME)
                .insert({
                    id: certificate.id,
                    user_id: userId,
                    subject: info.subject,
                    issuer: info.issuer,
                    serial_number: info.serialNumber,
                    valid_from: info.validFrom.toISOString(),
                    valid_to: info.validTo.toISOString(),
                    cpf_cnpj: info.cpfCnpj,
                    email: info.email,
                    organization: info.organization,
                    encrypted_data: certificate.encryptedData,
                    stored_at: certificate.storedAt,
                    last_used_at: certificate.lastUsedAt
                } as any)
                .select()
                .single();

            if (error) {
                throw new Error(`Erro ao armazenar certificado: ${error.message}`);
            }

            return certificate;

        } catch (error: any) {
            console.error('Error storing certificate:', error);
            throw new Error(error.message || 'Erro ao armazenar certificado');
        }
    }

    /**
     * Load and decrypt certificate from Supabase
     * @param userId - User ID
     * @param password - User's password for decryption
     * @returns Decrypted certificate data
     */
    async loadCertificate(userId: string, password: string): Promise<ArrayBuffer | null> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            // 1. Fetch certificate from Supabase
            const { data, error } = await supabase
                .from(this.TABLE_NAME)
                .select('*')
                .eq('user_id', userId)
                .order('stored_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No certificate found
                    return null;
                }
                throw new Error(`Erro ao carregar certificado: ${error.message}`);
            }

            if (!data || !(data as any).encrypted_data) {
                return null;
            }

            // 2. Parse encrypted data
            const storable: StorableEncryptedData = JSON.parse((data as any).encrypted_data);
            const encrypted = storableToEncryptedData(storable);

            // 3. Decrypt
            const decrypted = await decryptData(encrypted, password);

            // 4. Update last used timestamp
            await supabase
                .from(this.TABLE_NAME)
                // @ts-ignore
                .update({ last_used_at: new Date().toISOString() })
                .eq('id', (data as any).id);

            return decrypted;

        } catch (error: any) {
            console.error('Error loading certificate:', error);

            if (error.message?.includes('decrypt')) {
                throw new Error('Senha incorreta ou certificado corrompido');
            }

            throw new Error(error.message || 'Erro ao carregar certificado');
        }
    }

    /**
     * Get certificate information without decrypting
     * @param userId - User ID
     * @returns Certificate information or null
     */
    async getCertificateInfo(userId: string): Promise<CertificateInfo | null> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data: rawData, error } = await supabase
                .from(this.TABLE_NAME)
                .select('*')
                .eq('user_id', userId)
                .order('stored_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw error;
            }

            if (!rawData) return null;

            const data = rawData as any;

            // Calculate days until expiration
            const validTo = new Date(data.valid_to);
            const now = new Date();
            const daysUntilExpiration = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return {
                subject: data.subject,
                issuer: data.issuer,
                serialNumber: data.serial_number,
                validFrom: new Date(data.valid_from),
                validTo: validTo,
                cpfCnpj: data.cpf_cnpj,
                email: data.email,
                organization: data.organization,
                isValid: now >= new Date(data.valid_from) && now <= validTo,
                daysUntilExpiration
            };

        } catch (error: any) {
            console.error('Error getting certificate info:', error);
            return null;
        }
    }

    /**
     * Remove certificate from storage
     * @param userId - User ID
     */
    async removeCertificate(userId: string): Promise<void> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { error } = await supabase
                .from(this.TABLE_NAME)
                .delete()
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Erro ao remover certificado: ${error.message}`);
            }

        } catch (error: any) {
            console.error('Error removing certificate:', error);
            throw new Error(error.message || 'Erro ao remover certificado');
        }
    }

    /**
     * Check if user has a certificate stored
     * @param userId - User ID
     * @returns True if certificate exists
     */
    async hasCertificate(userId: string): Promise<boolean> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { count, error } = await supabase
                .from(this.TABLE_NAME)
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (error) {
                console.error('Error checking certificate:', error);
                return false;
            }

            return (count ?? 0) > 0;

        } catch (error) {
            console.error('Error checking certificate:', error);
            return false;
        }
    }
}

export const certificateStorageService = new CertificateStorageService();
