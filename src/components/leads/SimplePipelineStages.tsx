import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowRight, Percent, Calendar, Settings } from 'lucide-react';
import { PipelineStage } from '@/hooks/leads/usePipelineStages';
import { PipelineConfigurationManager } from '@/components/pipeline/PipelineConfigurationManager';
import { toast } from 'sonner';

interface SimplePipelineStagesProps {
  stages: PipelineStage[];
  currentStageId?: string;
  leadId?: string;
  onStageChange?: (stageId: string, stageName: string) => void;
  onWin?: () => void;
  onLose?: () => void;
  leadData?: any;
  isUpdating?: boolean;
  showConfiguration?: boolean;
}

export const SimplePipelineStages = ({
  stages,
  currentStageId,
  onStageChange,
  onWin,
  onLose,
  leadData,
  isUpdating = false,
  showConfiguration = false
}: SimplePipelineStagesProps) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const currentStageIndex = stages.findIndex(stage => stage.id === currentStageId);
  const currentStage = stages[currentStageIndex];

  const handleStageClick = (stage: PipelineStage) => {
    if (isUpdating) return;
    
    // Solo permitir avanzar a la siguiente etapa o retroceder una
    const targetIndex = stages.findIndex(s => s.id === stage.id);
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
      const previousStage = stages[currentStageIndex - 1];
      handleStageClick(previousStage);
    }
  };

  const handleNextStage = () => {
    if (currentStageIndex < stages.length - 1) {
      const nextStage = stages[currentStageIndex + 1];
      handleStageClick(nextStage);
    }
  };

  const getStageStatus = (index: number) => {
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

  if (stages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No hay etapas configuradas para este pipeline
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Progreso del Pipeline</h3>
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
                    Crea y personaliza el pipeline de leads con la plantilla simplificada
                  </DialogDescription>
                </DialogHeader>
                <PipelineConfigurationManager 
                  pipelineId="leads-pipeline"
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
              {currentStageIndex + 1} de {stages.length} etapas
            </span>
          </div>
          <Progress 
            value={currentStageIndex >= 0 ? ((currentStageIndex + 1) / stages.length) * 100 : 0} 
            className="h-2"
          />
        </div>

        {/* Stage Timeline */}
        <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-2">
          {stages.map((stage, index) => {
            const status = getStageStatus(index);
            const isClickable = !isUpdating && 
              (Math.abs(index - currentStageIndex) <= 1 || currentStageIndex === -1);

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
                </Button>
                
                {index < stages.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            );
          })}
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
            disabled={isUpdating || currentStageIndex >= stages.length - 1}
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
            </div>
          </div>
        )}

        {/* Lead Details */}
        {leadData && (
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
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
        )}
      </CardContent>
    </Card>
  );
};