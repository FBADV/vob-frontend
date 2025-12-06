import React from 'react';
import { ModuleHeader } from '../components/ModuleHeader';
import { ReportsDashboard } from '../components/ReportsDashboard';
import { PDFExportButton } from '../components/PDFExportButton';
import { useGlobalData } from '../context/GlobalDataContext';
import { BarChart3, FileText } from 'lucide-react';

export const Reports: React.FC = () => {
    const { processes, clients, services, agendaEvents } = useGlobalData();

    // Prepare data for specific reports
    const processColumns = [
        { header: 'Número', dataKey: 'number' },
        { header: 'Cliente', dataKey: 'clientName' },
        { header: 'Status', dataKey: 'status' },
        { header: 'Valor', dataKey: 'value' },
        { header: 'Data Dist.', dataKey: 'distributionDate' },
    ];

    const clientColumns = [
        { header: 'Nome', dataKey: 'name' },
        { header: 'Tipo', dataKey: 'type' },
        { header: 'Email', dataKey: 'email' },
        { header: 'Telefone', dataKey: 'phone' },
    ];

    const serviceColumns = [
        { header: 'Título', dataKey: 'title' },
        { header: 'Cliente', dataKey: 'clientName' },
        { header: 'Status', dataKey: 'statusLabel' },
        { header: 'Data', dataKey: 'date' },
        { header: 'Hora', dataKey: 'time' },
    ];

    const agendaColumns = [
        { header: 'Título', dataKey: 'title' },
        { header: 'Tipo', dataKey: 'typeLabel' },
        { header: 'Cliente', dataKey: 'clientName' },
        { header: 'Status', dataKey: 'statusLabel' },
        { header: 'Data', dataKey: 'date' },
        { header: 'Hora', dataKey: 'startTime' },
    ];

    const processData = processes.map(p => ({
        ...p,
        clientName: clients.find(c => c.id === p.clientId)?.name || 'N/A',
        value: p.value ? `R$ ${p.value.toLocaleString('pt-BR')}` : 'R$ 0,00'
    }));

    const serviceData = services.map(s => ({
        ...s,
        clientName: clients.find(c => c.id === s.clientId)?.name || s.personServed || 'N/A',
        statusLabel: s.status === 'scheduled' ? 'Agendado' :
            s.status === 'completed' ? 'Concluído' :
                s.status === 'in_progress' ? 'Em Andamento' : 'Cancelado',
        date: new Date(s.date).toLocaleDateString('pt-BR')
    }));

    const agendaData = agendaEvents.map(e => ({
        ...e,
        clientName: clients.find(c => c.id === e.clientId)?.name || 'N/A',
        typeLabel: e.type === 'hearing' ? 'Audiência' :
            e.type === 'deadline' ? 'Prazo' :
                e.type === 'meeting' ? 'Reunião' : 'Outro',
        statusLabel: e.status === 'scheduled' ? 'Agendado' :
            e.status === 'completed' ? 'Concluído' : 'Cancelado',
        date: new Date(e.startDate).toLocaleDateString('pt-BR')
    }));

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <ModuleHeader
                icon={BarChart3}
                title="Relatórios e Métricas"
                subtitle="Análise detalhada do desempenho do escritório"
            />

            {/* Dashboard Section */}
            <section>
                <ReportsDashboard />
            </section>

            {/* Export Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                    <FileText className="text-[rgb(var(--accent-primary))]" size={24} />
                    Relatórios Disponíveis
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Process Report Card */}
                    <div className="card-premium p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                        <div>
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-2">Relatório de Processos</h3>
                            <p className="text-sm text-[rgb(var(--text-secondary))] mb-6">
                                Lista completa de todos os processos cadastrados, com status, valores e datas.
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <PDFExportButton
                                title="Relatório Geral de Processos"
                                data={processData}
                                columns={processColumns}
                                fileName="relatorio_processos_vob.pdf"
                            />
                        </div>
                    </div>

                    {/* Client Report Card */}
                    <div className="card-premium p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                        <div>
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-2">Relatório de Clientes</h3>
                            <p className="text-sm text-[rgb(var(--text-secondary))] mb-6">
                                Base de clientes completa, incluindo contatos e classificação (PF/PJ).
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <PDFExportButton
                                title="Relatório Geral de Clientes"
                                data={clients}
                                columns={clientColumns}
                                fileName="relatorio_clientes_vob.pdf"
                            />
                        </div>
                    </div>

                    {/* Service Report Card */}
                    <div className="card-premium p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                        <div>
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-2">Relatório de Atendimentos</h3>
                            <p className="text-sm text-[rgb(var(--text-secondary))] mb-6">
                                Histórico completo de atendimentos realizados, com status, clientes e datas.
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <PDFExportButton
                                title="Relatório Geral de Atendimentos"
                                data={serviceData}
                                columns={serviceColumns}
                                fileName="relatorio_atendimentos_vob.pdf"
                            />
                        </div>
                    </div>

                    {/* Agenda Report Card */}
                    <div className="card-premium p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform">
                        <div>
                            <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-2">Relatório de Agenda</h3>
                            <p className="text-sm text-[rgb(var(--text-secondary))] mb-6">
                                Eventos da agenda incluindo audiências, prazos e reuniões.
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <PDFExportButton
                                title="Relatório de Eventos da Agenda"
                                data={agendaData}
                                columns={agendaColumns}
                                fileName="relatorio_agenda_vob.pdf"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
