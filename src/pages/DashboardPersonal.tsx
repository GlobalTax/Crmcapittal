import { useAuth } from '@/stores/useAuthStore';
import { Badge } from '@/components/ui/minimal/Badge';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DividedKpiRow } from '@/components/dashboard/DividedKpiRow';
import { AreaChartRevenueLeads } from '@/components/dashboard/charts/AreaChartRevenueLeads';
import { AreaChartRevenueTx } from '@/components/dashboard/charts/AreaChartRevenueTx';
import { DonutLeadsByStage } from '@/components/dashboard/charts/DonutLeadsByStage';
import { DonutTxByStage } from '@/components/dashboard/charts/DonutTxByStage';
import { RecentLeads } from '@/components/dashboard/RecentLeads';
import { RecentTx } from '@/components/dashboard/RecentTx';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { QuickActionsPanel } from '@/components/dashboard/QuickActionsPanel';

export default function DashboardPersonal() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Dashboard Captación & Venta
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
          </p>
        </div>
        <Badge color="blue">
          ¡Hola, {user?.user_metadata?.first_name || 'Usuario'}!
        </Badge>
      </div>

      {/* KPI Row */}
      <DividedKpiRow />

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AreaChartRevenueLeads />
        <AreaChartRevenueTx />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DonutLeadsByStage />
        <DonutTxByStage />
      </div>

      {/* Recent Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentLeads />
        <RecentTx />
      </div>

      {/* Timeline and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityTimeline />
        </div>
        <QuickActionsPanel />
      </div>
    </div>
  );
}