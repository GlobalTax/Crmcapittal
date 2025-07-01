
import { useAsync, UseAsyncOptions } from './useAsync';
import { useErrorHandler } from '@/components/ErrorBoundary';

export const useAsyncWithErrorBoundary = <T = any>(options: UseAsyncOptions = {}) => {
  const { handleError } = useErrorHandler();
  
  const enhancedOptions: UseAsyncOptions = {
    ...options,
    onError: (error) => {
      // Log error to ErrorBoundary system
      handleError(new Error(error), { context: 'useAsync' });
      
      // Call original error handler if provided
      options.onError?.(error);
    }
  };

  return useAsync<T>(enhancedOptions);
};
