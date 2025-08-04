import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Operation } from '../types/Operation';
import { useUserRole } from '@/hooks/useUserRole';
import { fetchOperationsFromDB } from '../services/operationsService';

export const useOperationsQuery = () => {
  const { role } = useUserRole();
  const queryClient = useQueryClient();

  const operationsQuery = useQuery({
    queryKey: ['operations', role],
    queryFn: async (): Promise<Operation[]> => {
      if (!role) {
        return [];
      }
      return await fetchOperationsFromDB(role);
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
        queryFn: () => fetchOperationsFromDB(role),
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