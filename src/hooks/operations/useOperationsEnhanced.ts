import { useMemo, useCallback } from 'react';
import { useOperationsContext } from '@/contexts';

export const useOperationsEnhanced = () => {
  const originalHook = useOperationsContext();

  // Enhanced operations with additional computed fields
  const enhancedOperations = useMemo(() => {
    return originalHook.operations.map(operation => ({
      ...operation,
      isHighValue: operation.amount > 5000000,
      roi: operation.ebitda ? (operation.ebitda / operation.amount) * 100 : 0,
      growthCategory: operation.annual_growth_rate > 15 ? 'high' : 
                     operation.annual_growth_rate > 5 ? 'medium' : 'low'
    }));
  }, [originalHook.operations]);

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

  // Enhanced CRUD operations
  const enhancedMutations = useMemo(() => ({
    addOperation: async (operationData: any) => {
      try {
        await originalHook.createOperation(operationData);
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Error creating operation' };
      }
    },
    
    addBulkOperations: async (operationsData: any[]) => {
      try {
        for (const operation of operationsData) {
          await originalHook.createOperation(operation);
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Error creating operations' };
      }
    },
    
    updateOperation: async (operationId: string, operationData: any) => {
      try {
        await originalHook.updateOperation(operationId, operationData);
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Error updating operation' };
      }
    },
    
    deleteOperation: async (operationId: string) => {
      try {
        await originalHook.deleteOperation(operationId);
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Error deleting operation' };
      }
    }
  }), [originalHook]);

  return {
    ...originalHook,
    operations: enhancedOperations,
    stats,
    filters: {
      filterByValue,
      filterByGrowth,
      filterBySector
    },
    ...enhancedMutations
  };
};