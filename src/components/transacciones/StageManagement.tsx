import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useStages } from "@/hooks/useStages";
import { useToast } from "@/hooks/use-toast";
import { Settings, Plus, Edit2, Trash2, GripVertical } from "lucide-react";
import { Stage } from "@/types/Pipeline";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StageManagementProps {
  pipelineId?: string;
}

interface SortableStageItemProps {
  stage: Stage;
  onEdit: (stage: Stage) => void;
  onDelete: (stageId: string) => void;
}

const SortableStageItem = ({ stage, onEdit, onDelete }: SortableStageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-background border rounded-lg"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing text-muted-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: stage.color || '#6B7280' }}
      />
      
      <div className="flex-1">
        <span className="font-medium">{stage.name}</span>
        {stage.description && (
          <p className="text-sm text-muted-foreground">{stage.description}</p>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(stage)}
          className="h-8 w-8 p-0"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(stage.id)}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const StageManagement = ({ pipelineId }: StageManagementProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [newStageName, setNewStageName] = useState('');
  const [newStageDescription, setNewStageDescription] = useState('');
  const [newStageColor, setNewStageColor] = useState('#3B82F6');
  
  const { stages, loading, createStage, updateStage, deleteStage, reorderStages } = useStages('DEAL');
  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  // Filter stages for the pipeline (DEAL type for transactions)
  const filteredStages = stages?.filter(s => s.pipeline?.type === 'DEAL') || [];

  const handleCreateStage = async () => {
    if (!newStageName.trim()) return;

    try {
      const maxOrder = Math.max(...filteredStages.map(s => s.order_index), -1);
      await createStage({
        name: newStageName.trim(),
        description: newStageDescription.trim() || undefined,
        color: newStageColor,
        order_index: maxOrder + 1,
        pipeline_id: pipelineId || filteredStages[0]?.pipeline_id || '',
        is_active: true
      });

      setNewStageName('');
      setNewStageDescription('');
      setNewStageColor('#3B82F6');
      setIsCreating(false);
      
      toast({
        title: "Columna creada",
        description: `La columna "${newStageName}" ha sido creada exitosamente.`,
      });
    } catch (error) {
      toast({
        title: "Error al crear columna",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleEditStage = async () => {
    if (!editingStage || !newStageName.trim()) return;

    try {
      await updateStage(editingStage.id, {
        name: newStageName.trim(),
        description: newStageDescription.trim() || undefined,
        color: newStageColor,
      });

      setEditingStage(null);
      setNewStageName('');
      setNewStageDescription('');
      setNewStageColor('#3B82F6');
      
      toast({
        title: "Columna actualizada",
        description: `La columna "${newStageName}" ha sido actualizada exitosamente.`,
      });
    } catch (error) {
      toast({
        title: "Error al actualizar columna",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta columna? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteStage(stageId);
      toast({
        title: "Columna eliminada",
        description: "La columna ha sido eliminada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al eliminar columna",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredStages.findIndex((stage) => stage.id === active.id);
    const newIndex = filteredStages.findIndex((stage) => stage.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(filteredStages, oldIndex, newIndex);
    const stageIds = newOrder.map(s => s.id);

    try {
      await reorderStages(stageIds);
      toast({
        title: "Orden actualizado",
        description: "El orden de las columnas ha sido actualizado.",
      });
    } catch (error) {
      toast({
        title: "Error al reordenar",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const startEditing = (stage: Stage) => {
    setEditingStage(stage);
    setNewStageName(stage.name);
    setNewStageDescription(stage.description || '');
    setNewStageColor(stage.color || '#3B82F6');
    setIsCreating(false);
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingStage(null);
    setNewStageName('');
    setNewStageDescription('');
    setNewStageColor('#3B82F6');
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingStage(null);
    setNewStageName('');
    setNewStageDescription('');
    setNewStageColor('#3B82F6');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Gestionar Columnas
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Columnas del Kanban</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Create/Edit Form */}
          {(isCreating || editingStage) && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  {editingStage ? 'Editar Columna' : 'Nueva Columna'}
                </h3>
                <Button variant="ghost" size="sm" onClick={cancelForm}>
                  Cancelar
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage-name">Nombre</Label>
                  <Input
                    id="stage-name"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    placeholder="Ej: En progreso"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stage-color">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="stage-color"
                      type="color"
                      value={newStageColor}
                      onChange={(e) => setNewStageColor(e.target.value)}
                      className="w-12 h-9 p-1 border rounded-lg"
                    />
                    <div 
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: newStageColor }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stage-description">Descripción (opcional)</Label>
                <Input
                  id="stage-description"
                  value={newStageDescription}
                  onChange={(e) => setNewStageDescription(e.target.value)}
                  placeholder="Descripción de la etapa"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={cancelForm}>
                  Cancelar
                </Button>
                <Button 
                  onClick={editingStage ? handleEditStage : handleCreateStage}
                  disabled={!newStageName.trim()}
                >
                  {editingStage ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </div>
          )}

          {/* Add New Stage Button */}
          {!isCreating && !editingStage && (
            <Button onClick={startCreating} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Añadir Nueva Columna
            </Button>
          )}

          {/* Existing Stages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Columnas Existentes</h3>
              <span className="text-xs text-muted-foreground">
                Arrastra para reordenar
              </span>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredStages.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {filteredStages.map((stage) => (
                      <SortableStageItem
                        key={stage.id}
                        stage={stage}
                        onEdit={startEditing}
                        onDelete={handleDeleteStage}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            
            {!loading && filteredStages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay columnas configuradas.</p>
                <p className="text-sm">Crea tu primera columna para comenzar.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
