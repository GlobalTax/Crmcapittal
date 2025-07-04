
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';

// Lazy load pages with proper React.lazy
const Leads = lazy(() => import('@/pages/Leads'));
const Contacts = lazy(() => import('@/pages/Contacts'));
const Companies = lazy(() => import('@/pages/Companies'));
const Negocios = lazy(() => import('@/pages/Negocios'));
const Proposals = lazy(() => import('@/pages/Proposals'));
const TimeTracking = lazy(() => import('@/pages/TimeTracking'));
const Email = lazy(() => import('@/pages/Email'));
const CalendarPage = lazy(() => import('@/pages/Calendar'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const Documents = lazy(() => import('@/pages/Documents'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<Navigate to="/leads" replace />} />
                
                <Route element={<DashboardLayout />}>
                  <Route 
                    path="/leads" 
                    element={
                      <Suspense fallback={<LoadingSkeleton />}>
                        <Leads />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/contacts" 
                    element={
                      <Suspense fallback={<LoadingSkeleton />}>
                        <Contacts />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/companies" 
                    element={
                      <Suspense fallback={<LoadingSkeleton />}>
                        <Companies />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/negocios" 
                    element={
                      <Suspense fallback={<LoadingSkeleton />}>
                        <Negocios />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/proposals" 
                    element={
                      <Suspense fallback={<LoadingSkeleton />}>
                        <Proposals />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/time-tracking" 
                    element={
                      <Suspense fallback={<LoadingSkeleton />}>
                        <TimeTracking />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/email" 
                    element={
                      <Suspense fallback={<LoadingSkeleton />}>
                        <Email />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/calendar" 
                    element={
                      <Suspense fallback={<LoadingSkeleton />}>
                        <CalendarPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/transactions" 
                    element={
                      <Suspense fallback={<LoadingSkeleton />}>
                        <Transactions />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/documents/*" 
                    element={
                      <Suspense fallback={<LoadingSkeleton />}>
                        <Documents />
                      </Suspense>
                    } 
                  />
                </Route>
              </Routes>
            </div>
            <Toaster />
          </Router>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
