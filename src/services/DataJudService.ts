import type { Tribunal, TribunalCategory, DataJudResponse, DataJudQuery } from '../types/datajud';

const API_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

// Use proxy in development to avoid CORS issues
const BASE_URL = import.meta.env.DEV
    ? '/api/datajud'  // Proxy local em desenvolvimento
    : 'https://api-publica.datajud.cnj.jus.br';  // URL direta em produção

// Complete Tribunal Mapping
export const TRIBUNALS: Tribunal[] = [
    // Tribunais Superiores
    { id: 'tst', name: 'Tribunal Superior do Trabalho', acronym: 'TST', category: 'superior', endpoint: `${BASE_URL}/api_publica_tst/_search` },
    { id: 'tse', name: 'Tribunal Superior Eleitoral', acronym: 'TSE', category: 'superior', endpoint: `${BASE_URL}/api_publica_tse/_search` },
    { id: 'stj', name: 'Superior Tribunal de Justiça', acronym: 'STJ', category: 'superior', endpoint: `${BASE_URL}/api_publica_stj/_search` },
    { id: 'stm', name: 'Superior Tribunal Militar', acronym: 'STM', category: 'superior', endpoint: `${BASE_URL}/api_publica_stm/_search` },

    // Justiça Federal
    { id: 'trf1', name: 'Tribunal Regional Federal da 1ª Região', acronym: 'TRF1', category: 'federal', endpoint: `${BASE_URL}/api_publica_trf1/_search`, region: '1ª' },
    { id: 'trf2', name: 'Tribunal Regional Federal da 2ª Região', acronym: 'TRF2', category: 'federal', endpoint: `${BASE_URL}/api_publica_trf2/_search`, region: '2ª' },
    { id: 'trf3', name: 'Tribunal Regional Federal da 3ª Região', acronym: 'TRF3', category: 'federal', endpoint: `${BASE_URL}/api_publica_trf3/_search`, region: '3ª' },
    { id: 'trf4', name: 'Tribunal Regional Federal da 4ª Região', acronym: 'TRF4', category: 'federal', endpoint: `${BASE_URL}/api_publica_trf4/_search`, region: '4ª' },
    { id: 'trf5', name: 'Tribunal Regional Federal da 5ª Região', acronym: 'TRF5', category: 'federal', endpoint: `${BASE_URL}/api_publica_trf5/_search`, region: '5ª' },
    { id: 'trf6', name: 'Tribunal Regional Federal da 6ª Região', acronym: 'TRF6', category: 'federal', endpoint: `${BASE_URL}/api_publica_trf6/_search`, region: '6ª' },

    // Justiça Estadual
    { id: 'tjac', name: 'Tribunal de Justiça do Acre', acronym: 'TJAC', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjac/_search`, region: 'AC' },
    { id: 'tjal', name: 'Tribunal de Justiça de Alagoas', acronym: 'TJAL', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjal/_search`, region: 'AL' },
    { id: 'tjam', name: 'Tribunal de Justiça do Amazonas', acronym: 'TJAM', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjam/_search`, region: 'AM' },
    { id: 'tjap', name: 'Tribunal de Justiça do Amapá', acronym: 'TJAP', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjap/_search`, region: 'AP' },
    { id: 'tjba', name: 'Tribunal de Justiça da Bahia', acronym: 'TJBA', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjba/_search`, region: 'BA' },
    { id: 'tjce', name: 'Tribunal de Justiça do Ceará', acronym: 'TJCE', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjce/_search`, region: 'CE' },
    { id: 'tjdft', name: 'TJ do Distrito Federal e Territórios', acronym: 'TJDFT', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjdft/_search`, region: 'DF' },
    { id: 'tjes', name: 'Tribunal de Justiça do Espírito Santo', acronym: 'TJES', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjes/_search`, region: 'ES' },
    { id: 'tjgo', name: 'Tribunal de Justiça de Goiás', acronym: 'TJGO', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjgo/_search`, region: 'GO' },
    { id: 'tjma', name: 'Tribunal de Justiça do Maranhão', acronym: 'TJMA', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjma/_search`, region: 'MA' },
    { id: 'tjmg', name: 'Tribunal de Justiça de Minas Gerais', acronym: 'TJMG', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjmg/_search`, region: 'MG' },
    { id: 'tjms', name: 'TJ do Mato Grosso do Sul', acronym: 'TJMS', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjms/_search`, region: 'MS' },
    { id: 'tjmt', name: 'Tribunal de Justiça do Mato Grosso', acronym: 'TJMT', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjmt/_search`, region: 'MT' },
    { id: 'tjpa', name: 'Tribunal de Justiça do Pará', acronym: 'TJPA', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjpa/_search`, region: 'PA' },
    { id: 'tjpb', name: 'Tribunal de Justiça da Paraíba', acronym: 'TJPB', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjpb/_search`, region: 'PB' },
    { id: 'tjpe', name: 'Tribunal de Justiça de Pernambuco', acronym: 'TJPE', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjpe/_search`, region: 'PE' },
    { id: 'tjpi', name: 'Tribunal de Justiça do Piauí', acronym: 'TJPI', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjpi/_search`, region: 'PI' },
    { id: 'tjpr', name: 'Tribunal de Justiça do Paraná', acronym: 'TJPR', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjpr/_search`, region: 'PR' },
    { id: 'tjrj', name: 'Tribunal de Justiça do Rio de Janeiro', acronym: 'TJRJ', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjrj/_search`, region: 'RJ' },
    { id: 'tjrn', name: 'TJ do Rio Grande do Norte', acronym: 'TJRN', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjrn/_search`, region: 'RN' },
    { id: 'tjro', name: 'Tribunal de Justiça de Rondônia', acronym: 'TJRO', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjro/_search`, region: 'RO' },
    { id: 'tjrr', name: 'Tribunal de Justiça de Roraima', acronym: 'TJRR', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjrr/_search`, region: 'RR' },
    { id: 'tjrs', name: 'Tribunal de Justiça do Rio Grande do Sul', acronym: 'TJRS', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjrs/_search`, region: 'RS' },
    { id: 'tjsc', name: 'Tribunal de Justiça de Santa Catarina', acronym: 'TJSC', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjsc/_search`, region: 'SC' },
    { id: 'tjse', name: 'Tribunal de Justiça de Sergipe', acronym: 'TJSE', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjse/_search`, region: 'SE' },
    { id: 'tjsp', name: 'Tribunal de Justiça de São Paulo', acronym: 'TJSP', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjsp/_search`, region: 'SP' },
    { id: 'tjto', name: 'Tribunal de Justiça do Tocantins', acronym: 'TJTO', category: 'estadual', endpoint: `${BASE_URL}/api_publica_tjto/_search`, region: 'TO' },

    // Justiça do Trabalho
    { id: 'trt1', name: 'Tribunal Regional do Trabalho da 1ª Região', acronym: 'TRT1', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt1/_search`, region: '1ª' },
    { id: 'trt2', name: 'Tribunal Regional do Trabalho da 2ª Região', acronym: 'TRT2', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt2/_search`, region: '2ª' },
    { id: 'trt3', name: 'Tribunal Regional do Trabalho da 3ª Região', acronym: 'TRT3', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt3/_search`, region: '3ª' },
    { id: 'trt4', name: 'Tribunal Regional do Trabalho da 4ª Região', acronym: 'TRT4', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt4/_search`, region: '4ª' },
    { id: 'trt5', name: 'Tribunal Regional do Trabalho da 5ª Região', acronym: 'TRT5', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt5/_search`, region: '5ª' },
    { id: 'trt6', name: 'Tribunal Regional do Trabalho da 6ª Região', acronym: 'TRT6', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt6/_search`, region: '6ª' },
    { id: 'trt7', name: 'Tribunal Regional do Trabalho da 7ª Região', acronym: 'TRT7', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt7/_search`, region: '7ª' },
    { id: 'trt8', name: 'Tribunal Regional do Trabalho da 8ª Região', acronym: 'TRT8', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt8/_search`, region: '8ª' },
    { id: 'trt9', name: 'Tribunal Regional do Trabalho da 9ª Região', acronym: 'TRT9', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt9/_search`, region: '9ª' },
    { id: 'trt10', name: 'Tribunal Regional do Trabalho da 10ª Região', acronym: 'TRT10', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt10/_search`, region: '10ª' },
    { id: 'trt11', name: 'Tribunal Regional do Trabalho da 11ª Região', acronym: 'TRT11', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt11/_search`, region: '11ª' },
    { id: 'trt12', name: 'Tribunal Regional do Trabalho da 12ª Região', acronym: 'TRT12', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt12/_search`, region: '12ª' },
    { id: 'trt13', name: 'Tribunal Regional do Trabalho da 13ª Região', acronym: 'TRT13', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt13/_search`, region: '13ª' },
    { id: 'trt14', name: 'Tribunal Regional do Trabalho da 14ª Região', acronym: 'TRT14', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt14/_search`, region: '14ª' },
    { id: 'trt15', name: 'Tribunal Regional do Trabalho da 15ª Região', acronym: 'TRT15', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt15/_search`, region: '15ª' },
    { id: 'trt16', name: 'Tribunal Regional do Trabalho da 16ª Região', acronym: 'TRT16', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt16/_search`, region: '16ª' },
    { id: 'trt17', name: 'Tribunal Regional do Trabalho da 17ª Região', acronym: 'TRT17', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt17/_search`, region: '17ª' },
    { id: 'trt18', name: 'Tribunal Regional do Trabalho da 18ª Região', acronym: 'TRT18', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt18/_search`, region: '18ª' },
    { id: 'trt19', name: 'Tribunal Regional do Trabalho da 19ª Região', acronym: 'TRT19', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt19/_search`, region: '19ª' },
    { id: 'trt20', name: 'Tribunal Regional do Trabalho da 20ª Região', acronym: 'TRT20', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt20/_search`, region: '20ª' },
    { id: 'trt21', name: 'Tribunal Regional do Trabalho da 21ª Região', acronym: 'TRT21', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt21/_search`, region: '21ª' },
    { id: 'trt22', name: 'Tribunal Regional do Trabalho da 22ª Região', acronym: 'TRT22', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt22/_search`, region: '22ª' },
    { id: 'trt23', name: 'Tribunal Regional do Trabalho da 23ª Região', acronym: 'TRT23', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt23/_search`, region: '23ª' },
    { id: 'trt24', name: 'Tribunal Regional do Trabalho da 24ª Região', acronym: 'TRT24', category: 'trabalho', endpoint: `${BASE_URL}/api_publica_trt24/_search`, region: '24ª' },

    // Justiça Eleitoral
    { id: 'tre-ac', name: 'Tribunal Regional Eleitoral do Acre', acronym: 'TRE-AC', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-ac/_search`, region: 'AC' },
    { id: 'tre-al', name: 'Tribunal Regional Eleitoral de Alagoas', acronym: 'TRE-AL', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-al/_search`, region: 'AL' },
    { id: 'tre-am', name: 'Tribunal Regional Eleitoral do Amazonas', acronym: 'TRE-AM', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-am/_search`, region: 'AM' },
    { id: 'tre-ap', name: 'Tribunal Regional Eleitoral do Amapá', acronym: 'TRE-AP', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-ap/_search`, region: 'AP' },
    { id: 'tre-ba', name: 'Tribunal Regional Eleitoral da Bahia', acronym: 'TRE-BA', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-ba/_search`, region: 'BA' },
    { id: 'tre-ce', name: 'Tribunal Regional Eleitoral do Ceará', acronym: 'TRE-CE', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-ce/_search`, region: 'CE' },
    { id: 'tre-dft', name: 'Tribunal Regional Eleitoral do Distrito Federal', acronym: 'TRE-DFT', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-dft/_search`, region: 'DF' },
    { id: 'tre-es', name: 'Tribunal Regional Eleitoral do Espírito Santo', acronym: 'TRE-ES', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-es/_search`, region: 'ES' },
    { id: 'tre-go', name: 'Tribunal Regional Eleitoral de Goiás', acronym: 'TRE-GO', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-go/_search`, region: 'GO' },
    { id: 'tre-ma', name: 'Tribunal Regional Eleitoral do Maranhão', acronym: 'TRE-MA', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-ma/_search`, region: 'MA' },
    { id: 'tre-mg', name: 'Tribunal Regional Eleitoral de Minas Gerais', acronym: 'TRE-MG', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-mg/_search`, region: 'MG' },
    { id: 'tre-ms', name: 'Tribunal Regional Eleitoral do Mato Grosso do Sul', acronym: 'TRE-MS', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-ms/_search`, region: 'MS' },
    { id: 'tre-mt', name: 'Tribunal Regional Eleitoral do Mato Grosso', acronym: 'TRE-MT', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-mt/_search`, region: 'MT' },
    { id: 'tre-pa', name: 'Tribunal Regional Eleitoral do Pará', acronym: 'TRE-PA', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-pa/_search`, region: 'PA' },
    { id: 'tre-pb', name: 'Tribunal Regional Eleitoral da Paraíba', acronym: 'TRE-PB', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-pb/_search`, region: 'PB' },
    { id: 'tre-pe', name: 'Tribunal Regional Eleitoral de Pernambuco', acronym: 'TRE-PE', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-pe/_search`, region: 'PE' },
    { id: 'tre-pi', name: 'Tribunal Regional Eleitoral do Piauí', acronym: 'TRE-PI', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-pi/_search`, region: 'PI' },
    { id: 'tre-pr', name: 'Tribunal Regional Eleitoral do Paraná', acronym: 'TRE-PR', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-pr/_search`, region: 'PR' },
    { id: 'tre-rj', name: 'Tribunal Regional Eleitoral do Rio de Janeiro', acronym: 'TRE-RJ', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-rj/_search`, region: 'RJ' },
    { id: 'tre-rn', name: 'Tribunal Regional Eleitoral do Rio Grande do Norte', acronym: 'TRE-RN', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-rn/_search`, region: 'RN' },
    { id: 'tre-ro', name: 'Tribunal Regional Eleitoral de Rondônia', acronym: 'TRE-RO', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-ro/_search`, region: 'RO' },
    { id: 'tre-rr', name: 'Tribunal Regional Eleitoral de Roraima', acronym: 'TRE-RR', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-rr/_search`, region: 'RR' },
    { id: 'tre-rs', name: 'Tribunal Regional Eleitoral do Rio Grande do Sul', acronym: 'TRE-RS', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-rs/_search`, region: 'RS' },
    { id: 'tre-sc', name: 'Tribunal Regional Eleitoral de Santa Catarina', acronym: 'TRE-SC', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-sc/_search`, region: 'SC' },
    { id: 'tre-se', name: 'Tribunal Regional Eleitoral de Sergipe', acronym: 'TRE-SE', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-se/_search`, region: 'SE' },
    { id: 'tre-sp', name: 'Tribunal Regional Eleitoral de São Paulo', acronym: 'TRE-SP', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-sp/_search`, region: 'SP' },
    { id: 'tre-to', name: 'Tribunal Regional Eleitoral do Tocantins', acronym: 'TRE-TO', category: 'eleitoral', endpoint: `${BASE_URL}/api_publica_tre-to/_search`, region: 'TO' },

    // Justiça Militar
    { id: 'tjmmg', name: 'Tribunal de Justiça Militar de Minas Gerais', acronym: 'TJMMG', category: 'militar', endpoint: `${BASE_URL}/api_publica_tjmmg/_search`, region: 'MG' },
    { id: 'tjmrs', name: 'Tribunal de Justiça Militar do Rio Grande do Sul', acronym: 'TJMRS', category: 'militar', endpoint: `${BASE_URL}/api_publica_tjmrs/_search`, region: 'RS' },
    { id: 'tjmsp', name: 'Tribunal de Justiça Militar de São Paulo', acronym: 'TJMSP', category: 'militar', endpoint: `${BASE_URL}/api_publica_tjmsp/_search`, region: 'SP' },
];

// Helper functions
export const getTribunalById = (id: string): Tribunal | undefined => {
    return TRIBUNALS.find(t => t.id === id);
};

export const getTribunalsByCategory = (category: TribunalCategory): Tribunal[] => {
    return TRIBUNALS.filter(t => t.category === category);
};

export const searchTribunals = (query: string): Tribunal[] => {
    const lowerQuery = query.toLowerCase();
    return TRIBUNALS.filter(t =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.acronym.toLowerCase().includes(lowerQuery) ||
        t.region?.toLowerCase().includes(lowerQuery)
    );
};

// API Request Cache
interface CacheEntry {
    data: DataJudResponse;
    timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const getCacheKey = (endpoint: string, query: DataJudQuery): string => {
    return `${endpoint}:${JSON.stringify(query)}`;
};

const getFromCache = (key: string): DataJudResponse | null => {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > CACHE_TTL) {
        cache.delete(key);
        return null;
    }

    return entry.data;
};

const setCache = (key: string, data: DataJudResponse): void => {
    cache.set(key, { data, timestamp: Date.now() });
};

// Main API Functions
export const searchInTribunal = async (
    tribunalId: string,
    query: DataJudQuery
): Promise<DataJudResponse> => {
    const tribunal = getTribunalById(tribunalId);
    if (!tribunal) {
        throw new Error(`Tribunal não encontrado: ${tribunalId}`);
    }

    console.log(`🔍 Searching in tribunal: ${tribunal.name} (${tribunalId})`);
    console.log('📋 Query:', JSON.stringify(query, null, 2));
    console.log('🌐 Endpoint:', tribunal.endpoint);

    const cacheKey = getCacheKey(tribunal.endpoint, query);
    const cached = getFromCache(cacheKey);
    if (cached) {
        console.log('✓ Using cached data for', tribunalId);
        return cached;
    }

    try {
        console.log(`📡 Making request to ${tribunal.endpoint}...`);

        const response = await fetch(tribunal.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `APIKey ${API_KEY}`,
                'Content-Type': 'application/json',
                // Origin header is handled by Vite Proxy in dev, or browser in prod
            },
            body: JSON.stringify(query),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error (${response.status}):`, errorText);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Data received:', data);

        setCache(cacheKey, data);
        return data;
    } catch (error) {
        console.error('❌ Search failed:', error);
        throw error;
    }
};

export const searchByProcessNumber = async (processNumber: string): Promise<{ tribunal: Tribunal, data: DataJudResponse } | null> => {
    const cleanNumber = processNumber.replace(/[^\d]/g, '');

    // Robust Query: Search for both formatted and unformatted versions
    // DataJud typically expects the 20-digit number string, but some indices might vary.
    // We use a boolean OR query to be safe.
    const formattedNumber = cleanNumber.length === 20
        ? `${cleanNumber.substring(0, 7)}-${cleanNumber.substring(7, 9)}.${cleanNumber.substring(9, 13)}.${cleanNumber.substring(13, 14)}.${cleanNumber.substring(14, 16)}.${cleanNumber.substring(16, 20)}`
        : processNumber;

    const robustQuery: DataJudQuery = {
        query: {
            bool: {
                should: [
                    { match: { numeroProcesso: cleanNumber } },
                    { match: { numeroProcesso: formattedNumber } }
                ],
                minimum_should_match: 1
            }
        }
    };

    // 1. Infer Tribunals
    const tribunalIds = inferTribunalsFromCNJ(cleanNumber);
    console.log('🎯 Inferred tribunals:', tribunalIds);

    // 2. Search in Inferred Tribunals
    for (const id of tribunalIds) {
        try {
            const data = await searchInTribunal(id, robustQuery);
            if (data.hits.total.value > 0) {
                return { tribunal: getTribunalById(id)!, data };
            }
        } catch (error) {
            console.warn(`⚠️ Failed to search in inferred tribunal ${id}:`, error);
        }
    }

    // 3. Fallback: Search in Related Tribunals (if inferred failed)
    // If we inferred TJSP (8.26), maybe it's in TRF3 (Federal SP) or TRT2/15 (Labor SP)?
    // This is the "Perfect" robustness step.
    console.log('⚠️ Process not found in inferred tribunals. Attempting fallback search...');

    const fallbackTribunals = getFallbackTribunals(cleanNumber, tribunalIds);
    console.log('🔄 Fallback tribunals:', fallbackTribunals);

    for (const id of fallbackTribunals) {
        try {
            const data = await searchInTribunal(id, robustQuery);
            if (data.hits.total.value > 0) {
                console.log(`🎉 Found in fallback tribunal: ${id}`);
                return { tribunal: getTribunalById(id)!, data };
            }
        } catch (error) {
            console.warn(`⚠️ Failed to search in fallback tribunal ${id}:`, error);
        }
    }

    return null;
};

// Helper to infer tribunal from CNJ
export const inferTribunalsFromCNJ = (cnj: string): string[] => {
    const cleanCNJ = cnj.replace(/[^\d]/g, '');
    if (cleanCNJ.length !== 20) return [];

    // Estrutura CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
    // J = Justiça (8=Estadual, 4=Federal, 5=Trabalho, etc)
    // TR = Tribunal Regional (UF ou Região)

    const J = cleanCNJ.substring(13, 14);
    const TR = cleanCNJ.substring(14, 16);

    const tribunals: string[] = [];

    if (J === '8') { // Justiça Estadual
        // Mapeamento TR -> UF -> Tribunal ID
        const ufMap: Record<string, string> = {
            '01': 'tjac', '02': 'tjal', '03': 'tjap', '04': 'tjam', '05': 'tjba',
            '06': 'tjce', '07': 'tjdft', '08': 'tjes', '09': 'tjgo', '10': 'tjma',
            '11': 'tjmt', '12': 'tjms', '13': 'tjmg', '14': 'tjpa', '15': 'tjpb',
            '16': 'tjpr', '17': 'tjpe', '18': 'tjpi', '19': 'tjrj', '20': 'tjrn',
            '21': 'tjrs', '22': 'tjro', '23': 'tjrr', '24': 'tjsc', '25': 'tjse',
            '26': 'tjsp', '27': 'tjto'
        };
        if (ufMap[TR]) tribunals.push(ufMap[TR]);
    } else if (J === '4') { // Justiça Federal
        // TR é a região (01 a 06)
        const trfId = `trf${parseInt(TR)}`;
        if (getTribunalById(trfId)) tribunals.push(trfId);
    } else if (J === '5') { // Justiça do Trabalho
        // TR é a região (01 a 24)
        const trtId = `trt${parseInt(TR)}`;
        if (getTribunalById(trtId)) tribunals.push(trtId);
    }

    // Sempre adicionar tribunais superiores como fallback possível se não achar nada específico?
    // Não, melhor ser específico primeiro.

    return tribunals;
};

// Helper to get related tribunals for fallback
const getFallbackTribunals = (cnj: string, excludedIds: string[]): string[] => {
    const cleanCNJ = cnj.replace(/[^\d]/g, '');
    if (cleanCNJ.length !== 20) return [];

    // const J = cleanCNJ.substring(13, 14);
    // const TR = cleanCNJ.substring(14, 16);

    const fallbacks: string[] = [];

    // Se buscou no Estadual (8), tentar Federal (4) e Trabalho (5) da mesma "região" geográfica se possível
    // Isso é complexo pois as regiões TRF/TRT não batem 1:1 com UFs.
    // Mas podemos tentar TRF1-6 e TRT correspondentes.

    // Simplificação: Se falhou no específico, tenta os Superiores (STJ, TST, STF)
    fallbacks.push('stj', 'tst', 'stm', 'tse');

    return fallbacks.filter(id => !excludedIds.includes(id));
};

// Helper to sync process data
export const syncProcessData = async (process: any): Promise<any> => {
    if (!process.number) throw new Error('Processo sem número para sincronizar');

    const result = await searchByProcessNumber(process.number);
    if (!result) throw new Error('Processo não encontrado no DataJud');

    const { data } = result;
    const latestProcess = data.hits.hits[0]?._source;

    if (!latestProcess) throw new Error('Dados do processo não encontrados');

    console.log('✅ Movimentações extraídas:', latestProcess.movimentos?.length || 0);
    if (latestProcess.movimentos?.[0]) {
        console.log('📋 Primeira movimentação (exemplo):', latestProcess.movimentos[0]);
    }

    return {
        ...process,
        value: latestProcess.valorCausa || process.value,
        status: 'active',
        folder: {
            ...process.folder,
            movements: latestProcess.movimentos?.map((m: any) => {
                // Extrai TODOS os complementos sem perder dados
                const complementosTexto: string[] = [];

                // 1. Descrição principal
                if (m.descricao) {
                    complementosTexto.push(m.descricao);
                }

                // 2. Complementos tabelados (FORMATO COMPLETO)
                if (m.complementosTabelados?.length > 0) {
                    m.complementosTabelados.forEach((comp: any) => {
                        const partes = [];
                        if (comp.nome) partes.push(comp.nome);
                        if (comp.valor) partes.push(comp.valor);
                        if (comp.descricao && comp.descricao !== comp.valor) {
                            partes.push(`(${comp.descricao})`);
                        }
                        if (partes.length > 0) {
                            complementosTexto.push(partes.join(': '));
                        }
                    });
                }

                // 3. Complementos livres
                if (m.complementos?.length > 0) {
                    complementosTexto.push(...m.complementos);
                }

                return {
                    id: crypto.randomUUID(),
                    date: m.dataHora,
                    type: 'datajud', // Marca como vindo do DataJud

                    // ⭐ NOME COMPLETO E REAL da movimentação
                    title: m.nome || 'Movimentação',

                    // ⭐ DESCRIÇÃO COMPLETA com todos os complementos
                    description: complementosTexto.join('\n'),

                    // ⭐ DADOS ADICIONAIS preservados
                    codigo: m.codigo,
                    orgaoJulgador: m.orgaoJulgador?.nomeOrgao,

                    // ⭐ Mantém dados brutos para referência futura
                    rawData: {
                        codigo: m.codigo,
                        nome: m.nome,
                        dataHora: m.dataHora,
                        descricao: m.descricao,
                        complementosTabelados: m.complementosTabelados,
                        complementos: m.complementos,
                        orgaoJulgador: m.orgaoJulgador
                    },

                    isUserCreated: false,
                    createdAt: new Date().toISOString()
                };
            }).sort((a: any, b: any) => {
                // ⭐ ORDEM DECRESCENTE (mais recentes primeiro)
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            }) || process.folder?.movements || []
        },
        subjects: latestProcess.assuntos?.map((a: any) => a.nome) || [],
        degree: latestProcess.grau,
        ibgeCode: latestProcess.orgaoJulgador?.codigoMunicipioIBGE
    };
};
