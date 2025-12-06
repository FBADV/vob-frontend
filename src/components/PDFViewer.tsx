import React from 'react';
import { X, Download, ZoomIn, ZoomOut, FileText } from 'lucide-react';

interface PDFViewerProps {
    isOpen: boolean;
    onClose: () => void;
    documentUrl: string;
    documentTitle: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
    isOpen,
    onClose,
    documentUrl,
    documentTitle
}) => {
    if (!isOpen) return null;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = documentTitle;
        link.click();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60 animate-fade-in p-4 backdrop-blur-sm">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-scale-in border border-[rgb(var(--border-subtle))]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center bg-[rgb(var(--bg-secondary))] z-10">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))]">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] truncate">
                            {documentTitle}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors"
                            title="Download"
                        >
                            <Download size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 overflow-hidden bg-[rgb(var(--bg-primary))] relative">
                    {documentUrl && documentUrl !== '#' ? (
                        <iframe
                            src={documentUrl}
                            className="w-full h-full border-none"
                            title={documentTitle}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center p-8 rounded-2xl bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-subtle))] shadow-lg max-w-md">
                                <FileText size={48} className="mx-auto text-[rgb(var(--text-tertiary))] mb-4 opacity-50" />
                                <p className="text-[rgb(var(--text-secondary))] font-medium mb-2">
                                    Documento não disponível para visualização
                                </p>
                                <p className="text-sm text-[rgb(var(--text-tertiary))]">
                                    Este é um documento simulado. Em produção, o PDF seria carregado aqui.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with controls */}
                <div className="px-6 py-3 border-t border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-[rgb(var(--text-tertiary))]">
                            Visualizador de PDF
                        </div>
                        <div className="flex items-center gap-2 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-subtle))] p-1 shadow-sm">
                            <button
                                className="p-1.5 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-md transition-colors"
                                title="Diminuir zoom"
                            >
                                <ZoomOut size={16} />
                            </button>
                            <span className="text-xs font-bold text-[rgb(var(--text-primary))] min-w-[50px] text-center">
                                100%
                            </span>
                            <button
                                className="p-1.5 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-md transition-colors"
                                title="Aumentar zoom"
                            >
                                <ZoomIn size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
