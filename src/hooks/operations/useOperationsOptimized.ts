
import { useMemo, useEffect } from 'react';
import { Operation } from '@/types/Operation';
import { useOperationsContext } from '@/contexts';
import { useOperationsPagination } from './useOperationsPagination';
import { useOperationsFilter } from '@/hooks/useOperationsFilter';

export interface FilterState {
  search: string;
  sector: string;
  operationType: string;
  location: string;
  amountRange: [number, number];
  revenueRange: [number, number];
  growthRate: number;
  dateRange: string;
  status: string;
}

export const useOperationsOptimized = (filters: FilterState, pageSize: number = 12) => {
  const { operations, loading, error, ...mutations } = useOperationsContext();
  
  // Aplicar filtros (memoizado)
  const filteredOperations = useOperationsFilter(operations, filters);
  
  // Aplicar paginación
  const {
    paginatedOperations,
    paginationConfig,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination
  } = useOperationsPagination(filteredOperations, pageSize);

  // Estadísticas memoizadas
  const stats = useMemo(() => {
    const total = operations.length;
    const available = operations.filter(op => op.status === 'available').length;
    const totalValue = operations.reduce((sum, op) => sum + op.amount, 0);
    const avgValue = total > 0 ? totalValue / total : 0;
    
    return {
      total,
      available,
      filtered: filteredOperations.length,
      totalValue,
      avgValue
    };
  }, [operations, filteredOperations.length]);

  // Resetear paginación cuando cambian los filtros
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'search') return value !== '';
      if (key === 'amountRange') return value[0] !== 0 || value[1] !== 100;
      if (key === 'revenueRange') return value[0] !== 0 || value[1] !== 100;
      if (key === 'growthRate') return value !== 0;
      return value !== '';
    });
  }, [filters]);

  // Auto-reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [hasActiveFilters, resetPagination]);

  return {
    // Datos
    operations: paginatedOperations,
    allOperations: operations,
    filteredOperations,
    loading,
    error,
    stats,
    
    // Paginación
    paginationConfig,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
    
    // Estado
    hasActiveFilters,
    
    // Mutaciones
    ...mutations
  };
};
