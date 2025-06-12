
import { Operation } from '@/types/Operation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  insertOperation, 
  updateOperationInDB, 
  updateOperationStatusInDB, 
  deleteOperationFromDB, 
  updateTeaserUrlInDB 
} from './operationsService';

export const useOperationsMutations = (
  setOperations: React.Dispatch<React.SetStateAction<Operation[]>>
) => {
  const { user } = useAuth();

  const addOperation = async (operationData: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">) => {
    try {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const data = await insertOperation(operationData, user.id);

      if (data) {
        const typedOperation: Operation = {
          ...data,
          operation_type: data.operation_type as Operation['operation_type'],
          status: data.status as Operation['status']
        };
        setOperations(prev => [typedOperation, ...prev]);
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error añadiendo operación:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Error al añadir la operación' 
      };
    }
  };

  const updateOperation = async (operationId: string, operationData: Partial<Operation>) => {
    try {
      const data = await updateOperationInDB(operationId, operationData);

      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { 
              ...op, 
              ...operationData, 
              operation_type: data.operation_type as Operation['operation_type'],
              status: data.status as Operation['status'],
              updated_at: data.updated_at 
            }
          : op
      ));

      return { data, error: null };
    } catch (err) {
      console.error('Error actualizando operación:', err);
      return { data: null, error: 'Error al actualizar la operación' };
    }
  };

  const updateOperationStatus = async (operationId: string, newStatus: Operation['status']) => {
    try {
      const data = await updateOperationStatusInDB(operationId, newStatus);

      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: newStatus, updated_at: data.updated_at }
          : op
      ));

      return { data, error: null };
    } catch (err) {
      console.error('Error actualizando estado de operación:', err);
      return { data: null, error: 'Error al actualizar el estado de la operación' };
    }
  };

  const deleteOperation = async (operationId: string) => {
    try {
      await deleteOperationFromDB(operationId);
      setOperations(prev => prev.filter(op => op.id !== operationId));
      return { error: null };
    } catch (err) {
      console.error('Error eliminando operación:', err);
      return { error: 'Error al eliminar la operación' };
    }
  };

  const updateTeaserUrl = async (operationId: string, teaserUrl: string) => {
    try {
      const data = await updateTeaserUrlInDB(operationId, teaserUrl);

      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, teaser_url: teaserUrl, updated_at: data.updated_at }
          : op
      ));

      return { data, error: null };
    } catch (err) {
      console.error('Error actualizando URL del teaser:', err);
      return { data: null, error: 'Error al actualizar el teaser' };
    }
  };

  return {
    addOperation,
    updateOperation,
    updateOperationStatus,
    deleteOperation,
    updateTeaserUrl
  };
};
