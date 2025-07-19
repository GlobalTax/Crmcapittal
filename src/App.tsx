import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                
                {/* Companies routes */}
                <Route path="/empresas" element={<Companies />} />
                <Route path="/empresas/:id" element={<CompanyPage />} />
                
                {/* Contacts routes */}
                <Route path="/contactos" element={<Contacts />} />
                <Route path="/contactos/:id" element={<ContactPage />} />
                
                {/* Deals routes */}
                <Route path="/operaciones" element={<Deals />} />
                <Route path="/operaciones/:id" element={<DealPage />} />
                
                {/* Transactions routes */}
                <Route path="/transacciones" element={<Transacciones />} />
                <Route path="/transacciones/:id" element={<TransaccionPage />} />
                
                {/* Mandates routes */}
                <Route path="/mandatos" element={<MandatesPage />} />
                <Route path="/mandatos/:id" element={<MandateDetailPage />} />
                <Route path="/mandatos-compra" element={<BuyingMandates />} />
                
                {/* Other routes */}
                <Route path="/colaboradores" element={<Collaborators />} />
                <Route path="/comisiones" element={<CommissionsPage />} />
                <Route path="/email" element={<EmailSetup />} />
                <Route path="/documentos" element={<Documents />} />
                <Route path="/integrations" element={<Integrations />} />
                
                {/* Redirect old empresa route to new format */}
                <Route path="/empresa/:id" element={<Navigate to="/empresas/:id" replace />} />
              </Routes>
            </div>
          </SidebarInset>
        </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
