import { useAuth } from '@/contexts/AuthContext';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StandardDashboardLayout } from '@/components/dashboard/StandardDashboardLayout';
import { StandardDashboardHeader } from '@/components/dashboard/StandardDashboardHeader';
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
    <StandardDashboardLayout spacing="tight">
      <StandardDashboardHeader
        title="Dashboard Captación & Venta"
        userName={user?.user_metadata?.first_name || 'Usuario'}
        subtitle={format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
      />

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
    </StandardDashboardLayout>
  );
}