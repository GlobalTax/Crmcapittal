import { Lead } from '@/types/Lead';
import { LeadTasksList } from '../LeadTasksList';
import { LeadTaskEngineList } from '../LeadTaskEngineList';

interface LeadTasksTabProps {
  lead: Lead;
}

export const LeadTasksTab = ({ lead }: LeadTasksTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tareas del Lead</h3>
      </div>
      
      <LeadTasksList leadId={lead.id} />
      <LeadTaskEngineList leadId={lead.id} />
    </div>
  );
};