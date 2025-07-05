import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { useKpis } from '@/hooks/useKpis';
import { CheckCircle, User, Briefcase, DollarSign } from 'lucide-react';

export const PersonalKpiCards = () => {
  const { kpis, loading } = useKpis();

  const kpiData = [
    {
      title: 'Tareas Pendientes',
      value: kpis?.pendingTasks || 0,
      icon: CheckCircle,
      diff: 12.5
    },
    {
      title: 'Leads Asignados',
      value: kpis?.leadsAssigned || 0,
      icon: User,
      diff: 8.2
    },
    {
      title: 'Negocios Activos',
      value: kpis?.activeDeals || 0,
      icon: Briefcase,
      diff: -2.1
    },
    {
      title: 'Ingresos Est.',
      value: kpis?.estimatedRevenue ? `€${(kpis.estimatedRevenue / 1000).toFixed(0)}K` : '€0',
      icon: DollarSign,
      diff: 15.3
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-20 mb-4"></div>
            <div className="h-8 bg-muted rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
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