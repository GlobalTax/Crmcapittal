
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppRoutes } from '@/AppRoutes';
import { enableQueryDebugging } from '@/utils/queryDebugger';

// Enable query debugging to catch problematic queries
enableQueryDebugging();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // NEVER use stale data during debugging
      gcTime: 0, // Don't cache anything during debugging
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
