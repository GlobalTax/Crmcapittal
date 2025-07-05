import React, { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { OptimizedKanbanTask } from './OptimizedKanbanTask';
import { Negocio } from '@/types/Negocio';
import { Stage } from '@/types/Pipeline';
import { Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OptimizedKanbanColumnProps {
  stage: Stage;
  negocios: Negocio[];
  onEdit: (negocio: Negocio) => void;
  onView?: (negocio: Negocio) => void;
  onAddNegocio?: (stageId: string) => void;
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectItem?: (id: string) => void;
}

/**
 * OptimizedKanbanColumn Component
 * 
 * Memoized Kanban column with enhanced features:
 * - Performance optimization with React.memo
 * - Better drop zone visual feedback
 * - Stage statistics and metrics
 * - Quick add functionality
 * - Empty state handling
 * 
 * @param stage - The pipeline stage data
 * @param negocios - Array of business deals for this stage
 * @param onEdit - Callback for editing a negocio
 * @param onView - Optional callback for viewing a negocio
 * @param onAddNegocio - Optional callback for adding new negocio
 * @param isLoading - Loading state for the column
 */
const OptimizedKanbanColumn = memo(({ 
  stage, 
  negocios, 
  onEdit, 
  onView, 
  onAddNegocio,
  isLoading = false,
  selectedIds = [],
  onSelectItem
}: OptimizedKanbanColumnProps) => {
  /**
   * Calculate column statistics
   */
  const totalValue = negocios.reduce((total, negocio) => total + (negocio.valor_negocio || 0), 0);
  const averageValue = negocios.length > 0 ? totalValue / negocios.length : 0;
  const highPriorityCount = negocios.filter(n => n.prioridad === 'urgente' || n.prioridad === 'alta').length;

  /**
   * Format currency values
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: value > 999999 ? 'compact' : 'standard'
    }).format(value);
  };

  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="min-w-[350px] flex-shrink-0">
      {/* Column Header */}
      <div className="mb-4 p-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: stage.color || '#6B7280' }}
            />
            <h3 className="text-sm font-medium text-foreground">
              {stage.name}
            </h3>
            <div className="rounded bg-neutral-100 px-2 text-xs font-medium">
              {negocios.length}
            </div>
          </div>
          
          {onAddNegocio && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddNegocio(stage.id)}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Añadir negocio a ${stage.name}`}
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
          min-h-[400px] space-y-3 p-2 rounded-lg transition-all duration-200
          ${isOver 
            ? 'bg-primary/5 border-2 border-dashed border-primary/30 scale-[1.02]' 
            : ''
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

            {/* Tasks */}
            {!isLoading && negocios.map((negocio, index) => (
              <OptimizedKanbanTask
                key={negocio.id}
                negocio={negocio}
                index={index}
                onEdit={onEdit}
                onView={onView}
                isSelected={selectedIds.includes(negocio.id)}
                onSelectItem={onSelectItem}
              />
            ))}

            {/* Empty State */}
            {!isLoading && negocios.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-3 text-primary">
                  <Plus className="w-5 h-5" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Añade tu primer deal
                </p>
                {onAddNegocio && (
                  <Button
                    size="sm"
                    onClick={() => onAddNegocio(stage.id)}
                    className="text-xs"
                  >
                    + New deal
                  </Button>
                )}
              </div>
            )}

        {/* Drop Indicator */}
        {isOver && (
          <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 bg-primary/5 text-center">
            <p className="text-sm text-primary font-medium">
              Soltar aquí para mover a {stage.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

OptimizedKanbanColumn.displayName = 'OptimizedKanbanColumn';

export { OptimizedKanbanColumn };