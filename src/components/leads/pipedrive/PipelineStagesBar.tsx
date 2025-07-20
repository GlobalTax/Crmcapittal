
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { Lead } from '@/types/Lead';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

interface PipelineStagesBarProps {
  lead: Lead;
  stages: PipelineStage[];
  onStageChange: (stageId: string) => void;
  onWin: () => void;
  onLose: () => void;
}

export const PipelineStagesBar = ({ 
  lead, 
  stages, 
  onStageChange, 
  onWin, 
  onLose 
}: PipelineStagesBarProps) => {
  const currentStageIndex = stages.findIndex(s => s.id === lead.pipeline_stage_id) || 0;

  return (
    <div className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Pipeline Stages */}
        <div className="flex items-center gap-2">
          {stages.map((stage, index) => {
            const isActive = index <= currentStageIndex;
            const isCurrent = stage.id === lead.pipeline_stage_id;
            
            return (
              <button
                key={stage.id}
                onClick={() => onStageChange(stage.id)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${isCurrent 
                    ? 'bg-primary text-primary-foreground' 
                    : isActive 
                      ? 'bg-muted text-foreground hover:bg-muted/80' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }
                `}
              >
                {stage.name}
              </button>
            );
          })}
        </div>

        {/* Win/Lose Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onWin}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Ganado
          </Button>
          <Button
            onClick={onLose}
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Perdido
          </Button>
        </div>
      </div>
    </div>
  );
};
