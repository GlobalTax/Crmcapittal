
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernDashboardCardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  change?: {
    value: number;
    label: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'gray';
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-200'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200'
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'text-gray-600',
    border: 'border-gray-200'
  }
};

export const ModernDashboardCard: React.FC<ModernDashboardCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  color = 'gray',
  children,
  className,
  onClick
}) => {
  const colorClasses = colorVariants[color];

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200",
        onClick && "cursor-pointer hover:border-gray-300",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          {value && (
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {value}
            </div>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "p-2 rounded-lg",
            colorClasses.bg,
            colorClasses.border,
            "border"
          )}>
            <Icon className={cn("h-5 w-5", colorClasses.icon)} />
          </div>
        )}
      </div>

      {change && (
        <div className="flex items-center text-sm">
          <span className={cn(
            "flex items-center font-medium",
            change.trend === 'up' && "text-green-600",
            change.trend === 'down' && "text-red-600",
            change.trend === 'neutral' && "text-gray-600"
          )}>
            {change.trend === 'up' && '↗'}
            {change.trend === 'down' && '↘'}
            {change.trend === 'neutral' && '→'}
            <span className="ml-1">
              {change.trend !== 'neutral' && (change.value > 0 ? '+' : '')}{change.value}%
            </span>
          </span>
          <span className="text-gray-500 ml-1">{change.label}</span>
        </div>
      )}

      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};
