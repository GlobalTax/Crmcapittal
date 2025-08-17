import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ArrowRight, Settings, Calendar, Percent, MoreHorizontal } from 'lucide-react';
import { Stage } from '@/types/Pipeline';
import { useStages } from '@/hooks/useStages';
import { PipelineStageActions } from './PipelineStageActions';
import { PipelineConfigurationManager } from './PipelineConfigurationManager';
import { StageChecklist } from './StageChecklist';
import { usePersistentState } from '@/hooks/usePersistentState';
import { toast } from 'sonner';

interface DynamicPipelineStagesProps {
  pipelineId: string;
  currentStageId?: string;
  leadId?: string;
  onStageChange?: (stageId: string, stageName: string) => void;
  onWin?: () => void;
  onLose?: () => void;
  leadData?: any;
  isUpdating?: boolean;
  showConfiguration?: boolean;
  compactMode?: boolean;
  enableChecklistGate?: boolean;
}

export const DynamicPipelineStages = ({
  pipelineId,
  currentStageId,
  leadId,
  onStageChange,
  onWin,
  onLose,
  leadData,
  isUpdating = false,
  showConfiguration = false,
  compactMode: propCompactMode = false,
  enableChecklistGate = true
}: DynamicPipelineStagesProps) => {
  const { stages, loading, error } = useStages(pipelineId);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [compactMode, setCompactMode] = usePersistentState('pipeline-compact-mode', propCompactMode);
  
  // Función para validar completitud de etapa
  const validateStageCompletion = (currentStage: Stage, leadData?: any): { ok: boolean; reason?: string } => {
    if (!leadData) return { ok: true };

    // Validar required_fields
    if (currentStage.required_fields?.length > 0) {
      for (const field of currentStage.required_fields) {
        if (!leadData[field]) {
          return { ok: false, reason: `Campo requerido '${field}' está vacío` };
        }
      }
    }

    // Validar checklist requerido
    const checklist = currentStage.stage_config?.checklist ?? [];
    const requiredItems = checklist.filter((item: any) => item.required === true);
    
    if (requiredItems.length > 0) {
      const progress = leadData.extra?.stage_checklist?.[currentStage.id] ?? {};
      
      for (const item of requiredItems) {
        if (!progress[item.key]) {
          return { ok: false, reason: `Paso requerido '${item.label}' no completado` };
        }
      }
    }

    return { ok: true };
  };
  
  // Filtrar y ordenar etapas del pipeline actual
  const pipelineStages = stages
    .filter(stage => stage.pipeline_id === pipelineId && stage.is_active)
    .sort((a, b) => a.order_index - b.order_index);

  const currentStageIndex = pipelineStages.findIndex(stage => stage.id === currentStageId);
  const currentStage = pipelineStages[currentStageIndex];

  // Lógica del modo compacto
  const getVisibleStages = () => {
    if (!compactMode) return { visibleStages: pipelineStages, hiddenStages: [] };
    
    if (pipelineStages.length <= 3) {
      return { visibleStages: pipelineStages, hiddenStages: [] };
    }

    let visibleStages: Stage[] = [];
    const hiddenStages: Stage[] = [];
    
    if (currentStageIndex === -1) {
      // Si no hay etapa actual, mostrar las primeras 3
      visibleStages = pipelineStages.slice(0, 3);
      hiddenStages.push(...pipelineStages.slice(3));
    } else if (currentStageIndex === 0) {
      // Primera etapa: mostrar etapas 0, 1, 2
      visibleStages = pipelineStages.slice(0, 3);
      hiddenStages.push(...pipelineStages.slice(3));
    } else if (currentStageIndex === pipelineStages.length - 1) {
      // Última etapa: mostrar las últimas 3
      visibleStages = pipelineStages.slice(-3);
      hiddenStages.push(...pipelineStages.slice(0, -3));
    } else {
      // Etapa intermedia: anterior, actual, siguiente
      visibleStages = pipelineStages.slice(currentStageIndex - 1, currentStageIndex + 2);
      hiddenStages.push(...pipelineStages.slice(0, currentStageIndex - 1));
      hiddenStages.push(...pipelineStages.slice(currentStageIndex + 2));
    }
    
    return { visibleStages, hiddenStages };
  };

  const { visibleStages, hiddenStages } = getVisibleStages();

  const isStageClickable = (stage: Stage) => {
    const stageIndex = pipelineStages.findIndex(s => s.id === stage.id);
    return !isUpdating && 
      (Math.abs(stageIndex - currentStageIndex) <= 1 || currentStageIndex === -1);
  };

  const handleStageClick = (stage: Stage) => {
    if (isUpdating) return;
    
    // Solo permitir avanzar a la siguiente etapa o retroceder una
    const targetIndex = pipelineStages.findIndex(s => s.id === stage.id);
    const canMoveTo = Math.abs(targetIndex - currentStageIndex) <= 1;
    
    if (!canMoveTo && currentStageIndex !== -1) {
      toast.error('Solo puedes avanzar a la siguiente etapa o retroceder una etapa');
      return;
    }

    // Validar checklist requerido antes de avanzar
    if (enableChecklistGate && leadData && currentStage && targetIndex > currentStageIndex) {
      const validation = validateStageCompletion(currentStage, leadData);
      if (!validation.ok) {
        toast.error('Completa los pasos requeridos de esta etapa');
        return;
      }
    }

    if (onStageChange) {
      onStageChange(stage.id, stage.name);
    }
  };

  const handlePreviousStage = () => {
    if (currentStageIndex > 0) {
      const previousStage = pipelineStages[currentStageIndex - 1];
      handleStageClick(previousStage);
    }
  };

  const handleNextStage = () => {
    if (currentStageIndex < pipelineStages.length - 1) {
      // Validar checklist requerido antes de avanzar
      if (enableChecklistGate && leadData && currentStage) {
        const validation = validateStageCompletion(currentStage, leadData);
        if (!validation.ok) {
          toast.error('Completa los pasos requeridos de esta etapa');
          return;
        }
      }
      
      const nextStage = pipelineStages[currentStageIndex + 1];
      handleStageClick(nextStage);
    }
  };

  const getStageStatus = (stage: Stage, index: number) => {
    if (currentStageIndex === -1) return 'inactive';
    if (index < currentStageIndex) return 'completed';
    if (index === currentStageIndex) return 'current';
    return 'upcoming';
  };

  const getStageStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-primary text-primary-foreground';
      case 'current':
        return 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2';
      case 'upcoming':
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error al cargar las etapas del pipeline
      </div>
    );
  }

  if (pipelineStages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No hay etapas configuradas para este pipeline
        </p>
        {showConfiguration && (
          <Button onClick={() => setIsConfigOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar Pipeline
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pipeline Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">Progreso del Pipeline</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="compact-mode" className="text-sm">
                  Modo compacto
                </label>
                <Switch 
                  id="compact-mode"
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                />
              </div>
              {showConfiguration && (
                <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>Configuración del Pipeline</DialogTitle>
                      <DialogDescription>
                        Personaliza las etapas y acciones de tu pipeline
                      </DialogDescription>
                    </DialogHeader>
                    <PipelineConfigurationManager 
                      pipelineId={pipelineId}
                      onClose={() => setIsConfigOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Help text */}
          <p className="text-xs text-muted-foreground mb-3">
            Para avanzar, completa los campos requeridos y los pasos marcados como obligatorios
          </p>

          {/* Progress Visualization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Progreso</span>
              <span>
                {currentStageIndex + 1} de {pipelineStages.length} etapas
              </span>
            </div>
            <Progress 
              value={currentStageIndex >= 0 ? ((currentStageIndex + 1) / pipelineStages.length) * 100 : 0} 
              className="h-2"
            />
          </div>

          {/* Stage Timeline */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-2">
            {visibleStages.map((stage) => {
              const index = pipelineStages.findIndex(s => s.id === stage.id);
              const status = getStageStatus(stage, index);
              const isClickable = isStageClickable(stage);

              return (
                <div key={stage.id} className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${getStageStyles(status)} ${
                      isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    } px-2 py-1 text-xs`}
                    onClick={() => isClickable && handleStageClick(stage)}
                    disabled={isUpdating || !isClickable}
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-1 flex-shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="truncate max-w-24">{stage.name}</span>
                    {stage.probability && (
                      <Badge variant="secondary" className="ml-1 text-xs px-1">
                        {stage.probability}%
                      </Badge>
                    )}
                  </Button>
                  
                  {index < pipelineStages.length - 1 && !compactMode && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                  {index < pipelineStages.length - 1 && compactMode && visibleStages.findIndex(s => s.id === stage.id) < visibleStages.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              );
            })}
            
            {compactMode && hiddenStages.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="px-2 py-1 text-xs ml-1">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-50 bg-background">
                  <DropdownMenuLabel>Otras etapas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {hiddenStages.map((stage) => {
                    const isClickable = isStageClickable(stage);
                    return (
                      <DropdownMenuItem
                        key={stage.id}
                        onClick={() => isClickable && handleStageClick(stage)}
                        disabled={isUpdating || !isClickable}
                        className={!isClickable ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          <span>{stage.name}</span>
                          {stage.probability && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {stage.probability}%
                            </Badge>
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousStage}
              disabled={isUpdating || currentStageIndex <= 0}
            >
              Anterior
            </Button>

            <div className="flex gap-2">
              {onLose && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onLose}
                  disabled={isUpdating}
                >
                  Perdido
                </Button>
              )}
              {onWin && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onWin}
                  disabled={isUpdating}
                >
                  Ganado
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextStage}
              disabled={isUpdating || currentStageIndex >= pipelineStages.length - 1}
            >
              Siguiente
            </Button>
          </div>

          {/* Current Stage Info */}
          {currentStage && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: currentStage.color }}
                />
                <h4 className="font-medium">Etapa Actual: {currentStage.name}</h4>
                {currentStage.probability && (
                  <Badge variant="secondary">
                    <Percent className="h-3 w-3 mr-1" />
                    {currentStage.probability}% probabilidad
                  </Badge>
                )}
              </div>
              {currentStage.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {currentStage.description}
                </p>
              )}
              
              {/* Required Fields */}
              {currentStage.required_fields && currentStage.required_fields.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium mb-1">Campos requeridos:</p>
                  <div className="flex flex-wrap gap-1">
                    {currentStage.required_fields.map((field) => (
                      <Badge key={field} variant="outline">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage Checklist */}
              {leadId && leadData && (
                <div className="mb-3">
                  <StageChecklist 
                    stage={currentStage}
                    leadId={leadId}
                    leadData={leadData}
                    className="mt-2"
                  />
                </div>
              )}

              {/* Stage Actions */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStage(currentStage)}
                >
                  Ver Acciones de Etapa
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage Actions Panel */}
      {selectedStage && (
        <Dialog open={!!selectedStage} onOpenChange={() => setSelectedStage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Acciones de Etapa</DialogTitle>
              <DialogDescription>
                Configura y ejecuta acciones para la etapa {selectedStage.name}
              </DialogDescription>
            </DialogHeader>
            <PipelineStageActions
              stage={selectedStage}
              leadId={leadId}
              context={leadData}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Lead Details */}
      {leadData && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {leadData.estimated_close_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Cierre estimado: {new Date(leadData.estimated_close_date).toLocaleDateString()}</span>
                </div>
              )}
              {leadData.probability && (
                <div className="flex items-center gap-1">
                  <Percent className="h-4 w-4" />
                  <span>Probabilidad: {leadData.probability}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};