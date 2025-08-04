
import { useQuery } from '@tanstack/react-query';
import { useOperationsMutations } from './operations/useOperationsMutations';
import { useEffect, useState } from 'react';
import { sampleOperations } from '@/utils/createSampleOperations';
import { Operation } from '@/types/Operation';
import { useUserRole } from '@/hooks/useUserRole';
import { fetchOperationsFromDB } from '@/hooks/operations/operationsService';

export const useOperations = () => {
  const { role } = useUserRole();
  const mutations = useOperationsMutations();
  const [hasCreatedSamples, setHasCreatedSamples] = useState(false);

  const { 
    data: operations = [], 
    isLoading: loading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['operations', role],
    queryFn: async () => {
      try {
        const typedOperations = await fetchOperationsFromDB(role);
        return typedOperations;
      } catch (err) {
        console.error('Error cargando operaciones:', err);
        throw new Error('Error al cargar las operaciones');
      }
    },
    enabled: !!role
  });

  // Auto-crear operaciones de ejemplo si la base de datos está vacía
  useEffect(() => {
    if (!loading && operations.length === 0 && !hasCreatedSamples && role) {
      console.log("Base de datos vacía, creando operaciones de ejemplo...");
      addBulkOperations(sampleOperations, true);
      setHasCreatedSamples(true);
      // Forzar recarga después de crear las operaciones
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [loading, operations.length, hasCreatedSamples, role]);

  // Auto-reload para asegurar que se carguen los managers
  useEffect(() => {
    if (!loading && operations.length > 0) {
      const hasManagersAssigned = operations.some(op => op.manager && op.manager.name);
      if (!hasManagersAssigned) {
        console.log("Operaciones sin managers detectadas, forzando recarga...");
        setTimeout(() => {
          refetch();
        }, 500);
      }
    }
  }, [operations, loading, refetch]);

  // Wrapper functions to maintain API compatibility
  const addOperation = async (operationData: any) => {
    try {
      await new Promise<void>((resolve, reject) => {
        mutations.addOperation(operationData, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error)
        });
      });
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const addBulkOperations = async (operationsData: any[], isPublicSample = false) => {
    try {
      await new Promise<void>((resolve, reject) => {
        mutations.addBulkOperations(operationsData, isPublicSample, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error)
        });
      });
      return { data: operationsData, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const updateOperation = async (operationId: string, operationData: Partial<Operation>) => {
    try {
      await new Promise<void>((resolve, reject) => {
        mutations.updateOperation(operationId, operationData, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error)
        });
      });
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const updateOperationStatus = async (operationId: string, newStatus: Operation['status']) => {
    try {
      await new Promise<void>((resolve, reject) => {
        mutations.updateOperationStatus(operationId, newStatus, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error)
        });
      });
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const deleteOperation = async (operationId: string) => {
    try {
      await new Promise<void>((resolve, reject) => {
        mutations.deleteOperation(operationId, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error)
        });
      });
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  const updateTeaserUrl = async (operationId: string, teaserUrl: string) => {
    try {
      await new Promise<void>((resolve, reject) => {
        mutations.updateTeaserUrl(operationId, teaserUrl, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error)
        });
      });
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  };

  return { 
    operations, 
    loading, 
    error: error?.message || null, 
    refetch,
    addOperation,
    addBulkOperations,
    updateOperation,
    updateOperationStatus,
    deleteOperation,
    updateTeaserUrl
  };
};
