import { HierarchicalCRMView } from '@/components/unified/HierarchicalCRMView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function SellingMandates() {
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mandatos de Venta</h1>
            <p className="text-muted-foreground">
              Gestiona los mandatos de venta de empresas y activos
            </p>
          </div>
        </div>

        <HierarchicalCRMView initialLevel="mandates" />
      </div>
    </ErrorBoundary>
  );
}