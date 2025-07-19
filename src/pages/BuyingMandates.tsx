import { HierarchicalCRMView } from '@/components/unified/HierarchicalCRMView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { BuyingMandateTeaserModal } from '@/components/mandates/BuyingMandateTeaserModal';
import { useState } from 'react';

export default function BuyingMandates() {
  const [selectedMandateForTeaser, setSelectedMandateForTeaser] = useState<any>(null);
  const [showTeaserModal, setShowTeaserModal] = useState(false);

  const handleCreateTeaser = (mandate: any) => {
    setSelectedMandateForTeaser(mandate);
    setShowTeaserModal(true);
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