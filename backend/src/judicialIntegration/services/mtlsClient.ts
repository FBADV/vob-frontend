import https from 'https';
import forge from 'node-forge';
import { advogadoRepository } from '../repositories/AdvogadoRepository';
import { encryptionService } from './encryptionService';
import fs from 'fs/promises';

/**
 * Cliente mTLS para comunicação com sistemas judiciais.
 * 
 * Implementa autenticação mútua TLS (mTLS) usando certificado digital A1.
 * 
 * SEGURANÇA:
 * - Certificado descriptografado apenas em memória
 * - Agent HTTPS reutilizado (cache)
 * - Validação de certificado servidor obrigatória
 * - Timeout configurável para evitar travamentos
 */
export class MtlsClient {
    private agentCache: Map<string, https.Agent> = new Map();
    private readonly DEFAULT_TIMEOUT = 30000; // 30 segundos

    /**
     * Cria agente HTTPS com autenticação mTLS.
     * 
     * @param advogadoId - ID do advogado (dono do certificado)
     * @param password - Senha do certificado
     * @returns HTTPS Agent configurado
     */
    async criarAgenteMTLS(
        advogadoId: string,
        password: string
    ): Promise<https.Agent> {
        // Verificar cache
        const cacheKey = `${advogadoId}:${password}`;
        if (this.agentCache.has(cacheKey)) {
            return this.agentCache.get(cacheKey)!;
        }

        // Buscar advogado
        const advogado = await advogadoRepository.findById(advogadoId);
        if (!advogado) {
            throw new Error('Advogado não encontrado');
        }

        if (!advogado.certificadoPath) {
            throw new Error('Certificado não configurado para este advogado');
        }

        try {
            // 1. Descriptografar certificado
            const certBuffer = await this.descriptografarCertificado(
                advogado.certificadoPath
            );

            // 2. Extrair certificado e chave em formato PEM
            const { certPem, keyPem } = await this.extrairPEMs(
                certBuffer,
                password
            );

            // 3. Criar Agent HTTPS
            const agent = new https.Agent({
                cert: certPem,
                key: keyPem,
                rejectUnauthorized: true, // Validar certificado do servidor
                keepAlive: true,
                maxSockets: 10,
                timeout: this.DEFAULT_TIMEOUT
            });

            // 4. Armazenar em cache
            this.agentCache.set(cacheKey, agent);

            console.log(`[MtlsClient] Agent criado para advogado ${advogadoId}`);

            return agent;

        } catch (error) {
            throw new Error(`Erro ao criar agent mTLS: ${(error as Error).message}`);
        }
    }

    /**
     * Realiza requisição HTTP autenticada com mTLS.
     * 
     * @param advogadoId - ID do advogado
     * @param password - Senha do certificado
     * @param url - URL do endpoint
     * @param options - Opções da requisição
     */
    async requisicaoAutenticada(
        advogadoId: string,
        password: string,
        url: string,
        options: {
            method?: string;
            headers?: Record<string, string>;
            body?: string | object;
            timeout?: number;
        } = {}
    ): Promise<any> {
        const agent = await this.criarAgenteMTLS(advogadoId, password);

        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'VOB-JudicialIntegration/1.0',
                ...options.headers
            },
            body: typeof options.body === 'object'
                ? JSON.stringify(options.body)
                : options.body,
            timeout: options.timeout || this.DEFAULT_TIMEOUT
        };

        try {
            const response = await fetch(url, {
                ...requestOptions,
                // @ts-ignore - Agent é suportado no Node.js
                agent
            });

            const contentType = response.headers.get('content-type');
            const isJson = contentType?.includes('application/json');

            const data = isJson ? await response.json() : await response.text();

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}\n${typeof data === 'string' ? data : JSON.stringify(data)
                    }`
                );
            }

            return data;

        } catch (error) {
            if ((error as any).code === 'ECONNRESET') {
                throw new Error('Conexão resetada pelo servidor. Verifique certificado e permissões.');
            }
            if ((error as any).code === 'ETIMEDOUT') {
                throw new Error('Timeout na requisição. Servidor não respondeu.');
            }
            if ((error as any).code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
                throw new Error('Certificado do servidor auto-assinado. Possível ambiente de homologação.');
            }

            throw error;
        }
    }

    /**
     * Descriptografa certificado armazenado.
     */
    private async descriptografarCertificado(
        certificadoPath: string
    ): Promise<Buffer> {
        const encryptedData = await fs.readFile(certificadoPath);
        const decryptedBuffer = await encryptionService.decrypt(encryptedData);
        return decryptedBuffer;
    }

    /**
     * Extrai certificado e chave privada em formato PEM.
     */
    private async extrairPEMs(
        certBuffer: Buffer,
        password: string
    ): Promise<{ certPem: string; keyPem: string }> {
        try {
            // 1. Converter para ByteStringBuffer
            const bufferString = certBuffer.toString('binary');
            const p12Der = forge.util.createBuffer(bufferString, 'raw');

            // 2. Parsear ASN.1
            const p12Asn1 = forge.asn1.fromDer(p12Der);

            // 3. Decodificar PKCS#12
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

            // 4. Extrair certificado
            const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
            const certBag = certBags[forge.pki.oids.certBag];

            if (!certBag || certBag.length === 0) {
                throw new Error('Certificado não encontrado no arquivo PKCS#12');
            }

            const cert = certBag[0].cert!;
            const certPem = forge.pki.certificateToPem(cert);

            // 5. Extrair chave privada
            const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
            const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];

            if (!keyBag || keyBag.length === 0) {
                throw new Error('Chave privada não encontrada no arquivo PKCS#12');
            }

            const key = keyBag[0].key!;
            const keyPem = forge.pki.privateKeyToPem(key as forge.pki.rsa.PrivateKey);

            return { certPem, keyPem };

        } catch (error) {
            if ((error as Error).message.includes('MAC')) {
                throw new Error('Senha do certificado incorreta');
            }
            throw new Error(`Erro ao processar certificado: ${(error as Error).message}`);
        }
    }

    /**
     * Testa conexão com endpoint usando mTLS.
     * 
     * Útil para validar que certificado está funcionando.
     */
    async testeConexao(
        advogadoId: string,
        password: string,
        url: string
    ): Promise<{
        sucesso: boolean;
        mensagem: string;
        detalhes?: any;
    }> {
        try {
            const response = await this.requisicaoAutenticada(
                advogadoId,
                password,
                url,
                { method: 'GET', timeout: 10000 }
            );

            return {
                sucesso: true,
                mensagem: 'Conexão mTLS estabelecida com sucesso',
                detalhes: response
            };

        } catch (error) {
            return {
                sucesso: false,
                mensagem: (error as Error).message
            };
        }
    }

    /**
     * Limpa cache de agents.
     */
    limparCache(): void {
        this.agentCache.forEach(agent => agent.destroy());
        this.agentCache.clear();
        console.log('[MtlsClient] Cache de agents limpo');
    }
}

export const mtlsClient = new MtlsClient();
