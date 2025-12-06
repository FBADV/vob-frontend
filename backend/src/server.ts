import 'dotenv/config';
import app from './app';

// Validar variáveis críticas de ambiente
const requiredEnvVars = ['CRYPTO_KEY'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`[FATAL] Variável de ambiente ${envVar} não definida`);
        console.error('Copie .env.example para .env e configure as variáveis');
        process.exit(1);
    }
}

// Validar comprimento mínimo CRYPTO_KEY
if (process.env.CRYPTO_KEY && process.env.CRYPTO_KEY.length < 32) {
    console.error('[FATAL] CRYPTO_KEY deve ter no mínimo 32 caracteres');
    process.exit(1);
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`🚀 VOB Judicial Backend rodando na porta ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🔒 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(60));
});
