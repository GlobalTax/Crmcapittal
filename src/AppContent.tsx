
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import AttioLayout from '@/components/AttioLayout';
import LoginPage from '@/pages/LoginPage';
import PersonalDashboard from '@/pages/PersonalDashboard';
import MinimalPersonalDashboard from '@/pages/MinimalPersonalDashboard';
import Contacts from '@/pages/Contacts';
import Companies from '@/pages/Companies';
import Deals from '@/pages/Deals';
import MinimalTransacciones from '@/pages/MinimalTransacciones';
import SellingMandates from '@/pages/SellingMandates';
import BuyingMandates from '@/pages/BuyingMandates';
import Collaborators from '@/pages/Collaborators';
import Operations from '@/pages/Operations';
import AdminDashboard from '@/pages/AdminDashboard';
import StageManagement from '@/pages/StageManagement';
import Leads from '@/pages/Leads';
import LeadDetail from '@/pages/LeadDetail';
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
            <Route path="/login" element={<LoginPage />} />
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
                        <Route path="/operations" element={<Operations />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/stages" element={<StageManagement />} />
                        <Route path="/leads" element={<Leads />} />
                        <Route path="/leads/:id" element={<LeadDetail />} />
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
