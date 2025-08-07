import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Proposal } from '@/types/Proposal';
import { ProposalCard } from './ProposalCard';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProposalKanbanColumnProps {
  id: string;
  title: string;
  count: number;
  color: string;
  proposals: Proposal[];
  onViewProposal: (proposal: Proposal) => void;
  onEditProposal: (proposal: Proposal) => void;
  isLoading?: boolean;
}

export const ProposalKanbanColumn: React.FC<ProposalKanbanColumnProps> = ({
  id,
  title,
  count,
  color,
  proposals,
  onViewProposal,
  onEditProposal,
  isLoading
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const totalValue = proposals.reduce((sum, proposal) => sum + (proposal.total_amount || 0), 0);

  return (
    <div className="flex-shrink-0 w-80">
      <Card className={`h-full ${isOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''} transition-all duration-200`}>
        {/* Header de la columna */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <Badge variant="secondary" className={color}>
                {count}
              </Badge>
            </div>
            {totalValue > 0 && (
              <div className="text-sm text-muted-foreground">
                €{(totalValue / 1000).toFixed(0)}K
              </div>
            )}
          </div>
        </div>

        {/* Contenido de la columna */}
        <div
          ref={setNodeRef}
          className="p-4 space-y-3 min-h-[400px] max-h-[calc(100vh-300px)] overflow-y-auto"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <SortableContext items={proposals.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {proposals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No hay propuestas en este estado
                </div>
              ) : (
                proposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    onView={() => onViewProposal(proposal)}
                    onEdit={() => onEditProposal(proposal)}
                  />
                ))
              )}
            </SortableContext>
          )}
        </div>
      </Card>
    </div>
  );
};