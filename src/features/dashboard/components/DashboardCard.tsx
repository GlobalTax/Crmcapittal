/**
 * Dashboard Card Component
 * 
 * Reusable card component for dashboard metrics and content
 */

import React from 'react';
import { UnifiedCard } from '@/shared/components/ui';
import { DashboardCardProps } from '../types';

export const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  metric, 
  diff, 
  icon, 
  children, 
  className = '' 
}) => {
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