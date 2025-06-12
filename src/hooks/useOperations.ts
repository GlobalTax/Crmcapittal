
import { useOperationsData } from './operations/useOperationsData';
import { useOperationsMutations } from './operations/useOperationsMutations';

export const useOperations = () => {
  const { operations, setOperations, loading, error, refetch } = useOperationsData();
  const mutations = useOperationsMutations(setOperations);

  return { 
    operations, 
    loading, 
    error, 
    refetch,
    ...mutations
  };
};
