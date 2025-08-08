import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useIsClient } from '@/hooks/useIsClient';
import { LeadKanbanColumn } from './LeadKanbanColumn';
import { useLeadKanban, LeadWithStage } from '@/hooks/leads/useLeadKanban';

interface LeadKanbanBoardProps {
  onLeadClick?: (lead: LeadWithStage) => void;
  onAddLead?: (stageId?: string) => void;
  onRefresh?: () => void;
}

export const LeadKanbanBoard: React.FC<LeadKanbanBoardProps> = ({
  onLeadClick,
  onAddLead,
  onRefresh,
}) => {
  const isClient = useIsClient();
  const {
    stages,
    leadsByStage,
    isLoading,
    error,
    refetch,
    updateLeadStage,
    isDragging,
    setIsDragging,
    dragError,
    setDragError,
  } = useLeadKanban();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    setDragError(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (!over) return;

    const leadId = active.id as string;
    const newStageId = over.id as string;

    // Find the current stage of the lead
    const currentLead = Object.values(leadsByStage)
      .flat()
      .find(lead => lead.id === leadId);

    if (!currentLead || currentLead.pipeline_stage_id === newStageId) {
      return;
    }

    // Update the lead stage
    updateLeadStage({ leadId, newStageId });
  };

  const clearDragError = () => {
    setDragError(null);
  };

  if (isLoading || !isClient) {
    return (
      <div className="space-y-6">
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="min-w-[280px] space-y-4">
              <Skeleton className="h-8 w-full" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-32 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los leads. Por favor, inténtalo de nuevo.
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pipeline de Leads</h2>
          <p className="text-muted-foreground">
            Gestiona tus leads arrastrándolos entre etapas
          </p>
        </div>
        
        {onRefresh && (
          <Button
            variant="outline"
            onClick={() => {
              onRefresh();
              refetch();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        )}
      </div>

      {/* Drag Error Alert */}
      {dragError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {dragError}
            <Button variant="outline" size="sm" onClick={clearDragError}>
              Cerrar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-4 overflow-x-auto pb-4">{/* Reduced gap from 6 to 4 */}
          {stages.map((stage) => (
            <LeadKanbanColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStage[stage.id] || []}
              onLeadClick={onLeadClick}
              onAddLead={onAddLead}
            />
          ))}
        </div>
      </DndContext>

      {/* Mobile Tip */}
      <div className="lg:hidden text-center text-sm text-muted-foreground">
        Mantén presionado para arrastrar las tarjetas entre columnas
      </div>
    </div>
  );
};