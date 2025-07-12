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
  const isAdmin = role === 'admin' || role === 'superadmin';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sistema de Comisiones</h1>
            <p className="text-muted-foreground">
              Gestión avanzada con reglas personalizadas y análisis ejecutivo
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Sistema Avanzado
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          {isAdmin && <TabsTrigger value="executive">Ejecutivo</TabsTrigger>}
          {isAdmin && <TabsTrigger value="rules">Reglas</TabsTrigger>}
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="table">Comisiones</TabsTrigger>
          {isAdmin && <TabsTrigger value="settings">Configuración</TabsTrigger>}
        </TabsList>

        <TabsContent value="dashboard">
          <CommissionsDashboard />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="executive">
            <EnhancedExecutiveDashboard />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="rules">
            <AdvancedCommissionRules />
          </TabsContent>
        )}

        <TabsContent value="calculator">
          <CommissionCalculator />
        </TabsContent>

        <TabsContent value="table">
          <CommissionsTable />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="settings">
            <CommissionSettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}