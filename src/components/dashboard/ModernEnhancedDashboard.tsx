
import React from 'react';
import { useOperations } from '@/hooks/useOperations';
import { useLeads } from '@/hooks/useLeads';
import { useNegocios } from '@/hooks/useNegocios';
import { useUserRole } from '@/hooks/useUserRole';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { ModernDashboardCard } from './ModernDashboardCard';
import { LoadingSkeleton, DashboardLoadingSkeleton } from '@/components/LoadingSkeleton';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Target,
  Briefcase,
  Calendar,
  Clock
} from 'lucide-react';

export const ModernEnhancedDashboard = () => {
  const { role, loading: roleLoading } = useUserRole();
  const { operations, loading: operationsLoading } = useOperations();
  const { leads, isLoading: leadsLoading } = useLeads({});
  const { negocios, loading: negociosLoading } = useNegocios();

  const isLoading = roleLoading || operationsLoading || leadsLoading || negociosLoading;

  // Get dashboard metrics
  const dashboardData = useDashboardMetrics(operations, leads);

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  // Calculate key metrics
  const totalLeads = leads.length;
  const newLeadsToday = leads.filter(lead => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(lead.created_at) >= today;
  }).length;

  const totalOperations = operations.length;
  const activeOperations = operations.filter(op => op.status === 'ACTIVE').length;

  const totalRevenue = operations.reduce((sum, op) => sum + (op.amount || 0), 0);
  const monthlyRevenue = operations
    .filter(op => {
      const opDate = new Date(op.created_at);
      const now = new Date();
      return opDate.getMonth() === now.getMonth() && opDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, op) => sum + (op.amount || 0), 0);

  const conversionRate = totalLeads > 0 ? (activeOperations / totalLeads * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ModernDashboardCard
            title="Total Leads"
            value={totalLeads.toLocaleString()}
            subtitle={`${newLeadsToday} nuevos hoy`}
            change={{
              value: 12,
              label: 'vs mes anterior',
              trend: 'up'
            }}
            icon={Users}
            color="blue"
          />

          <ModernDashboardCard
            title="Operaciones Activas"
            value={activeOperations.toLocaleString()}
            subtitle={`${totalOperations} en total`}
            change={{
              value: 8,
              label: 'vs mes anterior',
              trend: 'up'
            }}
            icon={Briefcase}
            color="green"
          />

          <ModernDashboardCard
            title="Revenue Total"
            value={`€${(totalRevenue / 1000000).toFixed(1)}M`}
            subtitle={`€${(monthlyRevenue / 1000).toFixed(1)}K este mes`}
            change={{
              value: 15,
              label: 'vs mes anterior',
              trend: 'up'
            }}
            icon={DollarSign}
            color="purple"
          />

          <ModernDashboardCard
            title="Tasa Conversión"
            value={`${conversionRate.toFixed(1)}%`}
            subtitle="Leads a operaciones"
            change={{
              value: -2,
              label: 'vs mes anterior',
              trend: 'down'
            }}
            icon={Target}
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pipeline Chart */}
          <div className="lg:col-span-2">
            <ModernDashboardCard
              title="Pipeline de Operaciones"
              className="h-80"
            >
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Gráfico del pipeline en desarrollo</p>
                </div>
              </div>
            </ModernDashboardCard>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <ModernDashboardCard
              title="Actividad Reciente"
              className="h-80"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Nuevo lead registrado</p>
                    <p className="text-xs text-gray-500">Hace 2 horas</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Operación actualizada</p>
                    <p className="text-xs text-gray-500">Hace 4 horas</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Reunión programada</p>
                    <p className="text-xs text-gray-500">Hace 6 horas</p>
                  </div>
                </div>
              </div>
            </ModernDashboardCard>
          </div>
        </div>

        {/* Recent Operations Table */}
        <ModernDashboardCard
          title="Operaciones Recientes"
          className="mb-8"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Empresa</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {operations.slice(0, 5).map((operation, index) => (
                  <tr key={operation.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {operation.company_name || 'Sin nombre'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {operation.type || 'M&A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      €{((operation.amount || 0) / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        operation.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : operation.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {operation.status || 'Activa'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(operation.created_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModernDashboardCard>
      </div>
    </div>
  );
};
