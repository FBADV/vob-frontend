import React from 'react';
import { useGlobalData } from '../context/GlobalDataContext';
import { User, Mail, Shield, Calendar, Activity } from 'lucide-react';

export const Profile: React.FC = () => {
    const { user } = useGlobalData();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500 dark:text-gray-400">Usuário não encontrado</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-secondary to-blue-600 h-32"></div>

                <div className="px-6 pb-6">
                    <div className="flex items-end gap-6 -mt-16 mb-6">
                        <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-secondary to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                                {user.name.substring(0, 2).toUpperCase()}
                            </div>
                        </div>
                        <div className="flex-1 pb-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <User size={20} className="text-secondary" />
                                Informações do Usuário
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <Mail size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <Shield size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Função</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Summary */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Activity size={20} className="text-secondary" />
                                Resumo de Atividades
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">-</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Processos Ativos</p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">-</p>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Clientes</p>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">-</p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Atendimentos</p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">-</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Documentos</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-secondary" />
                    Configurações da Conta
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Para alterar suas configurações, acesse a página de{' '}
                    <a href="/settings" className="text-secondary hover:underline">Configurações</a>.
                </p>
            </div>
        </div>
    );
};
