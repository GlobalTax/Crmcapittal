import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Proposal } from '@/types/Proposal';
import { ProposalQuickActions } from './ProposalQuickActions';
import { FileText, Building } from 'lucide-react';

interface CompactProposalsListProps {
  proposals: Proposal[];
  status: string;
}

export const CompactProposalsList: React.FC<CompactProposalsListProps> = ({
  proposals,
  status
}) => {
  const statusProposals = proposals.filter(p => p.status === status);

  const formatCurrency = (amount?: number) => {
    if (!amount) return '€0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTimeInStatus = (proposal: Proposal) => {
    const now = new Date();
    const updatedDate = new Date(proposal.updated_at);
    const diffTime = now.getTime() - updatedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return '1 día';
    return `${diffDays} días`;
  };

  const getValueColor = (amount?: number) => {
    if (!amount) return 'text-slate-500';
    if (amount >= 50000) return 'text-green-600 font-bold';
    if (amount >= 25000) return 'text-blue-600 font-bold';
    return 'text-slate-700 font-bold';
  };

  const getServiceType = (proposal: Proposal) => {
    if (proposal.services && proposal.services.length > 0) {
      return proposal.services[0].name;
    }
    if (proposal.practice_area) {
      return proposal.practice_area.name;
    }
    return 'Consultoría General';
  };

  if (statusProposals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-600 mb-2">
          Sin propuestas en {status === 'draft' ? 'borrador' : status === 'sent' ? 'enviadas' : status === 'in_review' ? 'revisión' : status === 'approved' ? 'aprobadas' : 'rechazadas'}
        </h3>
        <p className="text-slate-500 text-sm">
          {status === 'draft' && 'Crea tu primera propuesta para comenzar'}
          {status === 'sent' && 'Las propuestas enviadas aparecerán aquí'}
          {status === 'in_review' && 'Las propuestas en revisión aparecerán aquí'}
          {status === 'approved' && 'Las propuestas aprobadas aparecerán aquí'}
          {status === 'rejected' && 'Las propuestas rechazadas aparecerán aquí'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {statusProposals.map((proposal) => (
        <Card 
          key={proposal.id} 
          className="hover:shadow-md transition-shadow duration-200 border border-slate-200"
        >
          <CardContent className="p-4">
            <div className="grid grid-cols-10 gap-4 items-center min-h-[48px]">
              {/* PROPUESTA (40%) */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 truncate text-sm">
                    {proposal.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {proposal.contact && (
                      <p className="text-sm text-slate-500 truncate">
                        {proposal.contact.name}
                      </p>
                    )}
                    {proposal.company && (
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Building className="h-3 w-3" />
                        <span className="truncate">{proposal.company.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* VALOR (20%) */}
              <div className="col-span-2">
                <div className={`text-sm ${getValueColor(proposal.total_amount)}`}>
                  {formatCurrency(proposal.total_amount)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {getServiceType(proposal)}
                </div>
              </div>

              {/* TIEMPO (20%) */}
              <div className="col-span-2">
                <div className="text-sm text-slate-700">
                  En estado: {getTimeInStatus(proposal)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(proposal.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </div>
              </div>

              {/* ACCIONES (20%) */}
              <div className="col-span-2 flex justify-end">
                <ProposalQuickActions proposal={proposal} status={status} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};