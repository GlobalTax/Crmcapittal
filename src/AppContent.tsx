
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
import Deals from '@/pages/Deals';
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
                  <AttioLayout>
                    <Suspense fallback={<div>Cargando...</div>}>
                      <Routes>
                        <Route path="/" element={<Navigate to="/personal" replace />} />
                        <Route path="/personal" element={<MinimalPersonalDashboard />} />
                        <Route path="/dashboard" element={<PersonalDashboard />} />
                        <Route path="/contacts" element={<Contacts />} />
                        <Route path="/companies" element={<Companies />} />
                        <Route path="/deals" element={<Deals />} />
                        <Route path="/transacciones" element={<MinimalTransacciones />} />
                        <Route path="/selling-mandates" element={<SellingMandates />} />
                        <Route path="/buying-mandates" element={<BuyingMandates />} />
                        <Route path="/collaborators" element={<Collaborators />} />
                        <Route path="/leads" element={<Leads />} />
                      </Routes>
                    </Suspense>
                    <FloatingLeadsWidget />
                  </AttioLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default AppContent;
