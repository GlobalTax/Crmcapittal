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
  colorScheme?: 'info' | 'warning' | 'success' | 'destructive' | 'primary';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  className,
  colorScheme
}) => {
  const getColorClasses = () => {
    if (colorScheme) {
      switch (colorScheme) {
        case 'info':
          return {
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
            changeColor: 'text-blue-600'
          };
        case 'warning':
          return {
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-500',
            changeColor: 'text-amber-600'
          };
        case 'success':
          return {
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-500',
            changeColor: 'text-emerald-600'
          };
        case 'destructive':
          return {
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-500',
            changeColor: 'text-red-600'
          };
        case 'primary':
          return {
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
            changeColor: 'text-primary'
          };
        default:
          return {
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
            changeColor: change?.trend === 'up' ? 'text-success' : 'text-destructive'
          };
      }
    }
    return {
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      changeColor: change?.trend === 'up' ? 'text-success' : 'text-destructive'
    };
  };

  const colors = getColorClasses();
  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
            <Icon className="w-4 h-4 text-gray-600" />
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="text-3xl font-bold text-gray-900">
          {value}
        </div>
        
        {change && (
          <div className="flex items-center gap-1">
            <div className="text-sm font-medium text-gray-600">
              {change.trend === 'up' ? '↑' : '↓'} {change.value}
            </div>
            <span className="text-xs text-gray-600">vs mes anterior</span>
          </div>
        )}
      </div>
    </div>
  );
};