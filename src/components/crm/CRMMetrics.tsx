import React from 'react';
import { useGlobalData } from '../../context/GlobalDataContext';
import { Users, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

export const CRMMetrics: React.FC = () => {
    const { leads } = useGlobalData();

    const totalLeads = leads.length;
    const totalValue = leads.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const wonLeads = leads.filter(l => l.status === 'won').length;
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    // Calculate active leads (excluding won/lost)
    const activeLeads = leads.filter(l => l.status !== 'won' && l.status !== 'lost').length;

    const metrics = [
        {
            title: 'Total de Leads',
            value: totalLeads,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
            title: 'Valor em Pipeline',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue),
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-100 dark:bg-green-900/30'
        },
        {
            title: 'Taxa de Conversão',
            value: `${conversionRate.toFixed(1)}%`,
            icon: TrendingUp,
            color: 'text-purple-600',
            bg: 'bg-purple-100 dark:bg-purple-900/30'
        },
        {
            title: 'Leads Ativos',
            value: activeLeads,
            icon: BarChart3,
            color: 'text-orange-600',
            bg: 'bg-orange-100 dark:bg-orange-900/30'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${metric.bg} ${metric.color}`}>
                        <metric.icon size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{metric.title}</p>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{metric.value}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
};
