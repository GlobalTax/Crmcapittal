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
import { MandateKanbanColumn } from './MandateKanbanColumn';
import { BuyingMandate } from '@/types/BuyingMandate';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define mandate statuses as stages
const MANDATE_STAGES = [
  { id: 'active', name: 'Activo', color: '#22c55e' },
  { id: 'paused', name: 'Pausado', color: '#f59e0b' },
  { id: 'completed', name: 'Completado', color: '#3b82f6' },
  { id: 'cancelled', name: 'Cancelado', color: '#ef4444' },
];

interface MandatesKanbanProps {
  mandates: BuyingMandate[];
  onUpdateStatus: (mandateId: string, status: string) => Promise<any>;
  onEdit: (mandate: BuyingMandate) => void;
  onView?: (mandate: BuyingMandate) => void;
  onAddMandate?: (status?: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  selectedIds?: string[];
  onSelectItem?: (id: string) => void;
}

export const MandatesKanban = React.memo(({ 
  mandates, 
  onUpdateStatus, 
  onEdit, 
  onView, 
  onAddMandate,
  isLoading = false,
  onRefresh,
  selectedIds = [],
  onSelectItem
}: MandatesKanbanProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }
    })
  );

  // Group mandates by status
  const mandatesByStatus = useMemo(() => {
    const groups: Record<string, BuyingMandate[]> = {};
    
    MANDATE_STAGES.forEach(stage => {
      groups[stage.id] = mandates.filter(mandate => mandate.status === stage.id);
    });
    
    // Add mandates without status to the first stage if available
    const mandatesSinEstado = mandates.filter(m => !m.status && MANDATE_STAGES.length > 0);
    if (mandatesSinEstado.length > 0 && MANDATE_STAGES.length > 0) {
      const firstStageId = MANDATE_STAGES[0].id;
      groups[firstStageId] = [...(groups[firstStageId] || []), ...mandatesSinEstado];
    }
    
    return groups;
  }, [mandates]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setDragError(null);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const mandateId = active.id as string;
    const newStatus = over.id as string;
    const oldStatus = MANDATE_STAGES.find(stage => 
      mandatesByStatus[stage.id]?.some(mandate => mandate.id === mandateId)
    )?.id;
    
    if (newStatus === oldStatus) return;

    const newStage = MANDATE_STAGES.find(s => s.id === newStatus);
    const oldStage = MANDATE_STAGES.find(s => s.id === oldStatus);
    
    try {
      await onUpdateStatus(mandateId, newStatus);
      
      if (newStage && oldStage) {
        toast({
          title: "Mandato movido",
          description: `Movido de "${oldStage.name}" a "${newStage.name}"`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al mover el mandato';
      setDragError(errorMessage);
      
      toast({
        title: "Error al mover mandato",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [mandatesByStatus, onUpdateStatus, toast]);

  const handleAddMandate = useCallback((status?: string) => {
    if (onAddMandate) {
      onAddMandate(status);
    }
  }, [onAddMandate]);

  const clearDragError = useCallback(() => {
    setDragError(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando kanban...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Vista Kanban</h3>
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
            {MANDATE_STAGES.map((stage) => (
              <SortableContext
                key={stage.id}
                id={stage.id}
                items={mandatesByStatus[stage.id]?.map(m => m.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <MandateKanbanColumn
                  stage={stage}
                  mandates={mandatesByStatus[stage.id] || []}
                  onEdit={onEdit}
                  onView={onView}
                  onAddMandate={handleAddMandate}
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

MandatesKanban.displayName = 'MandatesKanban';