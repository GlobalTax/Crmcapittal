import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { KanbanTask } from './KanbanTask';
import { Negocio } from '@/types/Negocio';
import { Stage } from '@/types/Pipeline';

interface KanbanColumnProps {
  stage: Stage;
  negocios: Negocio[];
  onEdit: (negocio: Negocio) => void;
  onView?: (negocio: Negocio) => void;
}

/**
 * KanbanColumn Component
 * 
 * Renders a single stage column in the Kanban board.
 * Contains a header with stage info and metrics, plus a droppable area for tasks.
 * 
 * @param stage - The pipeline stage data
 * @param negocios - Array of business deals for this stage
 * @param onEdit - Callback for editing a negocio
 * @param onView - Optional callback for viewing a negocio
 */
export const KanbanColumn = ({ stage, negocios, onEdit, onView }: KanbanColumnProps) => {
  /**
   * Calculates the total monetary value for all negocios in this stage
   * @returns Total value as a number
   */
  const getTotalValue = () => {
    return negocios.reduce((total, negocio) => total + (negocio.valor_negocio || 0), 0);
  };

  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = getTotalValue();

  return (
    <div className="min-w-[350px] flex-shrink-0">
      {/* Column Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 
            className="text-sm font-semibold flex items-center gap-2"
            style={{ color: stage.color }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            {stage.name}
          </h3>
          <Badge variant="secondary">{negocios.length}</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {new Intl.NumberFormat('es-ES', { 
            style: 'currency', 
            currency: 'EUR',
            minimumFractionDigits: 0 
          }).format(totalValue)}
        </div>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`min-h-[200px] space-y-3 p-2 rounded-lg transition-colors ${
          isOver ? 'bg-muted/50' : ''
        }`}
      >
        {negocios.map((negocio, index) => (
          <KanbanTask
            key={negocio.id}
            negocio={negocio}
            index={index}
            onEdit={onEdit}
            onView={onView}
          />
        ))}
      </div>
    </div>
  );
};