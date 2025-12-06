import type { Office, ProcessConnection } from '../types/connectivity.types';

// Mock storage
let offices: Office[] = [];

let processConnections: ProcessConnection[] = [];

export const connectivityService = {
    async getOffices(): Promise<Office[]> {
        return offices;
    },

    async addOffice(office: Office): Promise<void> {
        offices.push(office);
    },

    async updateOffice(id: string, updates: Partial<Office>): Promise<void> {
        offices = offices.map(o => o.id === id ? { ...o, ...updates } : o);
    },

    async deleteOffice(id: string): Promise<void> {
        offices = offices.filter(o => o.id !== id);
    },

    async sendConnectionRequest(targetOffice: Office, processId: string, processNumber: string): Promise<void> {
        // Simulate API call
        console.log(`Sending connection request to ${targetOffice.name} for process ${processNumber} (ID: ${processId})`);

        // Mock creating a local request record


        // In a real scenario, this would be sent to the remote office
        // For now, we'll just log it
    },

    async getProcessConnections(processId: string): Promise<ProcessConnection[]> {
        return processConnections.filter(c => c.processId === processId);
    },

    async disconnectProcess(connectionId: string): Promise<void> {
        processConnections = processConnections.map(c =>
            c.id === connectionId ? { ...c, status: 'disconnected' } : c
        );
    }
};
