import React, { useEffect, useState } from 'react';
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
  useEffect(() => {
    document.title = 'Pipeline de Deals | CRM M&A';

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', 'Pipeline de deals para mandatos M&A buy-side y sell-side. Gestiona etapas, probabilidades y valores.');

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);
  }, []);
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