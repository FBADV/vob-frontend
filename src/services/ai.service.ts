import { AI_PROMPTS } from '../utils/ai.prompts';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface AIAnalysisResult {
    complexity: 'Baixa' | 'Média' | 'Alta';
    risk_level: 'Baixo' | 'Médio' | 'Alto';
    summary: string;
    strategies: string[];
    theses: string[];
}

export const aiService = {
    /**
     * Check if AI service is configured
     */
    isConfigured(): boolean {
        return !!import.meta.env.VITE_OPENAI_API_KEY;
    },

    /**
     * Mock response for Service analysis
     */
    async getMockServiceAnalysis(): Promise<AIAnalysisResult> {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            complexity: 'Baixa',
            risk_level: 'Baixo',
            summary: 'Atendimento de rotina identificado. A demanda aparenta ser padrão e sem complexidades imediatas, mas requer formalização adequada.',
            strategies: [
                'Registrar todos os pontos discutidos em ata ou e-mail.',
                'Definir prazos claros para as próximas etapas.',
                'Solicitar documentos pendentes ao cliente imediatamente.'
            ],
            theses: [
                'Necessidade de alinhamento de expectativas',
                'Formalização contratual (se aplicável)'
            ]
        };
    },

    /**
     * Mock response for development/demo purposes
     */
    async getMockAnalysis(): Promise<AIAnalysisResult> {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
        return {
            complexity: 'Média',
            risk_level: 'Médio',
            summary: 'Processo em fase de conhecimento, aguardando sentença. Há movimentações recentes indicando conclusão para julgamento.',
            strategies: [
                'Monitorar publicação de sentença diariamente.',
                'Preparar minuta de Embargos de Declaração preventivamente.',
                'Verificar possibilidade de acordo antes da sentença.'
            ],
            theses: [
                'Prescrição intercorrente (se aplicável)',
                'Inversão do ônus da prova'
            ]
        };
    },

    /**
     * Analyze process data using LLM
     */
    async analyzeProcess(processData: any): Promise<AIAnalysisResult> {
        if (!this.isConfigured()) {
            console.warn('⚠️ OpenAI API Key not found. Using mock data.');
            return this.getMockAnalysis();
        }

        try {
            const prompt = AI_PROMPTS.ANALYZE_PROCESS
                .replace('{{class}}', processData.class_name || 'Não informada')
                .replace('{{subject}}', processData.subject?.join(', ') || 'Não informado')
                .replace('{{value}}', processData.case_value ? `R$ ${processData.case_value}` : 'Não informado')
                .replace('{{last_movement}}', processData.last_movement_date || 'N/A')
                .replace('{{movements}}', processData.movements ? processData.movements.map((m: any) => `${m.date} - ${m.title}: ${m.description || ''}`).join('\n') : 'Sem movimentações');

            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4-turbo-preview', // Or gpt-3.5-turbo
                    messages: [
                        { role: 'system', content: 'You are a legal assistant. Output valid JSON only.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                throw new Error(`AI API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            return JSON.parse(content) as AIAnalysisResult;

        } catch (error) {
            console.error('Error analyzing process with AI:', error);
            throw error;
        }
    },

    /**
     * Analyze service data using LLM
     */
    async analyzeService(serviceData: any): Promise<AIAnalysisResult> {
        if (!this.isConfigured()) {
            console.warn('⚠️ OpenAI API Key not found. Using mock data.');
            return this.getMockServiceAnalysis();
        }

        try {
            const prompt = AI_PROMPTS.ANALYZE_SERVICE
                .replace('{{title}}', serviceData.title || 'Não informado')
                .replace('{{type}}', serviceData.types?.join(', ') || 'Geral')
                .replace('{{description}}', serviceData.description || 'Sem descrição');

            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4-turbo-preview',
                    messages: [
                        { role: 'system', content: 'You are a legal assistant. Output valid JSON only.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                throw new Error(`AI API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            return JSON.parse(content) as AIAnalysisResult;

        } catch (error) {
            console.error('Error analyzing service with AI:', error);
            throw error;
        }
    },
    /**
     * Analyze CRM Lead
     */
    async analyzeLead(leadData: any): Promise<any> {
        if (!this.isConfigured()) {
            // Mock response
            await new Promise(resolve => setTimeout(resolve, 1500));
            return {
                closing_probability: 75,
                next_steps: [
                    'Agendar reunião de apresentação de proposta.',
                    'Enviar material institucional sobre casos similares.',
                    'Fazer follow-up em 48h.'
                ],
                client_profile: 'Pragmático - Focado em resultados e prazos.',
                talking_points: [
                    'Destacar celeridade processual.',
                    'Mencionar taxa de êxito em casos semelhantes.'
                ]
            };
        }

        try {
            const prompt = AI_PROMPTS.ANALYZE_LEAD
                .replace('{{name}}', leadData.name)
                .replace('{{status}}', leadData.status)
                .replace('{{value}}', leadData.value ? `R$ ${leadData.value}` : 'Não informado')
                .replace('{{temperature}}', leadData.temperature || 'Morn')
                .replace('{{history}}', leadData.history?.map((h: any) => h.content).join('; ') || 'Sem histórico');

            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4-turbo-preview',
                    messages: [
                        { role: 'system', content: 'You are a sales expert. Output valid JSON only.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) throw new Error(`AI API Error: ${response.statusText}`);
            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        } catch (error) {
            console.error('Error analyzing lead:', error);
            throw error;
        }
    },

    /**
     * Analyze Financial Health
     */
    async analyzeFinancial(financialData: any): Promise<any> {
        if (!this.isConfigured()) {
            // Mock response
            await new Promise(resolve => setTimeout(resolve, 1500));
            return {
                health_status: 'Estável',
                insights: [
                    'Receitas superam despesas em 15% este mês.',
                    'Gastos com escritório aumentaram 5%.'
                ],
                recommendation: 'Manter reserva de emergência e avaliar custos fixos.',
                savings_opportunity: 'Renegociar contratos de fornecedores de software.'
            };
        }

        try {
            const prompt = AI_PROMPTS.ANALYZE_FINANCIAL
                .replace('{{income}}', `R$ ${financialData.income}`)
                .replace('{{expense}}', `R$ ${financialData.expense}`)
                .replace('{{balance}}', `R$ ${financialData.balance}`)
                .replace('{{transactions}}', financialData.transactions.map((t: any) => `${t.description} (${t.amount})`).join('; '));

            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4-turbo-preview',
                    messages: [
                        { role: 'system', content: 'You are a financial advisor. Output valid JSON only.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) throw new Error(`AI API Error: ${response.statusText}`);
            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        } catch (error) {
            console.error('Error analyzing financials:', error);
            throw error;
        }
    },

    /**
     * Summarize text/movements
     */
    async summarize(text: string): Promise<string> {
        if (!this.isConfigured()) {
            return "Resumo indisponível (API Key não configurada). Simulação: O processo encontra-se em trâmite regular, com movimentações recentes indicando andamento processual típico.";
        }

        try {
            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: AI_PROMPTS.SUMMARIZE_MOVEMENTS },
                        { role: 'user', content: text }
                    ],
                    temperature: 0.5
                })
            });

            if (!response.ok) {
                throw new Error(`AI API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('Error summarizing with AI:', error);
            throw error;
        }
    }
};
