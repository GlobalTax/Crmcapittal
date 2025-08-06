import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StandardMetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'stable';
  };
  icon?: LucideIcon;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  children?: React.ReactNode;
}

export const StandardMetricCard: React.FC<StandardMetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  className,
  variant = 'default',
  children
}) => {
  const variantStyles = {
    default: 'border-border',
    success: 'border-success/20 bg-success/5',
    warning: 'border-warning/20 bg-warning/5',
    destructive: 'border-destructive/20 bg-destructive/5',
    info: 'border-primary/20 bg-primary/5'
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
    info: 'bg-primary/10 text-primary'
  };

  return (
    <div className={cn(
      "bg-card border rounded-lg p-6 hover:shadow-sm transition-all duration-200 hover:scale-[1.01]",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {Icon && (
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            iconStyles[variant]
          )}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-3xl font-bold text-card-foreground">
          {value}
        </div>
        
        {change && (
          <div className="flex items-center gap-1">
            <div className={cn(
              "text-sm font-medium flex items-center gap-1",
              change.trend === 'up' ? "text-success" : 
              change.trend === 'down' ? "text-destructive" : "text-muted-foreground"
            )}>
              {change.trend === 'up' && '↗'}
              {change.trend === 'down' && '↘'}
              {change.trend === 'stable' && '→'}
              {change.value}
            </div>
            <span className="text-xs text-muted-foreground">vs anterior</span>
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};