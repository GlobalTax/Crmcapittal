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
import { ReconversionKanbanColumn } from './ReconversionKanbanColumn';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReconversionKanbanViewProps {
  reconversiones: any[];
  onView: (reconversion: any) => void;
  onEdit: (reconversion: any) => void;
  onUpdateStatus: (reconversionId: string, status: string) => Promise<any>;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const RECONVERSION_STAGES = {
  'initial': {
    id: 'initial',
    name: 'Inicial',
    color: '#6B7280',
    description: 'Reconversiones en etapa inicial'
  },
  'active': {
    id: 'active', 
    name: 'Activa',
    color: '#3B82F6',
    description: 'Reconversiones en proceso activo'
  },
  'matching': {
    id: 'matching',
    name: 'En Matching', 
    color: '#F59E0B',
    description: 'Buscando coincidencias'
  },
  'negotiations': {
    id: 'negotiations',
    name: 'Negociaciones',
    color: '#8B5CF6', 
    description: 'En proceso de negociación'
  },
  'closed': {
    id: 'closed',
    name: 'Finalizada',
    color: '#10B981',
    description: 'Reconversiones completadas'
  }
};

export const ReconversionKanbanView = React.memo(({ 
  reconversiones, 
  onView,
  onEdit,
  onUpdateStatus,
  isLoading = false,
  onRefresh
}: ReconversionKanbanViewProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }
    })
  );

  // Group reconversiones by status
  const reconversionesByStatus = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    Object.keys(RECONVERSION_STAGES).forEach(status => {
      grouped[status] = reconversiones.filter(r => r.status === status);
    });
    
    return grouped;
  }, [reconversiones]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setDragError(null);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;
    
    if (!over) return;
    
    const reconversionId = active.id as string;
    const newStatus = over.id as string;
    
    // Find the reconversion being moved
    const reconversion = reconversiones.find(r => r.id === reconversionId);
    if (!reconversion) return;
    
    // Don't update if it's the same status
    if (reconversion.status === newStatus) return;
    
    try {
      await onUpdateStatus(reconversionId, newStatus);
      
      toast({
        title: "Estado actualizado",
        description: `Reconversión movida a ${RECONVERSION_STAGES[newStatus as keyof typeof RECONVERSION_STAGES]?.name}`,
      });
    } catch (error) {
      console.error('Error updating reconversion status:', error);
      setDragError('Error al actualizar el estado de la reconversión');
      
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la reconversión",
        variant: "destructive",
      });
    }
  }, [reconversiones, onUpdateStatus, toast]);

  const clearDragError = useCallback(() => {
    setDragError(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Cargando vista Kanban...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Vista Kanban</h2>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {dragError && (
        <Alert variant="destructive" className="animate-fade-in">
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {Object.values(RECONVERSION_STAGES).map((stage) => (
            <SortableContext 
              key={stage.id}
              items={reconversionesByStatus[stage.id]?.map(r => r.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <ReconversionKanbanColumn
                stage={stage}
                reconversiones={reconversionesByStatus[stage.id] || []}
                onEdit={onEdit}
                onView={onView}
                isLoading={false}
              />
            </SortableContext>
          ))}
        </div>
      </DndContext>

      {/* Mobile tip */}
      <div className="md:hidden bg-muted/50 rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">
          💡 Mantén presionado una tarjeta para arrastrarla entre columnas
        </p>
      </div>
    </div>
  );
});

ReconversionKanbanView.displayName = 'ReconversionKanbanView';