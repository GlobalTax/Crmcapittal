import React from 'react';
import { QueryClient as TanStackQueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new TanStackQueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface QueryClientProps {
  children: React.ReactNode;
}

export function QueryClient({ children }: QueryClientProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}