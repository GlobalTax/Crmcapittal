import { HierarchicalCRMView } from '@/components/unified/HierarchicalCRMView';
import { SectionErrorBoundary } from '@/components/errors/SectionErrorBoundary';

export default function MandatosList() {
  return (
    <SectionErrorBoundary section="Mandatos">
      <div className="space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Mandatos</h1>
        </div>

        <HierarchicalCRMView initialLevel="mandates" />
      </div>
    </SectionErrorBoundary>
  );
}
