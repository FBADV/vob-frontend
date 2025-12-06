import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { X, Upload, FileSpreadsheet, AlertCircle, Check, Loader2, ClipboardList } from 'lucide-react';
import { useGlobalData } from '../context/GlobalDataContext';
import { syncProcessData } from '../services/DataJudService';
import { generateUUID } from '../services/database.service';

interface BatchImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ImportedProcess {
    number: string;
    title: string;
    court: string;
    value: number;
    status: 'pending' | 'success' | 'error' | 'syncing';
    message?: string;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({ isOpen, onClose }) => {
    const { addProcess } = useGlobalData();
    const [activeTab, setActiveTab] = useState<'file' | 'manual'>('manual');
    const [manualInput, setManualInput] = useState('');
    const [importedData, setImportedData] = useState<ImportedProcess[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const parsedData: ImportedProcess[] = jsonData.map((row: any) => ({
                    number: row['Numero'] || row['Processo'] || row['CNJ'] || '',
                    title: row['Titulo'] || row['Partes'] || row['Nome'] || 'Sem título',
                    court: row['Vara'] || row['Orgao'] || row['Tribunal'] || 'Não informado',
                    value: parseFloat(row['Valor'] || row['Causa'] || '0') || 0,
                    status: 'pending' as const
                })).filter(item => item.number);

                if (parsedData.length === 0) {
                    setError('Nenhum processo encontrado na planilha. Verifique as colunas (Numero, Titulo, Vara, Valor).');
                } else {
                    setImportedData(parsedData);
                    setError(null);
                }
            } catch (err) {
                setError('Erro ao ler o arquivo. Certifique-se de que é um arquivo Excel ou CSV válido.');
                console.error(err);
            }
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv']
        },
        multiple: false
    });

    const handleManualParse = () => {
        if (!manualInput.trim()) {
            setError('Cole a lista de números primeiro.');
            return;
        }

        // Extract CNJ numbers (basic regex for 20 digits or formatted)
        // Matches: NNNNNNN-DD.AAAA.J.TR.OOOO or NNNNNNNDDAAAAJTROOOO
        const regex = /\d{7}-?\d{2}\.?\d{4}\.?\d\.?\d{2}\.?\d{4}/g;
        const matches = manualInput.match(regex);

        if (!matches || matches.length === 0) {
            setError('Nenhum número de processo válido encontrado.');
            return;
        }

        const parsedData: ImportedProcess[] = matches.map(num => ({
            number: num.replace(/[^\d]/g, ''), // Store clean number
            title: 'Aguardando Sincronização...',
            court: 'Aguardando...',
            value: 0,
            status: 'pending'
        }));

        setImportedData(parsedData);
        setError(null);
    };

    const handleImport = async () => {
        setIsProcessing(true);
        let successCount = 0;

        const newData = [...importedData];

        for (let i = 0; i < newData.length; i++) {
            if (newData[i].status === 'success') {
                successCount++;
                continue;
            }

            try {
                newData[i].status = 'syncing';
                setImportedData([...newData]); // Update UI to show syncing

                const item = newData[i];

                // Base process structure
                let processData: any = {
                    id: generateUUID(),
                    number: item.number,
                    title: item.title !== 'Aguardando Sincronização...' ? item.title : `Processo ${item.number}`,
                    court: item.court,
                    value: item.value,
                    status: 'active',
                    clientId: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    area: 'Cível',
                    className: 'Procedimento Comum',
                    folder: {
                        basicData: {
                            plaintiff: '',
                            defendant: '',
                            judge: '',
                            prosecutor: '',
                            courtSection: item.court,
                            distributionDate: new Date().toISOString()
                        },
                        movements: [],
                        timeline: [],
                        observations: [],
                        documents: []
                    }
                };

                // Try to sync with DataJud
                try {
                    const syncedData = await syncProcessData(processData);
                    // Update processData with synced data, ensuring folder/movements are preserved
                    processData = {
                        ...syncedData,
                        folder: {
                            ...syncedData.folder,
                            movements: syncedData.folder.movements || []
                        }
                    };

                    newData[i].title = processData.title || processData.clientName || `Processo ${processData.number}`;
                    newData[i].court = processData.court || processData.folder.basicData.courtSection;
                    newData[i].value = processData.value;
                } catch (syncErr) {
                    console.warn(`Erro ao sincronizar processo ${item.number}:`, syncErr);
                    // Continue with basic data if sync fails, but mark as success (created)
                }

                await addProcess(processData);

                newData[i].status = 'success';
                successCount++;
            } catch (err) {
                newData[i].status = 'error';
                newData[i].message = 'Erro ao importar';
            }

            // Update state after each item to show progress
            setImportedData([...newData]);
        }

        setIsProcessing(false);

        if (successCount === newData.length) {
            setTimeout(() => {
                onClose();
                setImportedData([]);
                setManualInput('');
            }, 1500);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4 backdrop-blur-sm">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in border border-[rgb(var(--border-subtle))]">
                <div className="px-8 py-6 border-b border-[rgb(var(--border-subtle))] flex justify-between items-center bg-[rgb(var(--bg-secondary))] z-10">
                    <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                        <FileSpreadsheet className="text-[rgb(var(--accent-primary))]" size={24} />
                        Importar Processos em Lote
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'manual'
                            ? 'border-b-2 border-[rgb(var(--accent-primary))] text-[rgb(var(--accent-primary))] bg-[rgb(var(--bg-secondary))]'
                            : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))]'
                            }`}
                    >
                        <ClipboardList size={18} />
                        Colar Lista (Manual)
                    </button>
                    <button
                        onClick={() => setActiveTab('file')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'file'
                            ? 'border-b-2 border-[rgb(var(--accent-primary))] text-[rgb(var(--accent-primary))] bg-[rgb(var(--bg-secondary))]'
                            : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))]'
                            }`}
                    >
                        <FileSpreadsheet size={18} />
                        Importar Planilha
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto">
                    {importedData.length === 0 ? (
                        activeTab === 'file' ? (
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragActive
                                    ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/10'
                                    : 'border-[rgb(var(--border-default))] hover:border-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--bg-tertiary))]'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <Upload size={48} className="mx-auto text-[rgb(var(--text-tertiary))] mb-4" />
                                <p className="text-lg font-bold text-[rgb(var(--text-primary))] mb-2">
                                    Arraste e solte sua planilha aqui
                                </p>
                                <p className="text-sm text-[rgb(var(--text-secondary))]">
                                    Ou clique para selecionar (XLSX, XLS, CSV)
                                </p>
                                <p className="text-xs text-[rgb(var(--text-tertiary))] mt-4">
                                    Colunas esperadas: Numero, Titulo, Vara, Valor
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-[rgb(var(--text-secondary))] mb-2">
                                        Cole os números dos processos (um por linha ou separados por vírgula)
                                    </label>
                                    <textarea
                                        value={manualInput}
                                        onChange={(e) => setManualInput(e.target.value)}
                                        className="input-premium px-4 w-full h-48 resize-none font-mono text-sm"
                                        placeholder="Ex: 0000000-00.0000.0.00.0000&#10;1234567-89.2024.8.26.0100"
                                    />
                                </div>
                                <button
                                    onClick={handleManualParse}
                                    className="btn-premium w-full py-3"
                                >
                                    Processar Lista
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-[rgb(var(--text-primary))]">
                                    Pré-visualização ({importedData.length} processos)
                                </h4>
                                <button
                                    onClick={() => { setImportedData([]); setManualInput(''); }}
                                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                                >
                                    Limpar
                                </button>
                            </div>

                            <div className="border border-[rgb(var(--border-subtle))] rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))]">
                                        <tr>
                                            <th className="px-4 py-3 font-bold">Número</th>
                                            <th className="px-4 py-3 font-bold">Título / Partes</th>
                                            <th className="px-4 py-3 font-bold">Vara</th>
                                            <th className="px-4 py-3 font-bold">Valor</th>
                                            <th className="px-4 py-3 font-bold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[rgb(var(--border-subtle))]">
                                        {importedData.map((item, index) => (
                                            <tr key={index} className="bg-[rgb(var(--bg-secondary))] hover:bg-[rgb(var(--bg-tertiary))] transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs text-[rgb(var(--text-primary))]">{item.number}</td>
                                                <td className="px-4 py-3 truncate max-w-[150px] text-[rgb(var(--text-secondary))]">{item.title}</td>
                                                <td className="px-4 py-3 truncate max-w-[150px] text-[rgb(var(--text-secondary))]">{item.court}</td>
                                                <td className="px-4 py-3 text-[rgb(var(--text-primary))] font-medium">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.status === 'pending' && <span className="text-[rgb(var(--text-tertiary))] font-medium">Pendente</span>}
                                                    {item.status === 'syncing' && <span className="text-blue-500 flex items-center gap-1 font-medium"><Loader2 size={14} className="animate-spin" /> Sync...</span>}
                                                    {item.status === 'success' && <span className="text-green-500 flex items-center gap-1 font-medium"><Check size={14} /> Sucesso</span>}
                                                    {item.status === 'error' && <span className="text-red-500 flex items-center gap-1 font-medium"><AlertCircle size={14} /> Erro</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm font-medium border border-red-100 dark:border-red-800">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}
                </div>

                {importedData.length > 0 && (
                    <div className="p-8 border-t border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30 flex justify-end gap-4">
                        <button
                            onClick={() => { setImportedData([]); onClose(); setManualInput(''); }}
                            className="px-6 py-3 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-xl transition-colors font-medium"
                            disabled={isProcessing}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={isProcessing || importedData.every(i => i.status === 'success')}
                            className="btn-premium py-3 px-8 flex items-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Upload size={20} />
                                    Cadastrar Processos
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
