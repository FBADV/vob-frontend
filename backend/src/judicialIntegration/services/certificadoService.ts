import * as forge from 'node-forge';
import * as fs from 'fs/promises';
import * as path from 'path';
import { encryptionService } from './encryptionService';
import { advogadoRepository } from '../repositories/AdvogadoRepository';

/**
 * Serviço de gerenciamento de certificados digitais A1.
 * 
 * RESPONSABILIDADES:
 * - Upload e validação de certificados PKCS#12 (.pfx/.p12)
 * - Criptografia simétrica via EncryptionService
 * - Armazenamento seguro em filesystem
 * - Recuperação para uso em mTLS
 * 
 * SEGURANÇA CRÍTICA:
 * - Senha NUNCA é armazenada
 * - Buffer descriptografado NUNCA é logado
 * - Certificado mantido em memória APENAS durante validação/uso
 * - Filesystem: diretório certs/ com permissões 700
 */
export class CertificadoService {
    private readonly certsDir: string;

    constructor() {
        this.certsDir = path.join(__dirname, '../../../certs');
    }

    /**
     * Garante existência do diretório certs/
     */
    private async ensureCertsDir(): Promise<void> {
        try {
            await fs.mkdir(this.certsDir, { recursive: true, mode: 0o700 });
        } catch (error) {
            console.error('[CertificadoService] Erro criando diretório certs:', error);
        }
    }

    /**
     * Valida e extrai informações de certificado PKCS#12.
     * 
     * @throws Error se certificado inválido, expirado ou senha incorreta
     */
    private validateCertificate(pfxBuffer: Buffer, password: string): {
        cn: string;
        validFrom: Date;
        validUntil: Date;
    } {
        try {
            // Parse ASN.1
            const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

            // Extrair certificado X.509
            const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
            const certBag = bags[forge.pki.oids.certBag]?.[0];

            if (!certBag) {
                throw new Error('Certificado não encontrado no arquivo PKCS#12');
            }

            const certificate = certBag.cert;
            if (!certificate) {
                throw new Error('Certificado X.509 não encontrado');
            }

            // Validar validade temporal
            const now = new Date();
            if (now < certificate.validity.notBefore) {
                throw new Error('Certificado ainda não é válido');
            }
            if (now > certificate.validity.notAfter) {
                throw new Error('Certificado expirado');
            }

            // Extrair Common Name
            const subject = certificate.subject.attributes;
            const cnAttr = subject.find((attr: any) => attr.name === 'commonName');
            const cn = cnAttr ? String(cnAttr.value) : 'Desconhecido';

            return {
                cn,
                validFrom: certificate.validity.notBefore,
                validUntil: certificate.validity.notAfter
            };
        } catch (error) {
            throw new Error(`Certificado inválido: ${(error as Error).message}`);
        }
    }

    /**
     * Faz upload e armazena certificado A1 criptografado.
     * 
     * FLUXO ATÔMICO:
     * 1. Validar certificado (parse + senha + validade)
     * 2. Criptografar buffer
     * 3. Salvar arquivo
     * 4. Atualizar registro de advogado
     * 5. Rollback em caso de falha
     */
    async uploadCertificado(
        advogadoId: string,
        pfxBuffer: Buffer,
        password: string
    ): Promise<{ success: boolean; message: string; certInfo?: any }> {
        let certPath: string | null = null;

        try {
            // 1. Validar certificado
            const certInfo = this.validateCertificate(pfxBuffer, password);
            console.log(`[CertificadoService] Certificado validado: ${certInfo.cn}`);

            // 2. Criptografar
            const encrypted = encryptionService.encrypt(pfxBuffer);

            // 3. Salvar arquivo
            await this.ensureCertsDir();
            const filename = `${advogadoId}_${Date.now()}.enc`;
            certPath = path.join(this.certsDir, filename);
            await fs.writeFile(certPath, encrypted, { mode: 0o600 });
            console.log(`[CertificadoService] Certificado salvo: ${certPath}`);

            // 4. Atualizar advogado
            await advogadoRepository.update(advogadoId, {
                certificadoPath: certPath,
                certificadoValidoAte: certInfo.validUntil
            });

            return {
                success: true,
                message: `Certificado de ${certInfo.cn} carregado com sucesso`,
                certInfo
            };
        } catch (error) {
            // Rollback: remover arquivo se criado
            if (certPath) {
                try {
                    await fs.unlink(certPath);
                } catch { }
            }

            return {
                success: false,
                message: `Erro: ${(error as Error).message}`
            };
        }
    }

    /**
     * Recupera certificado descriptografado para uso.
     * 
     * SEGURANÇA:
     * - Valida senha antes de retornar
     * - Buffer retornado deve ser descartado após uso
     * - Nunca logar buffer ou senha
     */
    async getCertificado(
        advogadoId: string,
        password: string
    ): Promise<{ pfx: Buffer; passphrase: string }> {
        const advogado = await advogadoRepository.findById(advogadoId);

        if (!advogado || !advogado.certificadoPath) {
            throw new Error('Certificado não encontrado para este advogado');
        }

        // Ler arquivo criptografado
        const encrypted = await fs.readFile(advogado.certificadoPath);

        // Descriptografar
        const decrypted = encryptionService.decrypt(encrypted);

        // Validar senha
        try {
            this.validateCertificate(decrypted, password);
        } catch (error) {
            throw new Error('Senha incorreta');
        }

        return {
            pfx: decrypted,
            passphrase: password
        };
    }
}

// Singleton
export const certificadoService = new CertificadoService();
