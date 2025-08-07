import React from 'react';

interface InlineStatsBarProps {
  onStatClick?: (statType: string) => void;
}

export const InlineStatsBar = ({ onStatClick }: InlineStatsBarProps) => {
  // Mock stats - in real implementation these would come from a hook
  const stats = {
    pipeline: 2400000,
    thisMonth: 450000,
    winRate: 78,
    atRisk: 2
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const handleStatClick = (statType: string) => {
    onStatClick?.(statType);
  };

  return (
    <div className="text-sm text-slate-600 mb-6 border-b border-slate-200 pb-4">
      <span 
        className="hover:text-blue-600 cursor-pointer transition-colors"
        onClick={() => handleStatClick('pipeline')}
      >
        Pipeline: {formatCurrency(stats.pipeline)}
      </span>
      <span className="mx-2 text-slate-400">|</span>
      <span 
        className="hover:text-blue-600 cursor-pointer transition-colors"
        onClick={() => handleStatClick('thisMonth')}
      >
        Este mes: {formatCurrency(stats.thisMonth)}
      </span>
      <span className="mx-2 text-slate-400">|</span>
      <span 
        className="hover:text-blue-600 cursor-pointer transition-colors"
        onClick={() => handleStatClick('winRate')}
      >
        Win rate: {stats.winRate}%
      </span>
      <span className="mx-2 text-slate-400">|</span>
      <span 
        className="hover:text-red-600 cursor-pointer transition-colors"
        onClick={() => handleStatClick('atRisk')}
      >
        Deals en riesgo: {stats.atRisk}
      </span>
    </div>
  );
};