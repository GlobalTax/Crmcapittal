import React from 'react';
import { TransaccionStats } from '@/hooks/useTransaccionesOptimized';

interface TransactionInlineStatsProps {
  stats: TransaccionStats;
  onFilterClick: (filterType: string) => void;
}

export function TransactionInlineStats({ stats, onFilterClick }: TransactionInlineStatsProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(0)}K`;
    }
    return `€${amount}`;
  };

  const pipelineValue = stats.totalValue || 0;
  const closingSoon = 3; // Mock data - would calculate from fecha_cierre
  const atRisk = 2; // Mock data - would calculate from last activity
  const completedThisMonth = 5; // Mock data - would calculate from completed stages

  return (
    <div className="mb-6 text-sm text-muted-foreground">
      <span 
        className="hover:text-primary cursor-pointer transition-colors"
        onClick={() => onFilterClick('all')}
      >
        {formatCurrency(pipelineValue)} pipeline
      </span>
      <span className="mx-2">|</span>
      <span 
        className="hover:text-primary cursor-pointer transition-colors"
        onClick={() => onFilterClick('closing_soon')}
      >
        {closingSoon} próximas cierre
      </span>
      <span className="mx-2">|</span>
      <span 
        className="hover:text-primary cursor-pointer transition-colors text-amber-600"
        onClick={() => onFilterClick('at_risk')}
      >
        {atRisk} en riesgo
      </span>
      <span className="mx-2">|</span>
      <span 
        className="hover:text-primary cursor-pointer transition-colors text-green-600"
        onClick={() => onFilterClick('completed')}
      >
        {completedThisMonth} completadas este mes
      </span>
    </div>
  );
}