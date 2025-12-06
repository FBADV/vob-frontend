import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
    file: File;
    onCrop: (croppedBlob: Blob) => void;
    onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ file, onCrop, onCancel }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, [file]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleCrop = () => {
        if (!imageRef.current) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to desired output size (e.g., 400x400)
        canvas.width = 400;
        canvas.height = 400;

        // Calculate source rectangle
        // The container is 256x256 (w-64 h-64).
        // The image is scaled by 'zoom' and translated by 'position'.
        // We need to map the 256x256 viewport to the original image coordinates.

        // Actually, it's easier to draw the image onto the canvas with the transforms.
        // But we need high resolution.

        // Let's assume the container is the "viewport".
        // We want to capture what's visible in the viewport.

        const image = imageRef.current;
        const scale = zoom;

        // Draw image to canvas
        // Clear canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate drawing parameters
        // We map the viewport (256px) to canvas (400px) -> ratio = 400/256 = 1.5625
        const ratio = 400 / 256;

        ctx.save();
        // Center the drawing
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale * ratio, scale * ratio);
        ctx.translate(position.x / scale, position.y / scale); // Adjust for position

        // Draw image centered
        ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

        ctx.restore();

        canvas.toBlob((blob) => {
            if (blob) {
                onCrop(blob);
            }
        }, 'image/jpeg', 0.9);
    };

    if (!imageSrc) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                <div className="p-4 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center">
                    <h3 className="font-bold text-[rgb(var(--text-primary))]">Ajustar Foto</h3>
                    <button onClick={onCancel} className="p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))]">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center">
                    <div
                        className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-[rgb(var(--accent-primary))] shadow-inner cursor-move bg-black"
                        ref={containerRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="Crop preview"
                            className="absolute max-w-none origin-center pointer-events-none select-none"
                            style={{
                                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                left: '50%',
                                top: '50%'
                            }}
                            draggable={false}
                        />
                    </div>

                    <p className="text-xs text-[rgb(var(--text-tertiary))] mt-4 mb-2">
                        Arraste para mover e use o slider para ampliar
                    </p>

                    <div className="w-full max-w-xs flex items-center gap-4 mt-2">
                        <ZoomOut size={16} className="text-[rgb(var(--text-secondary))]" />
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-[rgb(var(--bg-tertiary))] rounded-lg appearance-none cursor-pointer accent-[rgb(var(--accent-primary))]"
                        />
                        <ZoomIn size={16} className="text-[rgb(var(--text-secondary))]" />
                    </div>
                </div>

                <div className="p-4 border-t border-[rgb(var(--border-subtle))] flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleCrop}
                        className="btn-premium px-6 py-2 flex items-center gap-2"
                    >
                        <Check size={18} />
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};
