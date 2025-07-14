import React, { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { TransaccionKanbanCard } from './TransaccionKanbanCard';
import { Transaccion } from '@/types/Transaccion';
import { Stage } from '@/types/Pipeline';
import { Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransaccionKanbanColumnProps {
  stage: Stage;
  transacciones: Transaccion[];
  onEdit: (transaccion: Transaccion) => void;
  onView?: (transaccion: Transaccion) => void;
  onAddTransaccion?: (stageId: string) => void;
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectItem?: (id: string) => void;
}

const TransaccionKanbanColumn = memo(({ 
  stage, 
  transacciones, 
  onEdit, 
  onView, 
  onAddTransaccion,
  isLoading = false,
  selectedIds = [],
  onSelectItem
}: TransaccionKanbanColumnProps) => {
  // Calculate column statistics
  const totalValue = transacciones.reduce((total, transaccion) => total + (transaccion.valor_transaccion || 0), 0);
  const highPriorityCount = transacciones.filter(t => t.prioridad === 'urgente' || t.prioridad === 'alta').length;

  // Format currency values
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
              {transacciones.length}
            </div>
          </div>
          
          {onAddTransaccion && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddTransaccion(stage.id)}
              className="h-7 w-7 p-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label={`Añadir transacción a ${stage.name}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Stage Statistics */}
        {totalValue > 0 && (
          <div className="text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Valor total: {formatCurrency(totalValue)}</span>
            </div>
          </div>
        )}
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

        {/* Cards */}
        {!isLoading && transacciones.map((transaccion, index) => (
          <TransaccionKanbanCard
            key={transaccion.id}
            transaccion={transaccion}
            index={index}
            onEdit={onEdit}
            onView={onView}
            isSelected={selectedIds.includes(transaccion.id)}
            onSelectItem={onSelectItem}
          />
        ))}

        {/* Empty State */}
        {!isLoading && transacciones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 text-primary">
              <Plus className="w-5 h-5" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Añade tu primera transacción
            </p>
            {onAddTransaccion && (
              <Button
                size="sm"
                onClick={() => onAddTransaccion(stage.id)}
                className="text-xs gap-1"
              >
                <Plus className="h-3 w-3" />
                Nueva transacción
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

TransaccionKanbanColumn.displayName = 'TransaccionKanbanColumn';

export { TransaccionKanbanColumn };