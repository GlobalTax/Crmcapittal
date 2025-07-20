import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import Dashboard from '@/pages/Dashboard';
import PersonalDashboard from '@/pages/PersonalDashboard';
import MinimalIntegrations from '@/pages/MinimalIntegrations';
import OperationDetails from '@/pages/OperationDetails';
import NegocioDetail from '@/pages/NegocioDetail';
import Contacts from '@/pages/Contacts';
import Companies from '@/pages/Companies';
import MinimalTransacciones from '@/pages/MinimalTransacciones';
import TransaccionPage from '@/pages/TransaccionPage';
import BuyingMandates from '@/pages/BuyingMandates';
import Collaborators from '@/pages/Collaborators';
import Leads from '@/pages/Leads';
import LeadPage from '@/pages/LeadPage';
import ContactPage from '@/pages/ContactPage';
import CompanyPage from '@/pages/CompanyPage';
import CommissionsPage from '@/pages/CommissionsPage';
import LeadsEntryPanel from '@/components/captacion/LeadsEntryPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<PersonalDashboard />} />
        <Route path="settings/*" element={<MinimalIntegrations />} />
        
        {/* Operations routes */}
        <Route path="operations" element={<OperationDetails />} />
        <Route path="operations/:id" element={<NegocioDetail />} />
        
        {/* CRM routes */}
        <Route path="contacts" element={<Contacts />} />
        <Route path="contacts/:id" element={<ContactPage />} />
        <Route path="companies" element={<Companies />} />
        <Route path="companies/:id" element={<CompanyPage />} />
        
        {/* Leads routes */}
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadPage />} />
        <Route path="gestion-leads" element={<Navigate to="/leads" replace />} />
        <Route path="captacion" element={<LeadsEntryPanel />} />
        <Route path="captacion/:id" element={<LeadPage />} />
        
        {/* Transaction routes */}
        <Route path="transacciones" element={<TransaccionPage />} />
        <Route path="transacciones/:id" element={<TransaccionPage />} />
        <Route path="transacciones/lista" element={<MinimalTransacciones />} />
        <Route path="buying-mandates" element={<BuyingMandates />} />
        
        {/* Collaborators and commissions */}
        <Route path="collaborators" element={<Collaborators />} />
        <Route path="commissions" element={<CommissionsPage />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <TooltipProvider>
              <AppRoutes />
              <Toaster position="top-right" />
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
