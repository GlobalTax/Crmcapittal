import React, { useCallback, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Deal } from '@/types/Deal';
import { DealCard } from './DealCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface StageColumnProps {
  stage: {
    id: string;
    name: string;
    color: string;
  };
  deals: Deal[];
  onNewDeal: (stageName: string) => void;
  onDealClick?: (deal: Deal) => void;
}

const StageColumnComponent = ({ stage, deals, onNewDeal, onDealClick }: StageColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const handleNewDeal = useCallback(() => {
    onNewDeal(stage.name);
  }, [onNewDeal, stage.name]);

  const isEmpty = useMemo(() => deals.length === 0, [deals.length]);

  return (
    <div className="min-w-[280px] flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="font-semibold text-foreground text-sm">
            {stage.name}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {deals.length}
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewDeal}
          className="text-xs h-7 px-2"
        >
          <Plus className="h-3 w-3 mr-1" />
          New Deal
        </Button>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`
          min-h-[600px] space-y-3 p-2 rounded-lg transition-all duration-200
          ${isOver 
            ? 'bg-accent/50 border-2 border-dashed border-primary/30' 
            : 'bg-muted/20'
          }
        `}
      >
        {deals.map((deal, index) => (
          <DealCard
            key={deal.id}
            deal={deal}
            index={index}
            onClick={onDealClick}
          />
        ))}
        
        {/* Empty State */}
        {isEmpty && !isOver && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No deals in this stage</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const StageColumn = React.memo(StageColumnComponent, (prevProps, nextProps) => {
  return (
    prevProps.stage.id === nextProps.stage.id &&
    prevProps.stage.name === nextProps.stage.name &&
    prevProps.stage.color === nextProps.stage.color &&
    prevProps.deals.length === nextProps.deals.length &&
    prevProps.deals.every((deal, index) => 
      deal.id === nextProps.deals[index]?.id &&
      deal.updatedAt === nextProps.deals[index]?.updatedAt
    )
  );
});