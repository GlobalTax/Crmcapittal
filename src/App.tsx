
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import SuperAdmin from "./pages/SuperAdmin";
import Managers from "./pages/Managers";
import Projects from "./pages/Projects";
import Portfolio from "./pages/Portfolio";
import Sourcing from "./pages/Sourcing";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LegalNotice from "./pages/LegalNotice";
import CookiesPolicy from "./pages/CookiesPolicy";
import Leads from "./pages/Leads";
import { AuthProvider } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import OperationDetails from "./pages/OperationDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal" element={<LegalNotice />} />
            <Route path="/cookies" element={<CookiesPolicy />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/portfolio" 
              element={
                <ProtectedRoute>
                  <Portfolio />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sourcing" 
              element={
                <ProtectedRoute>
                  <Sourcing />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/superadmin" 
              element={
                <ProtectedRoute>
                  <SuperAdmin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/managers" 
              element={
                <ProtectedRoute>
                  <Managers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leads" 
              element={
                <ProtectedRoute>
                  <Leads />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/operation/:id" 
              element={
                <ProtectedRoute>
                  <OperationDetails />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
