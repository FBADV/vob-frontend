/**
 * Integração da Camada Judit no app.ts
 * 
 * Adicionar ao backend/src/app.ts:
 */

import { Express } from 'express';
import camadaJuditRoutes from './api/camadaJudit.routes';

export function configurarCamadaJudit(app: Express): void {
    // Registrar rotas da Camada Judit
    app.use('/api', camadaJuditRoutes);

    console.log('[Camada Judit] Endpoints registrados:');
    console.log('  📋 POST   /api/consulta-processual          - Busca assíncrona');
    console.log('  📊 GET    /api/consulta-processual/:id      - Status da busca');
    console.log('  📄 GET    /api/processos/:numero_cnj        - Processo completo');
    console.log('  🔔 POST   /api/tracking                     - Monitoramento');
    console.log('  📡 GET    /api/tracking/:id                 - Status tracking');
    console.log('  ❌ DELETE /api/tracking/:id                 - Cancelar tracking');
}
