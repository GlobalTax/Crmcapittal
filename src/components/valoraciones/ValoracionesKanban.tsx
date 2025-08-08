
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
import { ValoracionKanbanColumn } from './ValoracionKanbanColumn';
import { Valoracion, ValoracionStatus } from '@/types/Valoracion';
import { VALORACION_PHASES } from '@/utils/valoracionPhases';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ValoracionesKanbanProps {
  valoraciones: Valoracion[];
  onUpdateStatus: (valoracionId: string, status: ValoracionStatus) => Promise<any>;
  onEdit: (valoracion: Valoracion) => void;
  onView?: (valoracion: Valoracion) => void;
  onAddValoracion?: (status?: ValoracionStatus) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  selectedIds?: string[];
  onSelectItem?: (id: string) => void;
}

export const ValoracionesKanban = React.memo(({ 
  valoraciones, 
  onUpdateStatus, 
  onEdit, 
  onView, 
  onAddValoracion,
  isLoading = false,
  onRefresh,
  selectedIds = [],
  onSelectItem
}: ValoracionesKanbanProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }
    })
  );

  // Group valoraciones by status
  const valoracionesByStatus = useMemo(() => {
    const groups: Record<ValoracionStatus, Valoracion[]> = {
      requested: [],
      in_process: [],
      completed: [],
      delivered: []
    };
    
    valoraciones.forEach(valoracion => {
      if (groups[valoracion.status]) {
        groups[valoracion.status].push(valoracion);
      }
    });
    
    return groups;
  }, [valoraciones]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setDragError(null);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const valoracionId = active.id as string;
    const newStatus = over.id as ValoracionStatus;
    const valoracion = valoraciones.find(v => v.id === valoracionId);
    
    if (!valoracion || newStatus === valoracion.status) return;

    const newPhase = VALORACION_PHASES[newStatus];
    const oldPhase = VALORACION_PHASES[valoracion.status];
    
    try {
      await onUpdateStatus(valoracionId, newStatus);
      
      toast({
        title: "Valoración movida",
        description: `Movida de "${oldPhase.label}" a "${newPhase.label}"`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al mover la valoración';
      setDragError(errorMessage);
      
      toast({
        title: "Error al mover valoración",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [valoraciones, onUpdateStatus, toast]);

  const handleAddValoracion = useCallback((status?: ValoracionStatus) => {
    if (onAddValoracion) {
      onAddValoracion(status);
    }
  }, [onAddValoracion]);

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
    <div className="space-y-4" role="region" aria-label="Kanban de valoraciones">
      {/* Header with refresh button and SEO tags */}
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
<h1 className="sr-only">Kanban de valoraciones</h1>
        <h3 className="text-lg font-semibold">Pipeline de Valoraciones</h3>
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
            {Object.entries(VALORACION_PHASES).map(([status, phase]) => (
              <SortableContext
                key={status}
                id={status}
                items={valoracionesByStatus[status as ValoracionStatus]?.map(v => v.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <ValoracionKanbanColumn
                  status={status as ValoracionStatus}
                  phase={phase}
                  valoraciones={valoracionesByStatus[status as ValoracionStatus] || []}
                  onEdit={onEdit}
                  onView={onView}
                  onAddValoracion={handleAddValoracion}
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

ValoracionesKanban.displayName = 'ValoracionesKanban';
