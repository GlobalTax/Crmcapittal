
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard = ({ title, value, description, icon: Icon, trend }: StatsCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 mb-2">{description}</p>
        )}
        {trend && (
          <div className={`text-xs flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span className="mr-1">{trend.isPositive ? '↗' : '↘'}</span>
            {trend.isPositive ? '+' : ''}{trend.value}% desde el mes pasado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
