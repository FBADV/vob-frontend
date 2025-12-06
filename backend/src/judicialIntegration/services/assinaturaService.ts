import forge from 'node-forge';
import fs from 'fs/promises';
import { encryptionService } from './encryptionService';

/**
 * Serviço de assinatura digital usando certificado A1.
 * 
 * Responsabilidades:
 * - Assinar payloads com chave privada do certificado
 * - Extrair chave privada de PKCS#12
 * - Criar headers de assinatura para requisições
 * 
 * SEGURANÇA:
 * - Certificado descriptografado apenas em memória
 * - Chave privada nunca persistida
 * - Buffers limpos após uso
 */
export class AssinaturaService {

    /**
     * Assina payload com certificado A1.
     * 
     * @param payload - Dados a serem assinados (string ou object)
     * @param certificadoPath - Caminho do certificado criptografado
     * @param password - Senha do certificado
     * @returns Assinatura em Base64
     */
    async assinarPayload(
        payload: string | object,
        certificadoPath: string,
        password: string
    ): Promise<string> {
        let certBuffer: Buffer | null = null;

        try {
            // 1. Descriptografar certificado
            certBuffer = await this.descriptografarCertificado(certificadoPath);

            // 2. Extrair chave privada (certBuffer não pode ser null aqui)
            const privateKey = await this.extrairChavePrivada(certBuffer!, password);

            // 3. Preparar dados para assinatura
            const dataToSign = typeof payload === 'string'
                ? payload
                : JSON.stringify(payload);

            // 4. Criar hash SHA-256
            const md = forge.md.sha256.create();
            md.update(dataToSign, 'utf8');

            // 5. Assinar com chave privada
            const signature = privateKey.sign(md);

            // 6. Retornar em Base64
            return forge.util.encode64(signature);

        } finally {
            // Limpar buffer de memória (segurança)
            if (certBuffer) {
                certBuffer.fill(0);
                certBuffer = null;
            }
        }
    }

    /**
     * Extrai chave privada do certificado PKCS#12.
     */
    async extrairChavePrivada(
        certBuffer: Buffer,
        password: string
    ): Promise<forge.pki.rsa.PrivateKey> {
        try {
            // 1. Converter buffer para string binária (DER)
            const bufferString = certBuffer.toString('binary');
            const p12Der = forge.util.createBuffer(bufferString, 'raw');

            // 2. Parsear ASN.1
            const p12Asn1 = forge.asn1.fromDer(p12Der);

            // 3. Decodificar PKCS#12
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

            // 4. Extrair chave privada
            const keyBags = p12.getBags({
                bagType: forge.pki.oids.pkcs8ShroudedKeyBag
            });

            const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];

            if (!keyBag || keyBag.length === 0) {
                throw new Error('Chave privada não encontrada no certificado');
            }

            const key = keyBag[0].key;
            if (!key) {
                throw new Error('Chave privada inválida');
            }

            return key as forge.pki.rsa.PrivateKey;

        } catch (error) {
            if ((error as Error).message.includes('MAC')) {
                throw new Error('Senha do certificado incorreta');
            }
            throw new Error(`Erro ao extrair chave privada: ${(error as Error).message}`);
        }
    }

    /**
     * Extrai certificado X.509 em formato PEM.
     */
    async extrairCertificadoPEM(
        certBuffer: Buffer,
        password: string
    ): Promise<string> {
        try {
            const bufferString = certBuffer.toString('binary');
            const p12Der = forge.util.createBuffer(bufferString, 'raw');
            const p12Asn1 = forge.asn1.fromDer(p12Der);
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

            // Extrair certificado
            const certBags = p12.getBags({
                bagType: forge.pki.oids.certBag
            });

            const certBag = certBags[forge.pki.oids.certBag];

            if (!certBag || certBag.length === 0) {
                throw new Error('Certificado não encontrado');
            }

            const cert = certBag[0].cert;
            if (!cert) {
                throw new Error('Certificado inválido');
            }

            return forge.pki.certificateToPem(cert);

        } catch (error) {
            throw new Error(`Erro ao extrair certificado: ${(error as Error).message}`);
        }
    }

    /**
     * Extrai chave privada em formato PEM.
     */
    async extrairChavePrivadaPEM(
        certBuffer: Buffer,
        password: string
    ): Promise<string> {
        const privateKey = await this.extrairChavePrivada(certBuffer, password);
        return forge.pki.privateKeyToPem(privateKey);
    }

    /**
     * Descriptografa certificado armazenado.
     */
    private async descriptografarCertificado(
        certificadoPath: string
    ): Promise<Buffer> {
        try {
            // Ler arquivo criptografado
            const encryptedData = await fs.readFile(certificadoPath);

            // Descriptografar com EncryptionService (retorna Buffer)
            const decryptedBuffer = await encryptionService.decrypt(encryptedData);

            // Retornar buffer descriptografado diretamentе
            return decryptedBuffer;

        } catch (error) {
            throw new Error(`Erro ao descriptografar certificado: ${(error as Error).message}`);
        }
    }

    /**
     * Cria headers de assinatura para requisições HTTP.
     * 
     * Útil para APIs que requerem assinatura no header.
     */
    async criarHeadersAssinados(
        payload: string | object,
        certificadoPath: string,
        password: string,
        options: {
            timestampHeader?: string;
            signatureHeader?: string;
        } = {}
    ): Promise<Record<string, string>> {
        const timestamp = new Date().toISOString();
        const dataToSign = typeof payload === 'string'
            ? payload
            : JSON.stringify(payload);

        // Incluir timestamp na assinatura para evitar replay attacks
        const signaturePayload = `${timestamp}:${dataToSign}`;
        const signature = await this.assinarPayload(
            signaturePayload,
            certificadoPath,
            password
        );

        return {
            [options.timestampHeader || 'X-Timestamp']: timestamp,
            [options.signatureHeader || 'X-Signature']: signature
        };
    }

    /**
     * Valida se certificado está válido (não expirado).
     */
    async validarCertificado(
        certBuffer: Buffer,
        password: string
    ): Promise<{
        valido: boolean;
        validoDe: Date;
        validoAte: Date;
        cn: string;
    }> {
        const certPem = await this.extrairCertificadoPEM(certBuffer, password);
        const cert = forge.pki.certificateFromPem(certPem);

        const now = new Date();
        const validFrom = cert.validity.notBefore;
        const validUntil = cert.validity.notAfter;

        return {
            valido: now >= validFrom && now <= validUntil,
            validoDe: validFrom,
            validoAte: validUntil,
            cn: cert.subject.getField('CN')?.value || 'Desconhecido'
        };
    }
}

export const assinaturaService = new AssinaturaService();
