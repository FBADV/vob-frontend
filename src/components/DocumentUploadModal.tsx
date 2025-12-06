import React, { useState, useCallback } from 'react';
import { X, Upload, File as FileIcon, Loader2, Check } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '../context/ToastContext';
import { documentsService } from '../services/database.service';

interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    processId?: string;
    clientId?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    processId,
    clientId
}) => {
    const { success, error } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [documentType, setDocumentType] = useState('Outros');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setSelectedFile(file);
            setTitle(file.name.split('.')[0]); // Default title to filename
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
    });

    const handleUpload = async () => {
        if (!selectedFile) return;
        if (!processId && !clientId) {
            error('Erro', 'Documento deve estar vinculado a um processo ou cliente');
            return;
        }

        setIsUploading(true);
        try {
            await documentsService.create({
                processId: processId || null,
                clientId: clientId || null,
                title,
                type: documentType,
                url: '', // Will be handled by service
                size: selectedFile.size,
                file: selectedFile
            });

            success('Sucesso', 'Documento enviado com sucesso!');
            onSuccess();
            onClose();
            setSelectedFile(null);
            setTitle('');
        } catch (err) {
            console.error('Upload error:', err);
            error('Erro', 'Erro ao enviar documento');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-[rgb(var(--bg-primary))] rounded-2xl w-full max-w-md shadow-2xl border border-[rgb(var(--border-subtle))] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border-subtle))]">
                    <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
                        Upload de Documento
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[rgb(var(--bg-secondary))] rounded-lg transition-colors text-[rgb(var(--text-secondary))]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {!selectedFile ? (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive
                                ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/5'
                                : 'border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--bg-secondary))]'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-3 bg-[rgb(var(--bg-secondary))] rounded-full">
                                    <Upload size={24} className="text-[rgb(var(--accent-primary))]" />
                                </div>
                                <div>
                                    <p className="font-medium text-[rgb(var(--text-primary))]">
                                        Clique para selecionar ou arraste
                                    </p>
                                    <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                                        PDF, Imagens, Word (Max 10MB)
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[rgb(var(--bg-secondary))] rounded-xl p-4 flex items-center gap-3 border border-[rgb(var(--border-subtle))]">
                            <div className="p-2 bg-[rgb(var(--bg-tertiary))] rounded-lg">
                                <FileIcon size={24} className="text-[rgb(var(--accent-primary))]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-[rgb(var(--text-primary))] truncate">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-[rgb(var(--text-secondary))]">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="p-1.5 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg text-[rgb(var(--text-secondary))]"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                                Título do Documento
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Contrato Social"
                                className="w-full px-3 py-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] rounded-lg focus:outline-none focus:border-[rgb(var(--accent-primary))] text-[rgb(var(--text-primary))]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                                Tipo
                            </label>
                            <select
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                className="w-full px-3 py-2 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] rounded-lg focus:outline-none focus:border-[rgb(var(--accent-primary))] text-[rgb(var(--text-primary))]"
                            >
                                <option value="Petição">Petição</option>
                                <option value="Sentença">Sentença</option>
                                <option value="Procuração">Procuração</option>
                                <option value="Documento Pessoal">Documento Pessoal</option>
                                <option value="Contrato">Contrato</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-[rgb(var(--border-subtle))] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-secondary))] rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || !title || isUploading}
                        className="px-4 py-2 bg-[rgb(var(--accent-primary))] text-white rounded-lg hover:bg-[rgb(var(--accent-primary))]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                Enviar Documento
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
