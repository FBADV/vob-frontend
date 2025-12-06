/**
 * Converters - Normaliza dados de diferentes fontes (PJe, DataJud) para formato VOB
 */

/**
 * Converte dados do PJe para formato VOB
 */
export const converterDadosPJe = (pjeData: any) => {
    return {
        // Dados básicos
        numeroProcesso: pjeData.numeroProcesso,
        classe: pjeData.classe || 'Processo',
        orgaoJulgador: pjeData.orgaoJulgador?.nome,
        valorCausa: pjeData.valorCausa,
        dataDistribuicao: pjeData.dataDistribuicao,
        grau: pjeData.grau,

        // Movimentações (formato PJe → VOB)
        movimentos: pjeData.movimentacoes?.map((m: any) => ({
            id: crypto.randomUUID(),
            date: m.dataHora,
            type: 'datajud', // Usa 'datajud' para manter compatibilidade
            title: m.nome || 'Movimentação',
            description: [
                m.textoComplementar,
                m.descricao,
                m.complemento
            ].filter(Boolean).join('\n'),
            codigo: m.codigo,
            orgaoJulgador: pjeData.orgaoJulgador?.nome,
            rawData: m,
            isUserCreated: false,
            createdAt: new Date().toISOString(),
            _fonte: 'PJe (Tempo Real)'
        })).sort((a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        ) || [],

        // Partes do processo
        partes: pjeData.partes?.map((p: any) => ({
            nome: p.nome,
            documento: p.documento || p.cpf || p.cnpj,
            polo: p.polo,
            tipo: p.tipo || p.tipoPessoa,
            advogados: p.advogados
        })) || [],

        // Assuntos
        assuntos: pjeData.assuntos?.map((a: any) => ({
            codigo: a.codigo,
            nome: a.nome
        })) || [],

        // Metadata
        _metadata: {
            fonte: 'PJe',
            tempoReal: true,
            dataConsulta: new Date().toISOString()
        }
    };
};

/**
 * Converte dados do DataJud para formato VOB
 */
export const converterDadosDataJud = (datajudData: any, tribunalName?: string) => {
    return {
        // Dados básicos
        numeroProcesso: datajudData.numeroProcesso,
        classe: datajudData.classe?.nome || datajudData.classe, // Adjust access if needed
        orgaoJulgador: datajudData.orgaoJulgador?.nome || datajudData.orgaoJulgador?.nomeOrgao,
        // Ensure valorCausa is a number
        valorCausa: typeof datajudData.valorCausa === 'object' ? datajudData.valorCausa?.valor : datajudData.valorCausa,
        dataDistribuicao: datajudData.dataAjuizamento,
        grau: datajudData.grau,

        // Movimentações (já no formato correto após atualização DataJudService)
        // Remove redundant "synced via" text if it was being added here, or ensure purely raw data
        movimentos: datajudData.movimentos?.map((m: any) => ({
            ...m,
            // Ensure no "Synced via DataJud" text is baked into the description
            type: 'datajud'
        })) || [],

        // Partes
        partes: datajudData.partes || [],

        // Assuntos
        assuntos: datajudData.assuntos?.map((a: any) => ({
            codigo: a.codigo,
            nome: a.nome
        })) || [],

        // Metadata
        _metadata: {
            fonte: 'DataJud',
            tribunal: tribunalName,
            dataConsulta: new Date().toISOString(),
            ibgeCode: datajudData.orgaoJulgador?.codigoMunicipioIBGE // Capture IBGE code if available
        }
    };
};

/**
 * Detecta se um processo é recente (útil para UI)
 */
export const isProcessoRecente = (numeroProcesso: string): boolean => {
    const cleanNum = numeroProcesso.replace(/[^\d]/g, '');
    if (cleanNum.length !== 20) return false;

    const ano = parseInt(cleanNum.substring(9, 13));
    const anoAtual = new Date().getFullYear();

    return ano >= anoAtual - 1; // Considera recente se for dos últimos 2 anos
};

/**
 * Extrai informações CNJ do número do processo
 */
export const extrairInfoCNJ = (numeroProcesso: string) => {
    const cleanNum = numeroProcesso.replace(/[^\d]/g, '');
    if (cleanNum.length !== 20) return null;

    return {
        sequencial: cleanNum.substring(0, 7),
        digito: cleanNum.substring(7, 9),
        ano: cleanNum.substring(9, 13),
        justica: cleanNum.substring(13, 14),
        tribunal: cleanNum.substring(14, 16),
        origem: cleanNum.substring(16, 20)
    };
};
