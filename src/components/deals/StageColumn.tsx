import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Deal } from '@/types/Deal';
import { DealCard } from './DealCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface StageColumnProps {
  stage: {
    name: string;
    color: string;
  };
  deals: Deal[];
  onNewDeal: (stageName: string) => void;
  onDealClick?: (deal: Deal) => void;
}

export const StageColumn = ({ stage, deals, onNewDeal, onDealClick }: StageColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.name,
  });

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
          onClick={() => onNewDeal(stage.name)}
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
        {deals.length === 0 && !isOver && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No deals in this stage</p>
          </div>
        )}
      </div>
    </div>
  );
};