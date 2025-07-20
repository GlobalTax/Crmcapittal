import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { AttioLayout } from '@/components/layout/AttioLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Import pages
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import PersonalDashboard from '@/pages/PersonalDashboard';
import Companies from '@/pages/Companies';
import CompanyPage from '@/pages/CompanyPage';
import MinimalCompanies from '@/pages/MinimalCompanies';
import Contacts from '@/pages/Contacts';
import MinimalProposals from '@/pages/MinimalProposals';
import MinimalTimeTracking from '@/pages/MinimalTimeTracking';
import MinimalDocuments from '@/pages/MinimalDocuments';
import MinimalUserManagement from '@/pages/MinimalUserManagement';
import MinimalCollaborators from '@/pages/MinimalCollaborators';
import MinimalIntegrations from '@/pages/MinimalIntegrations';
import MinimalCalendar from '@/pages/MinimalCalendar';
import EmailSetup from '@/pages/EmailSetup';
import EInformaDashboard from '@/pages/EInformaDashboard';
import RODDashboard from '@/pages/RODDashboard';
import RODBuilder from '@/pages/RODBuilder';
import Subscribers from '@/pages/Subscribers';
import CampaignBuilder from '@/pages/CampaignBuilder';
import CommissionsPage from '@/pages/CommissionsPage';
import Valoraciones from '@/pages/Valoraciones';
import Reconversiones from '@/pages/Reconversiones';
import TeaserBuilder from '@/pages/TeaserBuilder';
import MandatesPage from '@/pages/MandatesPage';
import MandateDetailPage from '@/pages/MandateDetailPage';
import LeadsEntryPanel from '@/components/captacion/LeadsEntryPanel';
import { HubSpotDatabase } from '@/components/hubspot/HubSpotDatabase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

function AppContent() {
  useKeyboardShortcuts();
  
  return (
    <Routes>
      {/* Public auth route */}
      <Route path="/auth" element={<Auth />} />
      
      {/* Protected routes with layout */}
      <Route element={<ProtectedRoute><AttioLayout /></ProtectedRoute>}>
        {/* Dashboard routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/personal" element={<PersonalDashboard />} />
        
        {/* Empresas routes - FIXED: Added missing routes */}
        <Route path="/empresas" element={<Companies />} />
        <Route path="/empresas/:id" element={<CompanyPage />} />
        
        {/* Companies route redirect for compatibility */}
        <Route path="/companies" element={<Navigate to="/empresas" replace />} />
        <Route path="/companies/:id" element={<Navigate to="/empresas" replace />} />
        
        {/* Contactos routes */}
        <Route path="/contactos" element={<Contacts />} />
        <Route path="/contacts" element={<Navigate to="/contactos" replace />} />
        
        {/* Mandatos routes */}
        <Route path="/mandatos" element={<MandatesPage />} />
        <Route path="/mandatos/:id" element={<MandateDetailPage />} />
        <Route path="/transacciones" element={<MandatesPage />} />
        <Route path="/buying-mandates" element={<Navigate to="/mandatos" replace />} />
        
        {/* Lead management routes */}
        <Route path="/gestion-leads" element={<LeadsEntryPanel />} />
        <Route path="/captacion" element={<LeadsEntryPanel />} />
        
        {/* Other business routes */}
        <Route path="/proposals" element={<MinimalProposals />} />
        <Route path="/valoraciones" element={<Valoraciones />} />
        <Route path="/reconversiones" element={<Reconversiones />} />
        <Route path="/teaser-builder" element={<TeaserBuilder />} />
        
        {/* Communication routes */}
        <Route path="/email" element={<EmailSetup />} />
        <Route path="/calendar" element={<MinimalCalendar />} />
        <Route path="/time-tracking" element={<MinimalTimeTracking />} />
        
        {/* Document management */}
        <Route path="/documents/*" element={<MinimalDocuments />} />
        
        {/* Data & Analytics */}
        <Route path="/hubspot-data" element={<HubSpotDatabase />} />
        <Route path="/einforma" element={<EInformaDashboard />} />
        
        {/* ROD Builder routes */}
        <Route path="/rod" element={<RODDashboard />} />
        <Route path="/rod/builder" element={<RODBuilder />} />
        <Route path="/subscribers" element={<Subscribers />} />
        <Route path="/campaigns" element={<CampaignBuilder />} />
        
        {/* Administration routes */}
        <Route path="/users" element={<MinimalUserManagement />} />
        <Route path="/collaborators" element={<MinimalCollaborators />} />
        <Route path="/comisiones" element={<CommissionsPage />} />
        <Route path="/integrations" element={<MinimalIntegrations />} />
      </Route>
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
