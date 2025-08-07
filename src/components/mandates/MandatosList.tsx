import { HierarchicalCRMView } from '@/components/unified/HierarchicalCRMView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function MandatosList() {
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Mandatos</h1>
        </div>

        <HierarchicalCRMView initialLevel="mandates" />
      </div>
    </ErrorBoundary>
  );
}