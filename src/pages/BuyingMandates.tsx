import { HierarchicalCRMView } from '@/components/unified/HierarchicalCRMView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { BuyingMandateTeaserModal } from '@/components/mandates/BuyingMandateTeaserModal';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BuyingMandates() {
  const navigate = useNavigate();
  const [selectedMandateForTeaser, setSelectedMandateForTeaser] = useState<any>(null);
  const [showTeaserModal, setShowTeaserModal] = useState(false);

  const handleCreateTeaser = (mandate: any) => {
    setSelectedMandateForTeaser(mandate);
    setShowTeaserModal(true);
  };

  const handleViewEnhancedDetail = (mandateId: string) => {
    navigate(`/mandatos/${mandateId}/vista-detallada`);
  };

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
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                // Navigate to a sample mandate with enhanced view
                // In a real app, this would be based on selected mandate
                handleViewEnhancedDetail('sample-id');
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Vista Detallada
            </Button>
          </div>
        </div>

        <HierarchicalCRMView initialLevel="mandates" />

        {selectedMandateForTeaser && (
          <BuyingMandateTeaserModal
            mandate={selectedMandateForTeaser}
            open={showTeaserModal}
            onOpenChange={(open) => {
              setShowTeaserModal(open);
              if (!open) setSelectedMandateForTeaser(null);
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}