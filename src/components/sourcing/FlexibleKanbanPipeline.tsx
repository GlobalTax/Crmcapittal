import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useTargetCompanies } from "@/hooks/useTargetCompanies";
import { useStages } from "@/hooks/useStages";
import { usePipelines } from "@/hooks/usePipelines";
import { TargetCompany } from "@/types/TargetCompany";
import { Stage, PipelineType } from "@/types/Pipeline";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, Table } from "lucide-react";

interface FlexibleKanbanPipelineProps {
  onToggleView: () => void;
  pipelineType?: PipelineType;
}

export const FlexibleKanbanPipeline = ({ 
  onToggleView, 
  pipelineType = 'TARGET_COMPANY' 
}: FlexibleKanbanPipelineProps) => {
  const { pipelines, loading: pipelinesLoading } = usePipelines();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const { stages, loading: stagesLoading } = useStages(selectedPipelineId);
  const { targetCompanies, loading: companiesLoading, updateStatus } = useTargetCompanies();
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  // Filtrar pipelines por tipo
  const relevantPipelines = pipelines.filter(p => p.type === pipelineType);
  
  // Auto-seleccionar el primer pipeline si no hay uno seleccionado
  if (!selectedPipelineId && relevantPipelines.length > 0) {
    setSelectedPipelineId(relevantPipelines[0].id);
  }

  // Filtrar stages por pipeline seleccionado
  const pipelineStages = stages.filter(stage => stage.pipeline_id === selectedPipelineId);

  // Agrupar empresas por stage (usando stage_id en lugar de stage.id)
  const companiesByStage = pipelineStages.reduce((acc, stage) => {
    acc[stage.id] = targetCompanies.filter(company => company.stage_id === stage.id);
    return acc;
  }, {} as Record<string, TargetCompany[]>);

  const handleDragEnd = async (result: DropResult) => {
    setDraggedCard(null);
    
    if (!result.destination) return;

    const sourceStageId = result.source.droppableId;
    const destinationStageId = result.destination.droppableId;
    
    if (sourceStageId === destinationStageId) return;

    const draggedCompany = companiesByStage[sourceStageId][result.source.index];
    
    // Find the destination stage to get the status mapping
    const destinationStage = pipelineStages.find(s => s.id === destinationStageId);
    if (!destinationStage) return;

    // Update the company's stage
    try {
      await updateStatus(draggedCompany.id, draggedCompany.status, destinationStageId);
    } catch (error) {
      console.error('Error updating company stage:', error);
    }
  };

  const handleDragStart = (start: any) => {
    setDraggedCard(start.draggableId);
  };

  if (pipelinesLoading || stagesLoading || companiesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with pipeline selector and toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Pipeline Kanban</h3>
          {relevantPipelines.length > 1 && (
            <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Seleccionar pipeline" />
              </SelectTrigger>
              <SelectContent>
                {relevantPipelines.map((pipeline) => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Button
          onClick={onToggleView}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Table className="h-4 w-4" />
          Vista Tabla
        </Button>
      </div>

      {!selectedPipelineId ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Selecciona un pipeline para ver el tablero Kanban</p>
        </div>
      ) : pipelineStages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Este pipeline no tiene etapas configuradas</p>
        </div>
      ) : (
        /* Kanban Board */
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {pipelineStages.map((stage) => (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <div 
                  className="rounded-lg border-2 border-dashed border-gray-200 p-4 min-h-[600px]"
                  style={{ backgroundColor: `${stage.color}20` }} // 20% opacity of stage color
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">{stage.name}</h4>
                    <div 
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: stage.color }}
                    >
                      {companiesByStage[stage.id]?.length || 0}
                    </div>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[500px] transition-colors ${
                          snapshot.isDraggingOver ? 'bg-blue-50 bg-opacity-50' : ''
                        }`}
                      >
                        {(companiesByStage[stage.id] || []).map((company, index) => (
                          <Draggable
                            key={company.id}
                            draggableId={company.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-transform ${
                                  snapshot.isDragging ? 'rotate-3 scale-105' : ''
                                } ${
                                  draggedCard === company.id ? 'opacity-50' : ''
                                }`}
                              >
                                <KanbanCard company={company} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {/* Empty state */}
                        {(!companiesByStage[stage.id] || companiesByStage[stage.id].length === 0) && (
                          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                            No hay elementos en esta etapa
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};
