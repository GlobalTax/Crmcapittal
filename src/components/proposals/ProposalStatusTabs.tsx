import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Proposal } from '@/types/Proposal';

interface ProposalStatusTabsProps {
  proposals: Proposal[];
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

export const ProposalStatusTabs: React.FC<ProposalStatusTabsProps> = ({
  proposals,
  activeStatus,
  onStatusChange
}) => {
  // Calculate counts by status
  const statusCounts = proposals.reduce((acc, proposal) => {
    acc[proposal.status] = (acc[proposal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusTabs = [
    {
      value: 'draft',
      label: 'Borradores',
      count: statusCounts.draft || 0
    },
    {
      value: 'sent',
      label: 'Enviadas',
      count: statusCounts.sent || 0
    },
    {
      value: 'in_review',
      label: 'En Revisión',
      count: statusCounts.in_review || 0
    },
    {
      value: 'approved',
      label: 'Aprobadas',
      count: statusCounts.approved || 0
    },
    {
      value: 'rejected',
      label: 'Rechazadas',
      count: statusCounts.rejected || 0
    }
  ];

  return (
    <Tabs value={activeStatus} onValueChange={onStatusChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-background border border-border">
        {statusTabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-background rounded-none py-3"
          >
            <span className="font-medium">{tab.label}</span>
            <Badge 
              variant="secondary" 
              className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full"
            >
              {tab.count}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};