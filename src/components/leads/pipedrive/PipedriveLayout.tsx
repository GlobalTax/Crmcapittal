
import { useState } from 'react';
import { Lead } from '@/types/Lead';
import { PipedriveHeader } from './PipedriveHeader';
import { PipelineStagesBar } from './PipelineStagesBar';
import { SummarySection } from './SummarySection';
import { FocusSection } from './FocusSection';
import { HistorySection } from './HistorySection';
import { PersonSection } from './PersonSection';
import { PipedriveMainContent } from './PipedriveMainContent';
import { toast } from 'sonner';

interface PipedriveLayoutProps {
  lead: Lead;
}

export const PipedriveLayout = ({ lead }: PipedriveLayoutProps) => {
  // Mock pipeline stages - in real app would come from API
  const stages = [
    { id: '1', name: 'Pipeline', color: '#6B7280', isActive: true },
    { id: '2', name: 'Cualificado', color: '#3B82F6', isActive: true },
    { id: '3', name: 'Propuesta', color: '#F59E0B', isActive: true },
    { id: '4', name: 'Negociación', color: '#EF4444', isActive: true },
    { id: '5', name: 'Ganado', color: '#10B981', isActive: true },
    { id: '6', name: 'Perdido', color: '#6B7280', isActive: true }
  ];

  const currentStage = stages.find(s => s.id === lead.pipeline_stage_id) || stages[0];

  const handleStageChange = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    toast.info(`Cambiar etapa a: ${stage?.name}`);
  };

  const handleWin = () => {
    toast.success('Deal marcado como Ganado');
  };

  const handleLose = () => {
    toast.info('Deal marcado como Perdido');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <PipedriveHeader currentStage={currentStage.name} />
      
      {/* Pipeline Stages Bar */}
      <PipelineStagesBar
        lead={lead}
        stages={stages}
        onStageChange={handleStageChange}
        onWin={handleWin}
        onLose={handleLose}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-border bg-muted/20 overflow-y-auto">
          <div className="p-4 space-y-0">
            <SummarySection lead={lead} />
            <FocusSection lead={lead} />
            <HistorySection lead={lead} />
            <PersonSection lead={lead} />
          </div>
        </div>

        {/* Main Content */}
        <PipedriveMainContent lead={lead} />
      </div>
    </div>
  );
};
