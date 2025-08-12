import { HierarchicalCRMView } from '@/components/unified/HierarchicalCRMView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function MandatosList() {
  return (
    <ErrorBoundary>
      <div className="space-y-6">

        <HierarchicalCRMView initialLevel="mandates" />
      </div>
    </ErrorBoundary>
  );
}