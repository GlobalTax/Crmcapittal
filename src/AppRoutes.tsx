
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Simple auth protection component
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  // For now, just return children - you can add auth logic later
  return <>{children}</>;
};

// Lazy load pages that exist
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Contacts = lazy(() => import('./pages/Contacts'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const Sociedades = lazy(() => import('./pages/Sociedades'));
const SociedadPage = lazy(() => import('./pages/SociedadPage'));
const Auth = lazy(() => import('./pages/Auth'));

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
        <Route path="/login" element={<Auth />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
        
        {/* Contacts */}
        <Route path="/contacts" element={<AuthGuard><Contacts /></AuthGuard>} />
        <Route path="/contactos/:id" element={<AuthGuard><ContactPage /></AuthGuard>} />
        <Route path="/contacts/:id" element={<Navigate to="/contactos/:id" replace />} />
        
        {/* Sociedades (replacing Companies/Empresas) */}
        <Route path="/sociedades" element={<AuthGuard><Sociedades /></AuthGuard>} />
        <Route path="/sociedades/:id" element={<AuthGuard><SociedadPage /></AuthGuard>} />
        
        {/* Redirects from old routes to Sociedades */}
        <Route path="/companies" element={<Navigate to="/sociedades" replace />} />
        <Route path="/companies/:id" element={<Navigate to="/sociedades" replace />} />
        <Route path="/empresas" element={<Navigate to="/sociedades" replace />} />
        <Route path="/empresas/:id" element={<Navigate to="/sociedades" replace />} />
        
        {/* Placeholder routes for future development */}
        <Route path="/negocios" element={<div className="p-8">Módulo de Negocios - En desarrollo</div>} />
        <Route path="/portfolio" element={<div className="p-8">Módulo de Portfolio - En desarrollo</div>} />
        <Route path="/operations" element={<div className="p-8">Módulo de Operaciones - En desarrollo</div>} />
        <Route path="/proposals" element={<div className="p-8">Módulo de Propuestas - En desarrollo</div>} />
        <Route path="/cases" element={<div className="p-8">Módulo de Casos - En desarrollo</div>} />
        <Route path="/time-tracking" element={<div className="p-8">Módulo de Tiempo - En desarrollo</div>} />
        <Route path="/documents" element={<div className="p-8">Módulo de Documentos - En desarrollo</div>} />
        <Route path="/email" element={<div className="p-8">Módulo de Email - En desarrollo</div>} />
        <Route path="/calendar" element={<div className="p-8">Módulo de Calendario - En desarrollo</div>} />
        <Route path="/comisiones" element={<div className="p-8">Módulo de Comisiones - En desarrollo</div>} />
        <Route path="/mandatos" element={<div className="p-8">Módulo de Mandatos - En desarrollo</div>} />
        <Route path="/collaborators" element={<div className="p-8">Módulo de Colaboradores - En desarrollo</div>} />
        <Route path="/users" element={<div className="p-8">Módulo de Usuarios - En desarrollo</div>} />
        <Route path="/integrations" element={<div className="p-8">Módulo de Integraciones - En desarrollo</div>} />
        <Route path="/settings" element={<div className="p-8">Módulo de Configuración - En desarrollo</div>} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
