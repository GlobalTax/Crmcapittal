import { useAsync, UseAsyncOptions } from './useAsync';
import { secureLogger } from '@/utils/secureLogger';
import { toast as notify } from 'sonner';

export const useAsyncWithErrorBoundary = <T = any>(options: UseAsyncOptions = {}) => {
  const enhancedOptions: UseAsyncOptions = {
    ...options,
    onError: (error) => {
      // Logging seguro y toast de usuario
      const raw = error as unknown;
      const message = (raw && typeof raw === 'object' && 'message' in (raw as any))
        ? String((raw as any).message)
        : String(raw);
      const errObj: Error = (raw && typeof raw === 'object' && 'stack' in (raw as any))
        ? new Error(message)
        : new Error(message);

      secureLogger.error('Async operation failed', { message, context: 'useAsyncWithErrorBoundary' }, errObj);
      secureLogger.security('async_error', 'low', { message });
      notify.error('No se pudo completar la acción. Inténtalo de nuevo.');

      // Handler original
      options.onError?.(error);
    }
  };

  return useAsync<T>(enhancedOptions);
};
