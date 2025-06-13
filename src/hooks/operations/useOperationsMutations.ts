
import { useState } from 'react';
import { Operation } from '@/types/Operation';
import { useAuth } from '@/contexts/AuthContext';
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

  const addOperation = async (operationData: any) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(true);
    try {
      const newOperation = await insertOperation(operationData, user.id);
      setOperations(prev => [newOperation, ...prev]);
      return newOperation;
    } finally {
      setLoading(false);
    }
  };

  const addBulkOperations = async (operationsData: any[], isPublicSample = false) => {
    // Para operaciones de ejemplo públicas, no requerir autenticación
    if (!isPublicSample && !user) {
      throw new Error('Usuario no autenticado');
    }

    setLoading(true);
    try {
      // Si es una muestra pública, usar un usuario ficticio o null
      const userId = isPublicSample ? 'public' : user!.id;
      const newOperations = await insertBulkOperations(operationsData, userId);
      setOperations(prev => [...newOperations, ...prev]);
      return newOperations;
    } finally {
      setLoading(false);
    }
  };

  const updateOperation = async (operationId: string, operationData: Partial<Operation>) => {
    setLoading(true);
    try {
      const updatedOperation = await updateOperationInDB(operationId, operationData);
      setOperations(prev => 
        prev.map(op => op.id === operationId ? { ...op, ...updatedOperation } : op)
      );
      return updatedOperation;
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
      return updatedOperation;
    } finally {
      setLoading(false);
    }
  };

  const deleteOperation = async (operationId: string) => {
    setLoading(true);
    try {
      await deleteOperationFromDB(operationId);
      setOperations(prev => prev.filter(op => op.id !== operationId));
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
      return updatedOperation;
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
