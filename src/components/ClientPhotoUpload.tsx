import React, { useState } from 'react';
import { User, Upload, X } from 'lucide-react';

interface ClientPhotoUploadProps {
    clientId: string;
    currentPhotoUrl?: string;
    onPhotoUploaded: (url: string) => void;
    onPhotoRemoved?: () => void;
}

import { ImageCropper } from './ImageCropper';

export const ClientPhotoUpload: React.FC<ClientPhotoUploadProps> = ({
    clientId,
    currentPhotoUrl,
    onPhotoUploaded,
    onPhotoRemoved
}) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | undefined>(currentPhotoUrl);
    const [fileToCrop, setFileToCrop] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validação de tipo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida (JPG, PNG, etc.)');
            return;
        }

        // Validação de tamanho (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('A imagem é muito grande. Tamanho máximo: 5MB');
            return;
        }

        setFileToCrop(file);
        // Reset input value to allow selecting same file again if cancelled
        e.target.value = '';
    };

    const handleCropConfirm = async (croppedBlob: Blob) => {
        setFileToCrop(null);
        setUploading(true);

        try {
            // Convert Blob to File
            const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });

            // Import dinâmico do service
            const { db } = await import('../services/database.service');
            const url = await db.storage.uploadClientPhoto(file, clientId);
            setPreview(url);
            onPhotoUploaded(url);
        } catch (error) {
            console.error('Erro ao fazer upload da foto:', error);
            alert('Erro ao fazer upload da foto. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePhoto = async () => {
        if (!confirm('Deseja remover a foto do cliente?')) return;

        try {
            const { db } = await import('../services/database.service');
            await db.storage.deleteClientPhoto(clientId);
            setPreview(undefined);
            if (onPhotoRemoved) onPhotoRemoved();
        } catch (error) {
            console.error('Erro ao remover foto:', error);
            alert('Erro ao remover a foto.');
        }
    };

    return (
        <>
            {fileToCrop && (
                <ImageCropper
                    file={fileToCrop}
                    onCrop={handleCropConfirm}
                    onCancel={() => setFileToCrop(null)}
                />
            )}

            <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Foto do cliente"
                            className="w-32 h-32 rounded-full object-cover border-4 border-[rgb(var(--border-subtle))] shadow-lg"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[rgb(var(--bg-tertiary))] to-[rgb(var(--bg-secondary))] flex items-center justify-center border-4 border-[rgb(var(--border-subtle))] shadow-inner">
                            <User size={48} className="text-[rgb(var(--text-tertiary))]" />
                        </div>
                    )}

                    {preview && (
                        <button
                            onClick={handleRemovePhoto}
                            className="absolute -top-1 -right-1 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100"
                            title="Remover foto"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <label className="cursor-pointer w-full">
                    <div
                        className={`px-4 py-2.5 rounded-xl border-2 border-dashed border-[rgb(var(--border-default))] hover:border-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--bg-tertiary))] transition-all flex items-center justify-center gap-2 group ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <Upload size={18} className="text-[rgb(var(--text-tertiary))] group-hover:text-[rgb(var(--accent-primary))] transition-colors" />
                        <span className="text-sm font-bold text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--text-primary))] transition-colors">
                            {uploading ? 'Enviando...' : preview ? 'Alterar foto' : 'Adicionar foto'}
                        </span>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>

                <p className="text-xs font-medium text-[rgb(var(--text-tertiary))] text-center">
                    JPG, PNG ou GIF. Máx. 5MB
                </p>
            </div>
        </>
    );
};
