import type { CourtType } from '../types';

/**
 * Determines the court type based on CNJ process number
 * CNJ Format: NNNNNNN-DD.AAAA.J.TR.OOOO
 * J = Justice segment (1-9)
 * TR = Tribunal code
 */
export const getCourtTypeFromCNJ = (processNumber: string): CourtType => {
    if (!processNumber) return 'unknown';

    // Remove formatting and extract components
    const cleaned = processNumber.replace(/\D/g, '');
    if (cleaned.length < 20) return 'unknown';

    // Extract J (justice segment) - position 13 (0-indexed)
    const justiceSegment = cleaned.charAt(13);

    // Extract TR (tribunal) - positions 14-15
    const tribunal = cleaned.substring(14, 16);

    // Determine court type based on justice segment
    switch (justiceSegment) {
        case '1': // Supremo Tribunal Federal
            return 'stf';
        case '2': // Conselho Nacional de Justiça
            return 'unknown';
        case '3': // Superior Tribunal de Justiça
            return 'stj';
        case '4': // Justiça Federal
            // Check if it's 1st or 2nd degree
            if (tribunal.startsWith('5')) {
                return 'federal2'; // TRF (Tribunal Regional Federal)
            }
            return 'federal1';
        case '5': // Justiça do Trabalho
            return 'labor';
        case '6': // Justiça Eleitoral
            return 'unknown';
        case '7': // Justiça Militar da União
            return 'unknown';
        case '8': // Justiça Estadual
            // Check if it's 1st or 2nd degree
            if (tribunal.startsWith('2')) {
                return 'state2'; // TJ (Tribunal de Justiça)
            }
            return 'state1';
        case '9': // Justiça Militar Estadual
            return 'unknown';
        default:
            return 'unknown';
    }
};

/**
 * Gets a human-readable label for the court type
 */
export const getCourtTypeLabel = (courtType: CourtType): string => {
    const labels: Record<CourtType, string> = {
        state1: 'Estadual 1º Grau',
        state2: 'Estadual 2º Grau',
        labor: 'Trabalhista',
        federal1: 'Federal 1º Grau',
        federal2: 'Federal 2º Grau',
        stj: 'STJ',
        stf: 'STF',
        unknown: 'Desconhecido'
    };
    return labels[courtType] || 'Desconhecido';
};

/**
 * Extracts initials from a full name (first letter of first name + first letter of last name)
 */
export const getInitials = (name: string): string => {
    if (!name) return '';

    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }

    // First letter of first name + first letter of last name
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);

    return (firstInitial + lastInitial).toUpperCase();
};
