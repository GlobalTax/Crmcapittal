import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MandateHighlightCardProps {
  title: string;
  icon: LucideIcon;
  value: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export const MandateHighlightCard = ({ 
  title, 
  icon: Icon, 
  value, 
  subtitle, 
  className 
}: MandateHighlightCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-base font-medium">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};