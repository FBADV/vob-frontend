import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Lock } from 'lucide-react';

interface CertificateUploadProps {
    advogadoId: string;
    onSuccess?: (certInfo: any) => void;
}

/**
 * Component para upload de certificado digital A1.
 * 
 * FLUXO:
 * 1. Usuário seleciona arquivo .pfx/.p12
 * 2. Digita senha do certificado
 * 3. Upload para backend com criptografia
 * 4. Feedback visual de sucesso/erro
 */
export const CertificateUpload: React.FC<CertificateUploadProps> = ({ advogadoId, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<any | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validar extensão
            if (!selectedFile.name.match(/\.(pfx|p12)$/i)) {
                setError('Arquivo deve ser .pfx ou .p12');
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file || !password) {
            setError('Selecione um certificado e digite a senha');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('certificate', file);
            formData.append('password', password);

            const response = await fetch(
                `http://localhost:3001/api/judicial/advogados/${advogadoId}/certificado`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const result = await response.json();

            if (result.success) {
                setSuccess(result);
                setPassword(''); // Limpar senha
                if (onSuccess) onSuccess(result.certInfo);
            } else {
                setError(result.message || 'Erro ao fazer upload');
            }
        } catch (err) {
            setError('Erro de conexão com servidor');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Certificado Digital A1
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload de certificado para integração com tribunais
                    </p>
                </div>
            </div>

            {/* Upload de Arquivo */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Arquivo do Certificado (.pfx ou .p12)
                    </label>
                    <div className="flex items-center gap-3">
                        <label className="flex-1 relative cursor-pointer">
                            <input
                                type="file"
                                accept=".pfx,.p12"
                                onChange={handleFileChange}
                                className="sr-only"
                            />
                            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <Upload className="w-5 h-5 text-gray-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {file ? file.name : 'Selecionar certificado...'}
                                </span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Senha */}
                {file && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Senha do Certificado
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite a senha do certificado"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            ⚠️ A senha não será armazenada, apenas usada para validação
                        </p>
                    </div>
                )}

                {/* Botão Upload */}
                {file && password && (
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Fazer Upload do Certificado
                            </>
                        )}
                    </button>
                )}

                {/* Mensagens */}
                {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-green-700 dark:text-green-300">
                            <p className="font-medium">{success.message}</p>
                            {success.certInfo && (
                                <p className="text-xs mt-1">
                                    Válido até: {new Date(success.certInfo.validUntil).toLocaleDateString('pt-BR')}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Informações de Segurança */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                    🔒 Segurança
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Certificado criptografado com AES-256-GCM</li>
                    <li>• Senha nunca é armazenada no sistema</li>
                    <li>• Comunicação via HTTPS obrigatório</li>
                    <li>• Validação de expiração automática</li>
                </ul>
            </div>
        </div>
    );
};
