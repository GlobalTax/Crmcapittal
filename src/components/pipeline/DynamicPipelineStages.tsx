import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Settings, Calendar, Percent } from 'lucide-react';
import { Stage } from '@/types/Pipeline';
import { useStages } from '@/hooks/useStages';
import { PipelineStageActions } from './PipelineStageActions';
import { PipelineConfigurationManager } from './PipelineConfigurationManager';
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
  showConfiguration = false
}: DynamicPipelineStagesProps) => {
  const { stages, loading, error } = useStages(pipelineId);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  
  // Filtrar y ordenar etapas del pipeline actual
  const pipelineStages = stages
    .filter(stage => stage.pipeline_id === pipelineId && stage.is_active)
    .sort((a, b) => a.order_index - b.order_index);

  const currentStageIndex = pipelineStages.findIndex(stage => stage.id === currentStageId);
  const currentStage = pipelineStages[currentStageIndex];

  const handleStageClick = (stage: Stage) => {
    if (isUpdating) return;
    
    // Solo permitir avanzar a la siguiente etapa o retroceder una
    const targetIndex = pipelineStages.findIndex(s => s.id === stage.id);
    const canMoveTo = Math.abs(targetIndex - currentStageIndex) <= 1;
    
    if (!canMoveTo && currentStageIndex !== -1) {
      toast.error('Solo puedes avanzar a la siguiente etapa o retroceder una etapa');
      return;
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
    <div className="space-y-6">
      {/* Pipeline Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Progreso del Pipeline</h3>
            {showConfiguration && (
              <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
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
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
            {pipelineStages.map((stage, index) => {
              const status = getStageStatus(stage, index);
              const isClickable = !isUpdating && 
                (Math.abs(index - currentStageIndex) <= 1 || currentStageIndex === -1);

              return (
                <div key={stage.id} className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${getStageStyles(status)} ${
                      isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    }`}
                    onClick={() => isClickable && handleStageClick(stage)}
                    disabled={isUpdating || !isClickable}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="truncate max-w-32">{stage.name}</span>
                    {stage.probability && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {stage.probability}%
                      </Badge>
                    )}
                  </Button>
                  
                  {index < pipelineStages.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePreviousStage}
              disabled={isUpdating || currentStageIndex <= 0}
            >
              Etapa Anterior
            </Button>

            <div className="flex gap-2">
              {onLose && (
                <Button
                  variant="destructive"
                  onClick={onLose}
                  disabled={isUpdating}
                >
                  Marcar como Perdido
                </Button>
              )}
              {onWin && (
                <Button
                  variant="default"
                  onClick={onWin}
                  disabled={isUpdating}
                >
                  Marcar como Ganado
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleNextStage}
              disabled={isUpdating || currentStageIndex >= pipelineStages.length - 1}
            >
              Siguiente Etapa
            </Button>
          </div>

          {/* Current Stage Info */}
          {currentStage && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
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