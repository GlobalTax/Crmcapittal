
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MinimalLayout } from "@/components/layout/MinimalLayout";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Index from "@/pages/Index";
import Companies from "@/pages/Companies";
import Contacts from "@/pages/Contacts";
import Leads from "@/pages/Leads";
import Deals from "@/pages/Deals";
import Operations from "@/pages/Operations";
import Valoraciones from "@/pages/Valoraciones";
import ValoracionDetailView from "@/pages/ValoracionDetailView";
import MandatesPage from "@/pages/MandatesPage";
import MandatoDeCompraView from "@/pages/MandatoDeCompraView";
import MandatoDashboardView from "@/pages/MandatoDashboardView";
import BuyingMandates from "@/pages/BuyingMandates";
import SellingMandates from "@/pages/SellingMandates";
import VentaMandatoView from "@/components/transacciones/VentaMandatoView";
import Campaigns from "@/pages/Campaigns";
import Documents from "@/pages/Documents";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import UserManagement from "@/pages/UserManagement";
import { ClientMandateView } from "@/components/mandates/ClientMandateView";
import { ClientMandateLayout } from "@/components/layout/ClientMandateLayout";
import Reconversiones from "@/pages/Reconversiones";
import Cases from "@/pages/Cases";
import TimeTracking from "@/pages/TimeTracking";
import Proposals from "@/pages/Proposals";
import Commissions from "@/pages/Commissions";
import Collaborators from "@/pages/Collaborators";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Client mandate access - separate layout */}
                <Route path="/client-mandate/:accessToken" element={
                  <ClientMandateLayout>
                    <ClientMandateView />
                  </ClientMandateLayout>
                } />
                
                {/* Main application routes */}
                <Route path="/" element={<MinimalLayout />}>
                  <Route index element={<Index />} />
                  <Route path="companies" element={<Companies />} />
                  <Route path="contacts" element={<Contacts />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="deals" element={<Deals />} />
                  <Route path="operations" element={<Operations />} />
                  <Route path="valoraciones" element={<Valoraciones />} />
                  <Route path="valoraciones/:id" element={<ValoracionDetailView />} />
                  <Route path="mandates" element={<MandatesPage />} />
                  <Route path="mandates/buying" element={<BuyingMandates />} />
                  <Route path="mandates/selling" element={<SellingMandates />} />
                  <Route path="mandate/:mandateId" element={<MandatoDeCompraView />} />
                  <Route path="mandate-dashboard/:id" element={<MandatoDashboardView />} />
                  <Route path="transacciones/:id" element={<VentaMandatoView />} />
                  <Route path="campaigns" element={<Campaigns />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="user-management" element={<UserManagement />} />
                  <Route path="reconversiones" element={<Reconversiones />} />
                  <Route path="cases" element={<Cases />} />
                  <Route path="time-tracking" element={<TimeTracking />} />
                  <Route path="proposals" element={<Proposals />} />
                  <Route path="commissions" element={<Commissions />} />
                  <Route path="collaborators" element={<Collaborators />} />
                </Route>
              </Routes>
              <Toaster />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
