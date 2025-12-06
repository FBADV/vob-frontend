import React, { useState, useEffect } from 'react';
import { Scale, FileCheck, Users as UsersIcon, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { CertificateUpload } from '../judicial/CertificateUpload';
import { ProcessOnboarding } from '../judicial/ProcessOnboarding';

/**
 * Component de configurações da Integração Judicial.
 * 
 * AUTO-CRIAÇÃO: Cria advogado automaticamente se não existir
 * PERSISTÊNCIA: Certificado salvo em disco, registro em memória
 */
export const SettingsJudicial: React.FC = () => {
    const [oab, setOab] = useState('');
    const [mode, setMode] = useState<'setup' | 'onboarding'>('setup');
    const [advogadoId, setAdvogadoId] = useState<string | null>(null);
    const [advogado, setAdvogado] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados de sincronização
    const [certPassword, setCertPassword] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<any>(null);

    // Carregar ou criar advogado ao montar
    useEffect(() => {
        initAdvogado();
    }, []);

    const initAdvogado = async () => {
        try {
            // 1. Tentar buscar advogados existentes
            const response = await fetch('http://localhost:3001/api/judicial/advogados');
            const advogados = await response.json();

            if (advogados.length > 0) {
                // Usar primeiro advogado encontrado
                const adv = advogados[0];
                setAdvogadoId(adv.id);
                setAdvogado(adv);
                setOab(adv.oab);
                console.log('[SettingsJudicial] Advogado encontrado:', adv.id);
            } else {
                // 2. Criar advogado automaticamente
                const createResponse = await fetch('http://localhost:3001/api/judicial/advogados', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome: 'Advogado Principal',
                        oab: 'OAB/XX 00000'
                    })
                });

                const result = await createResponse.json();
                if (result.success) {
                    setAdvogadoId(result.advogado.id);
                    setAdvogado(result.advogado);
                    setOab(result.advogado.oab);
                    console.log('[SettingsJudicial] Advogado criado:', result.advogado.id);
                }
            }
        } catch (err) {
            setError('Erro ao inicializar advogado. Verifique se o backend está rodando.');
            console.error('[SettingsJudicial] Erro:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOabUpdate = async () => {
        if (!advogadoId) {
            setError('Advogado não inicializado');
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:3001/api/judicial/advogados/${advogadoId}/oab`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oab })
                }
            );

            const result = await response.json();

            if (result.success) {
                setAdvogado(result.advogado);
                setError(null);
                alert('✅ OAB atualizada com sucesso!');
            } else {
                setError(result.error || 'Erro ao atualizar OAB');
            }
        } catch (err) {
            setError('Erro de conexão. Verifique se o backend está rodando.');
        }
    };

    const handleSincronizar = async () => {
        if (!advogadoId) {
            alert('❌ Advogado não inicializado');
            return;
        }

        // DataJud não precisa de certificado (API pública)
        const isDataJud = true; // Sempre usar DataJud por padrão

        if (!isDataJud && !certPassword) {
            alert('❌ Digite a senha do certificado A1');
            return;
        }

        if (!isDataJud && !advogado?.certificadoPath) {
            alert('❌ Faça upload do certificado A1 antes de sincronizar');
            return;
        }

        setSyncing(true);
        setSyncResult(null);

        try {
            const response = await fetch(
                `http://localhost:3001/api/judicial/advogados/${advogadoId}/sincronizar`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tribunal: 'DATAJUD', // Sempre DataJud
                        certPassword: certPassword || '' // Vazio para DataJud
                    })
                }
            );

            const result = await response.json();

            if (result.sucesso) {
                setSyncResult(result);
                alert(
                    `✅ Sincronização concluída!\n\n` +
                    `✨ ${result.processosNovos} processos novos\n` +
                    `🔄 ${result.processosAtualizados} processos atualizados\n` +
                    `👥 ${result.partesImportadas} partes importadas\n\n` +
                    `📍 Tribunal: ${result.tribunal}`
                );

                // Mudar para modo onboarding após Sincronização bem-sucedida
                setMode('onboarding');
            } else {
                alert(`❌ Erro: ${result.error}`);
            }
        } catch (err) {
            console.error('[Sincronização] Erro:', err);
            alert('❌ Erro ao sincronizar. Verifique se o backend está rodando.');
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!advogadoId) {
        return (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700 dark:text-red-300">
                        <strong>Erro ao inicializar:</strong>
                        <p className="mt-1">{error || 'Não foi possível criar advogado'}</p>
                        <p className="mt-2">Verifique se o backend está rodando em http://localhost:3001</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Scale className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Integração Judicial
                    </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    Configure certificado digital A1 e sincronize processos dos tribunais
                </p>
            </div>

            {/* Status do Advogado */}
            {advogado && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p><strong>Advogado ID:</strong> {advogado.id}</p>
                            <p><strong>OAB Atual:</strong> {advogado.oab}</p>
                            {advogado.certificadoPath && (
                                <p className="flex items-center gap-1 mt-1">
                                    <CheckCircle className="w-4 h-4" />
                                    Certificado salvo em: <code className="text-xs">{advogado.certificadoPath}</code>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modo: Setup vs Onboarding */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg w-fit">
                <button
                    onClick={() => setMode('setup')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'setup'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                        }`}
                >
                    <FileCheck className="w-4 h-4 inline mr-2" />
                    Configuração
                </button>
                <button
                    onClick={() => setMode('onboarding')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'onboarding'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                        }`}
                >
                    <UsersIcon className="w-4 h-4 inline mr-2" />
                    Onboarding
                </button>
            </div>

            {/* Errors Globais */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                </div>
            )}

            {/* Conteúdo por Modo */}
            {mode === 'setup' ? (
                <div className="space-y-6">          {/* OAB */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Número OAB
                        </h3>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={oab}
                                onChange={(e) => setOab(e.target.value)}
                                placeholder="OAB/UF NÚMERO (ex: OAB/RN 12345)"
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleOabUpdate}
                                disabled={!oab}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Salvar
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Formato: <strong>OAB/UF NÚMERO</strong> (ex: OAB/RN 12345, OAB/SP 98765)
                        </p>
                    </div>

                    {/* Certificado A1 */}
                    <CertificateUpload
                        advogadoId={advogadoId}
                        onSuccess={(certInfo) => {
                            console.log('Certificado uploaded:', certInfo);
                            initAdvogado();
                        }}
                    />

                    {/* Sincronização de Processos */}
                    {advogado?.certificadoPath && (
                        <div className="space-y-4">
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-blue-600" />
                                    Sincronizar Processos Judiciais
                                </h3>

                                <div className="space-y-4">
                                    {/* Input Senha Certificado */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Senha do Certificado A1
                                        </label>
                                        <input
                                            type="password"
                                            value={certPassword}
                                            onChange={(e) => setCertPassword(e.target.value)}
                                            placeholder="Digite a senha..." className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            disabled={syncing}
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            A senha é usada apenas para descriptografar o certificado, não é armazenada
                                        </p>
                                    </div>

                                    {/* Botão Sincronizar */}
                                    <button
                                        onClick={handleSincronizar}
                                        disabled={syncing || !certPassword}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                                    >
                                        {syncing ? (
                                            <>
                                                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                                Sincronizando...
                                            </>
                                        ) : (
                                            <>
                                                <Scale className="w-5 h-5" />
                                                Sincronizar Processos do TJRN
                                            </>
                                        )}
                                    </button>

                                    {/* Resultado da Sincronização */}
                                    {syncResult && (
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-green-700 dark:text-green-300">
                                                    <strong>✅ Sincronização concluída!</strong>
                                                    <ul className="mt-2 space-y-1">
                                                        <li>✨ {syncResult.processosNovos} processos novos</li>
                                                        <li>🔄 {syncResult.processosAtualizados} processos atualizados</li>
                                                        <li>👥 {syncResult.partesImportadas} partes importadas</li>
                                                        <li>📍 {syncResult.tribunal}</li>
                                                    </ul>
                                                    <button
                                                        onClick={() => setMode('onboarding')}
                                                        className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                                                    >
                                                        Ir para Onboarding →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Informações de Persistência */}
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                <strong>⚠️ Sobre Persistência de Dados:</strong>
                                <ul className="mt-2 space-y-1 list-disc list-inside">
                                    <li><strong>Certificado</strong>: Salvo criptografado em disco (backend/certs/) - PERMANENTE ✅</li>
                                    <li><strong>Registro do Advogado</strong>: Em memória - será perdido ao reiniciar backend ⚠️</li>
                                    <li><strong>Solução</strong>: Em produção, migrar para PostgreSQL para persistência total</li>
                                    <li>Configure OAB e certificado antes de sincronizar processos</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <ProcessOnboarding advogadoId={advogadoId} />
            )}
        </div>
    );
};
