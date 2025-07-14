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
    <div className="min-w-[360px] flex-shrink-0">
      {/* Column Header */}
      <div className="mb-6 px-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: stage.color || '#6B7280' }}
            />
            <h3 className="text-base font-semibold text-foreground">
              {stage.name}
            </h3>
            <div className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">Valor total: {formatCurrency(totalValue)}</span>
          </div>
        )}
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Sin transacciones
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Añade tu primera transacción a esta etapa
            </p>
            {onAddTransaccion && (
              <Button
                size="sm"
                onClick={() => onAddTransaccion(stage.id)}
                className="gap-2 font-medium"
              >
                <Plus className="h-4 w-4" />
                Nueva transacción
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

TransaccionKanbanColumn.displayName = 'TransaccionKanbanColumn';

export { TransaccionKanbanColumn };