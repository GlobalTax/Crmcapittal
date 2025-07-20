
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import MinimalTransacciones from './MinimalTransacciones';

export default function SellingMandates() {
  return (
    <ErrorBoundary>
      <MinimalTransacciones
        title="Mandatos de Venta"
        description="Gestiona los mandatos de venta de empresas y activos"
      />
    </ErrorBoundary>
  );
}
