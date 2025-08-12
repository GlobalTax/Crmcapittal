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