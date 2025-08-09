
import { Lead } from '@/types/Lead';
import { PipedriveHeader } from './PipedriveHeader';
import { PipelineStagesBar } from './PipelineStagesBar';
import { SummarySection } from './SummarySection';
import { PersonSection } from './PersonSection';
import { TeamAssignmentSection } from './TeamAssignmentSection';
import { PipedriveMainContent } from './PipedriveMainContent';
import { usePipelineStages } from '@/hooks/leads/usePipelineStages';
import { useUpdateLead } from '@/hooks/leads/useUpdateLead';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { LeadClosureActionDialog } from '../LeadClosureActionDialog';
import { useUiLayout } from '@/state/useUiLayout';
import { cn } from '@/lib/utils';
interface PipedriveLayoutProps {
  lead: Lead;
}

export const PipedriveLayout = ({ lead }: PipedriveLayoutProps) => {
  const { data: stages = [], isLoading: stagesLoading } = usePipelineStages();
  const { updateStage, markWon, markLost, isUpdating } = useUpdateLead();
  const [closureOpen, setClosureOpen] = useState(false);
  const { focusMode } = useUiLayout();

  const currentStage = stages.find(s => s.id === lead.pipeline_stage_id) || stages[0];

  const handleStageChange = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (stage) {
      updateStage({
        leadId: lead.id,
        stageId,
        stageName: stage.name,
      });
    }
  };

  const handleWin = () => {
    markWon({
      leadId: lead.id,
      dealValue: lead.deal_value,
    });
  };

  const handleLose = () => {
    markLost({
      leadId: lead.id,
      lostReason: 'Marcado manualmente como perdido',
    });
  };

  if (stagesLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <PipedriveHeader currentStage={currentStage?.name || 'Pipeline'} onCreateFromLead={() => setClosureOpen(true)} />
      
      {/* Pipeline Stages Bar */}
      <PipelineStagesBar
        lead={lead}
        stages={stages.map(stage => ({
          id: stage.id,
          name: stage.name,
          color: stage.color,
          isActive: stage.is_active,
        }))}
        onStageChange={handleStageChange}
        onWin={handleWin}
        onLose={handleLose}
        isUpdating={isUpdating}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex">
        {/* Left Sidebar */}
        <aside className={cn("w-80 border-r border-border bg-muted/20 overflow-y-auto min-h-0", focusMode && "hidden md:hidden")}> 
          <div className="p-4 space-y-0">
            <SummarySection lead={lead} />
            <TeamAssignmentSection lead={lead} />
            <PersonSection lead={lead} />
          </div>
        </aside>

      {/* Main Content */}
      <PipedriveMainContent lead={lead} />
    </div>

    {/* Dialogo de cierre/creación desde lead */}
    <LeadClosureActionDialog
      isOpen={closureOpen}
      onClose={() => setClosureOpen(false)}
      lead={lead}
      onCreateFromLead={() => Promise.resolve({ success: true })}
    />
  </div>
  );
};
