import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down';
  };
  icon?: LucideIcon;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  className
}) => {
  return (
    <div className={cn("bg-card border rounded-lg p-6 hover:shadow-sm transition-shadow", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {Icon && (
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="text-3xl font-bold text-card-foreground">
          {value}
        </div>
        
        {change && (
          <div className="flex items-center gap-1">
            <div className={cn(
              "text-sm font-medium",
              change.trend === 'up' ? "text-success" : "text-destructive"
            )}>
              {change.trend === 'up' ? '↑' : '↓'} {change.value}
            </div>
            <span className="text-xs text-muted-foreground">vs mes anterior</span>
          </div>
        )}
      </div>
    </div>
  );
};