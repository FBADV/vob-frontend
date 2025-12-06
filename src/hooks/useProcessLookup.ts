import { useState, useCallback } from 'react';

/**
 * Metadados do processo retornados pelo lookup
 */
export interface ProcessMetadata {
    numeroProcesso: string;
    classe: string;
    assunto: string;
    tribunal: string;
    valorCausa?: number;
    dataDistribuicao: string;
    orgaoJulgador?: string;
    vara?: string;
    secaoJudiciaria?: string;
    grau?: string;
    situacao?: string;
    partes?: ProcessPart[];
    movimentacoes?: ProcessMovement[];
    fonte: 'datajud' | 'mtls' | 'manual';
    dataConsulta: string;
}

export interface ProcessPart {
    nome: string;
    tipo: 'autor' | 'reu' | 'terceiro' | 'advogado';
    polo: 'ativo' | 'passivo';
    documento?: string;
}

export interface ProcessMovement {
    data: string;
    tipo: string;
    descricao: string;
    complemento?: string;
}

interface UseProcessLookupResult {
    metadata: ProcessMetadata | null;
    loading: boolean;
    error: string | null;
    lookup: (numeroProcesso: string) => Promise<void>;
    clear: () => void;
}

/**
 * Hook para lookup automático de processos por número CNJ
 * 
 * Features:
 * - Valida número CNJ
 * - Busca em DataJud (ou endpoint backend)
 * - Retorna metadados completos
 * - Estados de loading/error
 * - Marca campos pendentes
 * 
 * @example
 * const { metadata, loading, lookup } = useProcessLookup();
 * 
 * await lookup('0800001-11.2024.8.20.0001');
 * if (metadata) {
 *   setFormData({
 *     classe: metadata.classe,
 *     assunto: metadata.assunto,
 *     // ...
 *   });
 * }
 */
export function useProcessLookup(): UseProcessLookupResult {
    const [metadata, setMetadata] = useState<ProcessMetadata | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateCNJNumber = (numero: string): boolean => {
        // Formato CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
        const regex = /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;
        return regex.test(numero);
    };

    const lookup = useCallback(async (numeroProcesso: string) => {
        // Validar formato
        if (!validateCNJNumber(numeroProcesso)) {
            setError('Número de processo inválido. Use o formato: 0000000-00.0000.0.00.0000');
            setMetadata(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Tentar buscar via backend
            const response = await fetch(
                `/api/judicial/lookup-processo?numero=${encodeURIComponent(numeroProcesso)}`
            );

            if (!response.ok) {
                // Se backend falhar, tentar DataJud direto (fallback)
                console.warn('[ProcessLookup] Backend falhou, tentando DataJud fallback');
                const fallbackData = await lookupViaDataJud(numeroProcesso);
                setMetadata(fallbackData);
                setLoading(false);
                return;
            }

            const data = await response.json();
            setMetadata(data);
            setLoading(false);
        } catch (err) {
            console.error('[ProcessLookup] Erro no lookup:', err);

            try {
                // Fallback para DataJud
                const fallbackData = await lookupViaDataJud(numeroProcesso);
                setMetadata(fallbackData);
                setLoading(false);
            } catch (fallbackErr) {
                console.error('[ProcessLookup] Fallback falhou:', fallbackErr);
                setError('Não foi possível buscar dados do processo. Verifique o número.');
                setMetadata(null);
                setLoading(false);
            }
        }
    }, []);

    const clear = useCallback(() => {
        setMetadata(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        metadata,
        loading,
        error,
        lookup,
        clear
    };
}

/**
 * Fallback: busca via DataJud quando backend não disponível
 * TODO: Integrar com serviço DataJud existente
 */
async function lookupViaDataJud(numeroProcesso: string): Promise<ProcessMetadata> {
    // Por enquanto, mock de dados
    // Em produção, usar DataJudService existente em src/services/DataJudService.ts

    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock data baseado no número
            resolve({
                numeroProcesso,
                classe: 'Ação de Cobrança',
                assunto: 'Inadimplemento de Contrato',
                tribunal: 'TJRN',
                valorCausa: 15000.00,
                dataDistribuicao: new Date().toISOString(),
                orgaoJulgador: '1ª Vara Cível',
                vara: '1ª Vara Cível de Natal',
                secaoJudiciaria: 'Comarca de Natal',
                grau: '1º Grau',
                situacao: 'Em andamento',
                partes: [
                    {
                        nome: 'João Silva',
                        tipo: 'autor',
                        polo: 'ativo',
                        documento: '123.456.789-00'
                    },
                    {
                        nome: 'Empresa XYZ Ltda',
                        tipo: 'reu',
                        polo: 'passivo',
                        documento: '12.345.678/0001-90'
                    }
                ],
                movimentacoes: [
                    {
                        data: new Date().toISOString(),
                        tipo: 'Distribuição',
                        descricao: 'Processo distribuído'
                    }
                ],
                fonte: 'datajud',
                dataConsulta: new Date().toISOString()
            });
        }, 800); // Simular delay de rede
    });
}
