import React from 'react';
import { useOperations } from '@/hooks/useOperations';
import { useLeads } from '@/hooks/useLeads';
import { useNegocios } from '@/hooks/useNegocios';
import { useUserRole } from '@/hooks/useUserRole';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useBatchedQueries } from '@/hooks/performance/useBatchedQueries';
import { usePerformanceMonitor } from '@/hooks/performance/usePerformanceMonitor';
import { DashboardHeader } from './DashboardHeader';
import { DashboardCard } from './DashboardCard';
import { KPIMetrics } from './KPIMetrics';
import { ActivityFeed } from './ActivityFeed';
import { QuickActions } from './QuickActions';
import { PipelineChart } from './PipelineChart';
import { ConversionChart } from './ConversionChart';
import { RecentDeals } from './RecentDeals';
import { LoadingSkeleton, DashboardLoadingSkeleton } from '@/components/LoadingSkeleton';
import { HealthStatusIndicator } from './HealthStatusIndicator';
import { RemindersDashboard } from './RemindersDashboard';
import { useReminderNotifications } from '@/hooks/useReminderNotifications';
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
import { RevealSection } from '@/components/ui/RevealSection';

const EnhancedDashboard = React.memo(() => {
  const { renderCount } = usePerformanceMonitor('EnhancedDashboard');
  const { addToBatch } = useBatchedQueries();
  
  const { role, loading: roleLoading } = useUserRole();
  const { operations, loading: operationsLoading } = useOperations();
  const { leads, isLoading: leadsLoading } = useLeads({});
  const { negocios, loading: negociosLoading } = useNegocios();
  
  // Initialize reminder notifications
  useReminderNotifications();

  const isLoading = roleLoading || operationsLoading || leadsLoading || negociosLoading;

  // Get dashboard metrics
  const dashboardData = useDashboardMetrics(operations, leads);

  // Generate recent activity - Optimized for performance
  const recentActivity = React.useMemo(() => {
    const activities = [];
    
    // Process only the most recent items to avoid unnecessary computation
    const recentOps = operations.length > 0 ? operations.slice(0, 3) : [];
    const recentNegocios = negocios.length > 0 ? negocios.slice(0, 2) : [];
    const recentLeads = leads.length > 0 ? leads.slice(0, 2) : [];
    
    // Add recent operations with error handling
    recentOps.forEach(op => {
      if (op?.id) {
        activities.push({
          id: `op-${op.id}`,
          type: 'operation' as const,
          description: `Nueva operación "${op.company_name || 'Sin nombre'}" por €${((op.amount || 0) / 1000000).toFixed(1)}M`,
          timestamp: new Date(op.created_at || Date.now()),
          user: op.manager?.name || 'Sistema',
          priority: (op.amount || 0) > 10000000 ? 'high' as const : 'medium' as const
        });
      }
    });

    // Add recent negocios with error handling
    recentNegocios.forEach(negocio => {
      if (negocio?.id) {
        activities.push({
          id: `neg-${negocio.id}`,
          type: 'lead' as const,
          description: `Negocio "${negocio.nombre_negocio || 'Sin nombre'}" actualizado`,
          timestamp: new Date(negocio.updated_at || Date.now()),
          user: negocio.propietario_negocio || 'Sistema',
          priority: negocio.prioridad === 'urgente' ? 'high' as const : 'medium' as const
        });
      }
    });

    // Add recent leads with error handling
    recentLeads.forEach(lead => {
      if (lead?.id) {
        activities.push({
          id: `lead-${lead.id}`,
          type: 'user' as const,
          description: `Nuevo lead "${lead.company_name || lead.name || 'Sin nombre'}" registrado`,
          timestamp: new Date(lead.created_at || Date.now()),
          user: 'Sistema',
          priority: 'low' as const
        });
      }
    });

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DashboardHeader role={role} />
      
      <div className="container mx-auto px-4 py-8 gap-8 flex flex-col">
        {/* KPI Metrics */}
        <section className="animate-fade-in">
          <RevealSection storageKey="dashboard/kpis" defaultCollapsed={false} collapsedLabel="Mostrar tarjetas" expandedLabel="Ocultar tarjetas">
            <KPIMetrics metrics={dashboardData.kpiMetrics} />
          </RevealSection>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 gap-6 flex flex-col">
            
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
          <div className="gap-6 flex flex-col">
            
            {/* Reminders Dashboard */}
            <div className="animate-fade-in delay-500">
              <RemindersDashboard />
            </div>

            {/* Activity Feed */}
            <div className="animate-fade-in delay-600">
              <ActivityFeed />
            </div>

            {/* Quick Actions */}
            <div className="animate-fade-in delay-700">
              <QuickActions actions={quickActions} role={role} />
            </div>

            {/* Portfolio Summary - Admin Only */}
            {(role === 'admin' || role === 'superadmin') && (
              <div className="animate-fade-in delay-700">
                 <DashboardCard title="Resumen Portfolio" icon={BarChart3}>
                   <div className="gap-4 flex flex-col">
                     <div className="flex justify-between items-center">
                       <span className="text-base text-gray-700">Valor Total</span>
                       <span className="font-semibold text-gray-900">
                         €{(dashboardData.totalPortfolioValue / 1000000).toFixed(1)}M
                       </span>
                     </div>
                     
                     <div className="flex justify-between items-center">
                       <span className="text-base text-gray-700">Operaciones Activas</span>
                       <span className="font-semibold text-gray-900">
                         {dashboardData.availableOperations.length}
                       </span>
                     </div>
                     
                     <div className="flex justify-between items-center">
                       <span className="text-base text-gray-700">En Proceso</span>
                       <span className="font-semibold text-gray-900">
                         {dashboardData.inProcessOperations.length}
                       </span>
                     </div>
                     
                     <div className="pt-4 border-t border-gray-200">
                       <div className="text-sm text-gray-600 text-center">
                         Tasa de conversión: {dashboardData.conversionRate.toFixed(1)}%
                       </div>
                     </div>
                   </div>
                 </DashboardCard>
              </div>
            )}

            {/* System Health Status - Admin Only */}
            {(role === 'admin' || role === 'superadmin') && (
              <div className="animate-fade-in delay-800">
                <HealthStatusIndicator />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export { EnhancedDashboard };