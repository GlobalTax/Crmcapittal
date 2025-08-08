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
import { useIsClient } from '@/hooks/useIsClient';
import { Skeleton } from '@/components/ui/skeleton';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { usePipelineConfiguration } from '@/hooks/usePipelineConfiguration';

interface DealsBoardProps {
  onNewDeal: (stageName?: string) => void;
  onDealClick?: (deal: Deal) => void;
}

export const DealsBoard = ({ onNewDeal, onDealClick }: DealsBoardProps) => {
  const isClient = useIsClient();
  const { deals, loading, updateDealStage } = useDeals();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  
  // Use pipeline configuration to get dynamic stages
  const { visibleStages, loading: configLoading } = usePipelineConfiguration();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }
    })
  );

  const getDealsByStage = (stageId: string, stageName: string) => {
    // Filter by stage_id first, then fallback to stage name for backward compatibility
    return deals.filter(deal => deal.stage_id === stageId || deal.stage === stageName);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const dealId = active.id as string;
    const newStageId = over.id as string;
    const newStage = visibleStages.find(s => s.id === newStageId);
    
    if (!newStage) return;

    // Find old stage
    const deal = deals.find(d => d.id === dealId);
    const oldStage = visibleStages.find(s => 
      getDealsByStage(s.id, s.name).some(deal => deal.id === dealId)
    );
    
    if (newStageId === oldStage?.id) return;

    try {
      // Update deal with new stage_id and stage name for backward compatibility
      await updateDealStage(dealId, newStage.name);
      
      // Announce the move for accessibility
      if (deal) {
        const announcement = `Deal '${deal.title}' moved to ${newStage.name}`;
        
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

  if (!isClient) {
    return (
      <div className="grid auto-cols-[280px] grid-flow-col gap-6 overflow-x-auto px-8 py-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-8" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (loading || configLoading) {
    return (
      <div className="grid auto-cols-[280px] grid-flow-col gap-6 overflow-x-auto px-8 py-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-8" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-24 w-full rounded-lg" />
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
          {visibleStages.map((stage) => (
            <SortableContext
              key={stage.id}
              id={stage.id}
              items={getDealsByStage(stage.id, stage.name).map(d => d.id)}
              strategy={verticalListSortingStrategy}
            >
              <StageColumn
                stage={{
                  id: stage.id,
                  name: stage.name,
                  color: stage.color
                }}
                deals={getDealsByStage(stage.id, stage.name)}
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