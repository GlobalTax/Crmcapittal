import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompactMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    isPositive?: boolean;
  };
  progress?: {
    current: number;
    total: number;
  };
  className?: string;
}

export const CompactMetricCard: React.FC<CompactMetricCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  progress,
  className
}) => {
  const progressPercentage = progress ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-lg p-4 shadow-sm",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-sm text-gray-600">{title}</span>
        </div>
        {change && (
          <span className={cn(
            "text-xs font-medium",
            change.isPositive !== false ? "text-emerald-700" : "text-amber-700"
          )}>
            {change.isPositive !== false ? "+" : ""}{change.value}%
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-semibold text-gray-900">
          {value}
        </div>
        
        {progress && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{progress.current} de {progress.total}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};