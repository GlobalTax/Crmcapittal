import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TransaccionHighlightCardProps {
  title: string;
  icon: LucideIcon;
  value: React.ReactNode;
  subtitle?: string;
}

export const TransaccionHighlightCard = ({ 
  title, 
  icon: Icon, 
  value, 
  subtitle 
}: TransaccionHighlightCardProps) => {
  return (
    <div className="bg-neutral-0 border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h4>
      </div>
      
      <div className="space-y-1">
        <div className="text-sm font-medium text-foreground">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};