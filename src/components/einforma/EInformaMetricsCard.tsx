import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

interface EInformaMetricsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
}

export const EInformaMetricsCard = ({ title, value, change, icon: Icon }: EInformaMetricsCardProps) => {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== 0 && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <TrendIcon className={`h-3 w-3 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
            <Badge variant={isPositive ? 'default' : 'destructive'} className="text-xs">
              {isPositive ? '+' : ''}{change}%
            </Badge>
            <span>vs mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};