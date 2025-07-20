
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AuthGuard from './components/auth/AuthGuard';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PersonalDashboard = lazy(() => import('./pages/PersonalDashboard'));
const Contacts = lazy(() => import('./pages/Contacts'));
const ContactDetails = lazy(() => import('./pages/ContactDetails'));
const Sociedades = lazy(() => import('./pages/Sociedades'));
const SociedadPage = lazy(() => import('./pages/SociedadPage'));
const Negocios = lazy(() => import('./pages/Negocios'));
const DealDetails = lazy(() => import('./pages/DealDetails'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const OperationDetails = lazy(() => import('./pages/OperationDetails'));
const Operations = lazy(() => import('./pages/Operations'));
const Proposals = lazy(() => import('./pages/Proposals'));
const ProposalDetails = lazy(() => import('./pages/ProposalDetails'));
const Cases = lazy(() => import('./pages/Cases'));
const CaseDetails = lazy(() => import('./pages/CaseDetails'));
const TimeTracking = lazy(() => import('./pages/TimeTracking'));
const Documents = lazy(() => import('./pages/Documents'));
const Email = lazy(() => import('./pages/Email'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Comisiones = lazy(() => import('./pages/Comisiones'));
const Mandatos = lazy(() => import('./pages/Mandatos'));
const MandatoPage = lazy(() => import('./pages/MandatoPage'));
const Collaborators = lazy(() => import('./pages/Collaborators'));
const Users = lazy(() => import('./pages/Users'));
const Integrations = lazy(() => import('./pages/Integrations'));
const Settings = lazy(() => import('./pages/Settings'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<div>Login Page</div>} />
        
        {/* Protected Routes */}
        <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/personal-dashboard" element={<AuthGuard><PersonalDashboard /></AuthGuard>} />
        
        {/* Contacts */}
        <Route path="/contacts" element={<AuthGuard><Contacts /></AuthGuard>} />
        <Route path="/contactos/:id" element={<AuthGuard><ContactDetails /></AuthGuard>} />
        <Route path="/contacts/:id" element={<Navigate to="/contactos/:id" replace />} />
        
        {/* Sociedades (replacing Companies/Empresas) */}
        <Route path="/sociedades" element={<AuthGuard><Sociedades /></AuthGuard>} />
        <Route path="/sociedades/:id" element={<AuthGuard><SociedadPage /></AuthGuard>} />
        
        {/* Redirects from old routes to Sociedades */}
        <Route path="/companies" element={<Navigate to="/sociedades" replace />} />
        <Route path="/companies/:id" element={<Navigate to="/sociedades" replace />} />
        <Route path="/empresas" element={<Navigate to="/sociedades" replace />} />
        <Route path="/empresas/:id" element={<Navigate to="/sociedades" replace />} />
        
        {/* Deals/Negocios */}
        <Route path="/deals" element={<Navigate to="/negocios" replace />} />
        <Route path="/negocios" element={<AuthGuard><Negocios /></AuthGuard>} />
        <Route path="/deals/:id" element={<Navigate to="/negocios/:id" replace />} />
        <Route path="/negocios/:id" element={<AuthGuard><DealDetails /></AuthGuard>} />
        
        {/* Portfolio/Operations */}
        <Route path="/portfolio" element={<AuthGuard><Portfolio /></AuthGuard>} />
        <Route path="/operations" element={<AuthGuard><Operations /></AuthGuard>} />
        <Route path="/portfolio/:id" element={<AuthGuard><OperationDetails /></AuthGuard>} />
        <Route path="/operations/:id" element={<AuthGuard><OperationDetails /></AuthGuard>} />
        
        {/* Proposals */}
        <Route path="/proposals" element={<AuthGuard><Proposals /></AuthGuard>} />
        <Route path="/proposals/:id" element={<AuthGuard><ProposalDetails /></AuthGuard>} />
        
        {/* Cases */}
        <Route path="/cases" element={<AuthGuard><Cases /></AuthGuard>} />
        <Route path="/cases/:id" element={<AuthGuard><CaseDetails /></AuthGuard>} />
        
        {/* Time Tracking */}
        <Route path="/time-tracking" element={<AuthGuard><TimeTracking /></AuthGuard>} />
        
        {/* Documents */}
        <Route path="/documents" element={<AuthGuard><Documents /></AuthGuard>} />
        
        {/* Email */}
        <Route path="/email" element={<AuthGuard><Email /></AuthGuard>} />
        
        {/* Calendar */}
        <Route path="/calendar" element={<AuthGuard><Calendar /></AuthGuard>} />
        
        {/* Commissions */}
        <Route path="/comisiones" element={<AuthGuard><Comisiones /></AuthGuard>} />
        
        {/* Mandatos */}
        <Route path="/mandatos" element={<AuthGuard><Mandatos /></AuthGuard>} />
        <Route path="/mandatos/:id" element={<AuthGuard><MandatoPage /></AuthGuard>} />
        
        {/* Admin Routes */}
        <Route path="/collaborators" element={<AuthGuard><Collaborators /></AuthGuard>} />
        <Route path="/users" element={<AuthGuard><Users /></AuthGuard>} />
        <Route path="/integrations" element={<AuthGuard><Integrations /></AuthGuard>} />
        <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
