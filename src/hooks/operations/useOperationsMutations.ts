
import { useState } from 'react';
import { Operation } from '@/types/Operation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  insertOperation, 
  insertBulkOperations, 
  updateOperationInDB, 
  updateOperationStatusInDB,
  deleteOperationFromDB,
  updateTeaserUrlInDB
} from './operationsService';

export const useOperationsMutations = (setOperations: React.Dispatch<React.SetStateAction<Operation[]>>) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { role } = useUserRole();

  const addOperation = async (operationData: any) => {
    if (!user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    setLoading(true);
    try {
      const newOperation = await insertOperation(operationData, user.id);
      setOperations(prev => [newOperation as Operation, ...prev]);
      return { data: newOperation, error: null };
    } catch (error) {
      console.error('Error adding operation:', error);
      return { data: null, error: 'Error al añadir la operación' };
    } finally {
      setLoading(false);
    }
  };

  const addBulkOperations = async (operationsData: any[], isPublicSample = false) => {
    // Para operaciones de ejemplo públicas, no requerir autenticación
    if (!isPublicSample && !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    setLoading(true);
    try {
      // Si es una muestra pública, usar un usuario ficticio o null
      const userId = isPublicSample ? 'public' : user!.id;
      const newOperations = await insertBulkOperations(operationsData, userId);
      setOperations(prev => [...(newOperations as Operation[]), ...prev]);
      return { data: newOperations, error: null };
    } catch (error) {
      console.error('Error adding bulk operations:', error);
      return { data: null, error: 'Error al añadir las operaciones' };
    } finally {
      setLoading(false);
    }
  };

  const updateOperation = async (operationId: string, operationData: Partial<Operation>) => {
    setLoading(true);
    try {
      const updatedOperation = await updateOperationInDB(operationId, operationData);
      setOperations(prev => 
        prev.map(op => op.id === operationId ? { ...op, ...updatedOperation } as Operation : op)
      );
      return { data: updatedOperation, error: null };
    } catch (error) {
      console.error('Error updating operation:', error);
      return { data: null, error: 'Error al actualizar la operación' };
    } finally {
      setLoading(false);
    }
  };

  const updateOperationStatus = async (operationId: string, newStatus: Operation['status']) => {
    setLoading(true);
    try {
      const updatedOperation = await updateOperationStatusInDB(operationId, newStatus);
      setOperations(prev => 
        prev.map(op => op.id === operationId ? { ...op, status: newStatus } : op)
      );
      return { data: updatedOperation, error: null };
    } catch (error) {
      console.error('Error updating operation status:', error);
      return { data: null, error: 'Error al actualizar el estado' };
    } finally {
      setLoading(false);
    }
  };

  const deleteOperation = async (operationId: string) => {
    setLoading(true);
    try {
      await deleteOperationFromDB(operationId, role);
      setOperations(prev => prev.filter(op => op.id !== operationId));
      return { error: null };
    } catch (error) {
      console.error('Error deleting operation:', error);
      return { error: 'Error al eliminar la operación' };
    } finally {
      setLoading(false);
    }
  };

  const updateTeaserUrl = async (operationId: string, teaserUrl: string) => {
    setLoading(true);
    try {
      const updatedOperation = await updateTeaserUrlInDB(operationId, teaserUrl);
      setOperations(prev => 
        prev.map(op => op.id === operationId ? { ...op, teaser_url: teaserUrl } : op)
      );
      return { data: updatedOperation, error: null };
    } catch (error) {
      console.error('Error updating teaser URL:', error);
      return { data: null, error: 'Error al actualizar el teaser' };
    } finally {
      setLoading(false);
    }
  };

  return {
    addOperation,
    addBulkOperations,
    updateOperation,
    updateOperationStatus,
    deleteOperation,
    updateTeaserUrl,
    loading
  };
};
