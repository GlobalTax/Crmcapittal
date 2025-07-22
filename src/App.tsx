import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from './QueryClient';
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
          <Route path="/" element={<DashboardLayout />} >
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
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
