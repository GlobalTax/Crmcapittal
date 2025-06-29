
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
  color?: string;
}

export const StatsCard = ({ title, value, description, icon: Icon, trend, color = "bg-blue-500" }: StatsCardProps) => {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
      <div className={`absolute top-0 left-0 w-full h-1 ${color}`}></div>
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        {description && (
          <p className="text-sm text-gray-500 mb-3">{description}</p>
        )}
        {trend && (
          <div className="flex items-center space-x-2">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              trend.isPositive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <span className={`${trend.isPositive ? '+' : ''}${trend.value}%`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
            <span className="text-xs text-gray-500">vs mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
