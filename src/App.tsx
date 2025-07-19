import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModernLayout } from "@/components/layout/ModernLayout";
import { lazy, Suspense } from "react";

// Import existing pages
import ModernDashboard from "./pages/ModernDashboard";
import Companies from "./pages/Companies";
import CompanyPage from "./pages/CompanyPage";
import Contacts from "./pages/Contacts";
import ContactPage from "./pages/ContactPage";
import Deals from "./pages/Deals";
import DealPage from "./pages/DealPage";
import Transacciones from "./pages/Transacciones";
import TransaccionPage from "./pages/TransaccionPage";
import Collaborators from "./pages/Collaborators";
import CommissionsPage from "./pages/CommissionsPage";
import EmailSetup from "./pages/EmailSetup";
import Documents from "./pages/Documents";
import Integrations from "./pages/Integrations";
import MandatesPage from "./pages/MandatesPage";
import MandateDetailPage from "./pages/MandateDetailPage";
import BuyingMandates from "./pages/BuyingMandates";
import DashboardPersonal from "./pages/DashboardPersonal";

// Lazy load ROD components and other missing pages
const RODDashboard = lazy(() => import("./pages/RODDashboard"));
const RODBuilder = lazy(() => import("./pages/RODBuilder"));
const Subscribers = lazy(() => import("./pages/Subscribers"));
const CampaignBuilder = lazy(() => import("./pages/CampaignBuilder"));
const Valoraciones = lazy(() => import("./pages/Valoraciones"));
const Reconversiones = lazy(() => import("./pages/Reconversiones"));
const TeaserBuilder = lazy(() => import("./pages/TeaserBuilder"));

const queryClient = new QueryClient();

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-slate-600">Cargando...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<ModernLayout />}>
              <Route index element={<ModernDashboard />} />
              <Route path="personal" element={<DashboardPersonal />} />
              
              {/* Companies routes */}
              <Route path="empresas" element={<Companies />} />
              <Route path="empresas/:id" element={<CompanyPage />} />
              
              {/* Contacts routes */}
              <Route path="contactos" element={<Contacts />} />
              <Route path="contactos/:id" element={<ContactPage />} />
              
              {/* Deals routes */}
              <Route path="operaciones" element={<Deals />} />
              <Route path="operaciones/:id" element={<DealPage />} />
              
              {/* Transactions routes */}
              <Route path="transacciones" element={<Transacciones />} />
              <Route path="transacciones/:id" element={<TransaccionPage />} />
              
              {/* Mandates routes */}
              <Route path="mandatos" element={<MandatesPage />} />
              <Route path="mandatos/:id" element={<MandateDetailPage />} />
              <Route path="mandatos-compra" element={<BuyingMandates />} />
              
              {/* ROD Dashboard and Builder routes */}
              <Route 
                path="rod" 
                element={
                  <Suspense fallback={<LoadingSkeleton />}>
                    <RODDashboard />
                  </Suspense>
                } 
              />
              <Route 
                path="rod/builder" 
                element={
                  <Suspense fallback={<LoadingSkeleton />}>
                    <RODBuilder />
                  </Suspense>
                } 
              />
              <Route 
                path="subscribers" 
                element={
                  <Suspense fallback={<LoadingSkeleton />}>
                    <Subscribers />
                  </Suspense>
                } 
              />
              <Route 
                path="campaigns" 
                element={
                  <Suspense fallback={<LoadingSkeleton />}>
                    <CampaignBuilder />
                  </Suspense>
                } 
              />

              {/* Servicios Complementarios */}
              <Route 
                path="valoraciones" 
                element={
                  <Suspense fallback={<LoadingSkeleton />}>
                    <Valoraciones />
                  </Suspense>
                } 
              />
              <Route 
                path="reconversiones" 
                element={
                  <Suspense fallback={<LoadingSkeleton />}>
                    <Reconversiones />
                  </Suspense>
                } 
              />
              <Route 
                path="teaser-builder" 
                element={
                  <Suspense fallback={<LoadingSkeleton />}>
                    <TeaserBuilder />
                  </Suspense>
                } 
              />
              
              {/* Other routes */}
              <Route path="colaboradores" element={<Collaborators />} />
              <Route path="comisiones" element={<CommissionsPage />} />
              <Route path="email" element={<EmailSetup />} />
              <Route path="documentos" element={<Documents />} />
              <Route path="integrations" element={<Integrations />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
