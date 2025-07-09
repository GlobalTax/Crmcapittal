import { useParams } from 'react-router-dom';
import { MandateTargetPipeline as Pipeline } from '@/components/mandates/MandateTargetPipeline';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function MandateTargetPipeline() {
  const { id } = useParams<{ id: string }>();

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pipeline de Targets</h1>
            <p className="text-muted-foreground">
              Gestión del pipeline de empresas objetivo
            </p>
          </div>
        </div>

        <Pipeline targets={[]} documents={[]} onTargetClick={() => {}} />
      </div>
    </ErrorBoundary>
  );
}