
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

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
        <Card key={index} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <div className="flex items-center mt-2">
                  {metric.change >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">{metric.description}</span>
                </div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <metric.icon className="h-6 w-6 text-neutral-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
