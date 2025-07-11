import React, { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { CommissionsDashboard } from '@/components/commissions/CommissionsDashboard';
import { CommissionsTable } from '@/components/commissions/CommissionsTable';
import { CommissionCalculator } from '@/components/commissions/CommissionCalculator';
import { CommissionSettings } from '@/components/commissions/CommissionSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Calculator, Settings, List } from 'lucide-react';

const CommissionsPage = () => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Solo superadmins pueden acceder
  if (role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sistema de Comisiones"
        description="Gestión completa de comisiones para colaboradores"
      />

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Comisiones
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculadora
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
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

        <TabsContent value="settings" className="space-y-6">
          <CommissionSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommissionsPage;