/**
 * Barrel export - Utilitários
 * Centraliza todos os utilitários em um único ponto de importação
 */

// Máscaras
export {
    onlyNumbers,
    maskCPF,
    maskCNPJ,
    maskDocument,
    maskPhone,
    maskCEP,
    maskMoney,
    maskProcessNumber
} from './masks';

// Validações
export {
    validateCPF,
    validateCNPJ,
    validateDocument,
    validatePhone,
    validateEmail,
    validateCEP,
    validateDateBR,
    validationMessages
} from './validators';

// Formatação de data
export {
    formatDateBR,
    formatDateTimeBR,
    parseDateBR,
    toISODate,
    maskDateBR,
    getRelativeDate
} from './dateFormat';

// Fuzzy match (arquivo existente)
export {
    calculateStringSimilarity,
    findMatchingClients,
    type ClientMatch
} from './fuzzyMatch';
