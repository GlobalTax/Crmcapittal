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
import { useIsClient } from '@/hooks/useIsClient';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface MandateKanbanProps {
  mandates: BuyingMandate[];
  onUpdateStatus: (mandateId: string, status: BuyingMandate['status']) => Promise<any>;
  onEdit: (mandate: BuyingMandate) => void;
  onView?: (mandate: BuyingMandate) => void;
  onAddMandate?: (status?: BuyingMandate['status']) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  selectedIds?: string[];
  onSelectItem?: (id: string) => void;
}

const MANDATE_STAGES = {
  active: { 
    id: 'active', 
    name: 'Activo', 
    color: '#10b981',
    description: 'Mandatos en ejecución activa'
  },
  paused: { 
    id: 'paused', 
    name: 'Pausado', 
    color: '#f59e0b',
    description: 'Mandatos temporalmente pausados'
  },
  completed: { 
    id: 'completed', 
    name: 'Completado', 
    color: '#3b82f6',
    description: 'Mandatos finalizados exitosamente'
  },
  cancelled: { 
    id: 'cancelled', 
    name: 'Cancelado', 
    color: '#ef4444',
    description: 'Mandatos cancelados o terminados'
  },
} as const;

export const MandateKanban = React.memo(({ 
  mandates, 
  onUpdateStatus, 
  onEdit, 
  onView, 
  onAddMandate,
  isLoading = false,
  onRefresh,
  selectedIds = [],
  onSelectItem
}: MandateKanbanProps) => {
  const isClient = useIsClient();
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
    const groups: Record<BuyingMandate['status'], BuyingMandate[]> = {
      active: [],
      paused: [],
      completed: [],
      cancelled: []
    };
    
    mandates.forEach(mandate => {
      if (groups[mandate.status]) {
        groups[mandate.status].push(mandate);
      }
    });
    
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
    const newStatus = over.id as BuyingMandate['status'];
    const mandate = mandates.find(m => m.id === mandateId);
    
    if (!mandate || newStatus === mandate.status) return;

    const newStage = MANDATE_STAGES[newStatus];
    const oldStage = MANDATE_STAGES[mandate.status];
    
    try {
      await onUpdateStatus(mandateId, newStatus);
      
      toast({
        title: "Mandato movido",
        description: `Movido de "${oldStage.name}" a "${newStage.name}"`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al mover el mandato';
      setDragError(errorMessage);
      
      toast({
        title: "Error al mover mandato",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [mandates, onUpdateStatus, toast]);

  const handleAddMandate = useCallback((status?: BuyingMandate['status']) => {
    if (onAddMandate) {
      onAddMandate(status);
    }
  }, [onAddMandate]);

  const clearDragError = useCallback(() => {
    setDragError(null);
  }, []);

  if (!isClient) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[300px] space-y-4">
              <Skeleton className="h-8 w-full" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-24 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
        <h3 className="text-lg font-semibold">Pipeline de Mandatos</h3>
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
            {Object.entries(MANDATE_STAGES).map(([status, stage]) => (
              <SortableContext
                key={status}
                id={status}
                items={mandatesByStatus[status as BuyingMandate['status']]?.map(m => m.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <MandateKanbanColumn
                  stage={stage}
                  mandates={mandatesByStatus[status as BuyingMandate['status']] || []}
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

MandateKanban.displayName = 'MandateKanban';