import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Deal } from '@/types/Deal';
import { UltraCompactDealCard } from './UltraCompactDealCard';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface UltraEfficientStageColumnProps {
  stage: {
    id: string;
    name: string;
    color: string;
  };
  deals: Deal[];
  onNewDeal: (stageName: string) => void;
  onDealClick?: (deal: Deal) => void;
  onDealEdit?: (deal: Deal) => void;
}

export const UltraEfficientStageColumn = ({ 
  stage, 
  deals, 
  onNewDeal, 
  onDealClick, 
  onDealEdit 
}: UltraEfficientStageColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const getTotalValue = () => {
    return deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '€0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-full min-w-80 flex-shrink-0">
      {/* Ultra-compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900">
            {stage.name}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {deals.length}
          </Badge>
          <span className="text-sm font-medium text-slate-600">
            {formatCurrency(getTotalValue())}
          </span>
        </div>
        
        <button
          onClick={() => onNewDeal(stage.name)}
          className="h-6 w-6 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 space-y-3 min-h-[400px]
          ${isOver ? 'bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 p-2' : ''}
        `}
      >
        <SortableContext
          items={deals.map(d => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <UltraCompactDealCard
              key={deal.id}
              deal={deal}
              onClick={onDealClick}
              onEdit={onDealEdit}
            />
          ))}
        </SortableContext>
        
        {/* Empty State */}
        {deals.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 mb-2">
              No hay deals en esta etapa
            </p>
            <button
              onClick={() => onNewDeal(stage.name)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Crear primer deal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};