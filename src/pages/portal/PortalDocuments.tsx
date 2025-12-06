import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Folder, Calendar } from 'lucide-react';
import { usePortalAuth } from '../../hooks/usePortalAuth';
import { portalDataService } from '../../services/portalData.service';
import toast from 'react-hot-toast';

interface Document {
    id: string;
    name: string;
    type: string;
    size?: number;
    url?: string;
    processNumber: string;
    processTitle: string;
    uploadedAt: string;
}

export const PortalDocuments: React.FC = () => {
    const { client } = usePortalAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (client) {
            fetchDocuments();
        }
    }, [client]);

    const fetchDocuments = async () => {
        if (!client) return;

        setLoading(true);
        try {
            const data = await portalDataService.getClientDocuments(client.id);
            setDocuments(data);
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error('Erro ao carregar documentos');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (doc: Document) => {
        if (doc.url) {
            window.open(doc.url, '_blank');
        } else {
            toast.error('Documento não disponível para download');
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '-';
        const mb = bytes / (1024 * 1024);
        return mb < 1 ? `${Math.round(bytes / 1024)} KB` : `${mb.toFixed(2)} MB`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    const filteredDocs = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.processNumber.includes(searchTerm) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group documents by process
    const groupedDocs = filteredDocs.reduce((acc, doc) => {
        const key = `${doc.processNumber} - ${doc.processTitle}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(doc);
        return acc;
    }, {} as Record<string, Document[]>);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--accent-primary))] mx-auto mb-4"></div>
                    <p className="text-[rgb(var(--text-secondary))]">Carregando documentos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Documentos</h1>
                    <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                        {documents.length} {documents.length === 1 ? 'documento disponível' : 'documentos disponíveis'}
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar documentos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--bg-tertiary))] border border-[rgb(var(--border-primary))] rounded-xl text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                    />
                </div>
            </div>

            {/* Empty State */}
            {documents.length === 0 && (
                <div className="card-premium text-center py-12">
                    <FileText className="mx-auto text-[rgb(var(--text-tertiary))] mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">
                        Nenhum documento encontrado
                    </h3>
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                        Os documentos dos seus processos aparecerão aqui
                    </p>
                </div>
            )}

            {/* Documents grouped by process */}
            {Object.entries(groupedDocs).map(([processKey, processDocs]) => (
                <div key={processKey} className="card-premium overflow-hidden">
                    {/* Process Header */}
                    <div className="bg-[rgb(var(--bg-tertiary))]/50 px-6 py-4 border-b border-[rgb(var(--border-primary))]">
                        <div className="flex items-center gap-2">
                            <Folder className="text-[rgb(var(--accent-primary))]" size={20} />
                            <h2 className="text-base font-semibold text-[rgb(var(--text-primary))]">
                                {processKey}
                            </h2>
                        </div>
                    </div>

                    {/* Documents List */}
                    <div className="divide-y divide-[rgb(var(--border-primary))]">
                        {processDocs.map((doc) => (
                            <div
                                key={doc.id}
                                className="px-6 py-4 hover:bg-[rgb(var(--bg-tertiary))]/30 transition-colors flex items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="p-2 bg-[rgb(var(--accent-primary))]/10 rounded-lg">
                                        <FileText className="text-[rgb(var(--accent-primary))]" size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">
                                            {doc.name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-[rgb(var(--text-secondary))]">
                                            <span className="flex items-center gap-1">
                                                <FileText size={12} />
                                                {doc.type}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {formatDate(doc.uploadedAt)}
                                            </span>
                                            {doc.size && (
                                                <span>{formatFileSize(doc.size)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDownload(doc)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--accent-primary))] text-white rounded-lg hover:brightness-110 transition-all text-sm font-medium"
                                >
                                    <Download size={16} />
                                    Baixar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* No Results */}
            {filteredDocs.length === 0 && documents.length > 0 && (
                <div className="card-premium text-center py-8">
                    <Search className="mx-auto text-[rgb(var(--text-tertiary))] mb-3" size={32} />
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                        Nenhum documento encontrado para "{searchTerm}"
                    </p>
                </div>
            )}
        </div>
    );
};
