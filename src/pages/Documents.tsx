import React, { useState } from 'react';
import { useGlobalData } from '../context/GlobalDataContext';
import { Plus, Search, Download, FileText, Trash2, Tag, Filter } from 'lucide-react';
import type { Document } from '../types';
import { ModuleHeader } from '../components/ModuleHeader';

export const Documents: React.FC = () => {
    const { documents, addDocument, deleteDocument, clients } = useGlobalData();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [showModal, setShowModal] = useState(false);
    const [newDocument, setNewDocument] = useState<Partial<Document>>({
        title: '',
        type: 'other',
        category: '',
        tags: []
    });

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || doc.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDocument.title && newDocument.type) {
            addDocument({
                ...newDocument as Document,
                id: crypto.randomUUID(),
                fileUrl: '/documents/' + crypto.randomUUID(),
                fileSize: Math.floor(Math.random() * 5000000),
                uploadDate: new Date().toISOString(),
                tags: newDocument.tags || []
            });
            setShowModal(false);
            setNewDocument({ title: '', type: 'other', category: '', tags: [] });
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getDocumentTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            contract: 'Contrato',
            petition: 'Petição',
            procuration: 'Procuração',
            certificate: 'Certidão',
            report: 'Relatório',
            other: 'Outro'
        };
        return labels[type] || type;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <ModuleHeader
                title="Documentos"
                subtitle="Gestão centralizada de documentos e arquivos"
                icon={FileText}
                action={
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-premium flex items-center gap-2 px-6 py-2.5"
                    >
                        <Plus size={20} />
                        Novo Documento
                    </button>
                }
            />

            <div className="card-premium overflow-hidden">
                <div className="p-4 border-b border-[rgb(var(--border-subtle))]">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] pointer-events-none" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar documentos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-premium pl-16 pr-4 py-2 w-full"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] pointer-events-none" size={18} />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="input-premium pl-12 pr-8 py-2 appearance-none cursor-pointer"
                            >
                                <option value="all">Todos os tipos</option>
                                <option value="contract">Contratos</option>
                                <option value="petition">Petições</option>
                                <option value="procuration">Procurações</option>
                                <option value="certificate">Certidões</option>
                                <option value="report">Relatórios</option>
                                <option value="other">Outros</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {filteredDocuments.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-[rgb(var(--text-tertiary))]">
                            <FileText size={48} className="mx-auto mb-3 opacity-30" />
                            Nenhum documento encontrado
                        </div>
                    ) : (
                        filteredDocuments.map((doc) => (
                            <div key={doc.id} className="bg-[rgb(var(--bg-tertiary))]/30 rounded-xl p-4 border border-[rgb(var(--border-subtle))] hover:shadow-md transition-all group hover:border-[rgb(var(--accent-primary))]/30">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <FileText size={20} className="text-[rgb(var(--accent-primary))]" />
                                        <span className="text-xs font-bold text-[rgb(var(--text-secondary))] uppercase tracking-wide">
                                            {getDocumentTypeLabel(doc.type)}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            className="p-1.5 text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--accent-primary))] transition-colors"
                                            title="Download"
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteDocument(doc.id)}
                                            className="p-1.5 text-[rgb(var(--text-tertiary))] hover:text-red-500 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-[rgb(var(--text-primary))] mb-2 line-clamp-2">
                                    {doc.title}
                                </h3>
                                <p className="text-xs text-[rgb(var(--text-secondary))] mb-3">
                                    {doc.category}
                                </p>
                                <div className="flex items-center justify-between text-xs text-[rgb(var(--text-tertiary))]">
                                    <span>{formatFileSize(doc.fileSize)}</span>
                                    <span>{new Date(doc.uploadDate).toLocaleDateString('pt-BR')}</span>
                                </div>
                                {doc.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {doc.tags.map((tag, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))] rounded-full text-xs font-medium">
                                                <Tag size={10} />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Document Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-[rgb(var(--bg-secondary))] rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-scale-in border border-[rgb(var(--border-subtle))]">
                        <div className="px-6 py-4 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center bg-[rgb(var(--bg-tertiary))]/30">
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">Novo Documento</h3>
                            <button onClick={() => setShowModal(false)} className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-colors">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-1">Título</label>
                                <input
                                    type="text"
                                    required
                                    value={newDocument.title}
                                    onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                                    className="input-premium w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-1">Tipo</label>
                                <select
                                    value={newDocument.type}
                                    onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value as any })}
                                    className="input-premium w-full"
                                >
                                    <option value="contract">Contrato</option>
                                    <option value="petition">Petição</option>
                                    <option value="procuration">Procuração</option>
                                    <option value="certificate">Certidão</option>
                                    <option value="report">Relatório</option>
                                    <option value="other">Outro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-1">Categoria</label>
                                <input
                                    type="text"
                                    value={newDocument.category}
                                    onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value })}
                                    className="input-premium w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-1">Cliente (Opcional)</label>
                                <select
                                    value={newDocument.clientId || ''}
                                    onChange={(e) => setNewDocument({ ...newDocument, clientId: e.target.value || undefined })}
                                    className="input-premium w-full"
                                >
                                    <option value="">Nenhum</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-1">Arquivo</label>
                                <input
                                    type="file"
                                    className="input-premium w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[rgb(var(--accent-primary))]/10 file:text-[rgb(var(--accent-primary))] hover:file:bg-[rgb(var(--accent-primary))]/20"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[rgb(var(--border-subtle))]">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary-premium px-4 py-2"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-premium px-6 py-2"
                                >
                                    Salvar Documento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
