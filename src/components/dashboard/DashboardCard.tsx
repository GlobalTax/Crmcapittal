import React from 'react';
import { UnifiedCard } from '@/components/ui/unified-card';
import { LucideIcon } from 'lucide-react';

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
  icon, 
  children, 
  className = '' 
}: DashboardCardProps) => {
  return (
    <UnifiedCard
      variant="default"
      title={title}
      metric={metric}
      diff={diff}
      icon={icon}
      className={className}
    >
      {children}
    </UnifiedCard>
  );
};