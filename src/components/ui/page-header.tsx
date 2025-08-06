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
    <div className="bg-white border-b border-gray-100 px-6 py-4 mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                {title}
              </h1>
              {badge && (
                <Badge variant={badge.variant || 'secondary'} className="text-xs">
                  {badge.text}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-500 leading-relaxed">
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
    </div>
  );
}