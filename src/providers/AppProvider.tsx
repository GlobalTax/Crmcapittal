import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AppErrorBoundary } from '@/components/error-boundary/AppErrorBoundary';
import { useAppStore } from '@/stores';
import { initializeAuthListener } from '@/stores/useAuthStore';
import { secureLogger } from '@/utils/secureLogger';
import { configManager } from '@/utils/configManager';

// Optimized QueryClient configuration using centralized config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: configManager.performance.queryStaleTime,
      gcTime: configManager.performance.queryGcTime,
      retry: (failureCount, error) => {
        // Don't retry for auth errors
        if (error instanceof Error && error.message.includes('auth')) {
          return false;
        }
        return failureCount < configManager.performance.maxRetryAttempts;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const initialize = useAppStore((state) => state.initialize);

  useEffect(() => {
    // Initialize app
    initialize();
    
    // Initialize auth listener
    initializeAuthListener();

    // Performance monitoring
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      secureLogger.debug(`App initialization took ${endTime - startTime} milliseconds`);
    };
  }, [initialize]);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
          
          {/* Global components */}
          <Toaster 
            position="top-right"
            expand={true}
            richColors
            closeButton
          />
          
          {/* Development tools - can be added later if needed */}
        </ThemeProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};