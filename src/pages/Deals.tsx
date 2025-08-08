import React, { useState } from 'react';
import { OptimizedDealsBoard } from '@/components/deals/OptimizedDealsBoard';
import { NewDealModal } from '@/components/deals/NewDealModal';
import { DealDrawer } from '@/components/deals/DealDrawer';
import { Deal, DealStage } from '@/types/Deal';

const Deals = () => {
  const [newDealModalOpen, setNewDealModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [defaultStage, setDefaultStage] = useState<DealStage>('Lead');

  const handleNewDeal = () => {
    setNewDealModalOpen(true);
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  const handleDealEdit = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  return (
    <div className="h-full flex flex-col" data-tour="deals-section">
      {/* Optimized Single Kanban View */}
      <OptimizedDealsBoard 
        onNewDeal={handleNewDeal}
        onDealClick={handleDealClick}
        onDealEdit={handleDealEdit}
      />

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