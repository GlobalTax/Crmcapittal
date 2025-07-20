import { HierarchicalCRMView } from '@/components/unified/HierarchicalCRMView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function BuyingMandates() {
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mandatos de Compra</h1>
            <p className="text-muted-foreground">
              Gestiona los mandatos de búsqueda de empresas para adquisición
            </p>
          </div>
        </div>

        <HierarchicalCRMView initialLevel="mandates" />
      </div>
    </ErrorBoundary>
  );
}