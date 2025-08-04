import { useMemo, useCallback } from 'react';
import { useOperationsStore } from '../stores/operationsStore';

export const useOperationsEnhanced = () => {
  const store = useOperationsStore();

  // Enhanced operations with additional computed fields
  const enhancedOperations = useMemo(() => {
    return store.operations.map(operation => ({
      ...operation,
      isHighValue: operation.amount > 5000000,
      roi: operation.ebitda ? (operation.ebitda / operation.amount) * 100 : 0,
      growthCategory: operation.annual_growth_rate > 15 ? 'high' : 
                     operation.annual_growth_rate > 5 ? 'medium' : 'low'
    }));
  }, [store.operations]);

  // Memoized filters
  const filterByValue = useCallback((minValue: number) => {
    return enhancedOperations.filter(op => op.amount >= minValue);
  }, [enhancedOperations]);

  const filterByGrowth = useCallback((minGrowth: number) => {
    return enhancedOperations.filter(op => op.annual_growth_rate >= minGrowth);
  }, [enhancedOperations]);

  const filterBySector = useCallback((sector: string) => {
    return enhancedOperations.filter(op => 
      op.sector?.toLowerCase().includes(sector.toLowerCase())
    );
  }, [enhancedOperations]);

  // Enhanced statistics
  const stats = useMemo(() => {
    const totalValue = enhancedOperations.reduce((sum, op) => sum + op.amount, 0);
    const avgValue = enhancedOperations.length > 0 ? totalValue / enhancedOperations.length : 0;
    const highValueCount = enhancedOperations.filter(op => op.isHighValue).length;
    const avgGrowthRate = enhancedOperations.length > 0 
      ? enhancedOperations.reduce((sum, op) => sum + op.annual_growth_rate, 0) / enhancedOperations.length 
      : 0;

    return {
      totalValue,
      avgValue,
      highValueCount,
      avgGrowthRate,
      totalOperations: enhancedOperations.length
    };
  }, [enhancedOperations]);

  return {
    ...store,
    operations: enhancedOperations,
    stats,
    filters: {
      filterByValue,
      filterByGrowth,
      filterBySector
    }
  };
};