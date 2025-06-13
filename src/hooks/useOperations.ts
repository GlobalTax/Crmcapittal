
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
        refetch();
      });
    }
  }, [loading, operations.length, hasCreatedSamples, mutations, refetch]);

  return { 
    operations, 
    loading, 
    error, 
    refetch,
    ...mutations
  };
};
