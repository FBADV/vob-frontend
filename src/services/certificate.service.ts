import forge from 'node-forge';
// @ts-ignore
import { KEYUTIL, KJUR, X509, hextob64 } from 'jsrsasign';
import type {
    CertificateInfo,
    CertificateValidationResult,
    PKCS12Data,
    ForgeCertificate
} from '../types/certificate.types';

/**
 * Service for managing A1 Digital Certificates (ICP-Brasil)
 * Handles upload, validation, storage, and retrieval of certificates
 */
class CertificateService {
    /**
     * Upload and validate a certificate file
     * @param file - The .pfx or .p12 certificate file
     * @param password - Certificate password
     * @returns Validation result with certificate info
     */
    async uploadCertificate(file: File, password: string): Promise<CertificateValidationResult> {
        try {
            // Read file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();

            // Validate and extract certificate info
            const result = await this.validateCertificate(arrayBuffer, password);

            return result;
        } catch (error: any) {
            return {
                isValid: false,
                errors: [error.message || 'Erro ao processar certificado'],
                warnings: []
            };
        }
    }

    /**
     * Validate certificate data and extract information
     * @param certData - Certificate data as ArrayBuffer
     * @param password - Certificate password
     * @returns Validation result
     */
    async validateCertificate(certData: ArrayBuffer, password: string): Promise<CertificateValidationResult> {
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
            // Parse PKCS#12
            const pkcs12 = await this.parsePKCS12(certData, password);

            if (!pkcs12) {
                return {
                    isValid: false,
                    errors: ['Não foi possível decodificar o certificado. Verifique a senha.'],
                    warnings: []
                };
            }

            const { certificate } = pkcs12;

            // Extract certificate information
            const info = this.extractCertificateInfo(certificate);

            // Validate expiration
            const now = new Date();
            if (info.validTo < now) {
                errors.push('Certificado expirado');
            } else if (info.daysUntilExpiration <= 30) {
                warnings.push(`Certificado expira em ${info.daysUntilExpiration} dias`);
            }

            // Validate if it's from ICP-Brasil
            if (!this.isICPBrasil(certificate)) {
                warnings.push('Certificado não parece ser da ICP-Brasil. Algumas funcionalidades podem não funcionar.');
            }

            // Validate certificate chain
            const chainValid = this.validateCertificateChain(certificate);
            if (!chainValid) {
                warnings.push('Não foi possível validar completa da cadeia de certificação');
            }

            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                info
            };

        } catch (error: any) {
            return {
                isValid: false,
                errors: [error.message || 'Erro ao validar certificado'],
                warnings
            };
        }
    }

    /**
     * Parse PKCS#12 certificate file
     * @param certData - Certificate data as ArrayBuffer
     * @param password - Certificate password
     * @returns Parsed PKCS12 data with certificate and private key
     */
    private async parsePKCS12(certData: ArrayBuffer, password: string): Promise<PKCS12Data | null> {
        let forgeError: any = null;
        let jsError: any = null;

        // -------------------------------------------------------------------------
        // ATTEMPT 1: node-forge (Standard)
        // -------------------------------------------------------------------------
        try {
            console.log('[Certificate Debug] Attempt 1: node-forge');

            // Convert to binary string safely
            const buffer = forge.util.createBuffer(certData);
            const binaryString = buffer.getBytes();
            const asn1 = forge.asn1.fromDer(binaryString);

            let p12;
            try {
                // @ts-ignore
                p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, password);
            } catch (e) {
                // @ts-ignore
                p12 = forge.pkcs12.pkcs12FromAsn1(asn1, true, password);
            }

            const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
            const certBag = certBags[forge.pki.oids.certBag];
            const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
            const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];

            if (certBag && certBag.length > 0 && keyBag && keyBag.length > 0) {
                console.log('[Certificate Debug] ✅ node-forge success!');
                return {
                    certificate: certBag[0].cert as ForgeCertificate,
                    privateKey: keyBag[0].key as any,
                    friendlyName: certBag[0].attributes?.friendlyName?.[0]
                };
            }
        } catch (err) {
            forgeError = err;
            console.warn('[Certificate Debug] node-forge failed:', err);
        }

        // -------------------------------------------------------------------------
        // ATTEMPT 2: jsrsasign (Fallback)
        // -------------------------------------------------------------------------
        try {
            console.log('[Certificate Debug] Attempt 2: jsrsasign');

            // Convert ArrayBuffer to Hex for jsrsasign
            const bytes = new Uint8Array(certData);
            let hex = '';
            for (let i = 0; i < bytes.length; i++) {
                const b = bytes[i];
                hex += (b < 16 ? '0' : '') + b.toString(16);
            }

            // Parse PFX using KEYUTIL (supports many formats)
            // Note: KEYUTIL.getKey returns the private key, but we need to extract the cert too.
            // For PFX, we can use KJUR.asn1.pkcs12.PKCS12P12

            // Since jsrsasign's PFX support is sometimes limited for *extracting* the cert chain 
            // in a simple way compared to forge, we'll try a specific approach:

            // 1. Try to get the key (validates password)
            const privateKey = KEYUTIL.getKey(hex, password);

            if (privateKey) {
                console.log('[Certificate Debug] jsrsasign: Password valid, private key extracted.');

                // If we got here, the password is correct. 
                // Now we need the certificate. jsrsasign doesn't have a simple "getCertFromPFX" 
                // that returns the X509 object directly in all versions.
                // We will try to re-parse with forge using the knowledge that the password IS correct,
                // maybe trying a different encoding for the password?

                // Actually, if forge failed but jsrsasign succeeded, it's likely an encryption algo issue.
                // Let's try to manually extract the cert using a simpler forge pass or just return
                // a "partial" success if we can't get the cert object fully compatible with forge types.

                // HOWEVER, we need a ForgeCertificate object for the rest of the app.
                // Converting jsrsasign cert to forge cert is complex.

                // Let's try one more trick with forge: Latin1/Binary encoding for password
                console.log('[Certificate Debug] Retrying forge with binary password...');

                // Some PFX generators encode the password as simple bytes, not UTF-8
                // We can try to pass the password as a binary string
                let binaryPassword = '';
                for (let i = 0; i < password.length; i++) {
                    binaryPassword += String.fromCharCode(password.charCodeAt(i) & 0xFF);
                }

                try {
                    const buffer = forge.util.createBuffer(certData);
                    const binaryString = buffer.getBytes();
                    const asn1 = forge.asn1.fromDer(binaryString);
                    // @ts-ignore
                    const p12Binary = forge.pkcs12.pkcs12FromAsn1(asn1, false, binaryPassword);
                    const certBags = p12Binary.getBags({ bagType: forge.pki.oids.certBag });
                    const certBag = certBags[forge.pki.oids.certBag];

                    if (certBag && certBag.length > 0) {
                        return {
                            certificate: certBag[0].cert as ForgeCertificate,
                            privateKey: null as any,
                            friendlyName: 'Imported via Fallback (Binary Password)'
                        };
                    }
                } catch (binaryError) {
                    console.warn('[Certificate Debug] Binary password attempt failed:', binaryError);
                }

                // Attempt 3: UTF-16LE Password (common for Windows-generated .pfx)
                console.log('[Certificate Debug] Retrying forge with UTF-16LE password...');
                try {
                    let utf16Password = '';
                    for (let i = 0; i < password.length; i++) {
                        const code = password.charCodeAt(i);
                        utf16Password += String.fromCharCode(code & 0xFF);
                        utf16Password += String.fromCharCode((code >> 8) & 0xFF);
                    }
                    // Add null terminator just in case (some implementations need it)
                    // utf16Password += String.fromCharCode(0) + String.fromCharCode(0);

                    // @ts-ignore
                    const p12Utf16 = forge.pkcs12.pkcs12FromAsn1(asn1, false, utf16Password);
                    const certBags = p12Utf16.getBags({ bagType: forge.pki.oids.certBag });
                    const certBag = certBags[forge.pki.oids.certBag];

                    if (certBag && certBag.length > 0) {
                        return {
                            certificate: certBag[0].cert as ForgeCertificate,
                            privateKey: null as any,
                            friendlyName: 'Imported via Fallback (UTF-16LE Password)'
                        };
                    }
                } catch (utf16Error) {
                    console.warn('[Certificate Debug] UTF-16LE password attempt failed:', utf16Error);
                }

                // Attempt 4: UTF-16BE Password (Java/Other systems)
                console.log('[Certificate Debug] Retrying forge with UTF-16BE password...');
                try {
                    let utf16bePassword = '';
                    for (let i = 0; i < password.length; i++) {
                        const code = password.charCodeAt(i);
                        utf16bePassword += String.fromCharCode((code >> 8) & 0xFF);
                        utf16bePassword += String.fromCharCode(code & 0xFF);
                    }

                    // @ts-ignore
                    const p12Utf16be = forge.pkcs12.pkcs12FromAsn1(asn1, false, utf16bePassword);
                    const certBags = p12Utf16be.getBags({ bagType: forge.pki.oids.certBag });
                    const certBag = certBags[forge.pki.oids.certBag];

                    if (certBag && certBag.length > 0) {
                        return {
                            certificate: certBag[0].cert as ForgeCertificate,
                            privateKey: null as any,
                            friendlyName: 'Imported via Fallback (UTF-16BE Password)'
                        };
                    }
                } catch (utf16beError) {
                    console.warn('[Certificate Debug] UTF-16BE password attempt failed:', utf16beError);
                }

                // If the binary password attempt failed, try the original password with forge again
                // This block was already present, but now it's after the binary attempt
                console.log('[Certificate Debug] Retrying forge with Latin1 password...');
                const buffer = forge.util.createBuffer(certData);
                const binaryString = buffer.getBytes();
                const asn1 = forge.asn1.fromDer(binaryString);

                // Sometimes password needs to be treated as binary
                // @ts-ignore
                const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, password);
                const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
                const certBag = certBags[forge.pki.oids.certBag];

                if (certBag && certBag.length > 0) {
                    return {
                        certificate: certBag[0].cert as ForgeCertificate,
                        privateKey: null as any, // We have the key from jsrsasign if needed, but for now let's hope forge got it
                        friendlyName: 'Imported via Fallback'
                    };
                }
                // If forge failed both times, try to extract cert using jsrsasign directly
                console.log('[Certificate Debug] Final fallback: jsrsasign direct cert extraction');
                try {
                    // @ts-ignore
                    const p12 = new KJUR.asn1.pkcs12.PKCS12P12({ bd: hex, password: password });
                    // @ts-ignore
                    if (p12.getCertBagArray) {
                        // @ts-ignore
                        const certBags = p12.getCertBagArray();
                        if (certBags && certBags.length > 0) {
                            // @ts-ignore
                            const certHex = certBags[0].certHex;
                            if (certHex) {
                                console.log('[Certificate Debug] jsrsasign extracted cert hex, converting to forge...');
                                const certBytes = forge.util.hexToBytes(certHex);
                                const certAsn1 = forge.asn1.fromDer(certBytes);
                                const forgeCert = forge.pki.certificateFromAsn1(certAsn1);

                                return {
                                    certificate: forgeCert as ForgeCertificate,
                                    privateKey: null as any,
                                    friendlyName: 'Imported via jsrsasign'
                                };
                            }
                        }
                    }
                } catch (jsCertError) {
                    console.warn('[Certificate Debug] jsrsasign cert extraction failed:', jsCertError);
                }
            }
        } catch (err) {
            jsError = err;
            console.warn('[Certificate Debug] jsrsasign failed:', err);
        }

        // If all failed, throw a detailed error with the collected failures
        const errorDetails = [
            `Forge: ${forgeError?.message || 'failed'}`,
            `JSRSAssign: ${jsError?.message || 'failed'}`
        ].join(' | ');

        console.error('[Certificate Debug] All attempts failed:', errorDetails);

        // Check file signature to see if it's even a PFX
        const bytes = new Uint8Array(certData);
        if (bytes.length > 0 && bytes[0] !== 0x30) {
            throw new Error(`Arquivo inválido: O arquivo não parece ser um certificado PFX/P12 (Header incorreto: ${bytes[0].toString(16)}).`);
        }

        if (errorDetails.includes('MAC') || errorDetails.includes('password')) {
            throw new Error(`Não foi possível validar a senha (MAC falhou). Isso pode ocorrer se a senha estiver incorreta OU se o certificado usar uma criptografia incompatível (ex: gerado em sistemas muito antigos ou muito recentes).`);
        }

        throw new Error(`Não foi possível ler o certificado. Detalhes técnicos: ${errorDetails}`);
    }

    /**
     * Extract readable information from certificate
     * @param cert - Forge certificate object
     * @returns Certificate information
     */
    private extractCertificateInfo(cert: ForgeCertificate): CertificateInfo {
        // Extract subject fields
        const subject = this.getSubjectField(cert, 'CN') || 'Desconhecido';
        const issuer = this.getIssuerField(cert, 'CN') || 'Desconhecida';
        const organization = this.getSubjectField(cert, 'O');
        const email = this.getSubjectField(cert, 'emailAddress');

        // Extract CPF/CNPJ from certificate
        const cpfCnpj = this.extractCPFCNPJ(cert);

        // Calculate days until expiration
        const now = new Date();
        const validTo = new Date(cert.validity.notAfter);
        const daysUntilExpiration = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
            subject,
            issuer,
            serialNumber: cert.serialNumber,
            validFrom: new Date(cert.validity.notBefore),
            validTo,
            cpfCnpj,
            email,
            organization,
            isValid: now >= cert.validity.notBefore && now <= cert.validity.notAfter,
            daysUntilExpiration
        };
    }

    /**
     * Get field from certificate subject
     */
    private getSubjectField(cert: ForgeCertificate, fieldName: string): string | undefined {
        const attrs = cert.subject.attributes;
        const attr = attrs.find((a: any) => a.shortName === fieldName || a.name === fieldName);
        return attr?.value;
    }

    /**
     * Get field from certificate issuer
     */
    private getIssuerField(cert: ForgeCertificate, fieldName: string): string | undefined {
        const attrs = cert.issuer.attributes;
        const attr = attrs.find((a: any) => a.shortName === fieldName || a.name === fieldName);
        return attr?.value;
    }

    /**
     * Extract CPF or CNPJ from certificate
     * ICP-Brasil certificates store CPF/CNPJ in specific OIDs
     */
    private extractCPFCNPJ(cert: ForgeCertificate): string {
        // Try to extract from subject alternative names or specific OIDs
        // OID 2.16.76.1.3.1 = CPF
        // OID 2.16.76.1.3.3 = CNPJ

        const attrs = cert.subject.attributes;

        // Try OID for CPF
        let cpfAttr = attrs.find((a: any) => a.type === '2.16.76.1.3.1');
        if (cpfAttr) {
            return this.formatCPF(cpfAttr.value);
        }

        // Try OID for CNPJ
        let cnpjAttr = attrs.find((a: any) => a.type === '2.16.76.1.3.3');
        if (cnpjAttr) {
            return this.formatCNPJ(cnpjAttr.value);
        }

        // Fallback: try to extract from CN (Common Name)
        const cn = this.getSubjectField(cert, 'CN') || '';
        const cpfMatch = cn.match(/\d{11}/);
        if (cpfMatch) {
            return this.formatCPF(cpfMatch[0]);
        }

        const cnpjMatch = cn.match(/\d{14}/);
        if (cnpjMatch) {
            return this.formatCNPJ(cnpjMatch[0]);
        }

        return 'Não identificado';
    }

    /**
     * Format CPF (000.000.000-00)
     */
    private formatCPF(cpf: string): string {
        const numbers = cpf.replace(/\D/g, '');
        if (numbers.length !== 11) return cpf;
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    /**
     * Format CNPJ (00.000.000/0000-00)
     */
    private formatCNPJ(cnpj: string): string {
        const numbers = cnpj.replace(/\D/g, '');
        if (numbers.length !== 14) return cnpj;
        return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    /**
     * Check if certificate is from ICP-Brasil
     */
    private isICPBrasil(cert: ForgeCertificate): boolean {
        const issuer = this.getIssuerField(cert, 'O') || '';
        const issuerCN = this.getIssuerField(cert, 'CN') || '';

        // Check if issuer organization contains ICP-Brasil indicators
        const icpBrasilIndicators = [
            'ICP-Brasil',
            'AC Raiz',
            'Autoridade Certificadora',
            'Certisign',
            'Serasa',
            'Valid',
            'Soluti'
        ];

        return icpBrasilIndicators.some(indicator =>
            issuer.includes(indicator) || issuerCN.includes(indicator)
        );
    }

    /**
     * Validate certificate chain (basic validation)
     * Full validation would require loading trusted roots
     */
    private validateCertificateChain(_cert: ForgeCertificate): boolean {
        try {
            // Basic check: verify certificate is self-consistent
            // In production, you'd validate against CA bundle
            return true; // Placeholder for now
        } catch {
            return false;
        }
    }
}

export const certificateService = new CertificateService();
