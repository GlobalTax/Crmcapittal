import React, { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserCollaborator } from '@/hooks/useUserCollaborator';
import { Navigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { CommissionsDashboard } from '@/components/commissions/CommissionsDashboard';
import { CommissionsTable } from '@/components/commissions/CommissionsTable';
import { CommissionCalculator } from '@/components/commissions/CommissionCalculator';
import { CommissionSettings } from '@/components/commissions/CommissionSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Calculator, Settings, List } from 'lucide-react';

const CommissionsPage = () => {
  const { role, loading: roleLoading } = useUserRole();
  const { collaborator, loading: collaboratorLoading, isCollaborator } = useUserCollaborator();

  const loading = roleLoading || collaboratorLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow access for superadmins, admins, and users with collaborator profiles
  const hasAccess = role === 'superadmin' || role === 'admin' || isCollaborator;
  
  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  const isAdmin = role === 'admin' || role === 'superadmin';
  const pageTitle = isAdmin ? "Sistema de Comisiones" : "Mis Comisiones";
  const pageDescription = isAdmin 
    ? "Gestión completa de comisiones para colaboradores"
    : `Consulta tus comisiones ${collaborator?.name ? `como ${collaborator.name}` : ''}`;
  
  // Define which tabs are available based on role
  const availableTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: DollarSign },
    { id: 'commissions', label: 'Comisiones', icon: List },
    { id: 'calculator', label: 'Calculadora', icon: Calculator },
    ...(isAdmin ? [{ id: 'settings', label: 'Configuración', icon: Settings }] : [])
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
      />

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className={`grid w-full grid-cols-${availableTabs.length}`}>
          {availableTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <CommissionsDashboard />
        </TabsContent>

        <TabsContent value="commissions" className="space-y-6">
          <CommissionsTable />
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <CommissionCalculator />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="settings" className="space-y-6">
            <CommissionSettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default CommissionsPage;