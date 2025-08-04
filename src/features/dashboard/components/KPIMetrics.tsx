/**
 * KPI Metrics Component
 * 
 * Grid component for displaying key performance indicators
 */

import React from 'react';
import { DashboardCard } from './DashboardCard';
import { KPIMetricsProps } from '../types';

export const KPIMetrics: React.FC<KPIMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <DashboardCard
          key={index}
          title={metric.title}
          metric={metric.value}
          diff={metric.change}
          icon={metric.icon}
        />
      ))}
    </div>
  );
};