
import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import BuyingMandates from '@/pages/BuyingMandates';
import Collaborators from '@/pages/Collaborators';
import Leads from '@/pages/Leads';
import LeadPage from '@/pages/LeadPage';
import ContactPage from '@/pages/ContactPage';
import CompanyPage from '@/pages/CompanyPage';
import CommissionsPage from '@/pages/CommissionsPage';
import LeadsEntryPanel from '@/components/captacion/LeadsEntryPanel';

export default function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex-1 overflow-auto">
      <Routes>
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
        
        {/* Transaction and mandate routes */}
        <Route path="transacciones" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <MinimalTransacciones />
          </Suspense>
        } />
        <Route path="buying-mandates" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <BuyingMandates />
          </Suspense>
        } />
        
        {/* Collaborators and commissions */}
        <Route path="collaborators" element={<Collaborators />} />
        <Route path="commissions" element={<CommissionsPage />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}
