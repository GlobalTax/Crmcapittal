import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LeadKanbanCard } from './LeadKanbanCard';
import { LeadWithStage } from '@/hooks/leads/useLeadKanban';
import { PipelineStage } from '@/hooks/leads/usePipelineStages';

interface LeadKanbanColumnProps {
  stage: PipelineStage;
  leads: LeadWithStage[];
  onLeadClick?: (lead: LeadWithStage) => void;
  onAddLead?: (stageId: string) => void;
}

export const LeadKanbanColumn = ({
  stage,
  leads,
  onLeadClick,
  onAddLead,
}: LeadKanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const leadIds = leads.map(lead => lead.id);

  return (
    <div className="min-w-[260px] flex-shrink-0">{/* Reduced from 280px to 260px */}
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="font-medium text-foreground text-sm">
            {stage.name}
          </h3>
          <span className="text-xs text-muted-foreground ml-1">
            {leads.length}
          </span>
        </div>
        
        {onAddLead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddLead(stage.id)}
            className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`
          min-h-[600px] space-y-2 p-2 rounded-lg transition-all duration-200 bg-gray-50
          ${isOver 
            ? 'bg-accent/30 border border-dashed border-primary/50' 
            : ''
          }
        `}
      >
        <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadKanbanCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadClick?.(lead)}
            />
          ))}
        </SortableContext>
        
        {/* Empty State */}
        {leads.length === 0 && !isOver && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No hay leads en esta etapa</p>
          </div>
        )}
      </div>
    </div>
  );
};