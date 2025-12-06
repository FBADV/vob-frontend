import * as crypto from 'crypto';

/**
 * Serviço de criptografia simétrica para certificados digitais A1.
 * 
 * Utiliza AES-256-GCM (Advanced Encryption Standard - Galois/Counter Mode)
 * conforme NIST FIPS 197 para máxima segurança.
 * 
 * FORMATO DE ARQUIVO CRIPTOGRAFADO:
 * [IV (16 bytes)] + [AuthTag (16 bytes)] + [Dados Criptografados (N bytes)]
 * Total: 32 + N bytes
 * 
 * SEGURANÇA CRÍTICA:
 * - Chave mestra derivada via SCRYPT a partir de CRYPTO_KEY do .env
 * - IV aleatório único por operação de criptografia
 * - Authentication Tag GCM garante integridade
 * - Em produção, migrar para KMS (AWS KMS, Azure Key Vault, HashiCorp Vault)
 */
export class EncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly key: Buffer;

    constructor() {
        const keyString = process.env.CRYPTO_KEY;

        if (!keyString || keyString.length < 32) {
            throw new Error(
                '[EncryptionService] CRYPTO_KEY deve ter no mínimo 32 caracteres. ' +
                'Defina CRYPTO_KEY no arquivo .env'
            );
        }

        // Derivação de chave via SCRYPT
        // N=16384 (custo), r=8 (block size), p=1 (paralelização)
        this.key = crypto.scryptSync(keyString, 'salt', 32);

        console.log('[EncryptionService] Inicializado com AES-256-GCM');
    }

    /**
     * Criptografa dados usando AES-256-GCM.
     * 
     * @param data - Buffer com dados em claro
     * @returns Buffer com IV + AuthTag + Dados Criptografados
     * 
     * @example
     * const encrypted = encryptionService.encrypt(certificadoBuffer);
     * fs.writeFileSync('cert.enc', encrypted);
     */
    encrypt(data: Buffer): Buffer {
        // Gerar IV aleatório único (16 bytes)
        const iv = crypto.randomBytes(16);

        // Criar cipher
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

        // Criptografar dados
        const encrypted = Buffer.concat([
            cipher.update(data),
            cipher.final()
        ]);

        // Obter authentication tag (16 bytes)
        const authTag = cipher.getAuthTag();

        // Formato final: IV (16) + AuthTag (16) + Dados Criptografados (N)
        return Buffer.concat([iv, authTag, encrypted]);
    }

    /**
     * Descriptografa dados criptografados por encrypt().
     * 
     * @param encryptedData - Buffer com IV + AuthTag + Dados Criptografados
     * @returns Buffer com dados em claro (certificado original)
     * @throws Error se AuthTag inválido (dados adulterados)
     * 
     * @example
     * const encrypted = fs.readFileSync('cert.enc');
     * const decrypted = encryptionService.decrypt(encrypted);
     */
    decrypt(encryptedData: Buffer): Buffer {
        if (encryptedData.length < 32) {
            throw new Error('[EncryptionService] Dados criptografados inválidos (tamanho < 32 bytes)');
        }

        // Extrair componentes
        const iv = encryptedData.slice(0, 16);
        const authTag = encryptedData.slice(16, 32);
        const encrypted = encryptedData.slice(32);

        // Criar decipher
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        decipher.setAuthTag(authTag);

        try {
            // Descriptografar dados
            const decrypted = Buffer.concat([
                decipher.update(encrypted),
                decipher.final()
            ]);

            return decrypted;
        } catch (error) {
            throw new Error(
                '[EncryptionService] Falha na descriptografia. ' +
                'Dados podem ter sido adulterados ou chave incorreta.'
            );
        }
    }
}

// Singleton instance
export const encryptionService = new EncryptionService();
