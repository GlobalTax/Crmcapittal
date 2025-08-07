import React, { useState, useMemo } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import { Deal } from '@/types/Deal';
import { OptimizedStageColumn } from './OptimizedStageColumn';
import { OptimizedDealCard } from './OptimizedDealCard';
import { OptimizedDealsHeader } from './OptimizedDealsHeader';
import { useDeals } from '@/hooks/useDeals';
import { useToast } from '@/hooks/use-toast';
import { usePipelineConfiguration } from '@/hooks/usePipelineConfiguration';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedDealsBoardProps {
  onNewDeal: () => void;
  onDealClick?: (deal: Deal) => void;
  onDealEdit?: (deal: Deal) => void;
}

export const OptimizedDealsBoard = ({ 
  onNewDeal, 
  onDealClick, 
  onDealEdit 
}: OptimizedDealsBoardProps) => {
  const { deals, loading, updateDealStage } = useDeals();
  const { visibleStages, loading: configLoading } = usePipelineConfiguration();
  const { toast } = useToast();
  
  // Filters and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState('this-month');
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  );

  // Filter deals based on search and filters
  const filteredDeals = useMemo(() => {
    let filtered = deals;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(search) ||
        deal.company?.name.toLowerCase().includes(search) ||
        deal.owner?.name.toLowerCase().includes(search)
      );
    }

    // Owner filter
    if (selectedOwner !== 'all') {
      if (selectedOwner === 'me') {
        // In real implementation, compare with auth.uid()
        filtered = filtered.filter(deal => deal.ownerId === 'current_user_id');
      } else if (selectedOwner === 'unassigned') {
        filtered = filtered.filter(deal => !deal.ownerId);
      }
    }

    // Quick filters
    quickFilters.forEach(filter => {
      switch (filter) {
        case 'mine':
          filtered = filtered.filter(deal => deal.ownerId === 'current_user_id');
          break;
        case 'closing-soon':
          // Filter deals with close date within next 30 days
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          filtered = filtered.filter(deal => {
            // Mock close date logic
            return deal.probability > 50;
          });
          break;
        case 'high-priority':
          filtered = filtered.filter(deal => deal.probability >= 70);
          break;
        case 'no-activity':
          // Mock logic for deals with no recent activity
          filtered = filtered.filter(deal => deal.probability < 30);
          break;
      }
    });

    return filtered;
  }, [deals, searchTerm, selectedOwner, quickFilters]);

  const getDealsByStage = (stageId: string, stageName: string) => {
    return filteredDeals.filter(deal => 
      deal.stage_id === stageId || deal.stage === stageName
    );
  };

  const handleQuickFilterToggle = (filter: string) => {
    setQuickFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    const dealId = event.active.id as string;
    const deal = deals.find(d => d.id === dealId);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    setActiveDeal(null);
    
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const dealId = active.id as string;
    const newStageId = over.id as string;
    const newStage = visibleStages.find(s => s.id === newStageId);
    
    if (!newStage) return;

    const deal = deals.find(d => d.id === dealId);
    const oldStage = visibleStages.find(s => 
      getDealsByStage(s.id, s.name).some(deal => deal.id === dealId)
    );
    
    if (newStageId === oldStage?.id) return;

    try {
      await updateDealStage(dealId, newStage.name);
      
      if (deal) {
        toast({
          title: "Deal movido",
          description: `${deal.title} movido a ${newStage.name}`,
        });
      }
    } catch (error) {
      console.error('Error moving deal:', error);
      toast({
        title: "Error",
        description: "No se pudo mover el deal",
        variant: "destructive"
      });
    }
  };

  if (loading || configLoading) {
    return (
      <div className="h-full flex flex-col">
        {/* Header Skeleton */}
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-16 w-24" />
              <Skeleton className="h-16 w-24" />
              <Skeleton className="h-16 w-24" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        {/* Board Skeleton */}
        <div className="flex-1 flex gap-4 p-6 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-80 flex-shrink-0">
              <Skeleton className="h-20 w-full mb-4 rounded-lg" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Optimized Header */}
      <OptimizedDealsHeader
        onNewDeal={onNewDeal}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedOwner={selectedOwner}
        onOwnerChange={setSelectedOwner}
        quickFilters={quickFilters}
        onQuickFilterToggle={handleQuickFilterToggle}
        timePeriod={timePeriod}
        onTimePeriodChange={setTimePeriod}
      />

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <div className="h-full flex gap-4 p-6 overflow-x-auto">
            {visibleStages.map((stage) => (
              <OptimizedStageColumn
                key={stage.id}
                stage={{
                  id: stage.id,
                  name: stage.name,
                  color: stage.color
                }}
                deals={getDealsByStage(stage.id, stage.name)}
                onNewDeal={() => onNewDeal()}
                onDealClick={onDealClick}
                onDealEdit={onDealEdit}
              />
            ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeDeal && (
              <div className="transform rotate-3 opacity-90">
                <OptimizedDealCard
                  deal={activeDeal}
                  index={0}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Auto-refresh indicator */}
      <div className="px-6 py-2 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Actualización automática cada 60s • {filteredDeals.length} deals mostrados
        </p>
      </div>
    </div>
  );
};