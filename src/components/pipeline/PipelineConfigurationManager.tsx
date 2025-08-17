import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, GripVertical, Edit, Trash2, Settings, Save, X, Download, Loader2, Filter } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Stage } from '@/types/Pipeline';
import { StageAction } from '@/types/StageAction';
import { useStages } from '@/hooks/useStages';
import { useStageActions } from '@/hooks/useStageActions';
import { createSampleLeadsPipeline, checkIfLeadsPipelineExists } from '@/utils/seedLeadsPipeline';
import { toast } from 'sonner';

interface PipelineConfigurationManagerProps {
  pipelineId: string;
  onClose?: () => void;
}

interface StageFormData {
  name: string;
  description: string;
  color: string;
  order_index: number;
  stage_config: any;
  required_fields: string[];
  validation_rules: any[];
}

interface ChecklistItem {
  key: string;
  label: string;
  required?: boolean;
}

// Utility function to create slugs from labels
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const PipelineConfigurationManager = ({ pipelineId, onClose }: PipelineConfigurationManagerProps) => {
  const { stages, loading, createStage, updateStage, deleteStage, reorderStages, refetch } = useStages(pipelineId);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);
  const [stageForm, setStageForm] = useState<StageFormData>({
    name: '',
    description: '',
    color: '#3B82F6',
    order_index: 0,
    stage_config: {},
    required_fields: [],
    validation_rules: []
  });

  const pipelineStages = stages.filter(stage => stage.pipeline_id === pipelineId);

  const resetForm = () => {
    setStageForm({
      name: '',
      description: '',
      color: '#3B82F6',
      order_index: pipelineStages.length,
      stage_config: { checklist: [] },
      required_fields: [],
      validation_rules: []
    });
    setIsEditing(false);
  };

  const handleEditStage = (stage: Stage) => {
    const stageConfig = stage.stage_config || {};
    setStageForm({
      name: stage.name,
      description: stage.description || '',
      color: stage.color,
      order_index: stage.order_index,
      stage_config: {
        ...stageConfig,
        checklist: stageConfig.checklist || []
      },
      required_fields: stage.required_fields || [],
      validation_rules: stage.validation_rules || []
    });
    setSelectedStage(stage);
    setIsEditing(true);
    setIsStageDialogOpen(true);
  };

  const handleCreateStage = () => {
    resetForm();
    setSelectedStage(null);
    setIsStageDialogOpen(true);
  };

  const handleSaveStage = async () => {
    try {
      if (isEditing && selectedStage) {
        await updateStage(selectedStage.id, stageForm);
        toast.success('Etapa actualizada exitosamente');
      } else {
        await createStage({
          ...stageForm,
          pipeline_id: pipelineId,
          is_active: true
        });
        toast.success('Etapa creada exitosamente');
      }
      setIsStageDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving stage:', error);
      toast.error(`Error al guardar etapa: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta etapa?')) {
      try {
        await deleteStage(stageId);
        toast.success('Etapa eliminada exitosamente');
      } catch (error) {
        console.error('Error deleting stage:', error);
      }
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(pipelineStages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order_index for all stages
    const stageIds = items.map(item => item.id);
    try {
      await reorderStages(stageIds);
      toast.success('Orden actualizado exitosamente');
    } catch (error) {
      console.error('Error reordering stages:', error);
    }
  };

  const handleCreateLeadsTemplate = async () => {
    setIsCreatingTemplate(true);
    try {
      console.log('🔄 Iniciando creación de plantilla de leads...');
      
      // Verificar si existe pipeline LEAD
      const exists = await checkIfLeadsPipelineExists();
      console.log('📊 Pipeline existente:', exists);
      
      if (exists) {
        toast.info('Ya existe un pipeline de leads activo');
        console.log('ℹ️ Pipeline ya existe, cancelando creación');
        return;
      }
      
      // Crear pipeline con plantilla simplificada
      console.log('🚀 Creando nuevo pipeline de leads...');
      const result = await createSampleLeadsPipeline();
      console.log('✅ Resultado de creación:', result);
      
      if (result.success) {
        toast.success(`✅ ${result.message}`);
        console.log('🔄 Actualizando vista...');
        // Refetch stages para mostrar los nuevos datos
        await refetch();
        console.log('✨ Vista actualizada correctamente');
      } else {
        console.error('❌ Error en resultado:', result.message);
        toast.error(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('💥 Error creating leads template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`💥 Error al crear la plantilla: ${errorMessage}`);
    } finally {
      setIsCreatingTemplate(false);
      console.log('🏁 Proceso de creación de plantilla finalizado');
    }
  };

  const handleApplySimplePreset = async () => {
    setIsApplyingPreset(true);
    try {
      const simpleStageNames = ['nuevo', 'contactado', 'cualificado', 'propuesta', 'negociación', 'ganado', 'perdido'];
      
      for (const stage of pipelineStages) {
        const isVisible = simpleStageNames.includes(stage.name.toLowerCase());
        await updateStage(stage.id, { is_active: isVisible });
      }
      
      toast.success('Preset simple aplicado');
      await refetch();
    } catch (error) {
      console.error('Error applying preset:', error);
      toast.error('Error al aplicar preset simple');
    } finally {
      setIsApplyingPreset(false);
    }
  };

  // Checklist handlers
  const handleAddChecklistItem = () => {
    const newItem: ChecklistItem = {
      key: `item-${Date.now()}`,
      label: '',
      required: false
    };
    
    const updatedChecklist = [...(stageForm.stage_config.checklist || []), newItem];
    setStageForm(prev => ({
      ...prev,
      stage_config: {
        ...prev.stage_config,
        checklist: updatedChecklist
      }
    }));
  };

  const handleUpdateChecklistItem = (index: number, field: keyof ChecklistItem, value: any) => {
    const updatedChecklist = [...(stageForm.stage_config.checklist || [])];
    updatedChecklist[index] = {
      ...updatedChecklist[index],
      [field]: value
    };
    
    // Auto-generate key when label changes
    if (field === 'label' && value.trim()) {
      updatedChecklist[index].key = slugify(value);
    }
    
    setStageForm(prev => ({
      ...prev,
      stage_config: {
        ...prev.stage_config,
        checklist: updatedChecklist
      }
    }));
  };

  const handleRemoveChecklistItem = (index: number) => {
    const updatedChecklist = [...(stageForm.stage_config.checklist || [])];
    updatedChecklist.splice(index, 1);
    
    setStageForm(prev => ({
      ...prev,
      stage_config: {
        ...prev.stage_config,
        checklist: updatedChecklist
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuración de Pipeline</h2>
          <p className="text-muted-foreground">
            Personaliza las etapas y acciones de tu pipeline
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={handleCreateLeadsTemplate}
            disabled={isCreatingTemplate}
          >
            {isCreatingTemplate ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isCreatingTemplate ? 'Creando...' : 'Usar plantilla mínima (LEAD)'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleApplySimplePreset}
            disabled={isApplyingPreset}
          >
            {isApplyingPreset ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Filter className="h-4 w-4 mr-2" />
            )}
            {isApplyingPreset ? 'Aplicando...' : 'Aplicar preset simple (LEADS)'}
          </Button>
          <Button onClick={handleCreateStage}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Etapa
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Etapas del Pipeline</CardTitle>
          <CardDescription>
            Arrastra y suelta para reordenar. Haz clic en una etapa para configurar sus acciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="stages">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {pipelineStages
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((stage, index) => (
                      <Draggable key={stage.id} draggableId={stage.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`
                              flex items-center gap-3 p-4 border rounded-lg bg-card
                              ${snapshot.isDragging ? 'shadow-lg' : ''}
                            `}
                          >
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            
                            <div 
                              className="w-4 h-4 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: stage.color }}
                            />
                            
                            <div className="flex-1">
                              <h4 className="font-medium">{stage.name}</h4>
                              {stage.description && (
                                <p className="text-sm text-muted-foreground">
                                  {stage.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary">
                                  Orden: {stage.order_index + 1}
                                </Badge>
                                {stage.required_fields && stage.required_fields.length > 0 && (
                                  <Badge variant="outline">
                                    {stage.required_fields.length} campos requeridos
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStage(stage)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditStage(stage)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteStage(stage.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Stage Dialog */}
      <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Etapa' : 'Nueva Etapa'}
            </DialogTitle>
            <DialogDescription>
              Configura los detalles de la etapa
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="validation">Validación</TabsTrigger>
              <TabsTrigger value="config">Configuración</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={stageForm.name}
                    onChange={(e) => setStageForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre de la etapa"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={stageForm.color}
                    onChange={(e) => setStageForm(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={stageForm.description}
                  onChange={(e) => setStageForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción de la etapa"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="validation" className="space-y-4">
              <div>
                <Label>Campos Requeridos</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Campos que deben completarse antes de avanzar a la siguiente etapa
                </p>
                <Textarea
                  value={stageForm.required_fields.join('\n')}
                  onChange={(e) => setStageForm(prev => ({ 
                    ...prev, 
                    required_fields: e.target.value.split('\n').filter(f => f.trim()) 
                  }))}
                  placeholder="nombre&#10;email&#10;telefono"
                  rows={4}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="config" className="space-y-4">
              {/* Checklist Editor */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label>Checklist de la etapa</Label>
                    <p className="text-sm text-muted-foreground">
                      Lista de pasos o tareas que se deben completar en esta etapa
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddChecklistItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir paso
                  </Button>
                </div>
                
                {stageForm.stage_config.checklist && stageForm.stage_config.checklist.length > 0 ? (
                  <div className="space-y-3">
                    {stageForm.stage_config.checklist.map((item: ChecklistItem, index: number) => (
                      <div key={`${item.key}-${index}`} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1 grid grid-cols-1 gap-2">
                          <Input
                            placeholder="Descripción del paso"
                            value={item.label}
                            onChange={(e) => handleUpdateChecklistItem(index, 'label', e.target.value)}
                          />
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`required-${index}`}
                              checked={item.required || false}
                              onCheckedChange={(checked) => handleUpdateChecklistItem(index, 'required', checked)}
                            />
                            <Label 
                              htmlFor={`required-${index}`} 
                              className="text-sm font-normal cursor-pointer"
                            >
                              Campo obligatorio
                            </Label>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveChecklistItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground border rounded-lg border-dashed">
                    No hay pasos definidos. Haz clic en "Añadir paso" para comenzar.
                  </div>
                )}
              </div>
              
              {/* Separator */}
              <div className="border-t my-6"></div>
              
              {/* Advanced JSON Configuration */}
              <div>
                <Label>Configuración Avanzada (JSON)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Configuración técnica avanzada en formato JSON
                </p>
                <Textarea
                  value={JSON.stringify(stageForm.stage_config, null, 2)}
                  onChange={(e) => {
                    try {
                      const config = JSON.parse(e.target.value);
                      setStageForm(prev => ({ ...prev, stage_config: config }));
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  placeholder="{}"
                  rows={6}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStageDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveStage}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stage Actions Panel */}
      {selectedStage && (
        <StageActionsPanel 
          stage={selectedStage} 
          onClose={() => setSelectedStage(null)}
        />
      )}
    </div>
  );
};

interface StageActionsPanelProps {
  stage: Stage;
  onClose: () => void;
}

const StageActionsPanel = ({ stage, onClose }: StageActionsPanelProps) => {
  const { actions, loading, createStageAction, updateStageAction, deleteStageAction } = useStageActions(stage.id);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Acciones de: {stage.name}</CardTitle>
            <CardDescription>
              Configura las acciones que se ejecutarán en esta etapa
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsActionDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Acción
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay acciones configuradas para esta etapa
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action) => (
              <div key={action.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge variant={
                  action.action_type === 'automatic' ? 'default' :
                  action.action_type === 'manual' ? 'secondary' : 'outline'
                }>
                  {action.action_type}
                </Badge>
                <div className="flex-1">
                  <h5 className="font-medium">{action.action_name}</h5>
                  {action.is_required && (
                    <Badge variant="destructive" className="text-xs">
                      Requerida
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteStageAction(action.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};