import { Lead } from '@/types/Lead';
import { PipedriveHeader } from './PipedriveHeader';
import { DynamicPipelineStages } from '@/components/pipeline/DynamicPipelineStages';
import { SummarySection } from './SummarySection';
import { PersonSection } from './PersonSection';
import { TeamAssignmentSection } from './TeamAssignmentSection';
import { PipedriveMainContent } from './PipedriveMainContent';
import { useStages } from '@/hooks/useStages';
import { useUpdateLead } from '@/hooks/leads/useUpdateLead';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LeadClosureActionDialog } from '../LeadClosureActionDialog';
import { useUiLayout } from '@/state/useUiLayout';
import { cn } from '@/lib/utils';
import { useLeadStageAutomations } from '@/hooks/leads/useLeadStageAutomations';
import { PipelineConfigurationManager } from '@/components/pipeline/PipelineConfigurationManager';
import { ensureDefaultPipeline } from '@/services/pipelineService';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PipedriveLayoutProps {
  lead: Lead;
}

export const PipedriveLayout = ({ lead }: PipedriveLayoutProps) => {
  const { stages, loading: stagesLoading, refetch: refetchStages } = useStages('LEAD');
  const { updateStage, markWon, markLost, isUpdating } = useUpdateLead();
  const [closureOpen, setClosureOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [defaultPipelineId, setDefaultPipelineId] = useState<string | null>(null);
  const { focusMode } = useUiLayout();
  const { runForStageChange, runForWin, runForLose } = useLeadStageAutomations();

  const currentStage = stages.find(s => s.id === lead.pipeline_stage_id) || stages[0];

  // Ensure default pipeline exists and get its ID
  useEffect(() => {
    const setupPipeline = async () => {
      const pipelineId = await ensureDefaultPipeline('LEAD', 'Pipeline de Leads', 'Pipeline por defecto para gestión de leads');
      setDefaultPipelineId(pipelineId);
    };
    setupPipeline();
  }, []);

  const handleStageChange = (stageId: string, stageName: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (stage) {
      updateStage({
        leadId: lead.id,
        stageId,
        stageName: stage.name,
      });
      // Automatizaciones mínimas por etapa
      runForStageChange(lead, stage.name);
    }
  };

  const handleConfigurationSave = () => {
    refetchStages();
    setConfigOpen(false);
  };

  const handleWin = () => {
    markWon({
      leadId: lead.id,
      dealValue: lead.deal_value,
    });
    // Crear mandato/entidad de ejecución
    runForWin(lead);
  };

  const handleLose = () => {
    markLost({
      leadId: lead.id,
      lostReason: 'Marcado manualmente como perdido',
    });
    runForLose(lead);
  };

  if (stagesLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="safe-app-height min-h-0 flex flex-col bg-background">
      {/* Header */}
      <PipedriveHeader 
        currentStage={currentStage?.name || 'Pipeline'} 
        onCreateFromLead={() => setClosureOpen(true)}
        onOpenConfiguration={() => setConfigOpen(true)}
      />
      
      {/* Dynamic Pipeline Stages */}
      {defaultPipelineId && (
        <DynamicPipelineStages
          pipelineId={defaultPipelineId}
          currentStageId={lead.pipeline_stage_id}
          leadId={lead.id}
          onStageChange={handleStageChange}
          onWin={handleWin}
          onLose={handleLose}
          leadData={lead}
          isUpdating={isUpdating}
          showConfiguration={true}
        />
      )}

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

      {/* Pipeline Configuration Dialog */}
      {configOpen && defaultPipelineId && (
        <Dialog open={configOpen} onOpenChange={setConfigOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Configurar Pipeline de Leads</DialogTitle>
              <DialogDescription>
                Personaliza las etapas, acciones y automatizaciones del pipeline
              </DialogDescription>
            </DialogHeader>
            <PipelineConfigurationManager
              pipelineId={defaultPipelineId}
              onClose={() => {
                setConfigOpen(false);
                refetchStages();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};