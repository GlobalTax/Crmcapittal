import { HierarchicalCRMView } from '@/components/unified/HierarchicalCRMView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { RevealSection } from '@/components/ui/RevealSection';

export default function MandatosList() {
  return (
    <ErrorBoundary>
      <div className="space-y-6">

        <RevealSection storageKey="mandatos/hierarchical" defaultCollapsed={true} collapsedLabel="Mostrar tarjetas" expandedLabel="Ocultar tarjetas">
          <HierarchicalCRMView initialLevel="mandates" />
        </RevealSection>
      </div>
    </ErrorBoundary>
  );
}