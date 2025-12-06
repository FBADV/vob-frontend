import { db } from '../services/database.service';
import { isSupabaseConfigured } from '../lib/supabase';
import toast from 'react-hot-toast';

/**
 * Migrates data from localStorage to Supabase
 * This should be run ONCE when switching from localStorage to Supabase
 */
export async function migrateLocalStorageToSupabase(): Promise<{
    success: boolean;
    clientsMigrated: number;
    processesMigrated: number;
    errors: string[];
}> {
    const errors: string[] = [];
    let clientsMigrated = 0;
    let processesMigrated = 0;

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
        const error = 'Supabase não está configurado. Configure o .env primeiro.';
        toast.error(error);
        return { success: false, clientsMigrated: 0, processesMigrated: 0, errors: [error] };
    }

    toast('Iniciando migração de dados...');

    try {
        // Migrate Clients
        const clientsData = localStorage.getItem('vob_clients');
        if (clientsData) {
            const clients = JSON.parse(clientsData);
            toast(`Migrando ${clients.length} clientes...`);

            for (const client of clients) {
                try {
                    await db.clients.create({
                        name: client.name,
                        email: client.email || '',
                        phone: client.phone || '',
                        document: client.document,
                        cpfCnpj: client.document,
                        status: 'active',
                        type: client.type || 'individual'
                    });
                    clientsMigrated++;
                } catch (error: any) {
                    console.error('Error migrating client:', client.id, error);
                    errors.push(`Cliente ${client.name}: ${error.message}`);
                }
            }
        }

        // Migrate Processes
        const processesData = localStorage.getItem('vob_processes');
        if (processesData) {
            const processes = JSON.parse(processesData);
            toast(`Migrando ${processes.length} processos...`);

            for (const process of processes) {
                try {
                    await db.processes.create({
                        processNumber: process.number,
                        clientId: process.clientId,
                        tribunalId: process.court || '',
                        tribunalName: process.court,
                        className: process.className,
                        subject: [process.area],
                        filingDate: process.createdAt,
                        courtName: process.court,
                        caseValue: process.value || 0
                    });
                    processesMigrated++;
                } catch (error: any) {
                    console.error('Error migrating process:', process.id, error);
                    errors.push(`Processo ${process.number}: ${error.message}`);
                }
            }
        }

        // Success message
        const successMsg = `Migração concluída! ${clientsMigrated} clientes e ${processesMigrated} processos migrados.`;
        toast.success(successMsg);

        // Ask user if they want to clear localStorage
        const shouldClear = window.confirm(
            'Migração concluída com sucesso!\n\n' +
            `${clientsMigrated} clientes migrados\n` +
            `${processesMigrated} processos migrados\n\n` +
            'Deseja limpar os dados do localStorage?'
        );

        if (shouldClear) {
            localStorage.removeItem('vob_clients');
            localStorage.removeItem('vob_processes');
            toast.success('localStorage limpo!');
        }

        return {
            success: true,
            clientsMigrated,
            processesMigrated,
            errors
        };

    } catch (error: any) {
        const errorMsg = `Erro na migração: ${error.message}`;
        toast.error(errorMsg);
        errors.push(errorMsg);
        return {
            success: false,
            clientsMigrated,
            processesMigrated,
            errors
        };
    }
}

/**
 * Check if there is data in localStorage that can be migrated
 */
export function hasLocalStorageData(): boolean {
    const clients = localStorage.getItem('vob_clients');
    const processes = localStorage.getItem('vob_processes');

    return !!(clients || processes);
}

/**
 * Get count of items in localStorage
 */
export function getLocalStorageDataCount(): {
    clients: number;
    processes: number;
} {
    const clientsData = localStorage.getItem('vob_clients');
    const processesData = localStorage.getItem('vob_processes');

    const clients = clientsData ? JSON.parse(clientsData).length : 0;
    const processes = processesData ? JSON.parse(processesData).length : 0;

    return { clients, processes };
}
