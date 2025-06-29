
import { useState } from "react";
import { DropResult } from "react-beautiful-dnd";
import { useTargetCompanies } from "@/hooks/useTargetCompanies";
import { useDeals } from "@/hooks/useDeals";
import { useStages } from "@/hooks/useStages";
import { TargetStatus } from "@/types/TargetCompany";
import { PipelineType } from "@/types/Pipeline";
import { PipelineHeader } from "./PipelineHeader";
import { KanbanBoard } from "./KanbanBoard";
import { groupItemsByStage } from "./utils/kanbanUtils";

interface FlexibleKanbanPipelineProps {
  pipelineType: PipelineType;
  pipelineId?: string;
  onToggleView: () => void;
}

export const FlexibleKanbanPipeline = ({ 
  pipelineType, 
  pipelineId,
  onToggleView 
}: FlexibleKanbanPipelineProps) => {
  const { targetCompanies, loading: targetLoading, updateStatus } = useTargetCompanies();
  const { deals, loading: dealsLoading, updateDealStage } = useDeals(pipelineId);
  const { stages, loading: stagesLoading } = useStages(pipelineId);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  const loading = targetLoading || dealsLoading || stagesLoading;

  // Group items by stage
  const itemsByStage = groupItemsByStage(stages, pipelineType, deals, targetCompanies);

  const handleDragEnd = async (result: DropResult) => {
    setDraggedCard(null);
    
    if (!result.destination) return;

    const sourceStageId = result.source.droppableId;
    const destinationStageId = result.destination.droppableId;
    
    if (sourceStageId === destinationStageId) return;

    const draggedItem = itemsByStage[sourceStageId][result.source.index];
    
    if (pipelineType === 'DEAL' && 'deal_name' in draggedItem) {
      // Handle deal stage update
      await updateDealStage(draggedItem.id, destinationStageId);
    } else if (pipelineType === 'TARGET_COMPANY' && 'name' in draggedItem) {
      // Handle target company status update (convert stage to status)
      const destinationStage = stages.find(s => s.id === destinationStageId);
      if (destinationStage) {
        const statusMap: Record<number, TargetStatus> = {
          1: 'IDENTIFIED',
          2: 'RESEARCHING', 
          3: 'OUTREACH_PLANNED',
          4: 'CONTACTED',
          5: 'IN_CONVERSATION',
          6: 'ON_HOLD',
          7: 'CONVERTED_TO_DEAL'
        };
        const newStatus = statusMap[destinationStage.order_index];
        if (newStatus) {
          await updateStatus(draggedItem.id, newStatus);
        }
      }
    }
  };

  const handleDragStart = (start: any) => {
    setDraggedCard(start.draggableId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PipelineHeader 
        pipelineType={pipelineType} 
        pipelineId={pipelineId} 
        onToggleView={onToggleView} 
      />
      
      <KanbanBoard
        stages={stages}
        itemsByStage={itemsByStage}
        draggedCardId={draggedCard}
        pipelineType={pipelineType}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      />
    </div>
  );
};
