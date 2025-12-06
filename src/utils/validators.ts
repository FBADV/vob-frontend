/**
 * Utilitários de validação para formatos brasileiros
 * 
 * @module utils/validators
 */

import { onlyNumbers } from './masks';

/**
 * Valida CPF
 */
export const validateCPF = (cpf: string): boolean => {
    const numbers = onlyNumbers(cpf);

    if (numbers.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(numbers)) return false; // Todos dígitos iguais

    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.substring(10, 11))) return false;

    return true;
};

/**
 * Valida CNPJ
 */
export const validateCNPJ = (cnpj: string): boolean => {
    const numbers = onlyNumbers(cnpj);

    if (numbers.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(numbers)) return false; // Todos dígitos iguais

    // Validação do primeiro dígito verificador
    let length = numbers.length - 2;
    let nums = numbers.substring(0, length);
    const digits = numbers.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(nums.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    // Validação do segundo dígito verificador
    length = length + 1;
    nums = numbers.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(nums.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
};

/**
 * Valida CPF ou CNPJ
 */
export const validateDocument = (document: string): boolean => {
    const numbers = onlyNumbers(document);

    if (numbers.length === 11) return validateCPF(document);
    if (numbers.length === 14) return validateCNPJ(document);

    return false;
};

/**
 * Valida telefone brasileiro (8 ou 9 dígitos + DDD)
 */
export const validatePhone = (phone: string): boolean => {
    const numbers = onlyNumbers(phone);

    // 10 dígitos (DDD + 8) ou 11 dígitos (DDD + 9)
    if (numbers.length !== 10 && numbers.length !== 11) return false;

    // DDD deve estar entre 11 e 99
    const ddd = parseInt(numbers.substring(0, 2));
    if (ddd < 11 || ddd > 99) return false;

    return true;
};

/**
 * Valida email
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valida CEP
 */
export const validateCEP = (cep: string): boolean => {
    const numbers = onlyNumbers(cep);
    return numbers.length === 8;
};

/**
 * Valida data no formato brasileiro (dd/mm/yyyy)
 */
export const validateDateBR = (date: string): boolean => {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = date.match(dateRegex);

    if (!match) return false;

    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = parseInt(match[3]);

    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;

    // Validação de dias por mês
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Ano bissexto
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        daysInMonth[1] = 29;
    }

    if (day > daysInMonth[month - 1]) return false;

    return true;
};

/**
 * Mensagens de erro padronizadas
 */
export const validationMessages = {
    cpf: 'CPF inválido',
    cnpj: 'CNPJ inválido',
    document: 'CPF ou CNPJ inválido',
    phone: 'Telefone inválido',
    email: 'Email inválido',
    cep: 'CEP inválido',
    date: 'Data inválida (use dd/mm/yyyy)',
    required: 'Campo obrigatório'
};
