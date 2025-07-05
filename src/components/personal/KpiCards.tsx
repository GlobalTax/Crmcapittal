import { useKpis } from '@/hooks/useKpis';
import { Card } from '@/components/ui/card';
import { CheckCircle, User, Briefcase, DollarSign } from 'lucide-react';

export const KpiCards = () => {
  const { kpis, loading } = useKpis();

  const kpiData = [
    {
      title: 'Tareas Pendientes',
      value: kpis?.pendingTasks || 0,
      icon: CheckCircle,
      color: 'text-orange-600'
    },
    {
      title: 'Leads Asignados',
      value: kpis?.leadsAssigned || 0,
      icon: User,
      color: 'text-blue-600'
    },
    {
      title: 'Negocios Activos',
      value: kpis?.activeDeals || 0,
      icon: Briefcase,
      color: 'text-green-600'
    },
    {
      title: 'Ingresos Est.',
      value: kpis?.estimatedRevenue ? `€${(kpis.estimatedRevenue / 1000).toFixed(0)}K` : '€0',
      icon: DollarSign,
      color: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" aria-live="polite">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="kpi-card animate-pulse">
            <div className="h-4 bg-muted rounded w-20"></div>
            <div className="h-8 bg-muted rounded w-12"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto md:overflow-x-visible" aria-live="polite">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="kpi-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              </div>
              <Icon className={`h-8 w-8 ${kpi.color}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
};