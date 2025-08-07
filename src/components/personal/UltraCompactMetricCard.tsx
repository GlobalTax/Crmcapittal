import React from 'react';
import { cn } from '@/lib/utils';

interface UltraCompactMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  progress?: {
    current: number;
    total: number;
  };
  indicator?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const UltraCompactMetricCard: React.FC<UltraCompactMetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  progress,
  indicator,
  onClick,
  className
}) => {
  const progressPercentage = progress ? (progress.current / progress.total) * 100 : 0;

  return (
    <div 
      className={cn(
        "bg-white border border-slate-200 rounded-xl p-6 shadow-sm",
        onClick && "cursor-pointer hover:border-slate-300 transition-colors",
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {indicator}
            <span className="text-sm text-slate-600">{title}</span>
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.value}
            </span>
          )}
        </div>
        
        {/* Main Value */}
        <div className="text-2xl font-bold text-slate-900">
          {value}
        </div>
        
        {/* Subtitle */}
        {subtitle && (
          <div className="text-sm text-slate-500">
            {subtitle}
          </div>
        )}
        
        {/* Progress Bar */}
        {progress && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-600">
              <span>{progress.current}/{progress.total} completadas</span>
            </div>
            <div className="w-full bg-slate-200 rounded h-1">
              <div 
                className="bg-blue-600 h-1 rounded transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};