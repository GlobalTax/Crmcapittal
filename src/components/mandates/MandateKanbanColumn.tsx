import React, { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { MandateKanbanCard } from './MandateKanbanCard';
import { BuyingMandate } from '@/types/BuyingMandate';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';

interface MandateKanbanColumnProps {
  stage: {
    id: string;
    name: string;
    color: string;
    description?: string;
  };
  mandates: BuyingMandate[];
  onEdit: (mandate: BuyingMandate) => void;
  onView?: (mandate: BuyingMandate) => void;
  onAddMandate?: (status: BuyingMandate['status']) => void;
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectItem?: (id: string) => void;
}

const MandateKanbanColumn = memo(({ 
  stage, 
  mandates, 
  onEdit, 
  onView, 
  onAddMandate,
  isLoading = false,
  selectedIds = [],
  onSelectItem
}: MandateKanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="min-w-[360px] flex-shrink-0">
      {/* Column Header */}
      <div className="mb-6 px-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: stage.color }}
            />
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {stage.name}
              </h3>
              {stage.description && (
                <p className="text-xs text-muted-foreground">
                  {stage.description}
                </p>
              )}
            </div>
            <div className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {mandates.length}
            </div>
          </div>
          
          {onAddMandate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddMandate(stage.id as BuyingMandate['status'])}
              className="h-7 w-7 p-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label={`Añadir mandato en ${stage.name}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`
          min-h-[500px] space-y-4 p-3 rounded-xl transition-all duration-300 bg-muted/30
          ${isOver 
            ? 'bg-primary/10 border-2 border-dashed border-primary/50 scale-[1.01] shadow-lg' 
            : 'border border-transparent'
          }
          ${isLoading ? 'opacity-50' : ''}
        `}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Cards */}
        {!isLoading && mandates.map((mandate, index) => (
          <MandateKanbanCard
            key={mandate.id}
            mandate={mandate}
            onEdit={onEdit}
            onView={onView}
            isSelected={selectedIds.includes(mandate.id)}
            onSelectItem={onSelectItem}
          />
        ))}

        {/* Empty State */}
        {!isLoading && mandates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Sin mandatos
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Añade tu primer mandato en esta etapa
            </p>
            {onAddMandate && (
              <Button
                size="sm"
                onClick={() => onAddMandate(stage.id as BuyingMandate['status'])}
                className="gap-2 font-medium"
              >
                <Plus className="h-4 w-4" />
                Nuevo mandato
              </Button>
            )}
          </div>
        )}

        {/* Drop Indicator */}
        {isOver && (
          <div className="border-2 border-dashed border-primary/60 rounded-xl p-6 bg-primary/10 text-center backdrop-blur-sm">
            <p className="text-sm text-primary font-semibold">
              Soltar aquí para mover a {stage.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

MandateKanbanColumn.displayName = 'MandateKanbanColumn';

export { MandateKanbanColumn };