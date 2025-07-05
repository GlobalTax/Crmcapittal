import { TrendingUp, TrendingDown, Target, Clock, Users, Award } from 'lucide-react';
import { useKanbanMetrics } from '@/hooks/useKanbanMetrics';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Negocio } from '@/types/Negocio';
import { Stage } from '@/types/Pipeline';

interface MetricsBarProps {
  negocios: Negocio[];
  stages: Stage[];
}

/**
 * MetricsBar Component
 * 
 * Advanced metrics dashboard showing KPIs for the Kanban board.
 * Displays real-time calculated metrics including conversion rates,
 * weighted values, performance indicators, and trend analysis.
 * 
 * @param negocios - Array of business deals
 * @param stages - Array of pipeline stages
 */
export const MetricsBar = ({ negocios, stages }: MetricsBarProps) => {
  const { metrics, loading, error } = useKanbanMetrics(negocios, stages);

  if (loading) {
    return (
      <div className="bg-background border border-border rounded-lg p-6">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Calculando métricas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background border border-border rounded-lg p-6">
        <div className="text-center text-sm text-red-600">
          Error cargando métricas: {error}
        </div>
      </div>
    );
  }

  /**
   * Formats currency values for display
   * @param value - Numeric value to format
   * @returns Formatted currency string
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-2">
      <DashboardCard 
        title="Valor Total"
        metric={formatCurrency(metrics.totalValue)}
        icon={Target}
        className="min-w-[160px] h-[88px] p-4"
      />
      
      <DashboardCard 
        title="Valor Ponderado"
        metric={formatCurrency(metrics.weightedValue)}
        icon={TrendingUp}
        className="min-w-[160px] h-[88px] p-4"
      />
      
      <DashboardCard 
        title="Tasa Conversión"
        metric={`${metrics.conversionRate}%`}
        icon={Award}
        className="min-w-[160px] h-[88px] p-4"
      />
      
      <DashboardCard 
        title="Promedio Días"
        metric={metrics.averageTimePerStage}
        icon={Clock}
        className="min-w-[160px] h-[88px] p-4"
      />
      
      <DashboardCard 
        title="Nuevos (7d)"
        metric={metrics.newDealsThisWeek}
        icon={TrendingUp}
        className="min-w-[160px] h-[88px] p-4"
      />
      
      <DashboardCard 
        title="Cerrados (Mes)"
        metric={metrics.closedDealsThisMonth}
        icon={Users}
        className="min-w-[160px] h-[88px] p-4"
      />
    </div>
  );
};