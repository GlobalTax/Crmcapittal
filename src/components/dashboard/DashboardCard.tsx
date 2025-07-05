import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  metric?: string | number;
  diff?: number;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}

export const DashboardCard = ({ 
  title, 
  metric, 
  diff, 
  icon: Icon, 
  children, 
  className = '' 
}: DashboardCardProps) => {
  return (
    <div className={`bg-neutral-0 rounded shadow-sm p-6 flex flex-col gap-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
          {metric && (
            <p className="text-2xl font-bold text-foreground">{metric}</p>
          )}
          {diff !== undefined && (
            <div className="flex items-center mt-2">
              {diff >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs mes anterior</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-accent rounded-lg">
            <Icon className="h-6 w-6 text-accent-foreground" />
          </div>
        )}
      </div>
      
      {/* Content */}
      {children && (
        <div className="flex-1">
          {children}
        </div>
      )}
    </div>
  );
};