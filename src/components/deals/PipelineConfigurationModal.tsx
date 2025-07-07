import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Plus, RotateCcw, GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import { usePipelineConfiguration } from '@/hooks/usePipelineConfiguration';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableStageItemProps {
  stage: {
    id: string;
    name: string;
    color: string;
  };
  isVisible: boolean;
  onToggleVisibility: (stageId: string) => void;
  onDelete?: (stageId: string) => void;
  isCustom?: boolean;
}

const SortableStageItem = ({ stage, isVisible, onToggleVisibility, onDelete, isCustom }: SortableStageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background"
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1 flex items-center gap-3">
        <div 
          className="w-3 h-3 rounded-full border border-border" 
          style={{ backgroundColor: stage.color }}
        />
        <span className="font-medium">{stage.name}</span>
        {isCustom && (
          <Badge variant="outline" className="text-xs">
            Personalizada
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleVisibility(stage.id)}
          className="h-8 w-8 p-0"
        >
          {isVisible ? (
            <Eye className="h-4 w-4 text-green-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        
        {isCustom && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(stage.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const PipelineConfigurationModal = () => {
  const [open, setOpen] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#3B82F6');
  const [showCreateStage, setShowCreateStage] = useState(false);

  const {
    configuration,
    selectedPipelineId,
    dealPipelines,
    stages,
    visibleStages,
    loading,
    changePipeline,
    updateVisibleStages,
    updateStageOrder,
    createCustomStage,
    deleteStage,
    resetConfiguration
  } = usePipelineConfiguration();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stages.findIndex(s => s.id === active.id);
    const newIndex = stages.findIndex(s => s.id === over.id);
    
    const newOrder = arrayMove(stages.map(s => s.id), oldIndex, newIndex);
    await updateStageOrder(newOrder);
  };

  const handleToggleVisibility = async (stageId: string) => {
    const currentVisible = configuration.visibleStages.includes(stageId);
    let newVisible: string[];
    
    if (currentVisible) {
      newVisible = configuration.visibleStages.filter(id => id !== stageId);
    } else {
      newVisible = [...configuration.visibleStages, stageId];
    }

    await updateVisibleStages(newVisible);
  };

  const handleCreateStage = async () => {
    if (!newStageName.trim()) {
      toast.error('El nombre de la etapa es requerido');
      return;
    }

    const result = await createCustomStage({
      name: newStageName.trim(),
      color: newStageColor,
      order_index: stages.length + 1
    });

    if (result.success) {
      toast.success('Etapa personalizada creada exitosamente');
      setNewStageName('');
      setNewStageColor('#3B82F6');
      setShowCreateStage(false);
    } else {
      toast.error(result.error || 'Error al crear la etapa');
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    const result = await deleteStage(stageId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Etapa eliminada exitosamente');
    }
  };

  const handleReset = async () => {
    const result = await resetConfiguration();
    if (result.success) {
      toast.success('Configuración restablecida a valores por defecto');
      setOpen(false);
    } else {
      toast.error(result.error || 'Error al restablecer la configuración');
    }
  };

  const availableColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configurar Pipeline
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración del Pipeline</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pipeline Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Pipeline Activo</Label>
            <Select value={selectedPipelineId} onValueChange={changePipeline}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar pipeline" />
              </SelectTrigger>
              <SelectContent>
                {dealPipelines.map(pipeline => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    <div className="flex flex-col">
                      <span>{pipeline.name}</span>
                      {pipeline.description && (
                        <span className="text-xs text-muted-foreground">
                          {pipeline.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Stages Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Columnas del Pipeline</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateStage(!showCreateStage)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Columna
              </Button>
            </div>

            {/* Create New Stage Form */}
            {showCreateStage && (
              <div className="p-4 border border-border rounded-lg bg-muted/50 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="stage-name" className="text-sm">Nombre de la etapa</Label>
                  <Input
                    id="stage-name"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    placeholder="ej. Análisis técnico, Validación fiscal"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Color</Label>
                  <div className="flex gap-2">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          newStageColor === color ? 'border-foreground' : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewStageColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateStage} size="sm">
                    Crear Etapa
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateStage(false)}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Stages List with Drag & Drop */}
            {stages.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={stages.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {stages.map(stage => (
                      <SortableStageItem
                        key={stage.id}
                        stage={stage}
                        isVisible={configuration.visibleStages.length === 0 || configuration.visibleStages.includes(stage.id)}
                        onToggleVisibility={handleToggleVisibility}
                        onDelete={handleDeleteStage}
                        isCustom={stage.order_index > 4} // Assume first 4 are default stages
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <Separator />

          {/* Reset Button */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Restablecer la configuración a los valores por defecto
              </p>
            </div>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restablecer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};