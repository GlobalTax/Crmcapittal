import { useParams, useNavigate } from 'react-router-dom';
import { HierarchicalCRMView } from '@/components/unified/HierarchicalCRMView';
import { SectionErrorBoundary } from '@/components/errors/SectionErrorBoundary';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function MandatoDashboardView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <SectionErrorBoundary section="Mandatos">
      <div className="min-h-screen bg-neutral-0 flex flex-col">
        {/* Breadcrumb Navigation */}
        <div className="bg-background border-b border-border px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/mandatos')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mandatos
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <HierarchicalCRMView 
            initialLevel="mandates" 
            mandateId={id}
          />
        </div>
      </div>
    </SectionErrorBoundary>
  );
}
