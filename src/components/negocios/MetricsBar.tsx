import { TrendingUp, TrendingDown, Target, Clock, Users, Award } from 'lucide-react';
import { useKanbanMetrics } from '@/hooks/useKanbanMetrics';
import { Negocio } from '@/types/Negocio';
import { Stage } from '@/types/Pipeline';

interface MetricsBarProps {
  negocios: Negocio[];
  stages: Stage[];
}

interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

/**
 * MetricItem Component
 * 
 * Individual metric display with icon, label, value and optional trend indicator.
 * 
 * @param icon - React icon component to display
 * @param label - Metric label text
 * @param value - Metric value to display
 * @param trend - Optional trend direction
 * @param color - Optional color class for value
 */
const MetricItem = ({ icon, label, value, trend, color = "" }: MetricItemProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-muted-foreground">{icon}</div>
        {getTrendIcon()}
      </div>
      <div className={`text-xl font-bold ${color}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-xs text-muted-foreground text-center">{label}</div>
    </div>
  );
};

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
    <div className="bg-background border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground">Métricas del Pipeline</h2>
        <div className="text-xs text-muted-foreground">
          Actualizado en tiempo real
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricItem
          icon={<Target className="h-4 w-4" />}
          label="Valor Total"
          value={formatCurrency(metrics.totalValue)}
          color="text-primary"
        />
        
        <MetricItem
          icon={<TrendingUp className="h-4 w-4" />}
          label="Valor Ponderado"
          value={formatCurrency(metrics.weightedValue)}
          color="text-green-600"
          trend="up"
        />
        
        <MetricItem
          icon={<Award className="h-4 w-4" />}
          label="Tasa Conversión"
          value={`${metrics.conversionRate}%`}
          color="text-blue-600"
          trend={metrics.conversionRate > 20 ? 'up' : metrics.conversionRate < 10 ? 'down' : 'neutral'}
        />
        
        <MetricItem
          icon={<Clock className="h-4 w-4" />}
          label="Promedio Días"
          value={metrics.averageTimePerStage}
          color="text-orange-600"
        />
        
        <MetricItem
          icon={<TrendingUp className="h-4 w-4" />}
          label="Nuevos (7d)"
          value={metrics.newDealsThisWeek}
          color="text-purple-600"
          trend={metrics.newDealsThisWeek > 0 ? 'up' : 'neutral'}
        />
        
        <MetricItem
          icon={<Users className="h-4 w-4" />}
          label="Cerrados (Mes)"
          value={metrics.closedDealsThisMonth}
          color="text-emerald-600"
          trend={metrics.closedDealsThisMonth > 0 ? 'up' : 'neutral'}
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Valor Promedio</div>
          <div className="text-sm font-medium text-foreground">
            {formatCurrency(metrics.averageDealSize)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Etapa Top</div>
          <div className="text-sm font-medium text-foreground truncate">
            {metrics.topPerformingStage}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Alta Prioridad</div>
          <div className="text-sm font-medium text-red-600">
            {metrics.dealsByPriority.urgente + metrics.dealsByPriority.alta}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Propietarios</div>
          <div className="text-sm font-medium text-foreground">
            {Object.keys(metrics.dealsByOwner).length}
          </div>
        </div>
      </div>
    </div>
  );};
