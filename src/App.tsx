
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { 
  AuthProvider, 
  OperationsProvider, 
  CompaniesProvider, 
  ContactsProvider, 
  UsersProvider,
  GlobalSearchProvider,
  OnboardingProvider
} from '@/contexts';
import { AppRoutes } from '@/AppRoutes';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <OperationsProvider>
            <CompaniesProvider>
              <ContactsProvider>
                <UsersProvider>
                  <GlobalSearchProvider>
                    <OnboardingProvider>
                      <AppRoutes />
                      <Toaster />
                    </OnboardingProvider>
                  </GlobalSearchProvider>
                </UsersProvider>
              </ContactsProvider>
            </CompaniesProvider>
          </OperationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
