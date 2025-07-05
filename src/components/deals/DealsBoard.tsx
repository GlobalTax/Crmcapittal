import React, { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Deal } from '@/types/Deal';
import { StageColumn } from './StageColumn';
import { useDeals } from '@/hooks/useDeals';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

interface DealsBoardProps {
  onNewDeal: (stageName?: string) => void;
  onDealClick?: (deal: Deal) => void;
}

const STAGES = [
  { name: 'Lead', color: '#1E88E5' },
  { name: 'In Progress', color: '#FFB300' },
  { name: 'Won', color: '#00C48C' },
  { name: 'Lost', color: '#EF5350' }
];

export const DealsBoard = ({ onNewDeal, onDealClick }: DealsBoardProps) => {
  const { deals, loading, updateDealStage } = useDeals();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }
    })
  );

  const getDealsByStage = (stageName: string) => {
    return deals.filter(deal => deal.stage === stageName);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const dealId = active.id as string;
    const newStage = over.id as string;
    const oldStage = STAGES.find(stage => 
      getDealsByStage(stage.name).some(deal => deal.id === dealId)
    )?.name;
    
    if (newStage === oldStage) return;

    try {
      await updateDealStage(dealId, newStage);
      
      // Announce the move for accessibility
      const deal = deals.find(d => d.id === dealId);
      if (deal) {
        const announcement = `Deal '${deal.title}' moved to ${newStage}`;
        
        // Create aria-live announcement
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        liveRegion.textContent = announcement;
        
        document.body.appendChild(liveRegion);
        setTimeout(() => document.body.removeChild(liveRegion), 1000);
        
        toast({
          title: "Deal moved",
          description: announcement,
        });
      }
    } catch (error) {
      console.error('Error moving deal:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid auto-cols-[280px] grid-flow-col gap-6 overflow-x-auto px-8 py-6">
        {STAGES.map((stage) => (
          <div key={stage.name} className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-8" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full">
      <VisuallyHidden id="DndDescribedBy">
        Arrastra para mover el deal entre columnas
      </VisuallyHidden>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <div className="grid auto-cols-[280px] grid-flow-col gap-6 overflow-x-auto px-8 py-6 h-full">
          {STAGES.map((stage) => (
            <SortableContext
              key={stage.name}
              id={stage.name}
              items={getDealsByStage(stage.name).map(d => d.id)}
              strategy={verticalListSortingStrategy}
            >
              <StageColumn
                stage={stage}
                deals={getDealsByStage(stage.name)}
                onNewDeal={onNewDeal}
                onDealClick={onDealClick}
              />
            </SortableContext>
          ))}
        </div>
      </DndContext>
    </div>
  );
};