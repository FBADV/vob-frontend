import { useState, useEffect } from 'react';
import { certificateStorageService } from '../services/certificateStorage.service';
import type { CertificateInfo } from '../types/certificate.types';
import { useAuth } from '../context/AuthContext';

/**
 * React hook for managing user certificates
 * Handles loading, storing, and removing certificates
 */
export function useCertificate() {
    const { user } = useAuth();
    const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);
    const [hasCertificate, setHasCertificate] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load certificate info on mount
    useEffect(() => {
        loadCertificateInfo();
    }, [user]);

    const loadCertificateInfo = async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const info = await certificateStorageService.getCertificateInfo(user.id);
            setCertificateInfo(info);
            setHasCertificate(info !== null);

        } catch (err: any) {
            console.error('Error loading certificate info:', err);
            setError(err.message || 'Erro ao carregar certificado');
        } finally {
            setIsLoading(false);
        }
    };

    const storeCertificate = async (
        certData: ArrayBuffer,
        password: string,
        info: CertificateInfo
    ): Promise<void> => {
        if (!user?.id) {
            throw new Error('Usuário não autenticado');
        }

        try {
            setError(null);

            await certificateStorageService.storeCertificate(
                user.id,
                certData,
                password,
                info
            );

            // Reload certificate info
            await loadCertificateInfo();

        } catch (err: any) {
            console.error('Error storing certificate:', err);
            setError(err.message || 'Erro ao armazenar certificado');
            throw err;
        }
    };

    const loadCertificateData = async (password: string): Promise<ArrayBuffer> => {
        if (!user?.id) {
            throw new Error('Usuário não autenticado');
        }

        try {
            setError(null);

            const data = await certificateStorageService.loadCertificate(user.id, password);

            if (!data) {
                throw new Error('Certificado não encontrado');
            }

            return data;

        } catch (err: any) {
            console.error('Error loading certificate data:', err);
            setError(err.message || 'Erro ao carregar certificado');
            throw err;
        }
    };

    const removeCertificate = async (): Promise<void> => {
        if (!user?.id) {
            throw new Error('Usuário não autenticado');
        }

        try {
            setError(null);

            await certificateStorageService.removeCertificate(user.id);

            // Clear state
            setCertificateInfo(null);
            setHasCertificate(false);

        } catch (err: any) {
            console.error('Error removing certificate:', err);
            setError(err.message || 'Erro ao remover certificado');
            throw err;
        }
    };

    return {
        certificateInfo,
        hasCertificate,
        isLoading,
        error,
        storeCertificate,
        loadCertificateData,
        removeCertificate,
        reload: loadCertificateInfo
    };
}
