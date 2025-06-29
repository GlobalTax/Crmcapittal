
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Portfolio from "./pages/Portfolio";
import Admin from "./pages/Admin";
import SuperAdmin from "./pages/SuperAdmin";
import UserDashboard from "./pages/UserDashboard";
import Projects from "./pages/Projects";
import Managers from "./pages/Managers";
import NotFound from "./pages/NotFound";
import OperationDetails from "./pages/OperationDetails";
import Contacts from "./pages/Contacts";
import Companies from "./pages/Companies";
import Leads from "./pages/Leads";
import Sourcing from "./pages/Sourcing";
import PipelinesManager from "./pages/PipelinesManager";
import Operaciones from "./pages/Operaciones";
import MyDay from "./pages/MyDay";
import TimeTracking from "./pages/TimeTracking";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiesPolicy from "./pages/CookiesPolicy";
import LegalNotice from "./pages/LegalNotice";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiesPolicy />} />
              <Route path="/legal" element={<LegalNotice />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Index />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="admin" element={<Admin />} />
                <Route path="super-admin" element={<SuperAdmin />} />
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="projects" element={<Projects />} />
                <Route path="managers" element={<Managers />} />
                <Route path="operation/:id" element={<OperationDetails />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="companies" element={<Companies />} />
                <Route path="leads" element={<Leads />} />
                <Route path="sourcing" element={<Sourcing />} />
                <Route path="pipelines" element={<PipelinesManager />} />
                <Route path="operaciones" element={<Operaciones />} />
                <Route path="my-day" element={<MyDay />} />
                <Route path="time-tracking" element={<TimeTracking />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
