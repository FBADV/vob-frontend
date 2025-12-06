/**
 * Utilitários de máscaras para formatação brasileira
 * 
 * @module utils/masks
 */

/**
 * Remove todos os caracteres não numéricos
 */
export const onlyNumbers = (value: string): string => {
    return value.replace(/\D/g, '');
};

/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export const maskCPF = (value: string): string => {
    const numbers = onlyNumbers(value);

    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;

    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

/**
 * Aplica máscara de CNPJ: 00.000.000/0000-00
 */
export const maskCNPJ = (value: string): string => {
    const numbers = onlyNumbers(value);

    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;

    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
};

/**
 * Aplica máscara de CPF ou CNPJ automaticamente baseado no tamanho
 */
export const maskDocument = (value: string): string => {
    const numbers = onlyNumbers(value);

    if (numbers.length <= 11) {
        return maskCPF(value);
    }

    return maskCNPJ(value);
};

/**
 * Aplica máscara de telefone: (00) 0000-0000 ou (00) 00000-0000
 */
export const maskPhone = (value: string): string => {
    const numbers = onlyNumbers(value);

    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;

    // Celular com 9 dígitos
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

/**
 * Aplica máscara de CEP: 00000-000
 */
export const maskCEP = (value: string): string => {
    const numbers = onlyNumbers(value);

    if (numbers.length <= 5) return numbers;

    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

/**
 * Aplica máscara monetária brasileira: R$ 0.000,00
 */
export const maskMoney = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) / 100 : value;

    if (isNaN(numValue)) return 'R$ 0,00';

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(numValue);
};

/**
 * Formata número de processo (CNJ): 0000000-00.0000.0.00.0000
 */
export const maskProcessNumber = (value: string): string => {
    const numbers = onlyNumbers(value);

    if (numbers.length <= 7) return numbers;
    if (numbers.length <= 9) return `${numbers.slice(0, 7)}-${numbers.slice(7)}`;
    if (numbers.length <= 13) return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9)}`;
    if (numbers.length <= 14) return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13)}`;
    if (numbers.length <= 16) return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13, 14)}.${numbers.slice(14)}`;

    return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13, 14)}.${numbers.slice(14, 16)}.${numbers.slice(16, 20)}`;
};
