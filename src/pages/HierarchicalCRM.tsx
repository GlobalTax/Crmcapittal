import { SimplifiedCRMView } from '@/components/unified/SimplifiedCRMView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function HierarchicalCRM() {
  return (
    <ErrorBoundary>
      <SimplifiedCRMView initialTab="leads" />
    </ErrorBoundary>
  );
}