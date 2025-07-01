
import { useState, useCallback, useRef } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  retryCount?: number;
  retryDelay?: number;
}

export const useAsync = <T = any>(options: UseAsyncOptions = {}) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>): Promise<T | null> => {
      // Cancelar operación anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController();

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFunction();
        
        setState({
          data: result,
          loading: false,
          error: null,
        });

        options.onSuccess?.(result);
        retryCountRef.current = 0;
        
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        // Verificar si es un error de aborto
        if (error instanceof Error && error.name === 'AbortError') {
          return null;
        }

        // Lógica de reintento
        if (retryCountRef.current < (options.retryCount || 0)) {
          retryCountRef.current++;
          
          setTimeout(() => {
            execute(asyncFunction);
          }, options.retryDelay || 1000);
          
          return null;
        }

        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        options.onError?.(errorMessage);
        retryCountRef.current = 0;
        
        return null;
      }
    },
    [options.onSuccess, options.onError, options.retryCount, options.retryDelay]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
    retryCountRef.current = 0;
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    ...state,
    execute,
    reset,
    cancel,
  };
};

// Hook especializado para operaciones CRUD
export const useCRUD = <T = any>(options: UseAsyncOptions = {}) => {
  const create = useAsync<T>(options);
  const read = useAsync<T[]>(options);
  const update = useAsync<T>(options);
  const remove = useAsync<void>(options);

  return {
    create,
    read,
    update,
    remove,
  };
};

// Hook para operaciones con cache (corregido)
export const useAsyncWithCache = <T = any>(
  key: string,
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions & { cacheTime?: number } = {}
) => {
  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const asyncHook = useAsync<T>(options);

  const executeWithCache = useCallback(async () => {
    const cached = cache.current.get(key);
    const now = Date.now();
    const cacheTime = options.cacheTime || 5 * 60 * 1000;

    if (cached && (now - cached.timestamp) < cacheTime) {
      asyncHook.reset();
      // Directly set the state using a new execution with cached data
      return asyncHook.execute(async () => cached.data);
    }

    const result = await asyncHook.execute(asyncFunction);
    
    if (result) {
      cache.current.set(key, { data: result, timestamp: now });
    }

    return result;
  }, [key, asyncFunction, options.cacheTime, asyncHook]);

  return {
    ...asyncHook,
    execute: executeWithCache,
    clearCache: () => cache.current.clear(),
  };
};
