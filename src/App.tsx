
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AttioLayout } from '@/components/layout/AttioLayout';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Lazy load pages with proper React.lazy
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Leads = lazy(() => import('@/pages/Leads'));
const LeadPage = lazy(() => import('@/pages/LeadPage'));
const Contacts = lazy(() => import('@/pages/Contacts'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const Companies = lazy(() => import('@/pages/MinimalCompanies'));
const Deals = lazy(() => import('@/pages/Deals'));
const DealPage = lazy(() => import('@/pages/DealPage'));
const Transacciones = lazy(() => import('@/pages/Transacciones'));
const TransaccionPage = lazy(() => import('@/pages/TransaccionPage'));
const Proposals = lazy(() => import('@/pages/MinimalProposals'));
const TimeTracking = lazy(() => import('@/pages/MinimalTimeTracking'));
const PersonalDashboard = lazy(() => import('@/pages/PersonalDashboard'));
const Email = lazy(() => import('@/pages/MinimalEmail'));
const CalendarPage = lazy(() => import('@/pages/MinimalCalendar'));

const Documents = lazy(() => import('@/pages/MinimalDocuments'));
const UserManagement = lazy(() => import('@/pages/MinimalUserManagement'));
const Collaborators = lazy(() => import('@/pages/MinimalCollaborators'));
const Integrations = lazy(() => import('@/pages/MinimalIntegrations'));

// Settings pages
const SettingsLayout = lazy(() => import('@/components/settings/SettingsLayout').then(m => ({ default: m.SettingsLayout })));
const ProfilePage = lazy(() => import('@/pages/settings/ProfilePage'));
const EmailCalendarPage = lazy(() => import('@/pages/settings/EmailCalendarPage'));
const MembersTeamsPage = lazy(() => import('@/pages/settings/MembersTeamsPage'));
const AppearancePage = lazy(() => import('@/pages/settings/AppearancePage'));
const GeneralPage = lazy(() => import('@/pages/settings/GeneralPage'));

// Placeholder settings pages
const CallIntelligencePage = lazy(() => import('@/pages/settings/CallIntelligencePage'));
const PlansPage = lazy(() => import('@/pages/settings/PlaceholderPages').then(m => ({ default: m.PlansPage })));
const BillingPage = lazy(() => import('@/pages/settings/PlaceholderPages').then(m => ({ default: m.BillingPage })));
const DevelopersPage = lazy(() => import('@/pages/settings/PlaceholderPages').then(m => ({ default: m.DevelopersPage })));
const SecurityPage = lazy(() => import('@/pages/settings/PlaceholderPages').then(m => ({ default: m.SecurityPage })));
const SupportPage = lazy(() => import('@/pages/settings/PlaceholderPages').then(m => ({ default: m.SupportPage })));
const ExpertAccessPage = lazy(() => import('@/pages/settings/PlaceholderPages').then(m => ({ default: m.ExpertAccessPage })));
const MigrateCRMPage = lazy(() => import('@/pages/settings/PlaceholderPages').then(m => ({ default: m.MigrateCRMPage })));
const AppsPage = lazy(() => import('@/pages/settings/PlaceholderPages').then(m => ({ default: m.AppsPage })));
const ObjectsPage = lazy(() => import('@/pages/settings/PlaceholderPages').then(m => ({ default: m.ObjectsPage })));
const ListsPage = lazy(() => import('@/pages/settings/PlaceholderPages').then(m => ({ default: m.ListsPage })));
const DashboardsPage = lazy(() => import('@/pages/settings/PlaceholderPages').then(m => ({ default: m.DashboardsPage })));
const SequencesPage = lazy(() => import('@/pages/settings/PlaceholderPages').then(m => ({ default: m.SequencesPage })));
const WorkflowsPage = lazy(() => import('@/pages/settings/PlaceholderPages').then(m => ({ default: m.WorkflowsPage })));

const NotFound = lazy(() => import('@/pages/NotFound'));

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
            <AppContent />
          </Router>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  useKeyboardShortcuts();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public auth route */}
        <Route 
          path="/auth" 
          element={
            <Suspense fallback={<LoadingSkeleton />}>
              <Auth />
            </Suspense>
          } 
        />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute><AttioLayout /></ProtectedRoute>}>
          <Route 
            path="/personal" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <PersonalDashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Dashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/leads" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Leads />
              </Suspense>
            } 
          />
          <Route 
            path="/leads/:id" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <LeadPage />
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
            path="/contacts/:id" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <ContactPage />
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
            path="/deals/:id" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <DealPage />
              </Suspense>
            } 
          />
          <Route 
            path="/transacciones"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Transacciones />
              </Suspense>
            } 
          />
          <Route 
            path="/transacciones/:id" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <TransaccionPage />
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
            path="/documents/*" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Documents />
              </Suspense>
            } 
          />
          <Route 
            path="/users" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <UserManagement />
              </Suspense>
            } 
          />
          <Route 
            path="/collaborators" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Collaborators />
              </Suspense>
            } 
          />
          <Route 
            path="/integrations" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Integrations />
              </Suspense>
            } 
          />
        </Route>
        
        {/* Settings routes */}
        <Route 
          path="/settings/*" 
          element={
            <Suspense fallback={<LoadingSkeleton />}>
              <SettingsLayout />
            </Suspense>
          }
        >
          <Route 
            path="profile" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <ProfilePage />
              </Suspense>
            } 
          />
          <Route 
            path="email-calendar" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <EmailCalendarPage />
              </Suspense>
            } 
          />
          <Route 
            path="members-teams" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <MembersTeamsPage />
              </Suspense>
            } 
          />
          <Route 
            path="appearance" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <AppearancePage />
              </Suspense>
            } 
          />
          <Route 
            path="general" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <GeneralPage />
              </Suspense>
            } 
          />
          {/* Additional placeholder routes */}
          <Route 
            path="call-intelligence" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <CallIntelligencePage />
              </Suspense>
            } 
          />
          <Route path="plans" element={<PlansPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="developers" element={<DevelopersPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="expert-access" element={<ExpertAccessPage />} />
          <Route path="migrate-crm" element={<MigrateCRMPage />} />
          <Route path="apps" element={<AppsPage />} />
          <Route path="objects" element={<ObjectsPage />} />
          <Route path="lists" element={<ListsPage />} />
          <Route path="dashboards" element={<DashboardsPage />} />
          <Route path="sequences" element={<SequencesPage />} />
          <Route path="workflows" element={<WorkflowsPage />} />
          <Route 
            index
            element={<Navigate to="profile" replace />}
          />
          <Route path="*" element={<div>Settings page not found</div>} />
        </Route>
        
        {/* Catch-all route for 404 */}
        <Route 
          path="*" 
          element={
            <Suspense fallback={<LoadingSkeleton />}>
              <NotFound />
            </Suspense>
          } 
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
