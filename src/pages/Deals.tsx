import React, { useState } from 'react';
import { DealsBoard } from '@/components/deals/DealsBoard';
import { OpportunitiesTable } from '@/components/deals/OpportunitiesTable';
import { DealsViewToggle } from '@/components/deals/DealsViewToggle';
import { NewDealModal } from '@/components/deals/NewDealModal';
import { DealDrawer } from '@/components/deals/DealDrawer';
import { PipelineConfigurationModal } from '@/components/deals/PipelineConfigurationModal';
import { PipelineSelector } from '@/components/negocios/PipelineSelector';
import { Deal, DealStage } from '@/types/Deal';
import { useDeals } from '@/hooks/useDeals';
import { usePipelineConfiguration } from '@/hooks/usePipelineConfiguration';

const Deals = () => {
  const [newDealModalOpen, setNewDealModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [defaultStage, setDefaultStage] = useState<DealStage>('Lead');
  const [view, setView] = useState<'board' | 'table'>('board');
  const { deals, loading } = useDeals();
  const { selectedPipelineId, changePipeline } = usePipelineConfiguration();

  const handleNewDeal = (stageName?: string) => {
    if (stageName && ['Lead', 'In Progress', 'Won', 'Lost'].includes(stageName)) {
      setDefaultStage(stageName as DealStage);
    }
    setNewDealModalOpen(true);
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">Oportunidades</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona tu pipeline de ventas
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {view === 'board' && (
            <>
              <PipelineSelector
                selectedPipelineId={selectedPipelineId}
                onPipelineChange={changePipeline}
                pipelineType="DEAL"
              />
              <PipelineConfigurationModal />
            </>
          )}
          <DealsViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'board' ? (
          <DealsBoard 
            onNewDeal={handleNewDeal}
            onDealClick={handleDealClick}
          />
        ) : (
          <div className="p-6">
            <OpportunitiesTable 
              deals={deals}
              loading={loading}
              onDealClick={handleDealClick}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <NewDealModal
        open={newDealModalOpen}
        onOpenChange={setNewDealModalOpen}
        defaultStage={defaultStage}
      />
      
      <DealDrawer
        deal={selectedDeal}
        open={!!selectedDeal}
        onOpenChange={(open) => !open && setSelectedDeal(null)}
      />
    </div>
  );
};

export default Deals;