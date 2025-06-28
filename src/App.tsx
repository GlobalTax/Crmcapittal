
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MainLayout } from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Deals from "./pages/Deals";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import SearchPage from "./pages/SearchPage";
import Management from "./pages/Management";
import Contacts from "./pages/Contacts";
import OperationDetails from "./pages/OperationDetails";
import NotFound from "./pages/NotFound";

// Legal pages
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LegalNotice from "./pages/LegalNotice";
import CookiesPolicy from "./pages/CookiesPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Legal Pages */}
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal" element={<LegalNotice />} />
            <Route path="/cookies" element={<CookiesPolicy />} />
            
            {/* Protected Routes with Main Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
            </Route>
            
            <Route
              path="/deals"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Deals />} />
              <Route path=":id" element={<OperationDetails />} />
            </Route>
            
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Analytics />} />
            </Route>
            
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Reports />} />
            </Route>
            
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SearchPage />} />
            </Route>
            
            <Route
              path="/contacts"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Contacts />} />
            </Route>
            
            <Route
              path="/management"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Management />} />
            </Route>

            {/* Legacy redirects */}
            <Route path="/admin" element={<Navigate to="/management" replace />} />
            <Route path="/superadmin" element={<Navigate to="/management" replace />} />
            <Route path="/managers" element={<Navigate to="/management" replace />} />
            <Route path="/projects" element={<Navigate to="/deals" replace />} />
            <Route path="/operation/:id" element={<Navigate to="/deals/:id" replace />} />
            <Route path="/ma-dashboard" element={<Navigate to="/analytics" replace />} />
            <Route path="/ma-reports" element={<Navigate to="/reports" replace />} />
            <Route path="/ma-search" element={<Navigate to="/search" replace />} />

            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
