
import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/utils/logger';

interface LazyTabContentProps {
  isActive: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export const LazyTabContent: React.FC<LazyTabContentProps> = ({
  isActive,
  children,
  fallback,
  delay = 100
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (isActive && !shouldRender) {
      setIsLoading(true);
      logger.debug('LazyTabContent: Loading tab content');
      
      const timer = setTimeout(() => {
        setShouldRender(true);
        setIsLoading(false);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, shouldRender, delay]);
  
  if (!isActive) {
    return null;
  }
  
  if (isLoading || !shouldRender) {
    return fallback || (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  return <>{children}</>;
};
