import React from 'react';
import { useOperations } from '@/hooks/useOperations';
import { useLeads } from '@/hooks/useLeads';
import { useNegocios } from '@/hooks/useNegocios';
import { useUserRole } from '@/hooks/useUserRole';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { DashboardHeader } from './DashboardHeader';
import { KPIMetrics } from './KPIMetrics';
import { ActivityFeed } from './ActivityFeed';
import { QuickActions } from './QuickActions';
import { PipelineChart } from './PipelineChart';
import { ConversionChart } from './ConversionChart';
import { RecentDeals } from './RecentDeals';
import { LoadingSkeleton, DashboardLoadingSkeleton } from '@/components/LoadingSkeleton';
import { 
  Plus, 
  Users, 
  Building2, 
  TrendingUp, 
  FileText, 
  Calendar,
  Settings,
  BarChart3
} from 'lucide-react';

export const EnhancedDashboard = () => {
  const { role, loading: roleLoading } = useUserRole();
  const { operations, loading: operationsLoading } = useOperations();
  const { leads, isLoading: leadsLoading } = useLeads({});
  const { negocios, loading: negociosLoading } = useNegocios();

  const isLoading = roleLoading || operationsLoading || leadsLoading || negociosLoading;

  // Get dashboard metrics
  const dashboardData = useDashboardMetrics(operations, leads);

  // Generate recent activity
  const recentActivity = React.useMemo(() => {
    const activities = [];
    
    // Add recent operations
    operations.slice(0, 3).forEach(op => {
      activities.push({
        id: `op-${op.id}`,
        type: 'operation' as const,
        description: `Nueva operación "${op.company_name || 'Sin nombre'}" por €${(op.amount / 1000000).toFixed(1)}M`,
        timestamp: new Date(op.created_at || Date.now()),
        user: op.manager?.name || 'Sistema',
        priority: op.amount > 10000000 ? 'high' as const : 'medium' as const
      });
    });

    // Add recent negocios
    negocios.slice(0, 2).forEach(negocio => {
      activities.push({
        id: `neg-${negocio.id}`,
        type: 'lead' as const,
        description: `Negocio "${negocio.nombre_negocio}" actualizado`,
        timestamp: new Date(negocio.updated_at || Date.now()),
        user: negocio.propietario_negocio || 'Sistema',
        priority: negocio.prioridad === 'urgente' ? 'high' as const : 'medium' as const
      });
    });

    // Add recent leads
    leads.slice(0, 2).forEach(lead => {
      activities.push({
        id: `lead-${lead.id}`,
        type: 'user' as const,
        description: `Nuevo lead "${lead.company_name || lead.name}" registrado`,
        timestamp: new Date(lead.created_at || Date.now()),
        user: 'Sistema',
        priority: 'low' as const
      });
    });

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8);
  }, [operations, negocios, leads]);

  // Quick actions based on role
  const quickActions = React.useMemo(() => {
    const baseActions = [
      {
        title: "Nuevo Contacto",
        icon: Users,
        href: "/contacts",
        color: "blue"
      },
      {
        title: "Ver Negocios",
        icon: TrendingUp,
        href: "/negocios",
        color: "green"
      },
      {
        title: "Documentos",
        icon: FileText,
        href: "/documents",
        color: "purple"
      },
      {
        title: "Mi Calendario",
        icon: Calendar,
        href: "/calendar",
        color: "orange"
      }
    ];

    if (role === 'admin' || role === 'superadmin') {
      baseActions.unshift(
        {
          title: "Gestión Leads",
          icon: Building2,
          href: "/leads",
          color: "red"
        },
        {
          title: "Administración",
          icon: Settings,
          href: "/admin",
          color: "gray"
        }
      );
    }

    return baseActions;
  }, [role]);

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <DashboardHeader role={role} />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Metrics */}
        <section className="animate-fade-in">
          <KPIMetrics metrics={dashboardData.kpiMetrics} />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Pipeline Distribution Chart */}
              <div className="animate-fade-in delay-200">
                <PipelineChart 
                  availableOperations={dashboardData.availableOperations}
                  inProcessOperations={dashboardData.inProcessOperations}
                  soldOperations={dashboardData.soldOperations}
                />
              </div>

              {/* Conversion Rate Chart */}
              <div className="animate-fade-in delay-300">
                <ConversionChart 
                  conversionRate={dashboardData.conversionRate}
                  totalLeads={leads.length}
                  qualifiedLeads={leads.filter(l => l.status === 'QUALIFIED').length}
                />
              </div>
            </div>

            {/* Recent Deals */}
            <div className="animate-fade-in delay-400">
              <RecentDeals 
                operations={operations.slice(0, 5)} 
                negocios={negocios.slice(0, 5)}
                role={role}
              />
            </div>
          </div>

          {/* Right Column - Activity and Actions */}
          <div className="space-y-8">
            
            {/* Activity Feed */}
            <div className="animate-fade-in delay-500">
              <ActivityFeed activities={recentActivity} />
            </div>

            {/* Quick Actions */}
            <div className="animate-fade-in delay-600">
              <QuickActions actions={quickActions} role={role} />
            </div>

            {/* Portfolio Summary - Admin Only */}
            {(role === 'admin' || role === 'superadmin') && (
              <div className="animate-fade-in delay-700">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-6 shadow-xl">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-slate-800">Resumen Portfolio</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Valor Total</span>
                      <span className="font-bold text-green-600">
                        €{(dashboardData.totalPortfolioValue / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Operaciones Activas</span>
                      <span className="font-semibold text-blue-600">
                        {dashboardData.availableOperations.length}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">En Proceso</span>
                      <span className="font-semibold text-orange-600">
                        {dashboardData.inProcessOperations.length}
                      </span>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-200">
                      <div className="text-xs text-slate-500 text-center">
                        Tasa de conversión: {dashboardData.conversionRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};