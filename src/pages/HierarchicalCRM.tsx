import { HierarchicalCRMView } from '@/components/unified/HierarchicalCRMView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function HierarchicalCRM() {
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión Integral CRM</h1>
            <p className="text-muted-foreground">
              Navega entre Leads, Empresas, Mandatos y Targets de forma jerárquica
            </p>
          </div>
        </div>

        <HierarchicalCRMView initialLevel="leads" />
      </div>
    </ErrorBoundary>
  );
}