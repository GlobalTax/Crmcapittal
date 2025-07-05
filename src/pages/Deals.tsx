import React, { useState } from 'react';
import { DealsBoard } from '@/components/deals/DealsBoard';
import { NewDealModal } from '@/components/deals/NewDealModal';
import { DealDrawer } from '@/components/deals/DealDrawer';
import { Deal, DealStage } from '@/types/Deal';

const Deals = () => {
  const [newDealModalOpen, setNewDealModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [defaultStage, setDefaultStage] = useState<DealStage>('Lead');

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
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Deals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your sales pipeline
          </p>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <DealsBoard 
          onNewDeal={handleNewDeal}
          onDealClick={handleDealClick}
        />
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