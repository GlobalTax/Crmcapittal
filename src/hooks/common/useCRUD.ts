
import { useState, useCallback } from 'react';

interface AsyncOperation<T> {
  loading: boolean;
  data: T | null;
  error: string | null;
  execute: (fn: () => Promise<T>) => Promise<T | null>;
  cancel: () => void;
}

interface CRUDConfig {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  retryCount?: number;
  retryDelay?: number;
}

export const useCRUD = <T>(config: CRUDConfig = {}) => {
  const createAsyncOperation = <K>(): AsyncOperation<K> => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<K | null>(null);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async (fn: () => Promise<K>): Promise<K | null> => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fn();
        setData(result);
        config.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        config.onError?.(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    }, [config]);

    const cancel = useCallback(() => {
      setLoading(false);
      setError(null);
    }, []);

    return { loading, data, error, execute, cancel };
  };

  return {
    create: createAsyncOperation<T>(),
    read: createAsyncOperation<T[]>(),
    update: createAsyncOperation<T>(),
    remove: createAsyncOperation<void>()
  };
};
