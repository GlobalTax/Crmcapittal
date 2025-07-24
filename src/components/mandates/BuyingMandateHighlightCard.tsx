import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BuyingMandateHighlightCardProps {
  title: string;
  value: string | React.ReactNode;
  icon?: LucideIcon;
  subtitle?: string;
  className?: string;
}

export const BuyingMandateHighlightCard = ({ 
  title, 
  value, 
  icon: Icon, 
  subtitle,
  className = "" 
}: BuyingMandateHighlightCardProps) => {
  return (
    <div className={`bg-neutral-0 rounded border border-border p-4 space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="text-sm font-semibold text-foreground">
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
};