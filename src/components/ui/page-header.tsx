import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  actions?: ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  children, 
  badge,
  actions 
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {badge && (
              <Badge variant={badge.variant || 'secondary'}>
                {badge.text}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground text-lg">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
      
      {children && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}