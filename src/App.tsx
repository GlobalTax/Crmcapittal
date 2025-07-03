
import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LazyPage } from '@/components/common/LazyPage';

// Lazy load existing pages
const Leads = LazyPage(() => import('@/pages/Leads'));
const Contacts = LazyPage(() => import('@/pages/Contacts'));
const Companies = LazyPage(() => import('@/pages/Companies'));
const Deals = LazyPage(() => import('@/pages/Deals'));
const Negocios = LazyPage(() => import('@/pages/Negocios'));
const Proposals = LazyPage(() => import('@/pages/Proposals'));
const TimeTracking = LazyPage(() => import('@/pages/TimeTracking'));
const Email = LazyPage(() => import('@/pages/Email'));
const CalendarPage = LazyPage(() => import('@/pages/Calendar'));
const Transactions = LazyPage(() => import('@/pages/Transactions'));

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
                  path="/deals" 
                  element={
                    <Suspense fallback={<LoadingSkeleton />}>
                      <Deals />
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
              </Route>
            </Routes>
          </div>
          <Toaster />
        </Router>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
