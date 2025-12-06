import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { hasLocalStorageData, getLocalStorageDataCount } from '../utils/migrateData';
import { migrationService } from '../services/migration.service';
import { Database, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const DataMigrationPanel: React.FC = () => {
    const [hasData, setHasData] = useState(false);
    const [dataCount, setDataCount] = useState({ clients: 0, processes: 0 });
    const [isMigrating, setIsMigrating] = useState(false);
    const [progress, setProgress] = useState({ message: '', percent: 0 });
    const [migrationResult, setMigrationResult] = useState<{ success: boolean; error?: string } | null>(null);

    useEffect(() => {
        setHasData(hasLocalStorageData());
        setDataCount(getLocalStorageDataCount());
    }, []);

    const handleMigrate = async () => {
        if (!isSupabaseConfigured()) {
            toast.error('Configure o Supabase primeiro (.env)');
            return;
        }

        const confirmed = window.confirm(
            `Você está prestes a migrar:\n\n` +
            `${dataCount.clients} clientes\n` +
            `${dataCount.processes} processos\n\n` +
            `Deseja continuar?`
        );

        if (!confirmed) return;

        setIsMigrating(true);
        setMigrationResult(null);
        setProgress({ message: 'Iniciando...', percent: 0 });

        try {
            await migrationService.migrateAll((status, percent) => {
                setProgress({ message: status, percent });
            });

            setMigrationResult({ success: true });
            toast.success('Migração concluída com sucesso!');

            // Refresh counts
            setDataCount(getLocalStorageDataCount());
            setHasData(hasLocalStorageData());
        } catch (error) {
            console.error('Migration error:', error);
            setMigrationResult({ success: false, error: String(error) });
            toast.error('Erro na migração');
        } finally {
            setIsMigrating(false);
        }
    };

    if (!isSupabaseConfigured()) {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                            Supabase Não Configurado
                        </h3>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Configure o arquivo <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">.env</code> com as credenciais do Supabase para habilitar a migração de dados.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!hasData) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                            Nenhum Dado para Migrar
                        </h3>
                        <p className="text-sm text-green-800 dark:text-green-200">
                            Não há dados no localStorage que precisem ser migrados para o Supabase.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Database className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            Migração de Dados
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                            Migre seus dados do armazenamento local para o Supabase.
                        </p>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-500 dark:text-gray-400">Clientes</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {dataCount.clients}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-500 dark:text-gray-400">Processos</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {dataCount.processes}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleMigrate}
                            disabled={isMigrating}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {isMigrating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Migrando...
                                </>
                            ) : (
                                <>
                                    <Upload size={18} />
                                    Migrar para Supabase
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isMigrating && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-[rgb(var(--border-subtle))]">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-[rgb(var(--text-primary))] font-medium">{progress.message}</span>
                        <span className="text-[rgb(var(--text-secondary))]">{progress.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress.percent}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {migrationResult && (
                <div className={`border rounded-lg p-4 ${migrationResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                    <h4 className={`font-semibold mb-2 flex items-center gap-2 ${migrationResult.success
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-red-900 dark:text-red-100'
                        }`}>
                        {migrationResult.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {migrationResult.success ? 'Migração Concluída' : 'Erro na Migração'}
                    </h4>
                    {migrationResult.error && (
                        <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                            {migrationResult.error}
                        </p>
                    )}
                    {migrationResult.success && (
                        <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                            Todos os dados foram transferidos para o Supabase.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
