// Types for A1 Digital Certificate management

export interface CertificateInfo {
    subject: string;        // Nome do titular (CN)
    issuer: string;         // Autoridade Certificadora emissora
    serialNumber: string;   // Número de série único
    validFrom: Date;        // Início da validade
    validTo: Date;          // Fim da validade
    cpfCnpj: string;        // CPF ou CNPJ do titular
    email?: string;         // Email do titular (se disponível)
    organization?: string;  // Organização (para PJ)
    isValid: boolean;       // Se está válido (não expirado e não revogado)
    daysUntilExpiration: number; // Dias restantes até expiração
}

export interface Certificate {
    id: string;             // ID único no sistema
    userId: string;         // ID do usuário proprietário
    info: CertificateInfo;  // Informações do certificado
    encryptedData?: string; // Dados criptografados (base64)
    storedAt: string;       // Timestamp do armazenamento
    lastUsedAt?: string;    // Último uso
}

export interface CertificateValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    info?: CertificateInfo;
}

export interface SignatureOptions {
    reason?: string;        // Motivo da assinatura
    location?: string;      // Local da assinatura
    contactInfo?: string;   // Informação de contato
    includeTimestamp?: boolean; // Incluir timestamp (carimbo de tempo)
}

export interface SignedDocument {
    data: ArrayBuffer;      // Documento assinado
    signatureDate: Date;    // Data/hora da assinatura
    signer: string;         // Nome do signatário
    certificateInfo: CertificateInfo;
}

// Tipos específicos para node-forge
export interface ForgeCertificate {
    subject: any;
    issuer: any;
    serialNumber: string;
    validity: {
        notBefore: Date;
        notAfter: Date;
    };
    publicKey: any;
}

export interface ForgePrivateKey {
    n: any; // modulus
    e: any; // public exponent
    d: any; // private exponent
}

export interface PKCS12Data {
    certificate: ForgeCertificate;
    privateKey: ForgePrivateKey;
    friendlyName?: string;
}
