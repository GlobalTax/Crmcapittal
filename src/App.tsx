import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient } from './QueryClient';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';
import Leads from './pages/Leads';
import { PipedriveStyleLeadDetail } from './components/leads/PipedriveStyleLeadDetail';
import Contacts from './pages/Contacts';
import Companies from './pages/Companies';
import Deals from './pages/Deals';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { MinimalLayout } from './components/layout/MinimalLayout';
import MandatosList from './components/mandates/MandatosList';
import Valoraciones from './pages/Valoraciones';
import Transacciones from './pages/Transacciones';
import Reconversiones from './pages/Reconversiones';
import ReconversionDetail from "@/pages/ReconversionDetail";

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} >
            <Route index element={<Navigate to="/leads" replace />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/:id" element={<PipedriveStyleLeadDetail />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/mandates" element={<MandatosList />} />
            <Route path="/valoraciones" element={<Valoraciones />} />
            <Route path="/transacciones" element={<Transacciones />} />
            <Route path="/reconversiones" element={<Reconversiones />} />
            <Route path="/reconversiones/:id" element={<ReconversionDetail />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
