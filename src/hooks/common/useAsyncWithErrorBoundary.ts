
import { useAsync, UseAsyncOptions } from './useAsync';

export const useAsyncWithErrorBoundary = <T = any>(options: UseAsyncOptions = {}) => {
  const enhancedOptions: UseAsyncOptions = {
    ...options,
    onError: (error) => {
      // Log error to console for debugging
      console.error('useAsync error:', error);
      
      // Call original error handler if provided
      options.onError?.(error);
    }
  };

  return useAsync<T>(enhancedOptions);
};
