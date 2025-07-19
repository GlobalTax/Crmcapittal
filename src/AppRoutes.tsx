
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AttioLayout } from '@/components/layout/AttioLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

// Import new organized components
import MandatesPage from '@/pages/MandatesPage';
import MandateDetailPage from '@/pages/MandateDetailPage';
import MandatoTargetPanel from '@/components/targets/MandatoTargetPanel';
import MandateTargetPipeline from '@/components/targets/MandateTargetPipeline';
import TransaccionesList from '@/components/transacciones/TransaccionesList';
import VentaMandatoView from '@/components/transacciones/VentaMandatoView';
import CompanyList from '@/components/empresas/CompanyList';
import CompanyDetail from '@/components/empresas/CompanyDetail';
import ContactList from '@/components/contactos/ContactList';
import ContactDetail from '@/components/contactos/ContactDetail';
import LeadsEntryPanel from '@/components/captacion/LeadsEntryPanel';
import { HubSpotDatabase } from '@/components/hubspot/HubSpotDatabase';

// Import settings pages
import SettingsPage from '@/pages/settings/SettingsPage';
import ProfilePage from '@/pages/settings/ProfilePage';
import AppearancePage from '@/pages/settings/AppearancePage';
import EmailCalendarPage from '@/pages/settings/EmailCalendarPage';
import GeneralPage from '@/pages/settings/GeneralPage';
import CallIntelligencePage from '@/pages/settings/CallIntelligencePage';

// Import the unified lead page
const LeadPage = lazy(() => import('@/pages/LeadPage'));

// Keep existing lazy-loaded pages for other routes
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const PersonalDashboard = lazy(() => import('@/pages/PersonalDashboard'));
const Deals = lazy(() => import('@/pages/Deals'));
const DealPage = lazy(() => import('@/pages/DealPage'));
const Proposals = lazy(() => import('@/pages/MinimalProposals'));
const TimeTracking = lazy(() => import('@/pages/MinimalTimeTracking'));
const EmailSetup = lazy(() => import('@/pages/EmailSetup'));
const CalendarPage = lazy(() => import('@/pages/MinimalCalendar'));
const Documents = lazy(() => import('@/pages/MinimalDocuments'));
const UserManagement = lazy(() => import('@/pages/MinimalUserManagement'));
const Collaborators = lazy(() => import('@/pages/MinimalCollaborators'));
const HierarchicalCRM = lazy(() => import('@/pages/HierarchicalCRM'));
const ClientMandateView = lazy(() => import('@/pages/ClientMandateView'));
const Integrations = lazy(() => import('@/pages/MinimalIntegrations'));
const EInformaDashboard = lazy(() => import('@/pages/EInformaDashboard'));
const SystemDebug = lazy(() => import('@/pages/SystemDebug'));
const CommissionsPage = lazy(() => import('@/pages/CommissionsPage'));
const RODBuilder = lazy(() => import('@/pages/RODBuilder'));
const RODDashboard = lazy(() => import('@/pages/RODDashboard'));
const Subscribers = lazy(() => import('@/pages/Subscribers'));
const CampaignBuilder = lazy(() => import('@/pages/CampaignBuilder'));
const Valoraciones = lazy(() => import('@/pages/Valoraciones'));
const Reconversiones = lazy(() => import('@/pages/Reconversiones'));
const TeaserBuilder = lazy(() => import('@/pages/TeaserBuilder'));
const BuyingMandates = lazy(() => import('@/pages/BuyingMandates'));

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-slate-600">Cargando...</p>
    </div>
  </div>
);

export const AppRoutes = () => {
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

        {/* Public client mandate access route */}
        <Route 
          path="/mandato/:mandateId/cliente" 
          element={
            <Suspense fallback={<LoadingSkeleton />}>
              <ClientMandateView />
            </Suspense>
          } 
        />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute><AttioLayout /></ProtectedRoute>}>
          
          {/* Dashboard */}
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

          {/* M&A Operations - Mandatos */}
          <Route path="/mandatos" element={<MandatesPage />} />
          <Route path="/mandatos/:id" element={<MandateDetailPage />} />
          <Route path="/mandatos/:id/targets" element={<MandatoTargetPanel />} />
          <Route path="/mandatos/:id/targets/pipeline" element={<MandateTargetPipeline />} />
          
          {/* Mandatos de Compra */}
          <Route 
            path="/mandatos-compra" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <BuyingMandates />
              </Suspense>
            } 
          />

          {/* Transacciones/Mandatos de Venta */}
          <Route path="/transacciones" element={<TransaccionesList />} />
          <Route path="/transacciones/:id" element={<VentaMandatoView />} />

          {/* Servicios Complementarios */}
          <Route 
            path="/valoraciones" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Valoraciones />
              </Suspense>
            } 
          />
          <Route 
            path="/reconversiones" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Reconversiones />
              </Suspense>
            } 
          />
          <Route 
            path="/teaser-builder" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <TeaserBuilder />
              </Suspense>
            } 
          />

          {/* CRM */}
          <Route path="/empresas" element={<CompanyList />} />
          <Route path="/empresas/:id" element={<CompanyDetail />} />
          <Route path="/contactos" element={<ContactList />} />
          <Route path="/contactos/:id" element={<ContactDetail />} />

          {/* Leads y Captación */}
          <Route path="/captacion" element={<LeadsEntryPanel />} />
          <Route 
            path="/captacion/:id" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <LeadPage />
              </Suspense>
            } 
          />
          <Route path="/gestion-leads" element={<LeadsEntryPanel />} />
          <Route 
            path="/gestion-leads/:id" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <LeadPage />
              </Suspense>
            } 
          />
          <Route path="/leads" element={<LeadsEntryPanel />} />
          <Route 
            path="/leads/:id" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <LeadPage />
              </Suspense>
            } 
          />

          {/* Comunicación */}
          <Route 
            path="/email" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <EmailSetup />
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
            path="/time-tracking" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <TimeTracking />
              </Suspense>
            } 
          />

          {/* ROD Builder */}
          <Route 
            path="/rod" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <RODDashboard />
              </Suspense>
            } 
          />
          <Route 
            path="/rod/builder" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <RODBuilder />
              </Suspense>
            } 
          />
          <Route 
            path="/subscribers" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Subscribers />
              </Suspense>
            } 
          />
          <Route 
            path="/campaigns" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <CampaignBuilder />
              </Suspense>
            } 
          />

          {/* Deals y Propuestas */}
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
            path="/proposals" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Proposals />
              </Suspense>
            } 
          />

          {/* Documentos */}
          <Route 
            path="/documents/*" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Documents />
              </Suspense>
            } 
          />

          {/* Administración */}
          <Route 
            path="/users" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <UserManagement />
              </Suspense>
            } 
          />
          <Route 
            path="/colaboradores" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Collaborators />
              </Suspense>
            } 
          />
          <Route 
            path="/comisiones" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <CommissionsPage />
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

          {/* Análisis */}
          <Route 
            path="/einforma" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <EInformaDashboard />
              </Suspense>
            } 
          />

          {/* HubSpot Data */}
          <Route 
            path="/hubspot-data" 
            element={<HubSpotDatabase />}
          />

          {/* Otras rutas */}
          <Route 
            path="/crm" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <HierarchicalCRM />
              </Suspense>
            } 
          />
          <Route 
            path="/debug" 
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <SystemDebug />
              </Suspense>
            } 
          />

          {/* Redirects from old English routes to new Spanish routes */}
          <Route path="/buying-mandates" element={<Navigate to="/mandatos-compra" replace />} />
          <Route path="/buying-mandates/:id" element={<Navigate to="/mandatos-compra" replace />} />
          <Route path="/companies" element={<Navigate to="/empresas" replace />} />
          <Route path="/companies/:id" element={<Navigate to="/empresas" replace />} />
          <Route path="/contacts" element={<Navigate to="/contactos" replace />} />
          <Route path="/contacts/:id" element={<Navigate to="/contactos" replace />} />
        </Route>

        {/* Settings routes - Separate layout */}
        <Route path="/settings" element={<ProtectedRoute><SettingsLayout /></ProtectedRoute>}>
          <Route index element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="appearance" element={<AppearancePage />} />
          <Route path="email-calendar" element={<EmailCalendarPage />} />
          <Route path="general" element={<GeneralPage />} />
          <Route path="call-intelligence" element={<CallIntelligencePage />} />
          <Route path="members-teams" element={<div>Members & Teams - Coming Soon</div>} />
          <Route path="plans" element={<div>Plans - Coming Soon</div>} />
          <Route path="billing" element={<div>Billing - Coming Soon</div>} />
          <Route path="developers" element={<div>Developers - Coming Soon</div>} />
          <Route path="security" element={<div>Security - Coming Soon</div>} />
          <Route path="support" element={<div>Support - Coming Soon</div>} />
          <Route path="expert-access" element={<div>Expert Access - Coming Soon</div>} />
          <Route path="migrate-crm" element={<div>Migrate CRM - Coming Soon</div>} />
          <Route path="apps" element={<div>Apps - Coming Soon</div>} />
          <Route path="objects" element={<div>Objects - Coming Soon</div>} />
          <Route path="lists" element={<div>Lists - Coming Soon</div>} />
          <Route path="dashboards" element={<div>Dashboards - Coming Soon</div>} />
          <Route path="sequences" element={<div>Sequences - Coming Soon</div>} />
          <Route path="workflows" element={<div>Workflows - Coming Soon</div>} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};
