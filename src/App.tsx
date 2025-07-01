
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Negocios from "./pages/Negocios";
import NegocioDetail from "./pages/NegocioDetail";
import Operaciones from "./pages/Operaciones";
import OperationDetails from "./pages/OperationDetails";
import Contacts from "./pages/Contacts";
import Companies from "./pages/Companies";
import Leads from "./pages/Leads";
import Pipeline from "./pages/Pipeline";
import Portfolio from "./pages/Portfolio";
import Calendar from "./pages/Calendar";
import PipelinesManager from "./pages/PipelinesManager";
import Sourcing from "./pages/Sourcing";
import AdminPanel from "./pages/AdminPanel";
import UserManagement from "./pages/UserManagement";
import TimeTracking from "./pages/TimeTracking";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Index />} />
                <Route path="negocios" element={<Negocios />} />
                <Route path="negocios/:id" element={<NegocioDetail />} />
                <Route path="operaciones" element={<Operaciones />} />
                <Route path="operaciones/:id" element={<OperationDetails />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="companies" element={<Companies />} />
                <Route path="leads" element={<Leads />} />
                <Route path="pipeline" element={<Pipeline />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="pipelines" element={<PipelinesManager />} />
                <Route path="sourcing" element={<Sourcing />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="user-management" element={<UserManagement />} />
                <Route path="time-tracking" element={<TimeTracking />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
