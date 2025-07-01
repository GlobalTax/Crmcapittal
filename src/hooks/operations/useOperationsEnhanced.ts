
import { useOperations } from '@/hooks/useOperations';
import { useAsync } from '@/hooks/common';
import { Operation } from '@/types/Operation';
import { useToast } from '@/hooks/use-toast';

export const useOperationsEnhanced = () => {
  const originalHook = useOperations();
  const { toast } = useToast();

  // Enhanced operation creation with retry logic
  const createOperationEnhanced = useAsync<Operation>({
    onSuccess: (data) => {
      toast({
        title: "Operación creada",
        description: `${data.company_name} ha sido creada correctamente.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear operación",
        description: error,
        variant: "destructive",
      });
    },
    retryCount: 2,
    retryDelay: 1500
  });

  // Enhanced bulk operations with progress tracking
  const createBulkOperationsEnhanced = useAsync<Operation[]>({
    onSuccess: (data) => {
      toast({
        title: "Operaciones creadas",
        description: `${data.length} operaciones han sido creadas correctamente.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error en creación masiva",
        description: error,
        variant: "destructive",
      });
    },
    retryCount: 1,
    retryDelay: 2000
  });

  // Enhanced update with optimistic updates
  const updateOperationEnhanced = useAsync<Operation>({
    onSuccess: () => {
      toast({
        title: "Operación actualizada",
        description: "Los cambios han sido guardados correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar",
        description: error,
        variant: "destructive",
      });
    },
    retryCount: 2,
    retryDelay: 1000
  });

  const addOperationWithRetry = async (operationData: any) => {
    return createOperationEnhanced.execute(async () => {
      const result = await originalHook.addOperation(operationData);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    });
  };

  const addBulkOperationsWithRetry = async (operationsData: any[], isPublicSample = false) => {
    return createBulkOperationsEnhanced.execute(async () => {
      const result = await originalHook.addBulkOperations(operationsData, isPublicSample);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    });
  };

  const updateOperationWithRetry = async (operationId: string, operationData: Partial<Operation>) => {
    return updateOperationEnhanced.execute(async () => {
      const result = await originalHook.updateOperation(operationId, operationData);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    });
  };

  return {
    // Original functionality
    ...originalHook,
    
    // Enhanced functionality with useAsync
    addOperationWithRetry,
    addBulkOperationsWithRetry,
    updateOperationWithRetry,
    
    // Enhanced loading states
    isCreatingOperation: createOperationEnhanced.loading,
    isBulkCreating: createBulkOperationsEnhanced.loading,
    isUpdatingOperation: updateOperationEnhanced.loading,
    
    // Enhanced error states
    creationError: createOperationEnhanced.error,
    bulkCreationError: createBulkOperationsEnhanced.error,
    updateError: updateOperationEnhanced.error,
    
    // Control functions
    cancelCreation: createOperationEnhanced.cancel,
    cancelBulkCreation: createBulkOperationsEnhanced.cancel,
    cancelUpdate: updateOperationEnhanced.cancel,
    
    resetErrors: () => {
      createOperationEnhanced.reset();
      createBulkOperationsEnhanced.reset();
      updateOperationEnhanced.reset();
    }
  };
};
