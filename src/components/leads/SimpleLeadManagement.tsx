import React, { useState } from 'react';
import { OptimizedLeadWorkflow } from './OptimizedLeadWorkflow';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import { Lead } from '@/types/Lead';

export const SimpleLeadManagement = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const handleDrawerClose = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) {
      setSelectedLead(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Entrada Comercial</h1>
        <div className="flex items-center gap-3">
        </div>
      </div>

      {/* Optimized workflow */}
      <OptimizedLeadWorkflow />

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        open={drawerOpen}
        onOpenChange={handleDrawerClose}
      />
    </div>
  );
};