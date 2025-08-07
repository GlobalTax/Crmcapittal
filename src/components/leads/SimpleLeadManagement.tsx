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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Entrada Comercial</h1>
        <p className="text-muted-foreground">
          Workflow inteligente para gestión optimizada de leads
        </p>
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