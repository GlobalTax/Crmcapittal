import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  className 
}: StatsCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground">
              {value}
            </p>
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          
          {icon && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="text-primary">
                {icon}
              </div>
            </div>
          )}
        </div>
        
        {trend && (
          <div className="flex items-center gap-2 mt-4">
            <span className={cn(
              "text-sm font-medium",
              trend.direction === 'up' && "text-success",
              trend.direction === 'down' && "text-destructive",
              trend.direction === 'neutral' && "text-muted-foreground"
            )}>
              {trend.direction === 'up' && '+'}
              {trend.value}%
            </span>
            <span className="text-sm text-muted-foreground">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}