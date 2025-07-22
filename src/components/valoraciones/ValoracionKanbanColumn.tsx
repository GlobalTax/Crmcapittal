
import React, { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { ValoracionKanbanCard } from './ValoracionKanbanCard';
import { Valoracion, ValoracionStatus, ValoracionPhase } from '@/types/Valoracion';
import { Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/format';

interface ValoracionKanbanColumnProps {
  status: ValoracionStatus;
  phase: ValoracionPhase;
  valoraciones: Valoracion[];
  onEdit: (valoracion: Valoracion) => void;
  onView?: (valoracion: Valoracion) => void;
  onAddValoracion?: (status: ValoracionStatus) => void;
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectItem?: (id: string) => void;
}

const ValoracionKanbanColumn = memo(({ 
  status,
  phase,
  valoraciones, 
  onEdit, 
  onView, 
  onAddValoracion,
  isLoading = false,
  selectedIds = [],
  onSelectItem
}: ValoracionKanbanColumnProps) => {
  // Calculate column statistics
  const totalQuoted = valoraciones.reduce((total, val) => total + (val.fee_quoted || 0), 0);
  const totalCharged = valoraciones.reduce((total, val) => total + (val.fee_charged || 0), 0);

  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="min-w-[360px] flex-shrink-0">
      {/* Column Header */}
      <div className="mb-6 px-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{phase.icon}</div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {phase.label}
              </h3>
              <p className="text-xs text-muted-foreground">
                {phase.description}
              </p>
            </div>
            <div className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {valoraciones.length}
            </div>
          </div>
          
          {onAddValoracion && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddValoracion(status)}
              className="h-7 w-7 p-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label={`Añadir valoración en ${phase.label}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Stage Statistics */}
        {totalQuoted > 0 && (
          <div className="space-y-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Total cotizado: {formatCurrency(totalQuoted)}</span>
            </div>
            {totalCharged > 0 && (
              <div className="text-xs text-green-600">
                Cobrado: {formatCurrency(totalCharged)}
              </div>
            )}
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
        {!isLoading && valoraciones.map((valoracion, index) => (
          <ValoracionKanbanCard
            key={valoracion.id}
            valoracion={valoracion}
            index={index}
            onEdit={onEdit}
            onView={onView}
            isSelected={selectedIds.includes(valoracion.id)}
            onSelectItem={onSelectItem}
          />
        ))}

        {/* Empty State */}
        {!isLoading && valoraciones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Sin valoraciones
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Añade tu primera valoración en esta fase
            </p>
            {onAddValoracion && (
              <Button
                size="sm"
                onClick={() => onAddValoracion(status)}
                className="gap-2 font-medium"
              >
                <Plus className="h-4 w-4" />
                Nueva valoración
              </Button>
            )}
          </div>
        )}

        {/* Drop Indicator */}
        {isOver && (
          <div className="border-2 border-dashed border-primary/60 rounded-xl p-6 bg-primary/10 text-center backdrop-blur-sm">
            <p className="text-sm text-primary font-semibold">
              Soltar aquí para mover a {phase.label}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ValoracionKanbanColumn.displayName = 'ValoracionKanbanColumn';

export { ValoracionKanbanColumn };
