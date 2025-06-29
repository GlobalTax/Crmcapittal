
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { EmailStatsCard } from "@/components/dashboard/EmailStatsCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPIMetrics } from "@/components/dashboard/KPIMetrics";
import { ActivitySection } from "@/components/dashboard/ActivitySection";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PipelineSummary } from "@/components/dashboard/PipelineSummary";
import { RecentDeals } from "@/components/dashboard/RecentDeals";
import { useOperations } from "@/hooks/useOperations";
import { useLeads } from "@/hooks/useLeads";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { 
  Eye,
  MessageSquare,
  Calendar
} from "lucide-react";
import { useState } from "react";

const Index = () => {
  const { loading: authLoading } = useAuth();
  const { operations, loading: operationsLoading } = useOperations();
  const { leads, isLoading: leadsLoading } = useLeads();
  const { role } = useUserRole();
  const [deals, setDeals] = useState<any[]>([]);

  const { kpiMetrics, availableOperations, inProcessOperations, soldOperations } = useDashboardMetrics(operations, leads);

  // Show loading state while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle deal creation
  const handleCreateDeal = (dealData: any) => {
    setDeals(prev => [dealData, ...prev]);
    console.log('Nuevo deal creado:', dealData);
  };

  // HubSpot-style recent activities
  const recentActivities = [
    {
      id: '1',
      type: 'operation' as const,
      description: 'Nueva oportunidad de M&A valorada en €2.5M',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      user: 'Ana García',
      priority: 'high' as const
    },
    {
      id: '2',
      type: 'lead' as const,
      description: 'Lead calificado convertido a oportunidad',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      user: 'Carlos Ruiz',
      priority: 'medium' as const
    },
    {
      id: '3',
      type: 'operation' as const,
      description: 'Deal cerrado: €1.8M - Comisión generada',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      user: 'María López',
      priority: 'high' as const
    }
  ];

  const quickActions = [
    { title: "Ver Pipeline", icon: Eye, href: "/portfolio", color: "blue" },
    { title: "Gestionar Leads", icon: MessageSquare, href: "/leads", color: "green" },
    { title: "Mi Agenda", icon: Calendar, href: "/my-day", color: "purple" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader role={role} onCreateDeal={handleCreateDeal} />

      <div className="p-6 space-y-6">
        <KPIMetrics metrics={kpiMetrics} />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ActivitySection deals={deals} activities={recentActivities} />
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <QuickActions actions={quickActions} role={role} />
            
            <PipelineSummary 
              deals={deals}
              availableOperations={availableOperations}
              inProcessOperations={inProcessOperations}
              soldOperations={soldOperations}
              totalOperations={operations.length}
            />

            <RecentDeals deals={deals} />
          </div>
        </div>

        {/* Email Stats for Admins - HubSpot Style */}
        {(role === 'admin' || role === 'superadmin') && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Marketing & Sales</h3>
            <EmailStatsCard />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
