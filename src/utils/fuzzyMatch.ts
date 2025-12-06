// Utility function for fuzzy string matching
export function calculateStringSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    // Exact match
    if (s1 === s2) return 100;

    // Contains check
    if (s1.includes(s2) || s2.includes(s1)) return 80;

    // Levenshtein-inspired simple distance
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 100;

    let matches = 0;
    const minLen = Math.min(s1.length, s2.length);

    for (let i = 0; i < minLen; i++) {
        if (s1[i] === s2[i]) matches++;
    }

    // Word-based matching for better name comparison
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);

    let wordMatches = 0;
    for (const word1 of words1) {
        for (const word2 of words2) {
            if (word1 === word2 && word1.length > 2) {
                wordMatches += 2; // Give more weight to full word matches
            }
        }
    }

    const basicScore = (matches / maxLen) * 100;
    const wordScore = Math.min((wordMatches / Math.max(words1.length, words2.length)) * 100, 50);

    return Math.min(Math.round((basicScore + wordScore) / 1.5), 100);
}

// Find matching clients with similarity scores
export interface ClientMatch {
    client: any;
    similarity: number;
    isExact: boolean;
}

export function findMatchingClients(searchName: string, allClients: any[]): ClientMatch[] {
    return allClients
        .map(client => ({
            client,
            similarity: calculateStringSimilarity(searchName, client.name),
            isExact: searchName.toLowerCase().trim() === client.name.toLowerCase().trim()
        }))
        .filter(match => match.similarity >= 60) // Only show matches above 60% similarity
        .sort((a, b) => b.similarity - a.similarity);
}
