
import { LucideIcon } from "lucide-react";
import { DashboardCard } from './DashboardCard';

interface KPIMetric {
  title: string;
  value: string | number;
  change: number;
  description: string;
  icon: LucideIcon;
}

interface KPIMetricsProps {
  metrics: KPIMetric[];
}

export const KPIMetrics = ({ metrics }: KPIMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <DashboardCard
          key={index}
          title={metric.title}
          metric={metric.value}
          diff={metric.change}
          icon={metric.icon}
        />
      ))}
    </div>
  );
};
