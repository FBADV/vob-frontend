/**
 * Utilitários de formatação de data no padrão brasileiro
 * 
 * @module utils/dateFormat
 */

/**
 * Formata Date para string dd/mm/yyyy
 */
export const formatDateBR = (date: Date | string | null | undefined): string => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Formata Date para string dd/mm/yyyy HH:mm
 */
export const formatDateTimeBR = (date: Date | string | null | undefined): string => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Converte string dd/mm/yyyy para Date
 */
export const parseDateBR = (dateString: string): Date | null => {
    if (!dateString) return null;

    const parts = dateString.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // Mês começa em 0
    const year = parseInt(parts[2]);

    const date = new Date(year, month, day);

    if (isNaN(date.getTime())) return null;

    return date;
};

/**
 * Formata data para ISO string (para enviar ao backend)
 */
export const toISODate = (dateString: string): string | null => {
    const date = parseDateBR(dateString);
    return date ? date.toISOString() : null;
};

/**
 * Máscara para input de data (dd/mm/yyyy)
 */
export const maskDateBR = (value: string): string => {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;

    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
};

/**
 * Retorna data relativa (ex: "há 2 dias", "ontem", "hoje")
 */
export const getRelativeDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} meses`;

    return `Há ${Math.floor(diffDays / 365)} anos`;
};
