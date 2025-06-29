
import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useTargetCompanies } from "@/hooks/useTargetCompanies";
import { useDeals } from "@/hooks/useDeals";
import { useStages } from "@/hooks/useStages";
import { TargetCompany, TargetStatus } from "@/types/TargetCompany";
import { Deal } from "@/types/Deal";
import { PipelineType } from "@/types/Pipeline";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { DealCard } from "@/components/deals/DealCard";
import { CreateDealDialog } from "@/components/deals/CreateDealDialog";
import { Button } from "@/components/ui/button";
import { Table, Plus } from "lucide-react";

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
  const itemsByStage = stages.reduce((acc, stage) => {
    if (pipelineType === 'DEAL') {
      acc[stage.id] = deals.filter(deal => deal.stage_id === stage.id);
    } else if (pipelineType === 'TARGET_COMPANY') {
      // For target companies, we still use the old status-based grouping
      const statusColumns: { id: TargetStatus; stageId?: string }[] = [
        { id: 'IDENTIFIED' },
        { id: 'RESEARCHING' },
        { id: 'OUTREACH_PLANNED' },
        { id: 'CONTACTED' },
        { id: 'IN_CONVERSATION' },
        { id: 'ON_HOLD' },
        { id: 'CONVERTED_TO_DEAL' }
      ];
      
      const matchingStatus = statusColumns.find((_, index) => index === stage.order_index - 1);
      if (matchingStatus) {
        acc[stage.id] = targetCompanies.filter(company => company.status === matchingStatus.id);
      }
    }
    return acc;
  }, {} as Record<string, (Deal | TargetCompany)[]>);

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

  const renderCard = (item: Deal | TargetCompany, index: number) => {
    const isDragging = draggedCard === item.id;
    
    if (pipelineType === 'DEAL' && 'deal_name' in item) {
      return (
        <Draggable key={item.id} draggableId={item.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <DealCard deal={item} isDragging={isDragging} />
            </div>
          )}
        </Draggable>
      );
    } else if ('name' in item) {
      return (
        <Draggable key={item.id} draggableId={item.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <KanbanCard company={item} />
            </div>
          )}
        </Draggable>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getTitle = () => {
    switch (pipelineType) {
      case 'DEAL': return 'Pipeline de Deals M&A';
      case 'TARGET_COMPANY': return 'Pipeline de Empresas Objetivo';
      case 'LEAD': return 'Pipeline de Leads';
      case 'OPERACION': return 'Pipeline de Operaciones';
      case 'PROYECTO': return 'Pipeline de Proyectos';
      default: return 'Pipeline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with toggle and create button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{getTitle()}</h3>
        <div className="flex gap-2">
          {pipelineType === 'DEAL' && pipelineId && (
            <CreateDealDialog pipelineId={pipelineId} />
          )}
          <Button
            onClick={onToggleView}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Table className="h-4 w-4" />
            Vista Tabla
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">{stage.name}</h4>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                </div>
                
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : ''
                      }`}
                    >
                      {(itemsByStage[stage.id] || []).map((item, index) => 
                        renderCard(item, index)
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
