import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from './QueryClient';
import Leads from './pages/Leads';
import { PipedriveStyleLeadDetail } from './components/leads/PipedriveStyleLeadDetail';
import Contacts from './pages/Contacts';
import Companies from './pages/Companies';
import Deals from './pages/Deals';
import { DealRecord } from './pages/DealRecord';
import { ContactRecord } from './pages/ContactRecord';
import { CompanyRecord } from './pages/CompanyRecord';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { MinimalLayout } from './components/layout/MinimalLayout';
import { OnboardingPage } from './pages/OnboardingPage';
import { OnboardingProvider } from './components/onboarding/OnboardingProvider';
import MandatosList from './components/mandates/MandatosList';
import Valoraciones from './pages/Valoraciones';
import ValoracionDetail from './pages/ValoracionDetail';
import Transacciones from './pages/Transacciones';
import Reconversiones from './pages/Reconversiones';
import ReconversionDetail from "@/pages/ReconversionDetail";

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MinimalLayout />} >
            <Route index element={<OnboardingPage />} />
          </Route>
          <Route path="/onboarding" element={<OnboardingProvider><OnboardingPage /></OnboardingProvider>} />
          <Route path="/" element={<DashboardLayout />} >
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/:id" element={<PipedriveStyleLeadDetail />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/:id" element={<ContactRecord />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyRecord />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/deals/:id" element={<DealRecord />} />
            <Route path="/mandates" element={<MandatosList />} />
            <Route path="/valoraciones" element={<Valoraciones />} />
            <Route path="/valoraciones/:id" element={<ValoracionDetail />} />
            <Route path="/transacciones" element={<Transacciones />} />
          </Route>
          <Route path="/reconversiones" element={<Reconversiones />} />
          <Route path="/reconversiones/:id" element={<ReconversionDetail />} />
        </Routes>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
