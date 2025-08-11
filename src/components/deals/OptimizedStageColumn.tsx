import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Deal } from '@/types/Deal';
import { OptimizedDealCard } from './OptimizedDealCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface OptimizedStageColumnProps {
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

export const OptimizedStageColumn = ({ 
  stage, 
  deals, 
  onNewDeal, 
  onDealClick, 
  onDealEdit 
}: OptimizedStageColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const getTotalValue = () => {
    return deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  };

  const getAverageValue = () => {
    if (deals.length === 0) return 0;
    return getTotalValue() / deals.length;
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
    <div className="flex flex-col h-full w-80 flex-shrink-0">
      {/* Enhanced Header */}
      <div className="bg-muted/30 rounded-t-lg border border-b-0 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <h3 className="font-semibold text-foreground">
              {stage.name}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {deals.length}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNewDeal(stage.name)}
            className="h-7 px-2 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Plus className="h-3 w-3 mr-1" />
            Nuevo
          </Button>
        </div>

        {/* Stage Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Total: {formatCurrency(getTotalValue())}</span>
          <span>Avg: {formatCurrency(getAverageValue())}</span>
        </div>
      </div>

      {/* Droppable Area with Virtual Scrolling Support */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 overflow-y-auto space-y-3 p-3 bg-muted/10 border border-t-0 rounded-b-lg
          transition-all duration-200 min-h-[500px]
          ${isOver 
            ? 'bg-primary/5 border-primary/30 border-dashed' 
            : 'border-border'
          }
        `}
        style={{
          maxHeight: 'calc(100vh - 280px)', // Account for header heights
        }}
        role="list"
        aria-label={`${stage.name} - deals`}
      >
        <SortableContext
          items={deals.map(d => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal, index) => (
            <OptimizedDealCard
              key={deal.id}
              deal={deal}
              index={index}
              onClick={onDealClick}
              onEdit={onDealEdit}
            />
          ))}
        </SortableContext>
        
        {/* Empty State */}
        {deals.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              No hay deals en esta etapa
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNewDeal(stage.name)}
              className="text-xs"
            >
              Crear primer deal
            </Button>
          </div>
        )}

        {/* Drop Indicator */}
        {isOver && (
          <div className="flex items-center justify-center py-8 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5">
            <p className="text-sm text-primary font-medium">
              Suelta aquí para mover el deal
            </p>
          </div>
        )}
      </div>
    </div>
  );
};