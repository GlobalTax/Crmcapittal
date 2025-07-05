
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, XCircle, TrendingUp, Euro } from 'lucide-react';
import { Proposal } from '@/types/Proposal';

interface ProposalMetricsProps {
  proposals: Proposal[];
}

export const ProposalMetrics: React.FC<ProposalMetricsProps> = ({ proposals }) => {
  const metrics = {
    total: proposals.length,
    draft: proposals.filter(p => p.status === 'draft').length,
    sent: proposals.filter(p => p.status === 'sent').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
    totalValue: proposals
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + (p.total_amount || 0), 0),
    conversionRate: proposals.filter(p => p.status === 'sent').length > 0 
      ? (proposals.filter(p => p.status === 'approved').length / proposals.filter(p => p.status === 'sent').length) * 100 
      : 0
  };

  const cards = [
    {
      title: 'Total Propuestas',
      value: metrics.total,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pendientes',
      value: metrics.sent,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Aprobadas',
      value: metrics.approved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Valor Aprobado',
      value: `€${metrics.totalValue.toLocaleString()}`,
      icon: Euro,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Tasa Conversión',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="border border-gray-200 bg-white p-4">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-gray-600">
              {card.title}
            </div>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </div>
          <div className="pt-0">
            <div className={`text-sm font-bold ${card.color}`}>
              {card.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
