import * as React from 'react';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CardRadioProps {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  checked?: boolean;
}

export const CardRadio = ({ 
  value, 
  label, 
  description, 
  icon, 
  badge, 
  checked 
}: CardRadioProps) => {
  return (
    <label className={cn(
      "relative flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all h-16",
      "hover:bg-accent/50",
      checked 
        ? "border-primary bg-primary/5" 
        : "border-border bg-neutral-0"
    )}>
      <RadioGroupItem value={value} className="shrink-0" />
      
      {icon && (
        <div className="shrink-0 text-muted-foreground">
          {icon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{label}</span>
          {badge && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
};