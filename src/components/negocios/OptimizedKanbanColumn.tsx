import React, { memo } from 'react';
import { Droppable } from 'react-beautiful-dnd';
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
  isLoading = false 
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

  return (
    <div className="min-w-[350px] flex-shrink-0">
      {/* Column Header */}
      <div className="mb-4 bg-background border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color || '#6B7280' }}
            />
            <h3 className="text-sm font-semibold text-foreground">
              {stage.name}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {negocios.length}
            </Badge>
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

        {/* Stage Statistics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium text-green-600">
              {formatCurrency(totalValue)}
            </span>
          </div>
          
          {negocios.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Promedio:</span>
              <span className="font-medium text-foreground">
                {formatCurrency(averageValue)}
              </span>
            </div>
          )}
          
          {highPriorityCount > 0 && (
            <div className="col-span-2 flex items-center gap-1">
              <span className="text-muted-foreground">Alta prioridad:</span>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                {highPriorityCount}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              min-h-[400px] space-y-3 p-2 rounded-lg transition-all duration-200
              ${snapshot.isDraggingOver 
                ? 'bg-primary/5 border-2 border-dashed border-primary/30 scale-[1.02]' 
                : 'bg-muted/20 border-2 border-dashed border-transparent'
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
              />
            ))}

            {/* Empty State */}
            {!isLoading && negocios.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: stage.color || '#6B7280' }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  No hay negocios en esta etapa
                </p>
                {onAddNegocio && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddNegocio(stage.id)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Añadir negocio
                  </Button>
                )}
              </div>
            )}

            {/* Drop Indicator */}
            {snapshot.isDraggingOver && (
              <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 bg-primary/5 text-center">
                <p className="text-sm text-primary font-medium">
                  Soltar aquí para mover a {stage.name}
                </p>
              </div>
            )}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
});

OptimizedKanbanColumn.displayName = 'OptimizedKanbanColumn';

export { OptimizedKanbanColumn };