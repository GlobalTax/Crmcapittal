
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { useProposals } from '@/hooks/useProposals';
import { ProposalWizard } from '@/components/proposals/ProposalWizard';
import { ProposalStatusTabs } from '@/components/proposals/ProposalStatusTabs';
import { StatusInlineStats } from '@/components/proposals/StatusInlineStats';
import { CompactProposalsList } from '@/components/proposals/CompactProposalsList';
import { QuickTemplateDropdown } from '@/components/proposals/QuickTemplateDropdown';

export default function Proposals() {
  const { proposals, loading, createProposal } = useProposals();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState('draft');

  const handleCreateProposal = async (data: any) => {
    await createProposal(data);
  };

  const handleTemplateSelect = (templateId: string) => {
    // Open wizard with template pre-selected
    setIsWizardOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Cargando propuestas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Ultra-Compact Header */}
      <div className="bg-white border-b border-slate-100 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Propuestas</h1>
            <p className="text-sm text-slate-500">
              Pipeline de propuestas organizado por estado
            </p>
          </div>
          <QuickTemplateDropdown onTemplateSelect={handleTemplateSelect} />
        </div>
      </div>

      {/* Status-based Tabs with Counters */}
      <ProposalStatusTabs
        proposals={proposals}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
      />

      {/* Status-specific inline stats */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <StatusInlineStats proposals={proposals} status={activeStatus} />
        </CardContent>
      </Card>

      {/* Ultra-compact 4-column list */}
      <CompactProposalsList proposals={proposals} status={activeStatus} />

      {/* Wizard Dialog */}
      <ProposalWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleCreateProposal}
      />
    </div>
  );
}
