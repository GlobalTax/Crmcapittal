import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModernLayout } from "@/components/layout/ModernLayout";
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

const queryClient = new QueryClient();

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
