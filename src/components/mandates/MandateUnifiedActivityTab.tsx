import { BuyingMandate } from '@/types/BuyingMandate';
import { UnifiedTimeline } from '@/components/common/UnifiedTimeline';

interface MandateUnifiedActivityTabProps {
  mandate: BuyingMandate;
}

export const MandateUnifiedActivityTab = ({ mandate }: MandateUnifiedActivityTabProps) => {
  return (
    <UnifiedTimeline
      entityType="mandate"
      entityId={mandate.id}
      title="Timeline de Actividad del Mandato"
      showFilters={true}
      showExport={true}
      maxHeight="700px"
    />
  );
};