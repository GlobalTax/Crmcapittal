import React from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface StandardDashboardHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  showDate?: boolean;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  rightContent?: React.ReactNode;
}

export const StandardDashboardHeader: React.FC<StandardDashboardHeaderProps> = ({
  title,
  subtitle,
  userName,
  userRole,
  showDate = true,
  badge,
  rightContent
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {userName ? `¡Hola, ${userName}!` : title}
        </h1>
        <p className="text-muted-foreground text-lg mt-1">
          {subtitle || (showDate && format(new Date(), 'EEEE, d MMMM yyyy', { locale: es }))}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {badge && (
          <Badge variant={badge.variant || 'secondary'}>
            {badge.text}
          </Badge>
        )}
        {rightContent}
      </div>
    </div>
  );
};