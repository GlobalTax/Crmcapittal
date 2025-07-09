import { LeadControlCenter } from '@/components/leads/LeadControlCenter';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function LeadsEntryPanel() {
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Captación Comercial</h1>
            <p className="text-muted-foreground">
              Gestiona leads y oportunidades comerciales
            </p>
          </div>
        </div>

        <LeadControlCenter />
      </div>
    </ErrorBoundary>
  );
}