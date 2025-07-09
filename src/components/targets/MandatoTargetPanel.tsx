import { useParams } from 'react-router-dom';
import { HierarchicalCRMView } from '@/components/unified/HierarchicalCRMView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function MandatoTargetPanel() {
  const { id } = useParams<{ id: string }>();

  return (
    <ErrorBoundary>
      <HierarchicalCRMView 
        initialLevel="targets" 
        mandateId={id}
        mandateType="compra" 
      />
    </ErrorBoundary>
  );
}