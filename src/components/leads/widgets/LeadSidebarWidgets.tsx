import React from 'react';
import { Lead } from '@/types/Lead';
import { LeadScoreWidget } from './LeadScoreWidget';
import { NextActionWidget } from './NextActionWidget';

interface LeadSidebarWidgetsProps {
  lead: Lead;
}

export const LeadSidebarWidgets = ({ lead }: LeadSidebarWidgetsProps) => {
  return (
    <div className="space-y-4">
      <LeadScoreWidget score={lead.lead_score || 0} />
      <NextActionWidget nextActionDate={lead.next_action_date} />
    </div>
  );
};