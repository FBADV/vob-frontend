/**
 * Service for parsing and validating Brazilian process numbers (CNJ standard)
 * Pattern: NNNNNNN-DD.AAAA.J.TR.OOOO
 * 
 * Where:
 * - NNNNNNN: Sequential process number
 * - DD: Verification digit
 * - AAAA: Year of filing
 * - J: Justice segment (1=Federal, 2=Labor, 3=Electoral, 4=Military, 5=State, 8=Transparency, 9=Superior)
 * - TR: Court code
 * - OOOO: Origin court/district
 */

export interface ProcessNumberParts {
    sequentialNumber: string;
    verificationDigit: string;
    year: string;
    justiceSegment: string;
    courtCode: string;
    originCode: string;
    isValid: boolean;
}

// Mapping of court codes to tribunal IDs
const COURT_CODE_TO_TRIBUNAL: Record<string, string> = {
    // Justiça Federal (segmento 1)
    '1.01': 'trf1', '1.02': 'trf2', '1.03': 'trf3', '1.04': 'trf4', '1.05': 'trf5', '1.06': 'trf6',

    // Justiça do Trabalho (segmento 2)
    '2.01': 'trt1', '2.02': 'trt2', '2.03': 'trt3', '2.04': 'trt4', '2.05': 'trt5',
    '2.06': 'trt6', '2.07': 'trt7', '2.08': 'trt8', '2.09': 'trt9', '2.10': 'trt10',
    '2.11': 'trt11', '2.12': 'trt12', '2.13': 'trt13', '2.14': 'trt14', '2.15': 'trt15',
    '2.16': 'trt16', '2.17': 'trt17', '2.18': 'trt18', '2.19': 'trt19', '2.20': 'trt20',
    '2.21': 'trt21', '2.22': 'trt22', '2.23': 'trt23', '2.24': 'trt24',

    // Justiça Eleitoral (segmento 3)
    '3.01': 'tre-ac', '3.02': 'tre-al', '3.04': 'tre-am', '3.03': 'tre-ap', '3.05': 'tre-ba',
    '3.06': 'tre-ce', '3.07': 'tre-dft', '3.08': 'tre-es', '3.10': 'tre-go', '3.09': 'tre-ma',
    '3.13': 'tre-mg', '3.11': 'tre-ms', '3.14': 'tre-mt', '3.12': 'tre-pa', '3.15': 'tre-pb',
    '3.17': 'tre-pe', '3.18': 'tre-pi', '3.16': 'tre-pr', '3.19': 'tre-rj', '3.20': 'tre-rn',
    '3.23': 'tre-ro', '3.25': 'tre-rr', '3.21': 'tre-rs', '3.24': 'tre-sc', '3.26': 'tre-se',
    '3.27': 'tre-sp', '3.29': 'tre-to',

    // Justiça Militar (segmento 4)
    '4.13': 'tjmmg', '4.21': 'tjmrs', '4.27': 'tjmsp',

    // Justiça Estadual (segmento 5 ou 8)
    '5.01': 'tjac', '8.01': 'tjac', '5.02': 'tjal', '8.02': 'tjal',
    '5.04': 'tjam', '8.04': 'tjam', '5.03': 'tjap', '8.03': 'tjap',
    '5.05': 'tjba', '8.05': 'tjba', '5.06': 'tjce', '8.06': 'tjce',
    '5.07': 'tjdft', '8.07': 'tjdft', '5.08': 'tjes', '8.08': 'tjes',
    '5.10': 'tjgo', '8.10': 'tjgo', '5.09': 'tjma', '8.09': 'tjma',
    '5.13': 'tjmg', '8.13': 'tjmg', '5.11': 'tjms', '8.11': 'tjms',
    '5.14': 'tjmt', '8.14': 'tjmt', '5.12': 'tjpa', '8.12': 'tjpa',
    '5.15': 'tjpb', '8.15': 'tjpb', '5.17': 'tjpe', '8.17': 'tjpe',
    '5.18': 'tjpi', '8.18': 'tjpi', '5.16': 'tjpr', '8.16': 'tjpr',
    '5.19': 'tjrj', '8.19': 'tjrj', '5.20': 'tjrn', '8.20': 'tjrn',
    '5.23': 'tjro', '8.23': 'tjro', '5.25': 'tjrr', '8.25': 'tjrr',
    '5.21': 'tjrs', '8.21': 'tjrs', '5.24': 'tjsc', '8.24': 'tjsc',
    '5.26': 'tjse', '8.26': 'tjse', '5.27': 'tjsp', '8.27': 'tjsp',
    '5.29': 'tjto', '8.29': 'tjto',

    // Tribunais Superiores (segmento 9)
    '9.01': 'stf', '9.02': 'stj', '9.03': 'tst', '9.04': 'tse', '9.05': 'stm',
};

const JUSTICE_SEGMENTS: Record<string, string> = {
    '1': 'Federal',
    '2': 'Trabalho',
    '3': 'Eleitoral',
    '4': 'Militar Estadual',
    '5': 'Estadual',
    '8': 'Estadual',
    '9': 'Superior',
};

/**
 * Remove formatting from process number
 */
export const cleanProcessNumber = (processNumber: string): string => {
    return processNumber.replace(/[^\d]/g, '');
};

/**
 * Format process number to CNJ standard: NNNNNNN-DD.AAAA.J.TR.OOOO
 */
export const formatProcessNumber = (value: string): string => {
    const numbers = cleanProcessNumber(value);

    if (numbers.length === 0) return '';
    if (numbers.length <= 7) return numbers;
    if (numbers.length <= 9) return `${numbers.slice(0, 7)}-${numbers.slice(7)}`;
    if (numbers.length <= 13) return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9)}`;
    if (numbers.length <= 14) return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13)}`;
    if (numbers.length <= 16) return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13, 14)}.${numbers.slice(14)}`;

    return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13, 14)}.${numbers.slice(14, 16)}.${numbers.slice(16, 20)}`;
};

/**
 * Parse process number and extract its parts
 */
export const parseProcessNumber = (processNumber: string): ProcessNumberParts => {
    const cleaned = cleanProcessNumber(processNumber);

    const result: ProcessNumberParts = {
        sequentialNumber: '',
        verificationDigit: '',
        year: '',
        justiceSegment: '',
        courtCode: '',
        originCode: '',
        isValid: false,
    };

    // Process number must have exactly 20 digits
    if (cleaned.length !== 20) {
        return result;
    }

    result.sequentialNumber = cleaned.slice(0, 7);
    result.verificationDigit = cleaned.slice(7, 9);
    result.year = cleaned.slice(9, 13);
    result.justiceSegment = cleaned.slice(13, 14);
    result.courtCode = cleaned.slice(14, 16);
    result.originCode = cleaned.slice(16, 20);

    // Validate year
    const year = parseInt(result.year);
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) {
        return result;
    }

    // Validate justice segment
    if (!JUSTICE_SEGMENTS[result.justiceSegment]) {
        return result;
    }

    result.isValid = true;
    return result;
};

/**
 * Get tribunal ID from process number
 */
export const getTribunalFromProcessNumber = (processNumber: string): string | null => {
    const parts = parseProcessNumber(processNumber);

    if (!parts.isValid) {
        return null;
    }

    const key = `${parts.justiceSegment}.${parts.courtCode}`;
    return COURT_CODE_TO_TRIBUNAL[key] || null;
};

/**
 * Get justice segment name from process number
 */
export const getJusticeSegmentName = (processNumber: string): string | null => {
    const parts = parseProcessNumber(processNumber);

    if (!parts.isValid) {
        return null;
    }

    return JUSTICE_SEGMENTS[parts.justiceSegment] || null;
};

/**
 * Validate if process number is complete and valid
 */
export const isValidProcessNumber = (processNumber: string): boolean => {
    const parts = parseProcessNumber(processNumber);
    return parts.isValid && getTribunalFromProcessNumber(processNumber) !== null;
};

/**
 * Calculate verification digit (simplified - uses modulo 97)
 */
export const calculateVerificationDigit = (processNumber: string): string => {
    const cleaned = cleanProcessNumber(processNumber);

    if (cleaned.length < 13) {
        return '00';
    }

    // Get parts for calculation: sequentialNumber + year + justiceSegment + courtCode + originCode
    const forCalculation = cleaned.slice(0, 7) + cleaned.slice(9);
    const num = BigInt(forCalculation);
    const remainder = Number(num % 97n);
    const digit = 98 - remainder;

    return digit.toString().padStart(2, '0');
};
