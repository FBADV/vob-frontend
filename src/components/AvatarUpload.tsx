import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, X } from 'lucide-react';
import clsx from 'clsx';

interface AvatarUploadProps {
    currentAvatarUrl?: string;
    userName: string;
    onImageChange: (file: File | null) => void;
    className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
    currentAvatarUrl,
    userName,
    onImageChange,
    className
}) => {
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onImageChange(file);
        }
    }, [onImageChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1,
        multiple: false
    });

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onImageChange(null);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    };

    return (
        <div className={clsx("flex flex-col items-center gap-4", className)}>
            <div
                {...getRootProps()}
                className={clsx(
                    "relative w-32 h-32 rounded-full cursor-pointer group transition-all duration-300",
                    "border-4 border-[rgb(var(--bg-secondary))] shadow-xl",
                    isDragActive ? "ring-4 ring-[rgb(var(--accent-primary))]/50 scale-105" : "hover:ring-4 hover:ring-[rgb(var(--accent-primary))]/30"
                )}
            >
                <input {...getInputProps()} />

                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[rgb(var(--accent-primary))] to-purple-600 flex items-center justify-center relative">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Avatar Preview"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-3xl font-bold text-white">
                            {getInitials(userName)}
                        </span>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="text-white" size={32} />
                    </div>
                </div>

                {/* Remove button */}
                {preview && (
                    <button
                        onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
                        title="Remover foto"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            <div className="text-center">
                <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
                    Foto de Perfil
                </p>
                <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">
                    Clique ou arraste para alterar
                </p>
            </div>
        </div>
    );
};
