/**
 * Normalizes text by removing accents, converting to lowercase, and removing punctuation.
 * This is useful for search comparisons where formatting (like CPF/CNJ) shouldn't matter.
 */
export const normalizeText = (text: string): string => {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD') // Decompose accents
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric characters
};

/**
 * Checks if a value matches a search term using normalized comparison.
 * @param value The value to check (e.g., database record field)
 * @param searchTerm The search term typed by the user
 * @returns true if the normalized value includes the normalized search term
 */
export const matchesSearch = (value: string | undefined | null, searchTerm: string): boolean => {
    if (!searchTerm) return true;
    if (!value) return false;
    const normalizedValue = normalizeText(value);
    const normalizedSearch = normalizeText(searchTerm);
    return normalizedValue.includes(normalizedSearch);
};
