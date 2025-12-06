import React, { useState } from 'react';
import { Shield, Upload, Download, RefreshCw, FileText, AlertTriangle } from 'lucide-react';
import { useGlobalData } from '../../context/GlobalDataContext';
import { DataMigrationPanel } from '../DataMigrationPanel';

export const SettingsSystem: React.FC = () => {
    const { user } = useGlobalData();
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const handleBackup = async () => {
        setIsBackingUp(true);
        try {
            // Collect all data from LocalStorage
            const backupData: Record<string, any> = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('vob_')) {
                    backupData[key] = JSON.parse(localStorage.getItem(key) || 'null');
                }
            }

            // Create blob and download
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vob_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert('Backup realizado com sucesso! O arquivo foi baixado.');
        } catch (error) {
            console.error('Backup error:', error);
            alert('Erro ao gerar backup.');
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleRestore = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            if (!confirm('ATENÇÃO: Isso irá substituir todos os dados atuais pelos do backup. Deseja continuar?')) {
                return;
            }

            setIsRestoring(true);
            try {
                const text = await file.text();
                const data = JSON.parse(text);

                // Validate basic structure
                if (typeof data !== 'object') throw new Error('Arquivo inválido');

                // Restore data
                Object.keys(data).forEach(key => {
                    if (key.startsWith('vob_')) {
                        localStorage.setItem(key, JSON.stringify(data[key]));
                    }
                });

                alert('Sistema restaurado com sucesso! A página será recarregada.');
                window.location.reload();
            } catch (error) {
                console.error('Restore error:', error);
                alert('Erro ao restaurar backup. Verifique se o arquivo é válido.');
            } finally {
                setIsRestoring(false);
            }
        };

        input.click();
    };

    if (user?.role !== 'admin') {
        return (
            <div className="card-premium p-8 text-center text-[rgb(var(--text-secondary))] animate-fade-in">
                <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
                <h3 className="text-lg font-bold mb-2 text-[rgb(var(--text-primary))]">Acesso Restrito</h3>
                <p>Apenas administradores podem acessar as configurações do sistema.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="card-premium p-6">
                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-6 flex items-center gap-2">
                    <Shield className="text-[rgb(var(--accent-primary))]" size={24} />
                    Sistema
                </h2>

                <div className="space-y-8">
                    {/* Branding */}
                    <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Identidade Visual</h3>
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-xl bg-[rgb(var(--bg-tertiary))] border-2 border-dashed border-[rgb(var(--border-subtle))] flex items-center justify-center text-[rgb(var(--text-secondary))] hover:border-[rgb(var(--accent-primary))] hover:text-[rgb(var(--accent-primary))] transition-colors cursor-pointer group">
                                <Upload size={24} className="group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h4 className="font-medium text-[rgb(var(--text-primary))]">Logo do Sistema</h4>
                                <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">Recomendado: PNG transparente, 512x512px</p>
                                <button className="text-sm text-[rgb(var(--accent-primary))] hover:underline font-medium">
                                    Carregar nova logo
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-[rgb(var(--border-subtle))]" />

                    {/* Data Management */}
                    <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Gerenciamento de Dados</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                        <Download size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-[rgb(var(--text-primary))]">Backup Completo</h4>
                                        <p className="text-xs text-[rgb(var(--text-secondary))]">Exportar todos os dados</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleBackup}
                                    disabled={isBackingUp}
                                    className="w-full btn-premium py-2 text-sm flex items-center justify-center gap-2"
                                >
                                    {isBackingUp ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            Gerando Backup...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={16} />
                                            Fazer Backup
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="p-4 rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-tertiary))]/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                        <Upload size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-[rgb(var(--text-primary))]">Restaurar Dados</h4>
                                        <p className="text-xs text-[rgb(var(--text-secondary))]">Importar arquivo de backup</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRestore}
                                    disabled={isRestoring}
                                    className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--border-default))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] transition-colors text-sm flex items-center justify-center gap-2 font-medium"
                                >
                                    {isRestoring ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            Restaurando...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} />
                                            Restaurar Backup
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10">
                            <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                                <AlertTriangle size={16} />
                                Zona de Perigo
                            </h4>
                            <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                                Ações destrutivas que não podem ser desfeitas.
                            </p>
                            <button
                                onClick={() => {
                                    if (confirm('TEM CERTEZA? Isso apagará todos os dados locais do sistema (vob_*).')) {
                                        Object.keys(localStorage).forEach(key => {
                                            if (key.startsWith('vob_')) {
                                                localStorage.removeItem(key);
                                            }
                                        });
                                        window.location.reload();
                                    }
                                }}
                                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300"
                            >
                                Limpar Cache do Sistema
                            </button>
                        </div>

                        {/* Migration Panel */}
                        <div className="mt-4">
                            <DataMigrationPanel />
                        </div>
                    </div>


                    <div className="h-px bg-[rgb(var(--border-subtle))]" />

                    {/* Audit Logs */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Logs de Auditoria</h3>
                            <button className="text-sm text-[rgb(var(--accent-primary))] hover:underline font-medium flex items-center gap-1">
                                <FileText size={14} />
                                Ver todos
                            </button>
                        </div>
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[rgb(var(--bg-tertiary))]/30 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span className="text-[rgb(var(--text-primary))] font-medium">Login realizado</span>
                                        <span className="text-[rgb(var(--text-secondary))]">- Dr. João da Silva</span>
                                    </div>
                                    <span className="text-[rgb(var(--text-tertiary))] text-xs">Hoje, 14:3{i}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
