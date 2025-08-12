import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Settings, 
  Target, 
  Calculator, 
  FileText, 
  Table,
  TrendingUp,
  Zap
} from 'lucide-react';
import { CommissionsDashboard } from '@/components/commissions/CommissionsDashboard';
import { EnhancedExecutiveDashboard } from '@/components/commissions/EnhancedExecutiveDashboard';
import { AdvancedCommissionRules } from '@/components/commissions/AdvancedCommissionRules';
import { CommissionCalculator } from '@/components/commissions/CommissionCalculator';
import { CommissionsTable } from '@/components/commissions/CommissionsTable';
import { CommissionSettings } from '@/components/commissions/CommissionSettings';
import { CommissionReports } from '@/components/commissions/CommissionReports';
import { useUserRole } from '@/hooks/useUserRole';

export default function CommissionsPage() {
  const { role } = useUserRole();
  const isSuperAdmin = role === 'superadmin';

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">Solo los superadministradores pueden acceder al sistema de comisiones.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="executive">Ejecutivo</TabsTrigger>
          <TabsTrigger value="rules">Reglas</TabsTrigger>
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="table">Comisiones</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <CommissionsDashboard />
        </TabsContent>

        <TabsContent value="executive">
          <EnhancedExecutiveDashboard />
        </TabsContent>

        <TabsContent value="rules">
          <AdvancedCommissionRules />
        </TabsContent>

        <TabsContent value="calculator">
          <CommissionCalculator />
        </TabsContent>

        <TabsContent value="table">
          <CommissionsTable />
        </TabsContent>

        <TabsContent value="settings">
          <CommissionSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}