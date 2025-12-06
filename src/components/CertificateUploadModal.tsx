import React, { useState } from 'react';
import { X, Upload, Shield, CheckCircle, AlertTriangle, Loader2, FileCheck } from 'lucide-react';
import { certificateService } from '../services/certificate.service';
import type { CertificateValidationResult } from '../types/certificate.types';
import { useToast } from '../context/ToastContext';

interface CertificateUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCertificateUploaded: (validationResult: CertificateValidationResult) => void;
}

export const CertificateUploadModal: React.FC<CertificateUploadModalProps> = ({
    isOpen,
    onClose,
    onCertificateUploaded
}) => {
    const toast = useToast();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<CertificateValidationResult | null>(null);
    const [dragActive, setDragActive] = useState(false);

    if (!isOpen) return null;

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleFileSelect = (file: File) => {
        const ext = file.name.toLowerCase();
        if (!ext.endsWith('.pfx') && !ext.endsWith('.p12')) {
            toast.error('Formato Inválido', 'Por favor, selecione um arquivo .pfx ou .p12');
            return;
        }

        setSelectedFile(file);
        setValidationResult(null);
    };

    const handleValidate = async () => {
        if (!selectedFile || !password) {
            toast.error('Campos Obrigatórios', 'Selecione um certificado e informe a senha');
            return;
        }

        setIsValidating(true);

        try {
            const result = await certificateService.uploadCertificate(selectedFile, password);
            setValidationResult(result);

            if (result.isValid) {
                toast.success('Certificado Válido', 'Certificado validado com sucesso!');
                onCertificateUploaded(result);
            } else {
                toast.error('Certificado Inválido', result.errors[0] || 'Erro na validação');
            }
        } catch (error: any) {
            toast.error('Erro', error.message || 'Erro ao processar certificado');
            setValidationResult({
                isValid: false,
                errors: [error.message || 'Erro ao processar certificado'],
                warnings: []
            });
        } finally {
            setIsValidating(false);
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setPassword('');
        setValidationResult(null);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] animate-fade-in p-4 backdrop-blur-sm">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in border border-[rgb(var(--border-subtle))]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-[rgb(var(--border-subtle))] bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <Shield size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                                    Adicionar Certificado A1
                                </h3>
                            </div>
                            <p className="text-sm text-[rgb(var(--text-tertiary))] ml-14">
                                Faça upload do seu certificado digital ICP-Brasil
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* File Upload Area */}
                    <div>
                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-3">
                            Arquivo do Certificado (.pfx ou .p12)
                        </label>

                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 transition-all ${dragActive
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                    : selectedFile
                                        ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/10'
                                        : 'border-[rgb(var(--border-default))] hover:border-[rgb(var(--accent-primary))]'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {selectedFile ? (
                                <div className="flex items-center justify-center gap-4">
                                    <FileCheck size={32} className="text-emerald-600 dark:text-emerald-400" />
                                    <div className="flex-1">
                                        <p className="font-bold text-[rgb(var(--text-primary))]">{selectedFile.name}</p>
                                        <p className="text-sm text-[rgb(var(--text-tertiary))]">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                    <button
                                        onClick={resetForm}
                                        className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        Remover
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Upload size={48} className="mx-auto mb-4 text-[rgb(var(--text-tertiary))]" />
                                    <p className="text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                        Arraste o arquivo aqui ou clique para selecionar
                                    </p>
                                    <p className="text-xs text-[rgb(var(--text-tertiary))]">
                                        Formatos aceitos: .pfx, .p12 (PKCS#12)
                                    </p>
                                    <input
                                        type="file"
                                        accept=".pfx,.p12"
                                        onChange={handleFileInput}
                                        className="hidden"
                                        id="cert-file-input"
                                    />
                                    <label
                                        htmlFor="cert-file-input"
                                        className="inline-block mt-4 px-4 py-2 bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))] rounded-lg hover:bg-[rgb(var(--accent-primary))]/20 transition-colors cursor-pointer font-medium text-sm"
                                    >
                                        Selecionar Arquivo
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                            Senha do Certificado
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-premium w-full px-4"
                            placeholder="Digite a senha do certificado"
                            disabled={!selectedFile}
                        />
                        <p className="text-xs text-[rgb(var(--text-tertiary))] mt-2">
                            ⚠️ A senha nunca é armazenada e é usada apenas para validação
                        </p>
                    </div>

                    {/* Validation Result */}
                    {validationResult && (
                        <div className={`p-5 rounded-2xl border ${validationResult.isValid
                                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                            }`}>
                            <div className="flex items-start gap-3">
                                {validationResult.isValid ? (
                                    <CheckCircle className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={24} />
                                ) : (
                                    <AlertTriangle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={24} />
                                )}

                                <div className="flex-1">
                                    <h4 className={`font-bold text-sm mb-2 ${validationResult.isValid
                                            ? 'text-emerald-900 dark:text-emerald-100'
                                            : 'text-red-900 dark:text-red-100'
                                        }`}>
                                        {validationResult.isValid ? 'Certificado Válido! ✅' : 'Problemas Encontrados'}
                                    </h4>

                                    {/* Certificate Info */}
                                    {validationResult.info && (
                                        <div className="space-y-1 mb-3 text-sm">
                                            <p className="text-emerald-900 dark:text-emerald-100">
                                                <strong>Titular:</strong> {validationResult.info.subject}
                                            </p>
                                            <p className="text-emerald-700 dark:text-emerald-300">
                                                <strong>CPF/CNPJ:</strong> {validationResult.info.cpfCnpj}
                                            </p>
                                            <p className="text-emerald-700 dark:text-emerald-300">
                                                <strong>Emitido por:</strong> {validationResult.info.issuer}
                                            </p>
                                            <p className="text-emerald-700 dark:text-emerald-300">
                                                <strong>Validade:</strong> {validationResult.info.validTo.toLocaleDateString('pt-BR')}
                                                ({validationResult.info.daysUntilExpiration} dias restantes)
                                            </p>
                                        </div>
                                    )}

                                    {/* Errors */}
                                    {validationResult.errors.length > 0 && (
                                        <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                                            {validationResult.errors.map((error, i) => (
                                                <li key={i}>{error}</li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* Warnings */}
                                    {validationResult.warnings.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">
                                                Avisos:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1 text-xs text-amber-600 dark:text-amber-400">
                                                {validationResult.warnings.map((warning, i) => (
                                                    <li key={i}>{warning}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleValidate}
                        disabled={!selectedFile || !password || isValidating || (validationResult?.isValid === true)}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isValidating ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Validando...
                            </>
                        ) : validationResult?.isValid ? (
                            <>
                                <CheckCircle size={18} />
                                Validado
                            </>
                        ) : (
                            <>
                                <Shield size={18} />
                                Validar Certificado
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
