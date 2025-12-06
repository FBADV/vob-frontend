import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { advogadoRepository } from './judicialIntegration/repositories/AdvogadoRepository';
import { processoRepository } from './judicialIntegration/repositories/ProcessoRepository';
import { certificadoService } from './judicialIntegration/services/certificadoService';
import { oabService } from './judicialIntegration/services/oabService';
import { mtlsClient } from './judicialIntegration/services/mtlsClient';
import { sincronizacaoService } from './judicialIntegration/services/sincronizacaoService';
import { onboardingService } from './judicialIntegration/services/onboardingService';
import { clienteService } from './judicialIntegration/services/clienteService';
import type { ProcessoAdvogado } from './judicialIntegration/models/ProcessoAdvogado';

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// ========== HEALTH CHECK ==========
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'vob-judicial-backend', version: '1.0.0' });
});

// ========== ADVOGADOS ROUTES ==========

/**
 * GET /api/judicial/advogados
 * Listar todos advogados
 */
app.get('/api/judicial/advogados', async (_req, res) => {
    try {
        const advogados = await advogadoRepository.findAll();
        return res.json(advogados);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * POST /api/judicial/advogados
 * Criar novo advogado
 */
app.post('/api/judicial/advogados', async (req, res) => {
    try {
        const { nome, oab } = req.body;

        if (!nome) {
            return res.status(400).json({ error: 'Nome obrigatório' });
        }

        const novoAdvogado = await advogadoRepository.create({
            id: uuidv4(),
            nome,
            oab: oab || 'OAB/XX 00000', // OAB temporária se não fornecida
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return res.status(201).json({ success: true, advogado: novoAdvogado });
    } catch (error) {
        return res.status(400).json({ error: (error as Error).message });
    }
});

app.put('/api/judicial/advogados/:id/oab', async (req, res) => {
    try {
        const { id } = req.params;
        const { oab } = req.body;

        if (!oab) {
            return res.status(400).json({ error: 'OAB obrigatória' });
        }

        const atualizado = await oabService.atualizarOab(id, oab);
        return res.json({ success: true, advogado: atualizado });
    } catch (error) {
        return res.status(400).json({ error: (error as Error).message });
    }
});

app.post('/api/judicial/advogados/:id/certificado', upload.single('certificate'), async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Arquivo de certificado obrigatório' });
        }

        if (!password) {
            return res.status(400).json({ error: 'Senha do certificado obrigatória' });
        }

        const result = await certificadoService.uploadCertificado(
            id,
            req.file.buffer,
            password
        );

        if (result.success) {
            return res.json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

app.post('/api/judicial/advogados/teste-conexao', async (req, res) => {
    try {
        const { id, password } = req.body;

        if (!id || !password) {
            return res.status(400).json({ error: 'ID e senha do certificado obrigatórios' });
        }

        const result = await mtlsClient.testeConexao(
            id,
            password as string,
            'https://httpbin.org/get' // URL de teste
        );
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

// ========== SINCRONIZAÇÃO ROUTES ========== // Endpoint de sincronização (REAL - usa TribunalClient)
app.post('/api/judicial/advogados/:id/sincronizar', async (req, res) => {
    try {
        const { id } = req.params;
        const { certPassword, tribunal } = req.body;

        // DataJud não precisa de certificado (API pública)
        if (tribunal !== 'DATAJUD' && !certPassword) {
            return res.status(400).json({
                error: 'Senha do certificado obrigatória para tribunais que não sejam DataJud'
            });
        }

        const result = await sincronizacaoService.sincronizarProcessosPorAdvogado(
            id,
            certPassword || '', // Vazio para DataJud
            tribunal || 'DATAJUD' // Padrão DataJud
        );

        return res.json(result);
    } catch (error) {
        console.error('[API] Erro na sincronização:', error);
        return res.status(500).json({ error: (error as Error).message });
    }
});

// Listar processos judiciais do advogado (para onboarding)
app.get('/api/judicial/advogados/:id/processos', async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar todos os processos do advogado
        const processos = await processoRepository.findByAdvogadoId(id);

        return res.json({
            processos: processos.map((p: ProcessoAdvogado) => ({
                id: p.id,
                numeroProcesso: p.numeroProcesso,
                classe: p.classe,
                assunto: p.assuntoPrincipal,
                valorCausa: p.valorCausa,
                tribunal: p.tribunal,
                orgaoJulgador: p.orgaoJulgador,
                statusOnboarding: p.statusOnboarding,
                dataDistribuicao: p.dataDistribuicao,
                grau: p.grau,
                situacao: p.situacao
            }))
        });
    } catch (error) {
        console.error('[API] Erro ao listar processos:', error);
        return res.status(500).json({ error: (error as Error).message });
    }
});

// ========== ONBOARDING ROUTES ==========

app.get('/api/judicial/processos/:processoId/partes', async (req, res) => {
    try {
        const { processoId } = req.params;
        const { advogadoId } = req.query;

        if (!advogadoId) {
            return res.status(400).json({ error: 'advogadoId obrigatório' });
        }

        const result = await onboardingService.getPartesParaOnboarding(
            processoId,
            advogadoId as string
        );
        return res.json(result);
    } catch (error) {
        return res.status(400).json({ error: (error as Error).message });
    }
});

app.post('/api/judicial/processos/:processoId/definir-clientes', async (req, res) => {
    try {
        const { processoId } = req.params;
        const { advogadoId, partesIds } = req.body;

        if (!Array.isArray(partesIds) || partesIds.length === 0) {
            return res.status(400).json({ error: 'partesIds deve ser array não vazio' });
        }

        const result = await onboardingService.definirClientes(
            processoId,
            partesIds,
            advogadoId
        );

        return res.json({ success: true, ...result });
    } catch (error) {
        return res.status(400).json({ error: (error as Error).message });
    }
});

app.post('/api/judicial/processos/:processoId/concluir-onboarding', async (req, res) => {
    try {
        const { processoId } = req.params;
        const { advogadoId } = req.body;

        await onboardingService.concluirOnboarding(processoId, advogadoId);
        return res.json({ success: true });
    } catch (error) {
        return res.status(400).json({ error: (error as Error).message });
    }
});

// ========== CLIENTES ROUTES ==========

app.get('/api/judicial/clientes', async (req, res) => {
    try {
        const { advogadoId } = req.query;

        if (!advogadoId) {
            return res.status(400).json({ error: 'advogadoId obrigatório' });
        }

        const clientes = await clienteService.listarClientes(advogadoId as string);
        return res.json(clientes);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

app.get('/api/judicial/clientes/:clienteId', async (req, res) => {
    try {
        const { clienteId } = req.params;
        const { advogadoId } = req.query;

        const cliente = await clienteService.obterCliente(
            clienteId,
            advogadoId as string
        );

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        return res.json(cliente);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

app.put('/api/judicial/clientes/:clienteId', async (req, res) => {
    try {
        const { clienteId } = req.params;
        const { advogadoId, ...dados } = req.body;

        const clienteAtualizado = await clienteService.atualizarCliente(
            clienteId,
            advogadoId,
            dados
        );

        return res.json(clienteAtualizado);
    } catch (error) {
        return res.status(400).json({ error: (error as Error).message });
    }
});

app.post('/api/judicial/clientes', async (req, res) => {
    try {
        const { advogadoId, ...dados } = req.body;

        const cliente = await clienteService.criarCliente(advogadoId, dados);
        return res.status(201).json(cliente);
    } catch (error) {
        return res.status(400).json({ error: (error as Error).message });
    }
});

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[ERROR]', err);
    return res.status(500).json({
        error: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message
    });
});

export default app;
