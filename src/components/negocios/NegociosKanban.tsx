import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { KanbanColumn } from './KanbanColumn';
import { Negocio } from '@/types/Negocio';
import { useStages } from '@/hooks/useStages';
import { usePipelines } from '@/hooks/usePipelines';

interface NegociosKanbanProps {
  negocios: Negocio[];
  onUpdateStage: (negocioId: string, stageId: string) => Promise<any>;
  onEdit: (negocio: Negocio) => void;
  onView?: (negocio: Negocio) => void;
}

/**
 * NegociosKanban Component
 * 
 * Main Kanban board component that displays business deals across pipeline stages.
 * Features drag & drop functionality, stage-based organization, and real-time updates.
 * 
 * @param negocios - Array of business deals to display
 * @param onUpdateStage - Callback for updating a deal's stage
 * @param onEdit - Callback for editing a deal
 * @param onView - Optional callback for viewing deal details
 */

export const NegociosKanban = ({ negocios, onUpdateStage, onEdit, onView }: NegociosKanbanProps) => {
  const { stages } = useStages('DEAL');
  const { pipelines } = usePipelines();
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Gets the pipeline stages for DEAL type, sorted by order
   * @returns Array of pipeline stages
   */
  const getDealStages = () => {
    const dealPipeline = pipelines.find(p => p.type === 'DEAL');
    return stages
      .filter(s => s.pipeline_id === dealPipeline?.id)
      .sort((a, b) => a.order_index - b.order_index);
  };

  /**
   * Handles the start of a drag operation
   */
  const handleDragStart = () => {
    setIsDragging(true);
  };

  /**
   * Handles the end of a drag operation and updates the stage
   * @param result - Drag and drop result object
   */
  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStageId = destination.droppableId;
    
    try {
      await onUpdateStage(draggableId, newStageId);
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  /**
   * Filters negocios by stage ID
   * @param stageId - The stage ID to filter by
   * @returns Array of negocios for the given stage
   */
  const getNegociosByStage = (stageId: string) => {
    return negocios.filter(negocio => negocio.stage_id === stageId);
  };

  const dealStages = getDealStages();

  if (dealStages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No hay etapas configuradas para el pipeline de negocios.</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto pb-4">
          {dealStages.map((stage) => {
            const stageNegocios = getNegociosByStage(stage.id);

            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                negocios={stageNegocios}
                onEdit={onEdit}
                onView={onView}
              />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );};
