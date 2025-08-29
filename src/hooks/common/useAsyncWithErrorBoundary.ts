
import { useAsync, UseAsyncOptions } from './useAsync';
import { logger } from '@/utils/productionLogger';

export const useAsyncWithErrorBoundary = <T = any>(options: UseAsyncOptions = {}) => {
  const enhancedOptions: UseAsyncOptions = {
    ...options,
    onError: (error) => {
      // Log error for debugging
      logger.error('useAsync error encountered', { error }, 'useAsyncWithErrorBoundary');
      
      // Call original error handler if provided
      options.onError?.(error);
    }
  };

  return useAsync<T>(enhancedOptions);
};
