import { DashboardCard } from '@/components/dashboard/DashboardCard';

import { useKpisVenta } from '@/hooks/useKpisVenta';
import { TrendingUp, DollarSign, Target, CheckCircle, Percent, Calendar } from 'lucide-react';

export const DividedKpiRow = () => {
  const leadsKpis = null; // Leads functionality removed
  const leadsLoading = false;
  const { kpis: ventaKpis, loading: ventaLoading } = useKpisVenta();

  const loading = leadsLoading || ventaLoading;

  const kpiData = [
    {
      title: 'Leads Activos',
      value: leadsKpis?.activeLeads || 0,
      icon: Target,
      diff: 12.5
    },
    {
      title: 'Valor Leads',
      value: leadsKpis?.leadsValue ? `€${(leadsKpis.leadsValue / 1000).toFixed(0)}K` : '€0',
      icon: DollarSign,
      diff: 8.2
    },
    {
      title: 'Tx Activas',
      value: ventaKpis?.activeTx || 0,
      icon: TrendingUp,
      diff: -2.1
    },
    {
      title: 'Valor Tx',
      value: ventaKpis?.txValue ? `€${(ventaKpis.txValue / 1000).toFixed(0)}K` : '€0',
      icon: DollarSign,
      diff: 15.3
    },
    {
      title: 'Tasa Conversión',
      value: `${leadsKpis?.conversionRate?.toFixed(1) || 0}%`,
      icon: Percent,
      diff: 5.7
    },
    {
      title: 'Tx Cerradas Mes',
      value: leadsKpis?.closedThisMonth || 0,
      icon: CheckCircle,
      diff: 22.1
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-4 sm:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-20 mb-4"></div>
            <div className="h-8 bg-muted rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-4 sm:grid-cols-6">
      {kpiData.map((kpi, index) => (
        <DashboardCard
          key={index}
          title={kpi.title}
          metric={kpi.value}
          diff={kpi.diff}
          icon={kpi.icon}
        />
      ))}
    </div>
  );
};