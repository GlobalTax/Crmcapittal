
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AttioLayout } from '@/components/layout/AttioLayout';
import Auth from '@/pages/Auth';
import PersonalDashboard from '@/pages/PersonalDashboard';
import MinimalPersonalDashboard from '@/pages/MinimalPersonalDashboard';
import Contacts from '@/pages/Contacts';
import Companies from '@/pages/Companies';
import MinimalTransacciones from '@/pages/MinimalTransacciones';
import SellingMandates from '@/pages/SellingMandates';
import BuyingMandates from '@/pages/BuyingMandates';
import Collaborators from '@/pages/Collaborators';
import Leads from '@/pages/Leads';
import { FloatingLeadsWidget } from '@/components/leads/FloatingLeadsWidget';

const AppContent: React.FC = () => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ErrorBoundary>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AttioLayoutWithWidget />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

// Componente wrapper que incluye AttioLayout y FloatingLeadsWidget
const AttioLayoutWithWidget: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<AttioLayout />}>
          <Route index element={<Navigate to="/personal" replace />} />
          <Route path="personal" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <MinimalPersonalDashboard />
            </Suspense>
          } />
          <Route path="dashboard" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <PersonalDashboard />
            </Suspense>
          } />
          <Route path="contacts" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <Contacts />
            </Suspense>
          } />
          <Route path="companies" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <Companies />
            </Suspense>
          } />
          <Route path="transacciones" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <MinimalTransacciones />
            </Suspense>
          } />
          <Route path="selling-mandates" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <SellingMandates />
            </Suspense>
          } />
          <Route path="buying-mandates" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <BuyingMandates />
            </Suspense>
          } />
          <Route path="collaborators" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <Collaborators />
            </Suspense>
          } />
          <Route path="leads" element={
            <Suspense fallback={<div>Cargando...</div>}>
              <Leads />
            </Suspense>
          } />
        </Route>
      </Routes>
      <FloatingLeadsWidget />
    </>
  );
};

export default AppContent;
