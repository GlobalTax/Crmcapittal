
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
  bgColor?: string;
  textColor?: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  bgColor = "bg-white",
  textColor = "text-gray-900"
}: StatsCardProps) => {
  const isGradient = bgColor.includes('gradient');
  const iconBgColor = isGradient ? "bg-white/20" : "bg-gray-50";
  const iconTextColor = isGradient ? "text-white" : "text-gray-600";
  const titleColor = isGradient ? "text-white/90" : "text-gray-600";
  const descriptionColor = isGradient ? "text-white/80" : "text-gray-500";
  const trendColor = trend?.isPositive ? 
    (isGradient ? "text-white/90" : "text-green-600") : 
    (isGradient ? "text-white/90" : "text-red-600");

  return (
    <Card className={`${bgColor} hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 shadow-lg`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${titleColor}`}>{title}</CardTitle>
        <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center`}>
          <Icon className={`h-6 w-6 ${iconTextColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${textColor} mb-1`}>{value}</div>
        {description && (
          <p className={`text-sm ${descriptionColor} mb-2`}>{description}</p>
        )}
        {trend && (
          <div className={`text-sm flex items-center ${trendColor} font-medium`}>
            <span className="mr-1 text-lg">{trend.isPositive ? '↗' : '↘'}</span>
            {trend.isPositive ? '+' : ''}{trend.value}% desde el mes pasado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
