import { Lead } from '@/types/Lead';
import { UnifiedTimeline } from '@/components/common/UnifiedTimeline';

interface LeadUnifiedActivityTabProps {
  lead: Lead;
}

export const LeadUnifiedActivityTab = ({ lead }: LeadUnifiedActivityTabProps) => {
  return (
    <UnifiedTimeline
      entityType="lead"
      entityId={lead.id}
      title="Timeline de Actividad del Lead"
      showFilters={true}
      showExport={true}
      maxHeight="700px"
    />
  );
};