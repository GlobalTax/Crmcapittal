import React from 'react';
import { cn } from '@/lib/utils';

interface StandardMetricsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 6;
  className?: string;
}

export const StandardMetricsGrid: React.FC<StandardMetricsGridProps> = ({
  children,
  columns = 4,
  className
}) => {
  const gridStyles = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  return (
    <div className={cn(
      "grid gap-6",
      gridStyles[columns],
      className
    )}>
      {children}
    </div>
  );
};