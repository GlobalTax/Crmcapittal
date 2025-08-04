/**
 * Operations Query Hook
 * 
 * React Query hook for fetching operations with caching and optimizations
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Operation } from '../types';
import { useUserRole } from '@/hooks/useUserRole';
import { OperationService } from '../services/OperationService';

export const useOperationsQuery = () => {
  const { role } = useUserRole();
  const queryClient = useQueryClient();

  const operationsQuery = useQuery({
    queryKey: ['operations', role],
    queryFn: async (): Promise<Operation[]> => {
      if (!role) {
        return [];
      }
      return await OperationService.fetchOperations(role);
    },
    enabled: !!role,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  const invalidateOperations = () => {
    queryClient.invalidateQueries({ queryKey: ['operations'] });
  };

  const prefetchOperations = () => {
    if (role) {
      queryClient.prefetchQuery({
        queryKey: ['operations', role],
        queryFn: () => OperationService.fetchOperations(role),
        staleTime: 5 * 60 * 1000,
      });
    }
  };

  return {
    operations: operationsQuery.data || [],
    loading: operationsQuery.isLoading,
    error: operationsQuery.error?.message || null,
    refetch: operationsQuery.refetch,
    invalidateOperations,
    prefetchOperations,
    isStale: operationsQuery.isStale,
    isFetching: operationsQuery.isFetching
  };
};