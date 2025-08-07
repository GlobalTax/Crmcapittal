import React from 'react';
import { Proposal } from '@/types/Proposal';

interface StatusInlineStatsProps {
  proposals: Proposal[];
  status: string;
}

export const StatusInlineStats: React.FC<StatusInlineStatsProps> = ({
  proposals,
  status
}) => {
  const statusProposals = proposals.filter(p => p.status === status);
  
  const getStatusStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (status) {
      case 'draft': {
        const expiringSoon = statusProposals.filter(p => {
          if (!p.valid_until) return false;
          const expiryDate = new Date(p.valid_until);
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= 2 && daysUntilExpiry >= 0;
        }).length;

        return `${statusProposals.length} pendientes | ${expiringSoon} vencen pronto`;
      }
      
      case 'sent': {
        const opened = statusProposals.filter(p => p.views_count && p.views_count > 0).length;
        const unopened = statusProposals.length - opened;
        
        return `${statusProposals.length} enviadas | ${opened} abiertas | ${unopened} sin leer`;
      }
      
      case 'in_review': {
        const withComments = statusProposals.filter(p => p.notes && p.notes.trim()).length;
        
        return `${statusProposals.length} en revisión | ${withComments} con comentarios`;
      }
      
      case 'approved': {
        const totalValue = statusProposals.reduce((sum, p) => sum + (p.total_amount || 0), 0);
        const formattedValue = new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          notation: 'compact',
          maximumFractionDigits: 0
        }).format(totalValue);
        
        return `${statusProposals.length} aprobadas | ${formattedValue} valor total`;
      }
      
      case 'rejected': {
        const thisMonth = statusProposals.filter(p => {
          if (!p.updated_at) return false;
          const updatedDate = new Date(p.updated_at);
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          return updatedDate.getMonth() === currentMonth && updatedDate.getFullYear() === currentYear;
        }).length;
        
        return `${statusProposals.length} rechazadas | ${thisMonth} este mes`;
      }
      
      default:
        return `${statusProposals.length} propuestas`;
    }
  };

  return (
    <div className="text-sm text-slate-500 px-1 py-2">
      {getStatusStats()}
    </div>
  );
};