/**
 * Configuração e Registro da API Interna de Processos
 * 
 * Para integrar ao app.ts existente, adicione:
 * 
 * ```typescript
 * import { configurarApiInterna } from './internalApi';
 * 
 * // Depois de criar o app Express
 * configurarApiInterna(app);
 * ```
 */

import { Express } from 'express';
import processosRoutes from './routes/processos.routes';

/**
 * Configura todas as rotas da API Interna
 */
export function configurarApiInterna(app: Express): void {
    // Registrar rotas
    app.use('/internal/processos', processosRoutes);

    console.log('[API Interna] Rotas registradas:');
    console.log('  POST   /internal/processos/sincronizar');
    console.log('  GET    /internal/processos/:numero_cnj');
    console.log('  GET    /internal/clientes/:id_cliente/processos');
    console.log('  POST   /internal/monitoramentos');
    console.log('  GET    /internal/monitoramentos/pendentes');
    console.log('  GET    /internal/jobs/:job_id');
}

// Export types para uso externo
export * from './types/ProcessoNormalizado';
export { ProcessoService } from './services/ProcessoService';
export { MonitoramentoService } from './services/MonitoramentoService';
