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
import { OptimizedKanbanColumn } from './OptimizedKanbanColumn';
import { PipelineSelector } from './PipelineSelector';
import { Negocio } from '@/types/Negocio';
import { useStages } from '@/hooks/useStages';
import { usePipelines } from '@/hooks/usePipelines';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OptimizedNegociosKanbanProps {
  negocios: Negocio[];
  onUpdateStage: (negocioId: string, stageId: string) => Promise<any>;
  onEdit: (negocio: Negocio) => void;
  onView?: (negocio: Negocio) => void;
  onAddNegocio?: (stageId?: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  selectedIds?: string[];
  onSelectItem?: (id: string) => void;
}

/**
 * OptimizedNegociosKanban Component
 * 
 * High-performance Kanban board with advanced features:
 * - Pipeline selection with persistence
 * - Optimistic updates with error handling
 * - Enhanced drag & drop with validation
 * - Mobile-responsive design
 * - Performance optimizations with memoization
 * 
 * @param negocios - Array of business deals to display
 * @param onUpdateStage - Callback for updating a deal's stage
 * @param onEdit - Callback for editing a deal
 * @param onView - Optional callback for viewing deal details
 * @param onAddNegocio - Optional callback for adding new deal
 * @param isLoading - Loading state for the entire board
 * @param onRefresh - Optional refresh callback
 */
export const OptimizedNegociosKanban = React.memo(({ 
  negocios, 
  onUpdateStage, 
  onEdit, 
  onView, 
  onAddNegocio,
  isLoading = false,
  onRefresh,
  selectedIds = [],
  onSelectItem
}: OptimizedNegociosKanbanProps) => {
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

  /**
   * Get filtered stages for the selected pipeline
   */
  const filteredStages = useMemo(() => {
    if (!selectedPipelineId) return [];
    
    return stages
      .filter(s => s.pipeline_id === selectedPipelineId)
      .sort((a, b) => a.order_index - b.order_index);
  }, [stages, selectedPipelineId]);

  /**
   * Group negocios by stage with memoization for performance
   */
  const negociosByStage = useMemo(() => {
    const groups: Record<string, Negocio[]> = {};
    
    filteredStages.forEach(stage => {
      groups[stage.id] = negocios.filter(negocio => negocio.stage_id === stage.id);
    });
    
    return groups;
  }, [negocios, filteredStages]);

  /**
   * Handle pipeline selection change
   */
  const handlePipelineChange = useCallback((pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    setDragError(null);
  }, []);

  /**
   * Handle drag start with optimistic UI updates
   */
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setDragError(null);
  }, []);

  /**
   * Handle drag end with validation and error handling
   */
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const negocioId = active.id as string;
    const newStageId = over.id as string;
    const oldStageId = filteredStages.find(stage => 
      negociosByStage[stage.id]?.some(negocio => negocio.id === negocioId)
    )?.id;
    
    // Skip if dropped in the same stage
    if (newStageId === oldStageId) {
      return;
    }

    // Find the stage names for user feedback
    const newStage = filteredStages.find(s => s.id === newStageId);
    const oldStage = filteredStages.find(s => s.id === oldStageId);
    
    try {
      await onUpdateStage(negocioId, newStageId);
      
      // Success feedback
      if (newStage && oldStage) {
        toast({
          title: "Negocio movido",
          description: `Movido de "${oldStage.name}" a "${newStage.name}"`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al mover el negocio';
      setDragError(errorMessage);
      
      toast({
        title: "Error al mover negocio",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error('Error updating stage:', error);
    }
  }, [filteredStages, onUpdateStage, toast]);

  /**
   * Handle add negocio with stage pre-selection
   */
  const handleAddNegocio = useCallback((stageId?: string) => {
    if (onAddNegocio) {
      onAddNegocio(stageId);
    }
  }, [onAddNegocio]);

  /**
   * Clear drag error
   */
  const clearDragError = useCallback(() => {
    setDragError(null);
  }, []);

  // Loading state
  if (isLoading || stagesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando kanban...</p>
      </div>
    );
  }

  // Error state
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

  // No pipeline selected state
  if (!selectedPipelineId || filteredStages.length === 0) {
    return (
      <div className="space-y-4">
        <PipelineSelector
          selectedPipelineId={selectedPipelineId}
          onPipelineChange={handlePipelineChange}
          pipelineType="DEAL"
        />
        
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            {!selectedPipelineId 
              ? 'Selecciona un pipeline para ver el kanban'
              : 'No hay etapas configuradas para este pipeline'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pipeline Selector */}
      <div className="flex items-center justify-between">
        <PipelineSelector
          selectedPipelineId={selectedPipelineId}
          onPipelineChange={handlePipelineChange}
          pipelineType="DEAL"
        />
        
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isDragging}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
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
            <Button variant="ghost" size="sm" onClick={clearDragError}>
              Cerrar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Kanban Board */}
      <div className="h-full">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full overflow-x-auto pb-4 min-h-[600px]">
            {filteredStages.map((stage) => (
              <SortableContext
                key={stage.id}
                id={stage.id}
                items={negociosByStage[stage.id]?.map(n => n.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <OptimizedKanbanColumn
                  stage={stage}
                  negocios={negociosByStage[stage.id] || []}
                  onEdit={onEdit}
                  onView={onView}
                  onAddNegocio={handleAddNegocio}
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

OptimizedNegociosKanban.displayName = 'OptimizedNegociosKanban';