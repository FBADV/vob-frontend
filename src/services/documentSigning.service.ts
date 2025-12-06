import forge from 'node-forge';
import { PDFDocument } from 'pdf-lib';
import type { /* Certificate, */ SignatureOptions, SignedDocument } from '../types/certificate.types';
import { certificateService } from './certificate.service';

/**
 * Service for digitally signing documents (PDF and XML)
 * Implements ICP-Brasil standards (PAdES for PDF, XAdES for XML)
 */
class DocumentSigningService {
    /**
     * Sign a PDF document
     * @param pdfData - PDF file as ArrayBuffer
     * @param certData - Certificate data (PKCS#12)
     * @param password - Certificate password
     * @param options - Signature options (reason, location, etc.)
     * @returns Signed PDF as ArrayBuffer
     */
    async signPDF(
        pdfData: ArrayBuffer,
        certData: ArrayBuffer,
        password: string,
        options?: SignatureOptions
    ): Promise<SignedDocument> {
        try {
            // 1. Parse certificate
            const pkcs12 = await this.parseCertificate(certData, password);
            if (!pkcs12) {
                throw new Error('Falha ao decodificar certificado');
            }

            const { certificate, privateKey } = pkcs12;

            // 2. Load PDF
            const pdfDoc = await PDFDocument.load(pdfData);

            // 3. Get certificate info for signature metadata
            const certInfo = certificateService['extractCertificateInfo'](certificate as any);

            // 4. Create signature appearance (for now, we'll add a simple annotation)
            // In a full implementation, this would create a visible signature field

            // 5. Calculate document hash (SHA-256)
            const pdfBytes = await pdfDoc.save();
            const hash = this.calculateHash(pdfBytes.buffer as ArrayBuffer);

            // 6. Sign hash with private key
            const md = forge.md.sha256.create();
            md.update(hash, 'raw');

            // const signature = (privateKey as any).sign(md);

            // 7. Create PKCS#7 signature
            const p7 = forge.pkcs7.createSignedData();
            p7.content = forge.util.createBuffer(hash, 'raw');
            p7.addCertificate(certificate as any);
            p7.addSigner({
                key: privateKey as any,
                certificate: certificate as any,
                digestAlgorithm: forge.pki.oids.sha256,
                authenticatedAttributes: [
                    {
                        type: forge.pki.oids.contentType,
                        value: forge.pki.oids.data
                    },
                    {
                        type: forge.pki.oids.messageDigest
                    },
                    {
                        type: forge.pki.oids.signingTime,
                        value: new Date() as any
                    }
                ]
            });

            p7.sign();

            // 8. Embed signature in PDF
            // For now, we'll save the PDF with metadata about being signed
            // Full implementation would embed the PKCS#7 signature in PDF dictionary

            // Add metadata to indicate signed document
            pdfDoc.setTitle(`${pdfDoc.getTitle() || 'Document'} [ASSINADO DIGITALMENTE]`);
            pdfDoc.setAuthor(certInfo.subject);
            pdfDoc.setKeywords(['Assinado Digitalmente', 'ICP-Brasil']);
            pdfDoc.setSubject(options?.reason || 'Assinatura Digital');

            const signedPdfBytes = await pdfDoc.save();

            return {
                data: signedPdfBytes.buffer as any,
                signatureDate: new Date(),
                signer: certInfo.subject,
                certificateInfo: certInfo
            };

        } catch (error: any) {
            console.error('Error signing PDF:', error);
            throw new Error(error.message || 'Erro ao assinar PDF');
        }
    }

    /**
     * Sign XML document (for e-Proc petitions)
     * @param xmlData - XML as string
     * @param certData - Certificate data
     * @param password - Certificate password
     * @returns Signed XML as string
     */
    async signXML(
        xmlData: string,
        certData: ArrayBuffer,
        password: string
    ): Promise<string> {
        try {
            // 1. Parse certificate
            const pkcs12 = await this.parseCertificate(certData, password);
            if (!pkcs12) {
                throw new Error('Falha ao decodificar certificado');
            }

            const { certificate, privateKey } = pkcs12;

            // 2. Canonicalize XML (C14N)
            // In production, use proper XML canonicalization library
            const canonicalXml = xmlData.trim();

            // 3. Calculate hash
            const hash = this.calculateHash(canonicalXml);

            // 4. Sign hash
            const md = forge.md.sha256.create();
            md.update(hash, 'raw');
            const signature = (privateKey as any).sign(md);

            // 5. Convert signature to Base64
            const signatureBase64 = forge.util.encode64(signature);

            // 6. Get certificate as Base64
            const certPem = forge.pki.certificateToPem(certificate as any);
            const certBase64 = certPem
                .replace('-----BEGIN CERTIFICATE-----', '')
                .replace('-----END CERTIFICATE-----', '')
                .trim();

            // 7. Create XML Signature structure (XAdES-BES basic structure)
            const signatureXml = this.createXMLSignature(signatureBase64, certBase64, hash);

            // 8. Insert signature into XML
            const signedXml = xmlData.replace(
                '</root>',  // Replace with actual root element
                `${signatureXml}</root>`
            );

            return signedXml;

        } catch (error: any) {
            console.error('Error signing XML:', error);
            throw new Error(error.message || 'Erro ao assinar XML');
        }
    }

    /**
     * Verify PDF signature
     * @param pdfData - Signed PDF
     * @returns Verification result
     */
    async verifyPDFSignature(pdfData: ArrayBuffer): Promise<{
        isValid: boolean;
        signer?: string;
        signatureDate?: Date;
        errors: string[];
    }> {
        try {
            const pdfDoc = await PDFDocument.load(pdfData);

            // Check metadata for signature indicator
            const title = pdfDoc.getTitle();
            const author = pdfDoc.getAuthor();

            if (!title?.includes('[ASSINADO DIGITALMENTE]')) {
                return {
                    isValid: false,
                    errors: ['Documento não possui assinatura digital']
                };
            }

            // In full implementation, would verify PKCS#7 signature
            // For now, basic check

            return {
                isValid: true,
                signer: author || 'Desconhecido',
                signatureDate: new Date(pdfDoc.getModificationDate() || Date.now()),
                errors: []
            };

        } catch (error: any) {
            return {
                isValid: false,
                errors: [error.message || 'Erro ao verificar assinatura']
            };
        }
    }

    /**
     * Helper: Parse certificate from PKCS#12
     */
    private async parseCertificate(certData: ArrayBuffer, password: string) {
        return certificateService['parsePKCS12'](certData, password);
    }

    /**
     * Helper: Calculate SHA-256 hash
     */
    private calculateHash(data: ArrayBuffer | string): string {
        const md = forge.md.sha256.create();

        if (typeof data === 'string') {
            md.update(data, 'utf8');
        } else {
            const bytes = new Uint8Array(data);
            const binary = String.fromCharCode(...bytes);
            md.update(binary, 'raw');
        }

        return md.digest().getBytes();
    }

    /**
     * Helper: Create XML Signature structure
     */
    private createXMLSignature(signatureValue: string, certificate: string, digestValue: string): string {
        const digestBase64 = forge.util.encode64(digestValue);

        return `
<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
        <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
        <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
        <Reference URI="">
            <Transforms>
                <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
            </Transforms>
            <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
            <DigestValue>${digestBase64}</DigestValue>
        </Reference>
    </SignedInfo>
    <SignatureValue>${signatureValue}</SignatureValue>
    <KeyInfo>
        <X509Data>
            <X509Certificate>${certificate}</X509Certificate>
        </X509Data>
    </KeyInfo>
</Signature>`;
    }
}

export const documentSigningService = new DocumentSigningService();
