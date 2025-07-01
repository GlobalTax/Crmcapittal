
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
      mutations.addBulkOperations(sampleOperations, true);
      setHasCreatedSamples(true);
      // Forzar recarga después de crear las operaciones
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [loading, operations.length, hasCreatedSamples, mutations, refetch, role]);

  // Forzar una recarga adicional para asegurar que se carguen los managers
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

  return { 
    operations, 
    loading, 
    error: error?.message || null, 
    refetch,
    ...mutations
  };
};
