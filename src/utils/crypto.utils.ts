/**
 * Cryptography utilities for secure certificate storage
 * Uses Web Crypto API with AES-256-GCM encryption
 */

export interface EncryptedData {
    salt: Uint8Array;
    iv: Uint8Array;
    encryptedData: ArrayBuffer;
}

export interface StorableEncryptedData {
    salt: string;       // Base64 encoded
    iv: string;         // Base64 encoded
    data: string;       // Base64 encoded
}

/**
 * Encrypt data using AES-256-GCM
 * @param data - Data to encrypt
 * @param userPassword - User's password for key derivation
 * @returns Encrypted data with salt and IV
 */
export async function encryptData(
    data: ArrayBuffer,
    userPassword: string
): Promise<EncryptedData> {
    // Generate random salt for PBKDF2
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Import password as key material
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(userPassword),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    // Derive encryption key using PBKDF2
    // 100,000 iterations for strong key derivation
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );

    // Generate random IV for AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt data
    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
    );

    return { salt, iv, encryptedData };
}

/**
 * Decrypt data using AES-256-GCM
 * @param encryptedData - Encrypted data with salt and IV
 * @param userPassword - User's password for key derivation
 * @returns Decrypted data
 */
export async function decryptData(
    encryptedData: EncryptedData,
    userPassword: string
): Promise<ArrayBuffer> {
    // Import password as key material
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(userPassword),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    // Derive decryption key using same parameters
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encryptedData.salt as any,
            iterations: 100000,
            hash: 'SHA-256'
        },
        passwordKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );

    // Decrypt data
    const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: encryptedData.iv as any },
        key,
        encryptedData.encryptedData as any
    );

    return decryptedData;
}

/**
 * Convert EncryptedData to storable format (Base64 strings)
 */
export function encryptedDataToStorable(encrypted: EncryptedData): StorableEncryptedData {
    return {
        salt: arrayBufferToBase64(encrypted.salt),
        iv: arrayBufferToBase64(encrypted.iv),
        data: arrayBufferToBase64(encrypted.encryptedData)
    };
}

/**
 * Convert storable format back to EncryptedData
 */
export function storableToEncryptedData(storable: StorableEncryptedData): EncryptedData {
    return {
        salt: base64ToUint8Array(storable.salt),
        iv: base64ToUint8Array(storable.iv),
        encryptedData: base64ToArrayBuffer(storable.data)
    };
}

/**
 * Convert ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Convert Base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/**
 * Hash password for verification (not for encryption)
 * Used to verify password without storing it
 */
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return arrayBufferToBase64(hashBuffer);
}
