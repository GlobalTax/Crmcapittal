import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LeadTaskEngineRecord } from '@/hooks/leads/useLeadTaskEngine';

function hoursUntil(due?: string | null) {
  if (!due) return Infinity;
  const diff = new Date(due).getTime() - Date.now();
  return diff / (1000 * 60 * 60);
}

export const LeadTaskSLA: React.FC<{ task: LeadTaskEngineRecord }> = ({ task }) => {
  const hrs = hoursUntil(task.due_date);
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
  let label = 'SLA';

  if (task.status === 'done') {
    variant = 'outline';
    label = 'Completada';
  } else if (task.sla_breached || hrs < 0) {
    variant = 'destructive';
    label = 'SLA vencido';
  } else if (hrs <= 24) {
    variant = 'default';
    label = `SLA <24h`;
  } else {
    variant = 'secondary';
    label = `SLA ${Math.round(hrs)}h`;
  }

  return <Badge variant={variant} className="whitespace-nowrap">{label}</Badge>;
};

export default LeadTaskSLA;
