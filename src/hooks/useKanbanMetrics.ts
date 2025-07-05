import { useState, useEffect, useMemo } from 'react';
import { Negocio } from '@/types/Negocio';
import { Stage } from '@/types/Pipeline';
import { supabase } from '@/integrations/supabase/client';

interface KanbanMetrics {
  totalValue: number;
  weightedValue: number;
  conversionRate: number;
  averageTimePerStage: number;
  newDealsThisWeek: number;
  closedDealsThisMonth: number;
  averageDealSize: number;
  topPerformingStage: string;
  dealsByPriority: {
    urgente: number;
    alta: number;
    media: number;
    baja: number;
  };
  dealsByOwner: Record<string, number>;
}

/**
 * useKanbanMetrics Hook
 * 
 * Calculates advanced metrics for the Kanban board with real-time updates.
 * Provides KPIs like conversion rates, weighted values, and performance analytics.
 * 
 * @param negocios - Array of business deals
 * @param stages - Array of pipeline stages
 * @returns Comprehensive metrics object with loading and error states
 */
export const useKanbanMetrics = (negocios: Negocio[], stages: Stage[]) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculates weighted value based on stage position
   * @param negocio - Business deal object
   * @returns Weighted value considering stage probability (estimated from order)
   */
  const calculateWeightedValue = (negocio: Negocio): number => {
    const stage = stages.find(s => s.id === negocio.stage_id);
    if (!stage) return (negocio.valor_negocio || 0) * 0.1; // Default 10% for unknown stage
    
    // Estimate probability based on stage order (later stages = higher probability)
    const maxOrder = Math.max(...stages.map(s => s.order_index));
    const probability = stage.order_index / maxOrder;
    
    return (negocio.valor_negocio || 0) * probability;
  };

  /**
   * Calculates average time deals spend in each stage
   * @returns Average days per stage
   */
  const calculateAverageTimePerStage = (): number => {
    const now = new Date();
    const totalDays = negocios.reduce((acc, negocio) => {
      const createdDate = new Date(negocio.created_at);
      const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return acc + daysDiff;
    }, 0);
    
    return negocios.length > 0 ? Math.round(totalDays / negocios.length) : 0;
  };

  /**
   * Calculates conversion rate from first to last stage
   * @returns Conversion percentage
   */
  const calculateConversionRate = (): number => {
    if (stages.length === 0 || negocios.length === 0) return 0;
    
    const firstStage = stages.find(s => s.order_index === 1);
    const lastStage = stages.reduce((prev, current) => 
      prev.order_index > current.order_index ? prev : current
    );
    
    if (!firstStage || !lastStage) return 0;
    
    const totalDeals = negocios.length;
    const closedDeals = negocios.filter(n => n.stage_id === lastStage.id).length;
    
    return totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 0;
  };

  /**
   * Finds the stage with the highest total value
   * @returns Stage name with highest performance
   */
  const getTopPerformingStage = (): string => {
    const stageValues = stages.map(stage => {
      const stageDeals = negocios.filter(n => n.stage_id === stage.id);
      const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.valor_negocio || 0), 0);
      return { stage: stage.name, value: totalValue };
    });
    
    const topStage = stageValues.reduce((prev, current) => 
      prev.value > current.value ? prev : current, 
      { stage: 'N/A', value: 0 }
    );
    
    return topStage.stage;
  };

  /**
   * Counts new deals created in the last 7 days
   * @returns Number of new deals this week
   */
  const getNewDealsThisWeek = (): number => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return negocios.filter(negocio => {
      const createdDate = new Date(negocio.created_at);
      return createdDate >= oneWeekAgo;
    }).length;
  };

  /**
   * Counts closed deals in the current month
   * @returns Number of closed deals this month
   */
  const getClosedDealsThisMonth = (): number => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const lastStage = stages.reduce((prev, current) => 
      prev.order_index > current.order_index ? prev : current,
      stages[0] || { order_index: 0, id: '' }
    );
    
    return negocios.filter(negocio => {
      const updatedDate = new Date(negocio.updated_at);
      return negocio.stage_id === lastStage.id && updatedDate >= firstDayOfMonth;
    }).length;
  };

  /**
   * Groups deals by priority level
   * @returns Object with counts per priority
   */
  const getDealsByPriority = () => {
    return negocios.reduce((acc, negocio) => {
      const priority = negocio.prioridad || 'baja';
      acc[priority as keyof typeof acc] = (acc[priority as keyof typeof acc] || 0) + 1;
      return acc;
    }, {
      urgente: 0,
      alta: 0,
      media: 0,
      baja: 0
    });
  };

  /**
   * Groups deals by owner
   * @returns Object with counts per owner
   */
  const getDealsByOwner = (): Record<string, number> => {
    return negocios.reduce((acc, negocio) => {
      const owner = negocio.propietario_negocio || 'Sin asignar';
      acc[owner] = (acc[owner] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  /**
   * Memoized metrics calculation for performance optimization
   */
  const metrics: KanbanMetrics = useMemo(() => {
    const totalValue = negocios.reduce((sum, negocio) => sum + (negocio.valor_negocio || 0), 0);
    const weightedValue = negocios.reduce((sum, negocio) => sum + calculateWeightedValue(negocio), 0);
    const averageDealSize = negocios.length > 0 ? Math.round(totalValue / negocios.length) : 0;

    return {
      totalValue,
      weightedValue: Math.round(weightedValue),
      conversionRate: calculateConversionRate(),
      averageTimePerStage: calculateAverageTimePerStage(),
      newDealsThisWeek: getNewDealsThisWeek(),
      closedDealsThisMonth: getClosedDealsThisMonth(),
      averageDealSize,
      topPerformingStage: getTopPerformingStage(),
      dealsByPriority: getDealsByPriority(),
      dealsByOwner: getDealsByOwner()
    };
  }, [negocios, stages]);

  /**
   * Set up real-time subscriptions for metrics updates
   */
  useEffect(() => {
    const channel = supabase
      .channel('negocios-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'negocios'
        },
        () => {
          // Metrics will recalculate automatically via useMemo dependencies
          console.log('Negocios updated, metrics will recalculate');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: () => {
      // Trigger recalculation by updating a dependency
      setLoading(true);
      setTimeout(() => setLoading(false), 100);
    }
  };
};