import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import Index from "./pages/Index";
import Companies from "./pages/Companies";
import CompanyPage from "./pages/CompanyPage";
import Contactos from "./pages/Contactos";
import ContactoDetail from "./pages/ContactoDetail";
import Operaciones from "./pages/Operaciones";
import OperacionDetail from "./pages/OperacionDetail";
import Transacciones from "./pages/Transacciones";
import TransaccionDetail from "./pages/TransaccionDetail";
import Colaboradores from "./pages/Colaboradores";
import Comisiones from "./pages/Comisiones";
import Email from "./pages/Email";
import Templates from "./pages/Templates";
import Configuracion from "./pages/Configuracion";
import Configuracion2 from "./pages/Configuracion2";
import Mandatos from "./pages/Mandatos";
import MandatoDetail from "./pages/MandatoDetail";
import DocumentGenerator from "./pages/DocumentGenerator";
import DocumentEditor from "./pages/DocumentEditor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <Routes>
                <Route path="/" element={<Index />} />
                
                {/* Companies routes */}
                <Route path="/empresas" element={<Companies />} />
                <Route path="/empresas/:id" element={<CompanyPage />} />
                
                {/* Contacts routes */}
                <Route path="/contactos" element={<Contactos />} />
                <Route path="/contactos/:id" element={<ContactoDetail />} />
                
                {/* Operations routes */}
                <Route path="/operaciones" element={<Operaciones />} />
                <Route path="/operaciones/:id" element={<OperacionDetail />} />
                
                {/* Transactions routes */}
                <Route path="/transacciones" element={<Transacciones />} />
                <Route path="/transacciones/:id" element={<TransaccionDetail />} />
                
                {/* Mandates routes */}
                <Route path="/mandatos" element={<Mandatos />} />
                <Route path="/mandatos/:id" element={<MandatoDetail />} />
                
                {/* Other routes */}
                <Route path="/colaboradores" element={<Colaboradores />} />
                <Route path="/comisiones" element={<Comisiones />} />
                <Route path="/email" element={<Email />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/configuracion" element={<Configuracion />} />
                <Route path="/configuracion2" element={<Configuracion2 />} />
                <Route path="/document-generator" element={<DocumentGenerator />} />
                <Route path="/document-editor/:id" element={<DocumentEditor />} />
                
                {/* Redirect old empresa route to new format */}
                <Route path="/empresa/:id" element={<Navigate to="/empresas/:id" replace />} />
              </Routes>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
