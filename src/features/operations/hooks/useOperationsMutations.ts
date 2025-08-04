import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Operation } from '../types/Operation';
import { useAuth } from '@/stores/useAuthStore';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  insertOperation, 
  insertBulkOperations, 
  updateOperationInDB, 
  updateOperationStatusInDB,
  deleteOperationFromDB,
  updateTeaserUrlInDB
} from '../services/operationsService';
import { toast } from 'sonner';

interface MutationCallbacks {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useOperationsMutations = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const queryClient = useQueryClient();

  const addOperationMutation = useMutation({
    mutationFn: async (operationData: any) => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      return await insertOperation(operationData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      toast.success('Operación creada correctamente');
    },
    onError: (error) => {
      console.error('Error adding operation:', error);
      toast.error('Error al añadir la operación');
    }
  });

  const addBulkOperationsMutation = useMutation({
    mutationFn: async ({ operationsData, isPublicSample }: { operationsData: any[], isPublicSample?: boolean }) => {
      if (!isPublicSample && !user) {
        throw new Error('Usuario no autenticado');
      }
      const userId = isPublicSample ? 'public' : user!.id;
      return await insertBulkOperations({ operations: operationsData });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      toast.success(`${data.length} operaciones creadas correctamente`);
    },
    onError: (error) => {
      console.error('Error adding bulk operations:', error);
      toast.error('Error al añadir las operaciones');
    }
  });

  const updateOperationMutation = useMutation({
    mutationFn: async ({ operationId, operationData }: { operationId: string, operationData: Partial<Operation> }) => {
      console.log('Mutation updateOperation llamada con:', { operationId, operationData });
      return await updateOperationInDB(operationId, operationData);
    },
    onSuccess: (data, variables) => {
      console.log('Operación actualizada en DB:', data);
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      toast.success('Operación actualizada correctamente');
    },
    onError: (error) => {
      console.error('Error updating operation:', error);
      toast.error('Error al actualizar la operación');
    }
  });

  const updateOperationStatusMutation = useMutation({
    mutationFn: async ({ operationId, newStatus }: { operationId: string, newStatus: Operation['status'] }) => {
      return await updateOperationStatusInDB(operationId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      toast.success('Estado actualizado correctamente');
    },
    onError: (error) => {
      console.error('Error updating operation status:', error);
      toast.error('Error al actualizar el estado');
    }
  });

  const deleteOperationMutation = useMutation({
    mutationFn: async (operationId: string) => {
      return await deleteOperationFromDB(operationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      toast.success('Operación eliminada correctamente');
    },
    onError: (error) => {
      console.error('Error deleting operation:', error);
      toast.error('Error al eliminar la operación');
    }
  });

  const updateTeaserUrlMutation = useMutation({
    mutationFn: async ({ operationId, teaserUrl }: { operationId: string, teaserUrl: string }) => {
      return await updateTeaserUrlInDB(operationId, teaserUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      toast.success('Teaser actualizado correctamente');
    },
    onError: (error) => {
      console.error('Error updating teaser URL:', error);
      toast.error('Error al actualizar el teaser');
    }
  });

  return {
    addOperation: (operationData: any, callbacks?: MutationCallbacks) => {
      addOperationMutation.mutate(operationData, {
        onSuccess: callbacks?.onSuccess,
        onError: callbacks?.onError
      });
    },
    addBulkOperations: (operationsData: any[], isPublicSample = false, callbacks?: MutationCallbacks) => {
      addBulkOperationsMutation.mutate({ operationsData, isPublicSample }, {
        onSuccess: callbacks?.onSuccess,
        onError: callbacks?.onError
      });
    },
    updateOperation: (operationId: string, operationData: Partial<Operation>, callbacks?: MutationCallbacks) => {
      updateOperationMutation.mutate({ operationId, operationData }, {
        onSuccess: callbacks?.onSuccess,
        onError: callbacks?.onError
      });
    },
    updateOperationStatus: (operationId: string, newStatus: Operation['status'], callbacks?: MutationCallbacks) => {
      updateOperationStatusMutation.mutate({ operationId, newStatus }, {
        onSuccess: callbacks?.onSuccess,
        onError: callbacks?.onError
      });
    },
    deleteOperation: (operationId: string, callbacks?: MutationCallbacks) => {
      deleteOperationMutation.mutate(operationId, {
        onSuccess: callbacks?.onSuccess,
        onError: callbacks?.onError
      });
    },
    updateTeaserUrl: (operationId: string, teaserUrl: string, callbacks?: MutationCallbacks) => {
      updateTeaserUrlMutation.mutate({ operationId, teaserUrl }, {
        onSuccess: callbacks?.onSuccess,
        onError: callbacks?.onError
      });
    },
    loading: addOperationMutation.isPending || 
             addBulkOperationsMutation.isPending || 
             updateOperationMutation.isPending || 
             updateOperationStatusMutation.isPending || 
             deleteOperationMutation.isPending || 
             updateTeaserUrlMutation.isPending
  };
};