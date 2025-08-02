import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OperationService, OperationFilters, PaginationParams } from '@/services';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

interface UseOperationsOptions extends OperationFilters, PaginationParams {}

export const useOperationsService = (options: UseOperationsOptions = {}) => {
  const { role } = useUserRole();
  const queryClient = useQueryClient();

  const {
    data: operations = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['operations', role, options],
    queryFn: async () => {
      const result = await OperationService.getOperations(role, options);
      if (!result.success || result.error) {
        throw new Error(result.error || 'Error al cargar operaciones');
      }
      return result.data || [];
    },
    enabled: !!role,
    staleTime: 5 * 60 * 1000,
  });

  const createOperationMutation = useMutation({
    mutationFn: OperationService.createOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      toast.success('Operación creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear operación');
    },
  });

  return {
    operations,
    isLoading,
    error,
    refetch,
    createOperation: createOperationMutation.mutate,
    isCreating: createOperationMutation.isPending,
  };
};