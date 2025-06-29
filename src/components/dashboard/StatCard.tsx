
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard = ({ title, value, description, icon: Icon, trend }: StatCardProps) => {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
        <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
        {trend && (
          <div className={`text-xs flex items-center mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-1">{trend.isPositive ? '↗' : '↘'}</span>
            {trend.isPositive ? '+' : ''}{trend.value}% desde el mes pasado
          </div>
        )}
      </div>
    </Card>
  );
};
