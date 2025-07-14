import React, { useState, useCallback, useMemo } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TransaccionKanbanColumn } from './TransaccionKanbanColumn';
import { PipelineSelector } from '../negocios/PipelineSelector';
import { Transaccion } from '@/types/Transaccion';
import { useStages } from '@/hooks/useStages';
import { usePipelines } from '@/hooks/usePipelines';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TransaccionesKanbanProps {
  transacciones: Transaccion[];
  onUpdateStage: (transaccionId: string, stageId: string) => Promise<any>;
  onEdit: (transaccion: Transaccion) => void;
  onView?: (transaccion: Transaccion) => void;
  onAddTransaccion?: (stageId?: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  selectedIds?: string[];
  onSelectItem?: (id: string) => void;
}

export const TransaccionesKanban = React.memo(({ 
  transacciones, 
  onUpdateStage, 
  onEdit, 
  onView, 
  onAddTransaccion,
  isLoading = false,
  onRefresh,
  selectedIds = [],
  onSelectItem
}: TransaccionesKanbanProps) => {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>();
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const { stages, loading: stagesLoading, error: stagesError } = useStages('DEAL');
  const { pipelines } = usePipelines();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }
    })
  );

  // Get filtered stages for the selected pipeline
  const filteredStages = useMemo(() => {
    if (!stages || stages.length === 0) return [];
    
    // If no pipeline selected, use the first available pipeline
    if (!selectedPipelineId && stages.length > 0) {
      const firstPipelineId = stages[0].pipeline_id;
      setSelectedPipelineId(firstPipelineId);
      return stages.filter(s => s.pipeline_id === firstPipelineId).sort((a, b) => a.order_index - b.order_index);
    }
    
    return stages
      .filter(s => s.pipeline_id === selectedPipelineId)
      .sort((a, b) => a.order_index - b.order_index);
  }, [stages, selectedPipelineId]);

  // Group transacciones by stage
  const transaccionesByStage = useMemo(() => {
    const groups: Record<string, Transaccion[]> = {};
    
    filteredStages.forEach(stage => {
      groups[stage.id] = transacciones.filter(transaccion => transaccion.stage_id === stage.id);
    });
    
    // Add transacciones without stage to the first stage if available
    const transaccionesSinEtapa = transacciones.filter(t => !t.stage_id && filteredStages.length > 0);
    if (transaccionesSinEtapa.length > 0 && filteredStages.length > 0) {
      const firstStageId = filteredStages[0].id;
      groups[firstStageId] = [...(groups[firstStageId] || []), ...transaccionesSinEtapa];
    }
    
    return groups;
  }, [transacciones, filteredStages]);

  const handlePipelineChange = useCallback((pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    setDragError(null);
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setDragError(null);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const transaccionId = active.id as string;
    const newStageId = over.id as string;
    const oldStageId = filteredStages.find(stage => 
      transaccionesByStage[stage.id]?.some(transaccion => transaccion.id === transaccionId)
    )?.id;
    
    if (newStageId === oldStageId) return;

    const newStage = filteredStages.find(s => s.id === newStageId);
    const oldStage = filteredStages.find(s => s.id === oldStageId);
    
    try {
      await onUpdateStage(transaccionId, newStageId);
      
      if (newStage && oldStage) {
        toast({
          title: "Transacción movida",
          description: `Movida de "${oldStage.name}" a "${newStage.name}"`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al mover la transacción';
      setDragError(errorMessage);
      
      toast({
        title: "Error al mover transacción",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [filteredStages, onUpdateStage, toast, transaccionesByStage]);

  const handleAddTransaccion = useCallback((stageId?: string) => {
    if (onAddTransaccion) {
      onAddTransaccion(stageId);
    }
  }, [onAddTransaccion]);

  const clearDragError = useCallback(() => {
    setDragError(null);
  }, []);

  if (isLoading || stagesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando kanban...</p>
      </div>
    );
  }

  if (stagesError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-destructive">{stagesError}</p>
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  if (filteredStages.length === 0) {
    return (
      <div className="space-y-4">
        {pipelines && pipelines.length > 0 && (
          <PipelineSelector
            selectedPipelineId={selectedPipelineId}
            onPipelineChange={handlePipelineChange}
            pipelineType="DEAL"
          />
        )}
        
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            No hay etapas configuradas para mostrar el kanban
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Drag Error Alert */}
      {dragError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {dragError}
            <Button variant="ghost" size="sm" onClick={clearDragError}>
              Cerrar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Kanban Board */}
      <div className="h-full p-6">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full overflow-x-auto pb-6 min-h-[650px]">
            {filteredStages.map((stage) => (
              <SortableContext
                key={stage.id}
                id={stage.id}
                items={transaccionesByStage[stage.id]?.map(t => t.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <TransaccionKanbanColumn
                  stage={stage}
                  transacciones={transaccionesByStage[stage.id] || []}
                  onEdit={onEdit}
                  onView={onView}
                  onAddTransaccion={handleAddTransaccion}
                  isLoading={isDragging}
                  selectedIds={selectedIds}
                  onSelectItem={onSelectItem}
                />
              </SortableContext>
            ))}
          </div>
        </DndContext>
      </div>

      {/* Mobile Responsive Message */}
      <div className="md:hidden mt-4 p-4 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          💡 Tip: En móviles, mantén presionado para arrastrar las tarjetas
        </p>
      </div>
    </div>
  );
});

TransaccionesKanban.displayName = 'TransaccionesKanban';