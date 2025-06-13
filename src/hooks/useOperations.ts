
import { useOperationsData } from './operations/useOperationsData';
import { useOperationsMutations } from './operations/useOperationsMutations';
import { useEffect, useState } from 'react';
import { sampleOperations } from '@/utils/createSampleOperations';

export const useOperations = () => {
  const { operations, setOperations, loading, error, refetch } = useOperationsData();
  const mutations = useOperationsMutations(setOperations);
  const [hasCreatedSamples, setHasCreatedSamples] = useState(false);

  // Auto-crear operaciones de ejemplo si la base de datos está vacía
  useEffect(() => {
    if (!loading && operations.length === 0 && !hasCreatedSamples) {
      console.log("Base de datos vacía, creando operaciones de ejemplo...");
      // Usar isPublicSample = true para que sean visibles públicamente
      mutations.addBulkOperations(sampleOperations, true).then(() => {
        setHasCreatedSamples(true);
        // Forzar recarga después de crear las operaciones para traer la info de managers
        setTimeout(() => {
          refetch();
        }, 1000);
      });
    }
  }, [loading, operations.length, hasCreatedSamples, mutations, refetch]);

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
    error, 
    refetch,
    ...mutations
  };
};
