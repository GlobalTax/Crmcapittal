import { UnifiedTimeline } from '@/components/common/UnifiedTimeline';

interface ReconversionUnifiedActivityTabProps {
  reconversionId: string;
}

export const ReconversionUnifiedActivityTab = ({ reconversionId }: ReconversionUnifiedActivityTabProps) => {
  return (
    <UnifiedTimeline
      entityType="reconversion"
      entityId={reconversionId}
      title="Timeline de Actividad de Reconversión"
      showFilters={true}
      showExport={true}
      maxHeight="700px"
    />
  );
};