import { SimpleLeadManagement } from '@/components/leads/SimpleLeadManagement';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function LeadsEntryPanel() {
  return (
    <ErrorBoundary>
      <SimpleLeadManagement />
    </ErrorBoundary>
  );
}