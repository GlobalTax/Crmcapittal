
import { useOperationsData } from './operations/useOperationsData';
import { useOperationsMutations } from './operations/useOperationsMutations';
import { useEffect, useState } from 'react';
import { sampleOperations } from '@/utils/createSampleOperations';

export const useOperations = () => {
  const { operations, setOperations, loading, error, refetch } = useOperationsData();
  const mutations = useOperationsMutations(setOperations);
  const [hasCreatedSamples, setHasCreatedSamples] = useState(false);

  // Auto-create sample operations if database is empty
  useEffect(() => {
    if (!loading && operations.length === 0 && !hasCreatedSamples) {
      console.log("Database is empty, creating sample operations...");
      mutations.addBulkOperations(sampleOperations).then(() => {
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
