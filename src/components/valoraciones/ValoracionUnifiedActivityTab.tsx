import { UnifiedTimeline } from '@/components/common/UnifiedTimeline';

interface ValoracionUnifiedActivityTabProps {
  valoracionId: string;
}

export const ValoracionUnifiedActivityTab = ({ valoracionId }: ValoracionUnifiedActivityTabProps) => {
  return (
    <UnifiedTimeline
      entityType="valoracion"
      entityId={valoracionId}
      title="Timeline de Actividad de Valoración"
      showFilters={true}
      showExport={true}
      maxHeight="700px"
    />
  );
};