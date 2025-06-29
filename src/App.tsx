
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SuperAdmin from "./pages/SuperAdmin";
import Managers from "./pages/Managers";
import Projects from "./pages/Projects";
import Portfolio from "./pages/Portfolio";
import Sourcing from "./pages/Sourcing";
import NotFound from "./pages/NotFound";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LegalNotice from "./pages/LegalNotice";
import CookiesPolicy from "./pages/CookiesPolicy";
import Leads from "./pages/Leads";
import TimeTracking from "./pages/TimeTracking";
import { AuthProvider } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import OperationDetails from "./pages/OperationDetails";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/legal-notice" element={<LegalNotice />} />
              <Route path="/cookies-policy" element={<CookiesPolicy />} />
              
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/" element={<Index />} />
                <Route path="/time-tracking" element={<TimeTracking />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/sourcing" element={<Sourcing />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/managers" element={<Managers />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/super-admin" element={<SuperAdmin />} />
                <Route path="/operation/:id" element={<OperationDetails />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
