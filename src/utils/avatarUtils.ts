export const getAvatarInitials = (name: string): string => {
    if (!name) return 'XX';

    const parts = name.trim().split(/\s+/);

    // Filter out common connectors in Portuguese names
    const connectors = ['de', 'da', 'do', 'dos', 'das', 'e'];
    const validParts = parts.filter(part => !connectors.includes(part.toLowerCase()));

    if (validParts.length === 0) return name.substring(0, 2).toUpperCase();

    const firstInitial = validParts[0][0];
    const secondInitial = validParts.length > 1 ? validParts[1][0] : (validParts[0][1] || '');

    return (firstInitial + secondInitial).toUpperCase();
};

export const getAvatarGradient = (type?: 'individual' | 'company'): string => {
    return type === 'company'
        ? 'from-purple-500 to-pink-600'
        : 'from-blue-500 to-cyan-600'; // Default to individual
};
